console.log("stage4.js 파일 로드됨");

// jQuery가 로드되었는지 확인
if (typeof jQuery === 'undefined') {
    console.error('jQuery가 로드되지 않았습니다!');
} else {
    console.log('jQuery 버전:', jQuery.fn.jquery);
}

// 전역 변수 선언
let canvas, ctx;
let catImg, handImg, ballImages, brickImages;
let centerX, centerY, score, timeLeft;
let balls = [], bricks = [], particles = [];
let lastSpawn = 0, maxBalls = 3;
let gameStarted = false;
let selectedCatTheme = null;

let paddle = { x: 0, y: 0, width: 80, height: 80, angle: 0 };
let cat = { x: 50, y: 50, size: 80 };

// 벽돌 타입 정의
const brickTypes = {
    '유리컵': {
        images: ['glassCup_1.PNG', 'glassCup_2.PNG'],
        width: 50,
        height: 50,
        breakDelay: 300 // 0.3초
    },
    '접시': {
        images: ['plate2_1.PNG', 'plate2_2.PNG', 'plate2_3.PNG'],
        width: 60,
        height: 60,
        breakDelay: 300 // 0.3초
    },
    '액자': {
        images: ['frame1_1.PNG', 'frame1_2.PNG', 'frame1_3.PNG'],
        width: 90,  // 액자 크기 증가
        height: 90, // 액자 크기 증가
        breakDelay: 300 // 0.3초
    },
    '택배상자': {
        images: ['box1_1.PNG', 'box1_2.PNG', 'box1_3.PNG'],
        width: 100, // 택배상자 크기 증가
        height: 100, // 택배상자 크기 증가
        breakDelay: 300 // 0.3초
    }
};

// 테마에 따른 고양이 이미지 매핑
const catThemeMapping = {
    'select_cat1.jpg': 'cat2.jpg',
    'select_cat2.jpg': 'cat1.jpg',
    'select_cat3.jpg': 'cat3.jpg'
};

// 전역 변수 추가
let lastCatMove = 0;
let catMoveInterval = 10000; // 10초
let finalBallsCreated = false;
let paddleRadius = 280; // 패들이 움직일 원의 반지름 (벽돌 배치 원보다 약간 더 크게)

// 게임 초기화 함수
function initGame() {
    console.log("게임 초기화 시작");
    
    // 캔버스 초기화
    canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context!');
        return;
    }
    
    // 캔버스 크기 설정
    canvas.width = 800;
    canvas.height = 600;
    
    // 게임 변수 초기화
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    score = 0;
    timeLeft = 30;
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 이미지 초기화
    initImages();
}

// 이미지 초기화 함수
function initImages() {
    console.log("이미지 초기화 시작");
    
    // 이미지 객체 생성
    catImg = new Image();
    handImg = new Image();
    ballImages = [];
    brickImages = {};
    
    let imagesLoaded = 0;
    let imagesFailed = 0;
    let totalImages = 0;
    
    function checkImagesLoaded() {
        imagesLoaded++;
        console.log(`이미지 로드 진행: ${imagesLoaded}/${totalImages}`);
        if (imagesLoaded + imagesFailed >= totalImages) {
            console.log("모든 이미지 로드 완료");
            startGame();
        }
    }
    
    function handleImageError(img, type) {
        console.error(`${type} 이미지 로드 실패:`, img.src);
        imagesFailed++;
        checkImagesLoaded();
    }
    
    // 선택된 테마 가져오기
    const selectedTheme = localStorage.getItem('selectedCatTheme') || 'select_cat1.jpg';
    
    // 고양이 이미지 로드 (테마에 따라)
    const catImageName = catThemeMapping[selectedTheme] || 'cat2.jpg';
    catImg.onload = checkImagesLoaded;
    catImg.onerror = () => handleImageError(catImg, "고양이");
    catImg.src = `./images/${catImageName}`;
    
    // 패들 이미지 로드 (hand.PNG)
    handImg.onload = checkImagesLoaded;
    handImg.onerror = () => handleImageError(handImg, "손");
    handImg.src = "./images/hand.PNG";
    
    // 공 이미지 로드 (선택된 테마에 따라 하나의 공 이미지만 사용)
    let ballImageIndex = 1; // 기본값
    if (selectedTheme === 'select_cat2.jpg') {
        ballImageIndex = 2;
    } else if (selectedTheme === 'select_cat3.jpg') {
        ballImageIndex = 3;
    }
    
    const ballImg = new Image();
    ballImg.onload = checkImagesLoaded;
    ballImg.onerror = () => handleImageError(ballImg, "공");
    ballImg.src = `./ball_images/ball${ballImageIndex}.PNG`;
    ballImages = [ballImg]; // 하나의 공 이미지만 사용
    
    // 벽돌 이미지 로드
    Object.entries(brickTypes).forEach(([type, data]) => {
        brickImages[type] = [];
        data.images.forEach((imgName, index) => {
            const img = new Image();
            img.onload = () => {
                console.log(`${type} 이미지 ${index + 1} 로드 성공:`, imgName);
                checkImagesLoaded();
            };
            img.onerror = () => {
                console.error(`${type} 이미지 ${index + 1} 로드 실패:`, imgName);
                handleImageError(img, `${type} ${index + 1}`);
            };
            img.src = `./block_images/${imgName}`;
            brickImages[type].push(img);
        });
    });
    
    // 전체 이미지 수 계산
    totalImages = 2 + ballImages.length + Object.values(brickTypes).reduce((sum, type) => sum + type.images.length, 0);
}

