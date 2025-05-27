const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const BASE_SPEED_X = 5;
const BASE_SPEED_Y = -5;
let bricks = [];
const paddleHeight = 70;
const paddleWidth = 80;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let ballRadius = 15;
let x = canvas.width / 2;
let y = canvas.height - 100;
let dx = BASE_SPEED_X;
let dy = BASE_SPEED_Y;
let lives = 3;
let isGameOver = false;
let isGameClear = false;
let isRespawning = false;
let gameStarted = false;
let score = 0;
let animationId = null;

// 공 이미지 관리
const ballImages = {
    ball1: new Image(),
    ball2: new Image(),
    ball3: new Image(),
};
ballImages.ball1.src = 'ball_images/ball1.PNG';
ballImages.ball2.src = 'ball_images/ball2.PNG';
ballImages.ball3.src = 'ball_images/ball3.PNG';
let currentBallImage = ballImages.ball1; // 기본값으로 ball1 설정

// paddle 이미지 관리
const paddleImages = {
    paddle1: new Image(),
    paddle2: new Image(),
    paddle3: new Image(),
};

// 이미지 로드 에러 처리
function handleImageError(img) {
    console.log('이미지 로드 실패:', img.src);
    return false;
}

// 이미지 로드 설정
paddleImages.paddle1.onerror = () => handleImageError(paddleImages.paddle1);
paddleImages.paddle2.onerror = () => handleImageError(paddleImages.paddle2);
paddleImages.paddle3.onerror = () => handleImageError(paddleImages.paddle3);

paddleImages.paddle1.src = 'paddle_images/paddle1.PNG';
paddleImages.paddle2.src = 'paddle_images/paddle2.PNG';
paddleImages.paddle3.src = 'paddle_images/paddle3.PNG';

let currentPaddleImage = paddleImages.paddle1; // 기본값으로 paddle1 설정

// 테마 선택에 따른 공과 paddle 이미지 변경 함수
function changeBallImage(theme) {
    console.log('changeBallImage 호출됨, 테마:', theme);
    switch (theme) {
        case 'cat1':
            console.log('ball1, paddle1 이미지로 변경');
            currentBallImage = ballImages.ball1;
            currentPaddleImage = paddleImages.paddle1;
            break;
        case 'cat2':
            console.log('ball2, paddle2 이미지로 변경');
            currentBallImage = ballImages.ball2;
            currentPaddleImage = paddleImages.paddle2;
            break;
        case 'cat3':
            console.log('ball3, paddle3 이미지로 변경');
            currentBallImage = ballImages.ball3;
            currentPaddleImage = paddleImages.paddle3;
            break;
        default:
            console.log('기본 ball1, paddle1 이미지로 변경');
            currentBallImage = ballImages.ball1;
            currentPaddleImage = paddleImages.paddle1;
    }
}

const levels = [
    [
        { img: 'block_images/glassCup_1.PNG', scale: 0.2, hp: 1, name: '유리컵' },
        { img: 'block_images/plate1_1.PNG', scale: 0.2, hp: 1, name: '그릇' },
        { img: 'block_images/frame2_1.PNG', scale: 0.4, hp: 1, name: '액자' },
    ],
    [
        { img: 'block_images/glassCup_1.PNG', scale: 0.3, hp: 1, name: '유리컵' },
        { img: 'block_images/plate1_1.PNG', scale: 0.2, hp: 2, name: '그릇' },
        { img: 'block_images/frame1_1.PNG', scale: 0.1, hp: 2, name: '액자' },
        { img: 'block_images/box1_1.PNG', scale: 0.2, hp: 3, name: '택배박스' },
    ],
    [
        { img: 'block_images/glassCup_1.PNG', scale: 0.3, hp: 1, name: '유리컵' },
        { img: 'block_images/plate1_1.PNG', scale: 0.2, hp: 2, name: '그릇' },
        { img: 'block_images/frame1_1.PNG', scale: 0.1, hp: 2, name: '액자' },
        { img: 'block_images/box1_1.PNG', scale: 0.2, hp: 3, name: '택배박스' },
        { img: 'block_images/notebook_1.PNG', scale: 0.2, hp: 30, name: '노트북' },
    ],
];
let currentLevel = 0;
let brickTypes = levels[currentLevel];

