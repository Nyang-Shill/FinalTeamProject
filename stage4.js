$(document).ready(function () {
  // 저장된 테마 적용
  const selectedCatTheme = localStorage.getItem('selectedCatTheme');
  console.log('stage3에서 읽은 테마:', selectedCatTheme);
  
  if (selectedCatTheme) {
    if (selectedCatTheme === 'cat1' || selectedCatTheme === 'cat2' || selectedCatTheme === 'cat3') {
      console.log('테마 적용:', selectedCatTheme);
      changeBallImage(selectedCatTheme);
    }
  }

  // 캔버스 안내 텍스트
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = '32px sans-serif';
  ctx.fillStyle = '#888';
  ctx.textAlign = 'center';
  ctx.fillText('여기서 게임이 시작됩니다!', canvas.width/2, canvas.height/2);

  // 인트로 팝업 자동 표시
  $('#intro-modal').fadeIn(200);

  // 5초 후 자동 닫힘
  let introTimeout = setTimeout(function () {
    $('#intro-modal').fadeOut(200, startGameTimer);
  }, 5000);

  // SKIP 버튼 클릭 시 즉시 닫힘
  $('#skip-btn').click(function () {
    $('#intro-modal').fadeOut(200, startGameTimer);
    clearTimeout(introTimeout);
  });

  // 제한시간 타이머
  let timeLeft = 30;
  let timerInterval = null;

  function startGameTimer() {
    $('#time-remaining').text(timeLeft);
    timerInterval = setInterval(function () {
      timeLeft--;
      $('#time-remaining').text(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        showClearModal();
      }
    }, 1000);
  }

  // 스테이지 클리어 팝업 표시
  function showClearModal() {
    $('#clear-modal').fadeIn(200);
  }

  // 팝업 버튼 동작 (예시)
  $('.clear-next-btn').click(function () {
    window.location.href = 'stage4.html';
  });
  $('.clear-home-btn').click(function () {
    window.location.href = 'home.html';
  });
  // 점수 버튼은 필요에 따라 동작 추가
});

console.log("JS 실행됨!");
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Make sure canvas size is set
canvas.width = 800;
canvas.height = 600;

let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let score = 0;
let timeLeft = 30;
let balls = [];
let bricks = [];
let lastSpawn = 0;
let maxBalls = 3;
let paddleTrail = [];
let particles = [];
const TRAIL_LENGTH = 10;

// 이미지 불러오기
const catImg = new Image();
catImg.src = "cat.png";

const handImg = new Image();
handImg.src = "hand.png";

// Verify image loading
handImg.onload = () => {
    console.log("Hand image loaded successfully");
};
handImg.onerror = () => {
    console.log("Error loading hand image");
};

// 벽돌 객체 (랜덤 내구도)
const brickTypes = [
    { 
        name: '유리컵', 
        hp: 1, 
        color: '#ADD8E6',  // Light blue
        borderColor: '#87CEEB',
        image: '🥛'
    },
    { 
        name: '그릇', 
        hp: 2, 
        color: '#FFE4E1',  // Misty rose
        borderColor: '#FFB6C1',
        image: '🥣'
    },
    { 
        name: '액자', 
        hp: 2, 
        color: '#DEB887',  // Burly wood
        borderColor: '#8B4513',
        image: '🖼️'
    },
    { 
        name: '택배박스', 
        hp: 3, 
        color: '#D2B48C',  // Tan
        borderColor: '#8B4513',
        image: '📦'
    },
    { 
        name: '노트북', 
        hp: 30, 
        color: '#C0C0C0',  // Silver
        borderColor: '#808080',
        image: '💻'
    }
];

// 고양이 위치
let cat = {
    x: 50,
    y: 50,
    size: 80
};

// 패들 객체
const paddle = {
    x: centerX,
    y: centerY,
    width: 60,
    height: 60,
    angle: 0
};

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const dx = e.clientX - rect.left - centerX;
    const dy = e.clientY - rect.top - centerY;
    paddle.angle = Math.atan2(dy, dx);
});

function createBall() {
    const angle = Math.random() * Math.PI * 2;
    balls.push({
        x: cat.x + cat.size / 2,
        y: cat.y + cat.size / 2,
        dx: Math.cos(angle) * 3,
        dy: Math.sin(angle) * 3,
        radius: 8
    });
}

function createBreakEffect(brick) {
    for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        particles.push({
            x: brick.x + brick.w/2,
            y: brick.y + brick.h/2,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            life: 1.0,
            color: brickTypes.find(t => t.name === brick.name).color
        });
    }
}

function createBricks() {
    bricks = [];
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 80 + Math.random() * 50;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const type = brickTypes[Math.floor(Math.random() * brickTypes.length)];
        bricks.push({
            x, 
            y, 
            w: 50,  // Slightly larger width
            h: 50,  // Slightly larger height
            hp: type.hp, 
            name: type.name
        });
    }
}