// 게임 시작 함수
function startGame() {
    console.log("게임 시작");
    if (gameStarted) return;
    gameStarted = true;
    
    try {
        // 게임 상태 초기화
        score = 0;
        timeLeft = 30;
        balls = [];
        bricks = [];
        lastCatMove = Date.now();
        finalBallsCreated = false;
        
        // 고양이 초기 위치 설정 (왼쪽 또는 오른쪽에서 시작)
        const isLeftSide = Math.random() < 0.5; // 50% 확률로 왼쪽/오른쪽 결정
        cat.x = isLeftSide ? 50 : canvas.width - cat.size - 50;
        cat.y = Math.random() * (canvas.height - cat.size - 100) + 50; // 50px 마진
        
        // 게임 요소 생성
        createBricks();
        createBall();
        
        // 인트로 팝업 표시
        $('#intro-modal').fadeIn(200);
        
        // 5초 후 자동 닫힘
        setTimeout(() => {
            $('#intro-modal').fadeOut(200);
        }, 5000);
        
        // 타이머 시작
        const timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                $('#time-remaining').text(timeLeft);
                
                // 마지막 10초에 3개의 공 생성
                if (timeLeft === 10 && !finalBallsCreated) {
                    // 기존 공 제거
                    balls = [];
                    // 3개의 새로운 공 생성
                    for (let i = 0; i < 3; i++) {
                        createBall();
                    }
                    finalBallsCreated = true;
                }
            } else {
                clearInterval(timerInterval);
                $('#clear-modal').fadeIn(200);
                gameStarted = false;
            }
        }, 1000);
        
        // 게임 루프 시작
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('게임 시작 에러:', error);
        gameStarted = false;
    }
}

// 게임 루프 함수
function gameLoop() {
    if (!gameStarted) return;
    
    try {
        // 화면 클리어
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 게임 요소 업데이트 및 그리기
        updateBalls();
        drawBricks();
        drawCat();
        drawPaddle();
        drawBalls();
        updateScore();
        
        // 고양이 위치 변경 및 공 생성
        const currentTime = Date.now();
        if (currentTime - lastCatMove > catMoveInterval) {
            // 고양이가 왼쪽에 있으면 오른쪽으로, 오른쪽에 있으면 왼쪽으로 이동
            const isLeftSide = cat.x < canvas.width / 2;
            cat.x = isLeftSide ? canvas.width - cat.size - 50 : 50;
            
            // 위아래로만 랜덤하게 이동
            cat.y = Math.random() * (canvas.height - cat.size - 100) + 50; // 50px 마진
            lastCatMove = currentTime;
            
            // 마지막 10초에 3개의 공 생성
            if (timeLeft <= 10 && !finalBallsCreated) {
                // 기존 공 제거
                balls = [];
                // 3개의 새로운 공 생성
                for (let i = 0; i < 3; i++) {
                    createBall();
                }
                finalBallsCreated = true;
            } else if (timeLeft > 10) {
                // 일반적인 경우 하나의 공만 생성
                createBall();
            }
        }
        
        // 다음 프레임 요청
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('게임 루프 에러:', error);
        gameStarted = false;
    }
}

// DOM이 로드되면 게임 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM 로드 완료");
    initGame();
});

