$(document).ready(function () {
  console.log("게임 초기화 시작");
  
  // 저장된 테마 적용
  const selectedCatTheme = localStorage.getItem('selectedCatTheme');
  console.log('stage3에서 읽은 테마:', selectedCatTheme);
  
  // 캔버스 초기화
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  
  // 캔버스 크기 설정
  canvas.width = 800;
  canvas.height = 600;

  // 게임 변수 초기화
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
  const handImg = new Image();

  // 테마에 따른 이미지 설정
  if (selectedCatTheme) {
    const themeNum = selectedCatTheme.replace('cat', '');
    catImg.src = `ball_images/ball${themeNum}.PNG`;
    handImg.src = `paddle_images/paddle${themeNum}.PNG`;
  } else {
    catImg.src = "ball_images/ball1.PNG";
    handImg.src = "paddle_images/paddle1.PNG";
  }

  // 이미지 로드 확인
  let imagesLoaded = 0;
  const totalImages = 2;

  function checkAllImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
      console.log("모든 이미지 로드 완료");
      startGame();
    }
  }

  catImg.onload = checkAllImagesLoaded;
  handImg.onload = checkAllImagesLoaded;
  catImg.onerror = () => console.log("고양이 이미지 로드 실패");
  handImg.onerror = () => console.log("손 이미지 로드 실패");

  // 벽돌 객체 (랜덤 내구도)
  const brickTypes = [
    { 
      name: '유리컵', 
      hp: 1, 
      color: '#ADD8E6',
      borderColor: '#87CEEB',
      image: '🥛'
    },
    { 
      name: '그릇', 
      hp: 2, 
      color: '#FFE4E1',
      borderColor: '#FFB6C1',
      image: '🥣'
    },
    { 
      name: '액자', 
      hp: 2, 
      color: '#DEB887',
      borderColor: '#8B4513',
      image: '🖼️'
    },
    { 
      name: '택배박스', 
      hp: 3, 
      color: '#D2B48C',
      borderColor: '#8B4513',
      image: '📦'
    },
    { 
      name: '노트북', 
      hp: 30, 
      color: '#C0C0C0',
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

  // 마우스 이벤트 리스너
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
        w: 50,
        h: 50,
        hp: type.hp, 
        name: type.name
      });
    }
  }

  function drawBricks() {
    bricks.forEach(b => {
      const type = brickTypes.find(t => t.name === b.name);
      ctx.fillStyle = type.color;
      ctx.strokeStyle = type.borderColor;
      ctx.lineWidth = 2;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(type.image, b.x + b.w/2, b.y + b.h/2);
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

  function updateScore() {
    $('#scoreBoard').text(`수리비: ${score}원`);
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawCat();
    updateAndDrawParticles();
    drawPaddle();
    drawBalls();
    updateBalls();
    updateScore();

    if (Date.now() - lastSpawn > 10000 && balls.length < maxBalls) {
      cat.x = Math.random() * (canvas.width - cat.size);
      cat.y = Math.random() * (canvas.height - cat.size);
      createBall();
      lastSpawn = Date.now();
    }

    requestAnimationFrame(gameLoop);
  }

  function startGame() {
    console.log("게임 시작");
    createBricks();
    createBall();
    lastSpawn = Date.now();
    gameLoop();

    // 인트로 팝업 자동 표시
    $('#intro-modal').fadeIn(200);

    // 5초 후 자동 닫힘
    let introTimeout = setTimeout(function () {
      $('#intro-modal').fadeOut(200);
    }, 5000);

    // SKIP 버튼 클릭 시 즉시 닫힘
    $('#skip-btn').click(function () {
      $('#intro-modal').fadeOut(200);
      clearTimeout(introTimeout);
    });

    // 타이머 시작
    setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        $('#time-remaining').text(timeLeft);
      } else {
        $('#clear-modal').fadeIn(200);
      }
    }, 1000);
  }

  // 홈으로 버튼
  $('.clear-home-btn').click(function () {
    window.location.href = 'home.html';
  });
});

console.log("JS 실행됨!");