const brickImages = {};
let imagesToLoad = 0;
let imagesLoaded = 0;

// 깨지는 이미지도 미리 로드
const breakImages = ['block_images/glassCup_2.PNG', 'block_images/plate1_2.PNG', 'block_images/frame2_2.PNG'];

// 기존 이미지와 깨지는 이미지 모두 로드
[...levels.flat().map((type) => type.img), ...breakImages].forEach((imgPath) => {
    if (!brickImages[imgPath]) {
        imagesToLoad++;
        const image = new Image();
        image.src = imgPath;
        image.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === imagesToLoad) {
                randomPlaceBricks();
                // createTestBrick();
            }
            // createTestBrick();
        };
        brickImages[imgPath] = image;
    }
});

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    // document.addEventListener('mousemove', mouseMoveHandler, false);
    document.addEventListener('mousemove', mouseMoveHandler, false);
    $('#restartBtn').click(restartGame);
    draw();
}

//캔버스를 cell단위로 나눔
const cellSize = 5;
const gridRows = Math.floor(canvas.height / cellSize);
const gridCols = Math.floor(canvas.width / cellSize);
const brickAreaRows = Math.floor(gridRows * 0.4);
let grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));

function canPlaceBrick(row, col, brickW, brickH) {
    if (row + brickH > brickAreaRows || col + brickW > gridCols) return false;
    for (let i = 0; i < brickH; i++) {
        for (let j = 0; j < brickW; j++) {
            if (grid[row + i][col + j] !== 0) return false;
        }
    }
    return true;
}

function placeBrick(row, col, brickW, brickH, brickObj) {
    for (let i = 0; i < brickH; i++) {
        for (let j = 0; j < brickW; j++) {
            grid[row + i][col + j] = 1;
        }
    }
    bricks.push({
        x: col * cellSize,
        y: row * cellSize,
        w: brickW * cellSize,
        h: brickH * cellSize,
        img: brickObj.img,
        status: 1,
        hp: brickObj.hp,
        name: brickObj.name,
    });
}

function randomPlaceBricks() {
    grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));
    for (let n = 0; n < 1000; n++) {
        let type = brickTypes[Math.floor(Math.random() * brickTypes.length)];
        let img = brickImages[type.img];
        let scale = type.scale || 1;
        let brickW = Math.ceil((img.naturalWidth * scale) / cellSize);
        let brickH = Math.ceil((img.naturalHeight * scale) / cellSize);
        let tries = 0;
        let placed = false;
        while (tries < 100 && !placed) {
            let row = Math.floor(Math.random() * (brickAreaRows - brickH));
            let col = Math.floor(Math.random() * (gridCols - brickW));
            if (canPlaceBrick(row, col, brickW, brickH)) {
                placeBrick(row, col, brickW, brickH, type);
                placed = true;
            }
            tries++;
        }
        if (!placed) break;
    }
}

function drawBricks() {
    for (let brick of bricks) {
        if (brick.status === 1) {
            let img = brickImages[brick.img];
            if (img && img.complete && img.naturalWidth && img.naturalHeight) {
                ctx.drawImage(img, brick.x, brick.y, brick.w, brick.h);
            } else {
                ctx.fillStyle = '#888';
                ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
            }
            const maxHp = levels[currentLevel].find((t) => t.img === brick.img).hp;
            if (brick.hp < maxHp && brick.hp > 0) {
                ctx.save();
                let alpha = 0.2 + 0.4 * (1 - brick.hp / maxHp);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#000';
                ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
                ctx.restore();
            }
        } else if (brick.status === 2) {
            // 깨지는 중인 상태일 때
            let breakImg = brickImages[brick.breakImg];
            if (breakImg && breakImg.complete && breakImg.naturalWidth && breakImg.naturalHeight) {
                ctx.drawImage(breakImg, brick.x, brick.y, brick.w, brick.h);
            }
        }
    }
}