// jQuery ready 이벤트
$(document).ready(function() {
    console.log("jQuery ready");
    
    // SKIP 버튼 클릭 이벤트
    $('#skip-btn').click(function() {
        $('#intro-modal').fadeOut(200);
    });
    
    // 홈으로 버튼 클릭 이벤트
    $('.clear-home-btn').click(function() {
        window.location.href = 'home.html';
    });
    
    // 점수 버튼 클릭 이벤트
    $('.clear-score-btn').click(function() {
        alert(`최종 점수: ${score}원`);
    });
});

console.log("JS 파일 로드됨");

// 게임 함수들
function createBall() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 2; // 속도에 약간의 랜덤성 추가
    balls.push({
        x: cat.x + cat.size / 2,
        y: cat.y + cat.size / 2,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        radius: 15,
        imageIndex: 0
    });
}

function createBricks() {
    bricks = [];
    const types = Object.keys(brickTypes);
    
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 180 + Math.random() * 80; // 원의 반지름을 180~260으로 설정
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const type = types[Math.floor(Math.random() * types.length)];
        const brickType = brickTypes[type];
        
        // 벽돌이 화면 밖으로 나가지 않도록 위치 조정
        const margin = 20; // 화면 가장자리 여백
        const adjustedX = Math.max(margin, Math.min(canvas.width - brickType.width - margin, x));
        const adjustedY = Math.max(margin, Math.min(canvas.height - brickType.height - margin, y));
        
        bricks.push({
            x: adjustedX, 
            y: adjustedY, 
            w: brickType.width,
            h: brickType.height,
            hp: 2,
            maxHp: 2,
            name: type,
            breakTimer: null,
            isBreaking: false,
            hitCount: 0 // 액자 맞은 횟수 추적
        });
    }
}

function drawBricks() {
    bricks.forEach(brick => {
        try {
            const type = brickTypes[brick.name];
            if (type && brickImages[brick.name]) {
                let imgIndex = 0;
                
                if (brick.name === '유리컵' && brick.isBreaking) {
                    imgIndex = 1; // glassCup_2.PNG 사용
                } else if (brick.name === '액자' || brick.name === '택배상자' || brick.name === '접시') {
                    imgIndex = Math.min(brick.hitCount, type.images.length - 1); // 이미지 인덱스 범위 제한
                }
                
                const img = brickImages[brick.name][imgIndex];
                if (img && img.complete && img.naturalWidth !== 0) {
                    ctx.drawImage(img, brick.x, brick.y, brick.w, brick.h);
                } else {
                    console.warn(`${brick.name} 이미지 로드 실패:`, type.images[imgIndex]);
                    // 이미지가 로드되지 않은 경우 기본 사각형 그리기
                    ctx.fillStyle = '#ADD8E6';
                    ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
                }
            }
        } catch (error) {
            console.error('벽돌 그리기 에러:', error);
            // 에러 발생 시 기본 사각형 그리기
            ctx.fillStyle = '#ADD8E6';
            ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
        }
    });
}

function drawPaddle() {
    try {
        const x = centerX + Math.cos(paddle.angle) * paddleRadius;
        const y = centerY + Math.sin(paddle.angle) * paddleRadius;

        if (handImg && handImg.complete && handImg.naturalWidth !== 0) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(paddle.angle + Math.PI); // 180도 회전
            ctx.drawImage(handImg, -paddle.width / 2, -paddle.height / 2, paddle.width, paddle.height);
            ctx.restore();
        } else {
            // 이미지가 로드되지 않은 경우 기본 사각형 그리기
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(x - paddle.width/2, y - paddle.height/2, paddle.width, paddle.height);
        }
    } catch (error) {
        console.error('패들 그리기 에러:', error);
    }
}

