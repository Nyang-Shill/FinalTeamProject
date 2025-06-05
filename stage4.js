$(document).ready(function () {
  // 저장된 테마 적용
  const selectedCatTheme = localStorage.getItem('selectedCatTheme');
  console.log('stage4에서 읽은 테마:', selectedCatTheme);
  
  if (selectedCatTheme) {
    if (selectedCatTheme === 'cat1' || selectedCatTheme === 'cat2' || selectedCatTheme === 'cat3') {
      console.log('테마 적용:', selectedCatTheme);
      changeBallImage(selectedCatTheme);
    }
  }

<<<<<<< Updated upstream
  // 캔버스 안내 텍스트
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = '32px sans-serif';
  ctx.fillStyle = '#888';
  ctx.textAlign = 'center';
  ctx.fillText('여기서 게임이 시작됩니다!', canvas.width/2, canvas.height/2);
=======
// 테마에 따른 고양이 이미지 매핑
const catThemeMapping = {
    'cat1': 'cat2.jpg',
    'cat2': 'cat1.jpg',
    'cat3': 'cat3.jpg'
};

// 테마에 따른 공 이미지 매핑
const ballThemeMapping = {
    'cat1': 1,
    'cat2': 2,
    'cat3': 3
};
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
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
=======
// 이미지 초기화 함수
function initImages() {
    console.log("이미지 초기화 시작");
    
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
            // 이미지 로드 완료 후에도 자동으로 게임을 시작하지 않음
        }
    }
    
    function handleImageError(img, type) {
        console.error(`${type} 이미지 로드 실패:`, img.src);
        imagesFailed++;
        checkImagesLoaded();
    }
    
    // 선택된 테마 가져오기
    const selectedTheme = localStorage.getItem('selectedCatTheme') || 'cat1';
    console.log('선택된 고양이 테마:', selectedTheme);
    
    // 고양이 이미지 로드 (테마에 따라)
    const catImageName = catThemeMapping[selectedTheme] || 'cat2.jpg';
    catImg.onload = checkImagesLoaded;
    catImg.onerror = () => handleImageError(catImg, "고양이");
    catImg.src = `./images/${catImageName}`;
    console.log('로드할 고양이 이미지:', catImg.src);
    
    // 패들 이미지 로드 (hand.PNG)
    handImg.onload = checkImagesLoaded;
    handImg.onerror = () => handleImageError(handImg, "손");
    handImg.src = "./images/hand.PNG";
    
    // 공 이미지 로드 (선택된 테마에 따라 하나의 공 이미지만 사용)
    const ballImageIndex = ballThemeMapping[selectedTheme] || 1;
    console.log('선택된 공 이미지 인덱스:', ballImageIndex);
    
    const ballImg = new Image();
    ballImg.onload = checkImagesLoaded;
    ballImg.onerror = () => handleImageError(ballImg, "공");
    ballImg.src = `./ball_images/ball${ballImageIndex}.PNG`;
    console.log('로드할 공 이미지:', ballImg.src);
    ballImages = [ballImg];
    
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
>>>>>>> Stashed changes

  // 스테이지 클리어 팝업 표시
  function showClearModal() {
    $('#clear-modal').fadeIn(200);
  }

  // 팝업 버튼 동작 (예시)
  $('.clear-next-btn').click(function () {
    window.location.href = 'stage2.html';
  });
  $('.clear-home-btn').click(function () {
    window.location.href = 'home.html';
  });
  // 점수 버튼은 필요에 따라 동작 추가
});