function drawBall() {
    if (currentBallImage.complete) {
        ctx.drawImage(currentBallImage, x - ballRadius, y - ballRadius, ballRadius * 2, ballRadius * 2);
    } else {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.closePath();
    }
}

function drawPaddle() {
    if (currentPaddleImage && currentPaddleImage.complete && !currentPaddleImage.naturalWidth) {
        // 이미지가 로드되지 않은 경우 기본 사각형으로 표시
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight - 8, paddleWidth, paddleHeight);
        ctx.fillStyle = '#3a8dde';
        ctx.fill();
        ctx.closePath();
    } else if (currentPaddleImage && currentPaddleImage.complete) {
        // 이미지가 성공적으로 로드된 경우
        ctx.drawImage(currentPaddleImage, paddleX, canvas.height - paddleHeight - 8, paddleWidth, paddleHeight);
    } else {
        // 이미지 로드 중인 경우 기본 사각형으로 표시
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight - 8, paddleWidth, paddleHeight);
        ctx.fillStyle = '#3a8dde';
        ctx.fill();
        ctx.closePath();
    }
}

function showClearModal() {
    $('#clear-modal').fadeIn(200);
}

function collisionDetection() {
    for (let brick of bricks) {
        if (brick.status === 1) {
            if (x > brick.x && x < brick.x + brick.w && y > brick.y && y < brick.y + brick.h) {
                dy = -dy;
                brick.hp--;

                if (brick.hp <= 0) {
                    // 벽돌이 깨질 때 애니메이션 시작
                    brick.status = 2; // 2는 깨지는 중 상태
                    brick.breakStartTime = Date.now();
                    // 깨지는 이미지로 변경
                    if (brick.img.includes('glassCup_1')) {
                        brick.breakImg = 'block_images/glassCup_2.PNG';
                    } else if (brick.img.includes('plate1_1')) {
                        brick.breakImg = 'block_images/plate1_2.PNG';
                    } else if (brick.img.includes('frame2_1')) {
                        brick.breakImg = 'block_images/frame2_2.PNG';
                    }
                    // 0.5초 후에 완전히 사라지도록 설정
                    setTimeout(() => {
                        brick.status = 0;
                    }, 300);

                    // 벽돌이 깨질 때, 해당 벽돌의 최초 hp만큼 점수 증가
                    const maxHp = levels[currentLevel].find((t) => t.img === brick.img).hp;
                    score += maxHp;
                    $('#score-box').text(score);
                }

                if (isAllBricksCleared()) {
                    setTimeout(() => {
                        console.log('1.5초간 기다립니다.');
                        isGameClear = true; // <-- 3초 후에 클리어 처리
                        showClearModal(); // 모달 띄우기
                        cancelAnimationFrame(animationId); // 애니메이션 종료
                        animationId = null;
                        clearInterval(timerInterval);
                    }, 1500);
                }
            }
        }
    }
}

function isAllBricksCleared() {
    //모든 brick의 hp가 0이라면 true 반환
    return bricks.every((brick) => brick.hp === 0);
}

function draw() {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(draw);

    if (isGameClear || isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    if (!isRespawning) drawBall();
    drawPaddle();
    collisionDetection();

    if (isRespawning) return;

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;

    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius - paddleHeight - 8) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            lives--;
            if (!lives) {
                isGameOver = true;
                cancelAnimationFrame(animationId);
                animationId = null;
                $('#restartBtn').show();
                return;
            } else {
                isRespawning = true;
                setTimeout(() => {
                    x = canvas.width / 2;
                    y = canvas.height - paddleHeight - 15;
                    dx = BASE_SPEED_X * (Math.random() > 0.5 ? 1 : -1);
                    dy = BASE_SPEED_Y;
                    paddleX = (canvas.width - paddleWidth) / 2;
                    isRespawning = false;
                }, 3000);
                return;
            }
        }
    }

    x += dx;
    y += dy;

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
}

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
}