function drawBalls() {
    balls.forEach(ball => {
        try {
            const img = ballImages[0]; // 항상 동일한 공 이미지 사용
            if (img && img.complete && img.naturalWidth !== 0) {
                ctx.drawImage(img, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
            } else {
                // 이미지가 로드되지 않은 경우 기본 원 그리기
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
                ctx.closePath();
            }
        } catch (error) {
            console.error('공 그리기 에러:', error);
            // 에러 발생 시 기본 원 그리기
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();
            ctx.closePath();
        }
    });
}

function drawCat() {
    try {
        if (catImg && catImg.complete && catImg.naturalWidth !== 0) {
            ctx.drawImage(catImg, cat.x, cat.y, cat.size, cat.size);
        } else {
            // 이미지가 로드되지 않은 경우 기본 사각형 그리기
            ctx.fillStyle = '#FFA500';
            ctx.fillRect(cat.x, cat.y, cat.size, cat.size);
        }
    } catch (error) {
        console.error('고양이 그리기 에러:', error);
        // 에러 발생 시 기본 사각형 그리기
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(cat.x, cat.y, cat.size, cat.size);
    }
}

function updateScore() {
    $('#score-box').text(`수리비: ${score}원`);
}

function updateBalls() {
    balls.forEach(ball => {
        // 공의 다음 위치 계산
        const nextX = ball.x + ball.dx;
        const nextY = ball.y + ball.dy;

        // 경계 체크 및 위치 조정
        if (nextX - ball.radius < 0) {
            ball.x = ball.radius;
            ball.dx = Math.abs(ball.dx);
        } else if (nextX + ball.radius > canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.dx = -Math.abs(ball.dx);
        } else {
            ball.x = nextX;
        }

        if (nextY - ball.radius < 0) {
            ball.y = ball.radius;
            ball.dy = Math.abs(ball.dy);
        } else if (nextY + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
            ball.dy = -Math.abs(ball.dy);
        } else {
            ball.y = nextY;
        }

        // 패들 충돌
        const px = centerX + Math.cos(paddle.angle) * paddleRadius;
        const py = centerY + Math.sin(paddle.angle) * paddleRadius;
        const dist = Math.hypot(ball.x - px, ball.y - py);
        if (dist < 40) {
            const angle = Math.atan2(ball.y - centerY, ball.x - centerX);
            ball.dx = Math.cos(angle) * 3;
            ball.dy = Math.sin(angle) * 3;
        }

        // 벽돌 충돌
        bricks.forEach((brick, i) => {
            if (
                ball.x > brick.x && ball.x < brick.x + brick.w &&
                ball.y > brick.y && ball.y < brick.y + brick.h
            ) {
                if (brick.name === '유리컵' && !brick.isBreaking) {
                    brick.hp--;
                    brick.isBreaking = true;
                    score += 500;
                    
                    // 0.3초 후 벽돌 제거
                    brick.breakTimer = setTimeout(() => {
                        const index = bricks.indexOf(brick);
                        if (index > -1) {
                            bricks.splice(index, 1);
                            score += 500;
                        }
                    }, brickTypes['유리컵'].breakDelay);
                } else if (brick.name === '액자') {
                    brick.hitCount++;
                    score += 500;
                    
                    if (brick.hitCount >= 2 && !brick.isBreaking) {
                        brick.isBreaking = true;
                        // 0.3초 후 벽돌 제거
                        brick.breakTimer = setTimeout(() => {
                            const index = bricks.indexOf(brick);
                            if (index > -1) {
                                bricks.splice(index, 1);
                                score += 500;
                            }
                        }, brickTypes['액자'].breakDelay);
                    }
                } else if (brick.name === '택배상자') {
                    brick.hitCount++;
                    score += 500;
                    
                    if (brick.hitCount >= 2 && !brick.isBreaking) {
                        brick.isBreaking = true;
                        // 0.3초 후 벽돌 제거
                        brick.breakTimer = setTimeout(() => {
                            const index = bricks.indexOf(brick);
                            if (index > -1) {
                                bricks.splice(index, 1);
                                score += 500;
                            }
                        }, brickTypes['택배상자'].breakDelay);
                    }
                } else if (brick.name === '접시') {
                    brick.hitCount++;
                    score += 500;
                    
                    if (brick.hitCount >= 2 && !brick.isBreaking) {
                        brick.isBreaking = true;
                        // 0.3초 후 벽돌 제거
                        brick.breakTimer = setTimeout(() => {
                            const index = bricks.indexOf(brick);
                            if (index > -1) {
                                bricks.splice(index, 1);
                                score += 500;
                            }
                        }, brickTypes['접시'].breakDelay);
                    }
                }
                ball.dy *= -1;
            }
        });
    });
}

// 마우스 이벤트 리스너
function setupEventListeners() {
    if (!canvas) return;
    
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const dx = e.clientX - rect.left - centerX;
        const dy = e.clientY - rect.top - centerY;
        paddle.angle = Math.atan2(dy, dx);
    });
}
