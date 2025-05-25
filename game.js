const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const BASE_SPEED_X = 5;
const BASE_SPEED_Y = -5;
let bricks = [];
const paddleHeight = 12;
const paddleWidth = 80;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let ballRadius = 15;
let x = canvas.width / 2;
let y = canvas.height - 30;
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

// 테마 선택에 따른 공 이미지 변경 함수
function changeBallImage(theme) {
    console.log('changeBallImage 호출됨, 테마:', theme);
    switch (theme) {
        case 'cat1':
            console.log('ball1 이미지로 변경');
            currentBallImage = ballImages.ball1;
            break;
        case 'cat2':
            console.log('ball2 이미지로 변경');
            currentBallImage = ballImages.ball2;
            break;
        case 'cat3':
            console.log('ball3 이미지로 변경');
            currentBallImage = ballImages.ball3;
            break;
        default:
            console.log('기본 ball1 이미지로 변경');
            currentBallImage = ballImages.ball1;
    }
}

// 단계별 벽돌 종류 및 내구도 설정
const levels = [
    // 난이도 1
    [
        { img: 'block_images/glassCup.jpeg', scale: 0.2, hp: 1, name: '유리컵' },
        { img: 'block_images/plate.jpeg', scale: 0.2, hp: 1, name: '그릇' },
        { img: 'block_images/frame.jpeg', scale: 0.4, hp: 1, name: '액자' },
    ],
    // 난이도 2
    [
        { img: 'block_images/glassCup.jpeg', scale: 0.3, hp: 1, name: '유리컵' },
        { img: 'block_images/plate.jpeg', scale: 0.2, hp: 2, name: '그릇' },
        { img: 'block_images/frame.jpeg', scale: 0.1, hp: 2, name: '액자' },
        { img: 'block_images/box.jpeg', scale: 0.2, hp: 3, name: '택배박스' },
    ],
    // 난이도 3
    [
        { img: 'block_images/glassCup.jpeg', scale: 0.3, hp: 1, name: '유리컵' },
        { img: 'block_images/plate.jpeg', scale: 0.2, hp: 2, name: '그릇' },
        { img: 'block_images/frame.jpeg', scale: 0.1, hp: 2, name: '액자' },
        { img: 'block_images/box.jpeg', scale: 0.2, hp: 3, name: '택배박스' },
        { img: 'block_images/macbook.jpeg', scale: 0.2, hp: 30, name: '노트북' }, // BOSS
    ],
];
let currentLevel = 0;
let brickTypes = levels[currentLevel];

// 이미지 미리 로드 (모든 레벨의 벽돌 이미지)
const brickImages = {};
let imagesToLoad = 0;
let imagesLoaded = 0;
levels.flat().forEach((type) => {
    if (!brickImages[type.img]) {
        imagesToLoad++;
        const image = new Image();
        image.src = type.img;
        image.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === imagesToLoad) {
                // 모든 이미지가 로드된 후 벽돌만 생성
                randomPlaceBricks();
            }
        };
        brickImages[type.img] = image;
    }
});
if (imagesToLoad === 0) {
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    document.addEventListener('mousemove', mouseMoveHandler, false);
    $('#restartBtn').click(restartGame);
    draw();
}
const cellSize = 5; // 셀 한 칸의 크기(px)
const gridRows = Math.floor(canvas.height / cellSize);
const gridCols = Math.floor(canvas.width / cellSize);
const brickAreaRows = Math.floor(gridRows * 0.4); // 위쪽 40%만 사용
let grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));

function canPlaceBrick(row, col, brickW, brickH) {
    // brickW, brickH는 셀 단위
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
    // 실제 픽셀 좌표로 변환해서 bricks 배열에 추가
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

// 벽돌 랜덤 배치
function randomPlaceBricks() {
    // bricks = [];
    grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));
    for (let n = 0; n < 1000; n++) {
        // 충분히 반복
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
                // 내구도(hp) 추가
                bricks.push({
                    x: col * cellSize,
                    y: row * cellSize,
                    w: brickW * cellSize,
                    h: brickH * cellSize,
                    img: type.img,
                    status: 1,
                    hp: type.hp,
                    name: type.name,
                });
                for (let i = 0; i < brickH; i++) {
                    for (let j = 0; j < brickW; j++) {
                        grid[row + i][col + j] = 1;
                    }
                }
                placed = true;
            }
            tries++;
        }
        // 공간이 부족하면 break
        if (!placed) break;
    }
}
function drawBricks() {
    for (let r = 0; r < bricks.length; r++) {
        let brick = bricks[r];
        if (brick.status === 1) {
            let img = brickImages[brick.img];
            if (img && img.complete && img.naturalWidth && img.naturalHeight) {
                ctx.drawImage(img, brick.x, brick.y, brick.w, brick.h);
            } else {
                ctx.fillStyle = '#888';
                ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
            }
            // 깨지고 있다는 효과: 내구도가 줄어들수록 어두운 레이어를 덮음
            const maxHp = levels[currentLevel].find((t) => t.img === brick.img).hp;
            if (brick.hp < maxHp && brick.hp > 0) {
                ctx.save();
                // 내구도가 줄수록 더 진하게 (최대 0.6)
                let alpha = 0.2 + 0.4 * (1 - brick.hp / maxHp);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#000';
                ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
                ctx.restore();
            }
        }
    }
}
function drawBall() {
    if (currentBallImage.complete) {
        ctx.drawImage(currentBallImage, x - ballRadius, y - ballRadius, ballRadius * 2, ballRadius * 2);
    } else {
        // 이미지가 로드되지 않은 경우 기본 원형으로 표시
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.closePath();
    }
}
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight - 8, paddleWidth, paddleHeight);
    ctx.fillStyle = '#3a8dde';
    ctx.fill();
    ctx.closePath();
}