function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) paddleX = relativeX - paddleWidth / 2;

    /***************************마우스가 닿아도 벽돌이 깨짐, 시작*******************************/
    // let relativeY = e.clientY - canvas.getBoundingClientRect().top;

    // if (relativeX > 0 && relativeX < canvas.width) {
    //     paddleX = relativeX - paddleWidth / 2;
    // }

    // for (let brick of bricks) {
    //     if (brick.status === 1) {
    //         if (
    //             relativeX >= brick.x &&
    //             relativeX <= brick.x + brick.w &&
    //             relativeY >= brick.y &&
    //             relativeY <= brick.y + brick.h
    //         ) {
    //             brick.hp--;
    //             if (brick.hp <= 0) {
    //                 brick.status = 2;
    //                 brick.breakStartTime = Date.now();
    //                 if (brick.img.includes('glassCup_1')) {
    //                     brick.breakImg = 'block_images/glassCup_2.PNG';
    //                 } else if (brick.img.includes('plate1_1')) {
    //                     brick.breakImg = 'block_images/plate1_2.PNG';
    //                 } else if (brick.img.includes('frame2_1')) {
    //                     brick.breakImg = 'block_images/frame2_2.PNG';
    //                 }
    //                 setTimeout(() => {
    //                     brick.status = 0;
    //                 }, 300);

    //                 const maxHp = levels[currentLevel].find((t) => t.img === brick.img).hp;
    //                 score += maxHp;
    //                 $('#score-box').text(score);

    //                 if (isAllBricksCleared()) {
    //                     setTimeout(() => {
    //                         isGameClear = true;
    //                         showClearModal();
    //                         cancelAnimationFrame(animationId);
    //                         animationId = null;
    //                     }, 3000);
    //                 }
    //             }
    //         }
    //     }
    // }
    /***************************마우스가 닿아도 벽돌이 깨짐, 끝*******************************/
}

//테스트용 함수
function createTestBrick() {
    // 임의의 벽돌 속성 설정
    console.log('테스트');
    const testBrick = {
        img: 'block_images/glassCup_1.PNG', // 사용할 이미지
        scale: 0.2, // 크기 조정 비율
        hp: 1, // 내구도
        name: '테스트 벽돌', // 벽돌 이름
    };

    const img = brickImages[testBrick.img];
    if (!img || !img.naturalWidth || !img.complete) {
        console.error('이미지가 아직 로드되지 않았습니다:', testBrick.img);
        return;
    }

    // const img = brickImages[testBrick.img];
    const brickW = Math.ceil((img.naturalWidth * testBrick.scale) / cellSize);
    const brickH = Math.ceil((img.naturalHeight * testBrick.scale) / cellSize);
    const row = 10; // 원하는 위치의 행
    const col = 10; // 원하는 위치의 열

    // 벽돌을 배치
    placeBrick(row, col, 1, 1, testBrick); // 1x1 크기의 벽돌 추가
}

function restartGame() {
    isGameOver = false;
    isGameClear = false;
    x = canvas.width / 2;
    y = canvas.height - paddleHeight - 15;

    dx = BASE_SPEED_X * (Math.random() > 0.5 ? 1 : -1);
    dy = BASE_SPEED_Y;
    paddleX = (canvas.width - paddleWidth) / 2;
    currentLevel = 0;
    brickTypes = levels[currentLevel];
    bricks = [];
    // createTestBrick();
    randomPlaceBricks();
    $('#restartBtn').hide();
    score = 0;
    $('#score-box').text(score);
    draw();
}
