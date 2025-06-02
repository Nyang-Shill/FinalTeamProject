$(document).ready(function () {
  console.log("게임 초기화 시작");
  
  // 저장된 테마 적용
  const selectedCatTheme = localStorage.getItem('selectedCatTheme');
  console.log('stage3에서 읽은 테마:', selectedCatTheme);
  
  //컷신추가!!
    // 현재 이미지 인덱스 관리
    let currentImageIndex = 1;
    const maxImageIndex = 5;  // 최대 이미지 번호

    // 화살표 표시/숨김 업데이트 함수
    function updateArrows() {
        if (currentImageIndex === 1) {
            $('.left-arrow').css('visibility', 'hidden');
        } else {
            $('.left-arrow').css('visibility', 'visible');
        }

        if (currentImageIndex === maxImageIndex) {
            $('.right-arrow').css('visibility', 'hidden');
            $('#skip-btn').text('게임 시작');
        } else {
            $('.right-arrow').css('visibility', 'visible');
            $('#skip-btn').text('SKIP');
        }
    }

    // 이미지 변경 함수
    function changeImage(index) {
        const introImage = $('.intro-image');
        introImage.fadeOut(200, function() {
            introImage.attr('src', `scenes_images/stage4_${index}.png`);
            introImage.fadeIn(200);
            updateArrows();  // 이미지 변경 후 화살표 상태 업데이트
        });
    }

    // 오른쪽 화살표 클릭 이벤트
    $('.right-arrow').click(function() {
        if (currentImageIndex < maxImageIndex) {
            currentImageIndex++;
            changeImage(currentImageIndex);
        }
    });

    // 왼쪽 화살표 클릭 이벤트
    $('.left-arrow').click(function() {
        if (currentImageIndex > 1) {
            currentImageIndex--;
            changeImage(currentImageIndex);
        }
    });

    // 인트로 팝업 자동 표시
    $('#intro-modal').fadeIn(200);
    updateArrows();  // 초기 화살표 상태 설정

    // SKIP/게임 시작 버튼 클릭 시 즉시 닫힘
    $('#skip-btn').click(function () {
        $('#intro-modal').fadeOut(200, function () {
            if (typeof startGame === 'function') startGame();
            startGameTimer();
        });
    });


  
  // 캔버스 초기화
  const canvas = document.getElementById('game-canvas'); // gameCanvas -> game-canvas로 수정
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

  // 벽돌 객체 (랜덤 내구도)
  const brickTypes = [
    { 
      name: '유리컵', 
      hp: 1, 
      color: '#ADD8E6',
      borderColor: '#87CEEB',
      images: ['block_images/glassCup_1.PNG']
    },
    { 
      name: '그릇', 
      hp: 2, 
      color: '#FFE4E1',
      borderColor: '#FFB6C1',
      images: ['block_images/plate1_1.PNG', 'block_images/plate1_2.PNG']
    },
    { 
      name: '액자', 
      hp: 2, 
      color: '#DEB887',
      borderColor: '#8B4513',
      images: ['block_images/frame1_1.PNG', 'block_images/frame1_2.PNG']
    },
    { 
      name: '택배박스', 
      hp: 3, 
      color: '#D2B48C',
      borderColor: '#8B4513',
      images: ['block_images/box1_1.PNG', 'block_images/box1_2.PNG', 'block_images/box1_3.PNG']
    },
    { 
      name: '노트북', 
      hp: 30, 
      color: '#C0C0C0',
      borderColor: '#808080',
      images: ['block_images/notebook_1.PNG']
    }
  ];

  // 이미지 불러오기
  const catImg = new Image();
  const handImg = new Image();
  const brickImages = {};
  const ballImages = [];

  // 테마에 따른 이미지 설정
  if (selectedCatTheme) {
    const themeNum = selectedCatTheme.replace('cat', '');
    catImg.src = `ball_images/ball${themeNum}.PNG`;
    handImg.src = `paddle_images/paddle${themeNum}.PNG`;
  } else {
    catImg.src = "ball_images/ball1.PNG";
    handImg.src = "paddle_images/paddle1.PNG";
  }

  // 공 이미지 로드
  for (let i = 1; i <= 3; i++) {
    const img = new Image();
    img.src = `ball_images/ball${i}.PNG`;
    ballImages.push(img);
  }

  // 벽돌 이미지 로드
  brickTypes.forEach(type => {
    brickImages[type.name] = [];
    type.images.forEach(imgSrc => {
      const img = new Image();
      img.src = imgSrc;
      brickImages[type.name].push(img);
    });
  });

  // 이미지 로드 확인
  let imagesLoaded = 0;
  const totalImages = 2 + brickTypes.reduce((sum, type) => sum + type.images.length, 0) + ballImages.length;

  function checkAllImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
      console.log("모든 이미지 로드 완료");
      startGame();
    }
  }

  catImg.onload = checkAllImagesLoaded;
  handImg.onload = checkAllImagesLoaded;
  ballImages.forEach(img => {
    img.onload = checkAllImagesLoaded;
    img.onerror = () => console.log(`${img.src} 이미지 로드 실패`);
  });
  Object.values(brickImages).forEach(images => {
    images.forEach(img => {
      img.onload = checkAllImagesLoaded;
      img.onerror = () => console.log(`${img.src} 이미지 로드 실패`);
    });
  });
  catImg.onerror = () => console.log("고양이 이미지 로드 실패");
  handImg.onerror = () => console.log("손 이미지 로드 실패");

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
    const randomBallIndex = Math.floor(Math.random() * ballImages.length);
    balls.push({
      x: cat.x + cat.size / 2,
      y: cat.y + cat.size / 2,
      dx: Math.cos(angle) * 3,
      dy: Math.sin(angle) * 3,
      radius: 8,
      imageIndex: randomBallIndex
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
        maxHp: type.hp, // 최대 HP 저장
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
      
      // HP에 따른 이미지 선택
      const imageIndex = Math.floor((b.maxHp - b.hp) / (b.maxHp / type.images.length));
      const img = brickImages[b.name][Math.min(imageIndex, type.images.length - 1)];
      ctx.drawImage(img, b.x, b.y, b.w, b.h);
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
      const img = ballImages[ball.imageIndex];
      ctx.drawImage(img, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
    });
  }

  function drawCat() {
    ctx.drawImage(catImg, cat.x, cat.y, cat.size, cat.size);
  }

  function updateScore() {
    $('#score-box').text(`수리비: ${score}원`); // scoreBoard -> score-box로 수정
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