function collisionDetection() {
    for (let r = 0; r < bricks.length; r++) {
        let brick = bricks[r];
        if (brick.status === 1) {
            if (x > brick.x && x < brick.x + brick.w && y > brick.y && y < brick.y + brick.h) {
                dy = -dy;
                brick.hp--;
                if (brick.hp <= 0) {
                    brick.status = 0;
                    // 벽돌이 깨질 때, 해당 벽돌의 최초 hp만큼 점수 증가
                    const maxHp = levels[currentLevel].find((t) => t.img === brick.img).hp;
                    score += maxHp;
                    if (isAllBricksCleared()) {
                        isGameClear = true;
                        $('#restartBtn').show();
                    }
                }
            }
        }
    }
}
function isAllBricksCleared() {
    for (let r = 0; r < bricks.length; r++) {
        if (bricks[r].status === 1) return false;
    }
    return true;
}
function draw() {
    if (animationId) cancelAnimationFrame(animationId); // 이전 루프 중단
    animationId = requestAnimationFrame(draw);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    if (!isRespawning) {
        drawBall();
    }
    drawPaddle();
    collisionDetection();

    // if (isGameClear) {
    //     ctx.font = '28px Pretendard, Arial';
    //     ctx.fillStyle = '#ffd54f';
    //     ctx.fillText('축하합니다! 클리어!', canvas.width / 2 - 110, canvas.height / 2);
    //     cancelAnimationFrame(animationId); // 루프 멈춤
    //     animationId = null;
    //     return;
    // }
    // if (isGameOver) {
    //     ctx.font = '28px Pretendard, Arial';
    //     ctx.fillStyle = '#e57373';
    //     ctx.fillText('게임 오버', canvas.width / 2 - 70, canvas.height / 2);
    //     cancelAnimationFrame(animationId); // 루프 멈춤
    //     animationId = null;
    //     return;
    // }
    if (isRespawning) return; // 루프는 유지하되 일시정지
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // drawBricks();
    // if (!isRespawning) {
    //     drawBall();
    // }
    // drawPaddle();
    // collisionDetection();
    // // if (isGameClear) {
    // //     ctx.font = '28px Pretendard, Arial';
    // //     ctx.fillStyle = '#ffd54f';
    // //     ctx.fillText('축하합니다! 클리어!', canvas.width / 2 - 110, canvas.height / 2);
    // //     return;
    // // }
    // // if (isGameOver) {
    // //     ctx.font = '28px Pretendard, Arial';
    // //     ctx.fillStyle = '#e57373';
    // //     ctx.fillText('게임 오버', canvas.width / 2 - 70, canvas.height / 2);
    // //     return;
    // // }
    // if (isRespawning) {
    //     requestAnimationFrame(draw);
    //     return;

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius - paddleHeight - 8) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            lives--;
            if (!lives) {
                isGameOver = true;
                $('#restartBtn').show();
            } else {
                isRespawning = true;
                setTimeout(() => {
                    x = canvas.width / 2;
                    y = canvas.height - 30;
                    // dx = 3 * (Math.random() > 0.5 ? 1 : -1);
                    // dy = -3;
                    dx = BASE_SPEED_X * (Math.random() > 0.5 ? 1 : -1); // 방향만 랜덤, 속도는 고정
                    dy = BASE_SPEED_Y;
                    paddleX = (canvas.width - paddleWidth) / 2;
                    isRespawning = false;
                    // draw();
                }, 3000);
                // requestAnimationFrame(draw);
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
// requestAnimationFrame(draw);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}
function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}
function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}
function restartGame() {
    isGameOver = false;
    isGameClear = false;
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = BASE_SPEED_X * (Math.random() > 0.5 ? 1 : -1); // 방향만 랜덤, 속도는 고정
    dy = BASE_SPEED_Y;
    paddleX = (canvas.width - paddleWidth) / 2;
    currentLevel = 0;
    brickTypes = levels[currentLevel];
    randomPlaceBricks();
    $('#restartBtn').hide();
    draw();
}