function drawBricks() {
    bricks.forEach(b => {
        const type = brickTypes.find(t => t.name === b.name);
        
        // Draw shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Draw main brick background
        ctx.fillStyle = type.color;
        ctx.strokeStyle = type.borderColor;
        ctx.lineWidth = 2;

        // Draw rounded rectangle
        ctx.beginPath();
        const radius = 8;
        ctx.moveTo(b.x + radius, b.y);
        ctx.lineTo(b.x + b.w - radius, b.y);
        ctx.quadraticCurveTo(b.x + b.w, b.y, b.x + b.w, b.y + radius);
        ctx.lineTo(b.x + b.w, b.y + b.h - radius);
        ctx.quadraticCurveTo(b.x + b.w, b.y + b.h, b.x + b.w - radius, b.y + b.h);
        ctx.lineTo(b.x + radius, b.y + b.h);
        ctx.quadraticCurveTo(b.x, b.y + b.h, b.x, b.y + b.h - radius);
        ctx.lineTo(b.x, b.y + radius);
        ctx.quadraticCurveTo(b.x, b.y, b.x + radius, b.y);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw highlight
        const gradient = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw emoji
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(type.image, b.x + b.w/2, b.y + b.h/2 - 10);

        // Draw name
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText(b.name, b.x + b.w/2, b.y + b.h - 10);
        
        // Draw HP bars
        const hpWidth = 30;
        const hpHeight = 4;
        const maxHp = brickTypes.find(t => t.name === b.name).hp;
        const hpX = b.x + (b.w - hpWidth) / 2;
        const hpY = b.y + b.h - 20;

        // HP background
        ctx.fillStyle = '#ddd';
        ctx.fillRect(hpX, hpY, hpWidth, hpHeight);

        // HP bar
        const hpRatio = b.hp / maxHp;
        const hpColor = hpRatio > 0.6 ? '#4CAF50' : hpRatio > 0.3 ? '#FFC107' : '#F44336';
        ctx.fillStyle = hpColor;
        ctx.fillRect(hpX, hpY, hpWidth * hpRatio, hpHeight);
    });
}

function drawPaddle() {
    const radius = 200;
    const x = centerX + Math.cos(paddle.angle) * radius;
    const y = centerY + Math.sin(paddle.angle) * radius;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(paddle.angle);
    ctx.drawImage(handImg, -paddle.width / 2, -paddle.height / 2, paddle.width, paddle.height);
    ctx.restore();
}

function updateAndDrawParticles() {
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.02;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color ? `${p.color}${Math.floor(p.life * 255).toString(16).padStart(2, '0')}` : 
                                 `rgba(255, 255, 255, ${p.life})`;
        ctx.fill();
    });
}

function updateBalls() {
    balls.forEach(ball => {
        ball.x += ball.dx;
        ball.y += ball.dy;

        // 벽 반사
        if (ball.x < 0 || ball.x > canvas.width) ball.dx *= -1;
        if (ball.y < 0 || ball.y > canvas.height) ball.dy *= -1;

        // 패들 충돌
        const radius = 200;
        const px = centerX + Math.cos(paddle.angle) * radius;
        const py = centerY + Math.sin(paddle.angle) * radius;
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
                brick.hp--;
                if (brick.hp <= 0) {
                    createBreakEffect(brick);
                    bricks.splice(i, 1);
                    score += 1000;
                } else {
                    score += 500;
                    createBreakEffect(brick);
                }
                ball.dy *= -1;
            }
        });
    });
}

function drawBalls() {
    balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6666';
        ctx.fill();
        ctx.closePath();
    });
}

function drawCat() {
    ctx.drawImage(catImg, cat.x, cat.y, cat.size, cat.size);
}

function drawHUD() {
    document.getElementById('scoreBoard').innerHTML = `수리비: ${score}원 | 남은 시간: <span id="time">${timeLeft}</span>초`;
}

function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawCat();
    updateAndDrawParticles();
    drawPaddle();
    drawBalls();
    updateBalls();
    drawHUD();

    if (timestamp - lastSpawn > 10000 && balls.length < maxBalls) {
        cat.x = Math.random() * (canvas.width - cat.size);
        cat.y = Math.random() * (canvas.height - cat.size);
        createBall();
        lastSpawn = timestamp;
    }

    requestAnimationFrame(gameLoop);
}

// 시작
createBricks();
createBall();
lastSpawn = performance.now();
requestAnimationFrame(gameLoop);

// 타이머
setInterval(() => {
    if (timeLeft > 0) {
        timeLeft--;
    } else {
        alert("츄르 엔딩 등장! 고양이는 결국 쓰담쓰담을 받았습니다.");
        location.reload();
    }
}, 1000);
