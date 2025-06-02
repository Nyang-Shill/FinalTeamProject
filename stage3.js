// $(document).ready(function () {
//     // 저장된 테마 적용
//     const selectedCatTheme = localStorage.getItem('selectedCatTheme');
//     console.log('stage2에서 읽은 테마:', selectedCatTheme);

//     if (selectedCatTheme) {
//         if (selectedCatTheme === 'cat1' || selectedCatTheme === 'cat2' || selectedCatTheme === 'cat3') {
//             console.log('테마 적용:', selectedCatTheme);
//             changeBallImage(selectedCatTheme);
//         }
//     }

//     // 캔버스 안내 텍스트
//     const canvas = document.getElementById('game-canvas');
//     const ctx = canvas.getContext('2d');
//     ctx.font = '32px sans-serif';
//     ctx.fillStyle = '#888';
//     ctx.textAlign = 'center';
//     ctx.fillText('여기서 게임이 시작됩니다!', canvas.width / 2, canvas.height / 2);

//     // 인트로 팝업 자동 표시
//     $('#intro-modal').fadeIn(200);

//     // 5초 후 자동 닫힘
//     let introTimeout = setTimeout(function () {
//         $('#intro-modal').fadeOut(200, function () {
//             if (typeof setLevelAndStart === 'function') setLevelAndStart();
//             startGameTimer();
//         });
//     }, 5000);

//     // SKIP 버튼 클릭 시 즉시 닫힘
//     $('#skip-btn').click(function () {
//         $('#intro-modal').fadeOut(200, function () {
//             if (typeof setLevelAndStart === 'function') setLevelAndStart();
//             startGameTimer();
//         });
//         clearTimeout(introTimeout);
//     });

//     // 제한시간 타이머
//     let timeLeft = 30;
//     let timerInterval = null;

//     function startGameTimer() {
//         $('#time-remaining').text(timeLeft);
//         timerInterval = setInterval(function () {
//             timeLeft--;
//             $('#time-remaining').text(timeLeft);
//             if (timeLeft <= 0) {
//                 clearInterval(timerInterval);
//                 showClearModal();
//             }
//         }, 1000);
//     }

//     // 스테이지 클리어 팝업 표시
//     function showClearModal() {
//         $('#clear-modal').fadeIn(200);
//     }

//     // 팝업 버튼 동작 (예시)
//     $('.clear-next-btn').click(function () {
//         window.location.href = 'stage3.html';
//     });
//     $('.clear-home-btn').click(function () {
//         window.location.href = 'home.html';
//     });
//     // 점수 버튼은 필요에 따라 동작 추가

//     function getStageLevelFromFilename() {
//         // 예: stage2.html, stage2.js → 2
//         // location.pathname: /경로/stage2.html
//         // 또는 현재 JS 파일명에서 추출
//         const match = window.location.pathname.match(/stage(\d+)/);
//         if (match) {
//             // currentLevel은 0부터 시작이므로 -1
//             return parseInt(match[1], 10) - 1;
//         }
//         return 0; // 기본값: 1스테이지
//     }
//     let gameInitialized = false;

//     function setLevelAndStart() {
//         if (gameInitialized) return;
//         gameInitialized = true;
//         if (typeof currentLevel !== 'undefined') {
//             currentLevel = getStageLevelFromFilename();
//             brickTypes = levels[currentLevel];
//             randomPlaceBricks();
//         }
//         if (typeof startGame === 'function') startGame();
//     }
// });
$(document).ready(function () {
    // 저장된 테마 적용
    const selectedCatTheme = localStorage.getItem('selectedCatTheme');
    console.log('stage2에서 읽은 테마:', selectedCatTheme);

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
    ctx.fillText('여기서 게임이 시작됩니다!', canvas.width / 2, canvas.height / 2);

    // 인트로 팝업 자동 표시
    $('#intro-modal').fadeIn(200);

    // 5초 후 자동 닫힘
    let introTimeout = setTimeout(function () {
        $('#intro-modal').fadeOut(200, function () {
            if (typeof setLevelAndStart === 'function') setLevelAndStart();
            startGameTimer();
        });
    }, 5000);

    // SKIP 버튼 클릭 시 즉시 닫힘
    $('#skip-btn').click(function () {
        $('#intro-modal').fadeOut(200, function () {
            if (typeof setLevelAndStart === 'function') setLevelAndStart();
            startGameTimer();
        });
        clearTimeout(introTimeout);
    });

    // 제한시간 타이머
    let timeLeft = 10;
    let timerInterval = null;

    // function startGameTimer() {
    //     $('#time-remaining').text(timeLeft);
    //     timerInterval = setInterval(function () {
    //         timeLeft--;
    //         $('#time-remaining').text(timeLeft);
    //         if (timeLeft <= 0) {
    //             clearInterval(timerInterval);
    //             showClearModal();
    //         }
    //     }, 1000);
    // }

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
        $('.clear-score-btn').text(`점수: ${score}`);
        $('#clear-modal').fadeIn(200);
    }

    // 팝업 버튼 동작 (예시)
    $('.clear-next-btn').click(function () {
        window.location.href = 'stage3.html';
    });
    $('.clear-home-btn').click(function () {
        window.location.href = 'home.html';
    });
    // 점수 버튼은 필요에 따라 동작 추가

    function getStageLevelFromFilename() {
        // 예: stage2.html, stage2.js → 2
        // location.pathname: /경로/stage2.html
        // 또는 현재 JS 파일명에서 추출
        const match = window.location.pathname.match(/stage(\d+)/);
        if (match) {
            // currentLevel은 0부터 시작이므로 -1
            return parseInt(match[1], 10) - 1;
        }
        return 0; // 기본값: 1스테이지
    }

    function setLevelAndStart() {
        if (typeof currentLevel !== 'undefined') {
            currentLevel = getStageLevelFromFilename();
            brickTypes = levels[currentLevel];
            randomPlaceBricks();
        }
        if (typeof startGame === 'function') startGame();
    }

  }

  // 캔버스 안내 텍스트
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = '32px sans-serif';
  ctx.fillStyle = '#888';
  ctx.textAlign = 'center';
  ctx.fillText('여기서 게임이 시작됩니다!', canvas.width/2, canvas.height/2);

  let currentImageIndex = 1;
  const maxImageIndex = 2;

  // 인트로 모달 표시
  $('#intro-modal').show();
  updateArrowVisibility();
  updateSkipButton();

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

  // 팝업 버튼 동작
  $('.clear-next-btn').click(function () {
    window.location.href = 'stage4.html';
  });
  $('.clear-home-btn').click(function () {
    window.location.href = 'home.html';
  });
  
  // 왼쪽 화살표 클릭
  $('.left-arrow').click(function() {
    if (currentImageIndex > 1) {
      currentImageIndex--;
      updateImage();
      updateArrowVisibility();
      updateSkipButton();
    }
  });
  
  // 오른쪽 화살표 클릭
  $('.right-arrow').click(function() {
    if (currentImageIndex < maxImageIndex) {
      currentImageIndex++;
      updateImage();
      updateArrowVisibility();
      updateSkipButton();
    }
  });
  
  // SKIP/게임시작 버튼 클릭
  $('#skip-btn').click(function() {
    $('#intro-modal').hide();
    startGameTimer();
  });
  
  // 이미지 업데이트 함수
  function updateImage() {
    $('.intro-image').attr('src', `scenes_images/stage3_${currentImageIndex}.png`);
  }

  // 화살표 가시성 업데이트 함수
  function updateArrowVisibility() {
    if (currentImageIndex === 1) {
      $('.left-arrow').css('visibility', 'hidden');
    } else {
      $('.left-arrow').css('visibility', 'visible');
    }

    if (currentImageIndex === maxImageIndex) {
      $('.right-arrow').css('visibility', 'hidden');
    } else {
      $('.right-arrow').css('visibility', 'visible');
    }
  }

  // SKIP/게임시작 버튼 업데이트 함수
  function updateSkipButton() {
    if (currentImageIndex === maxImageIndex) {
      $('#skip-btn').text('게임시작');
    } else {
      $('#skip-btn').text('SKIP');
    }
  }

});

// 게임 시작 함수
function startGame() {
  // 게임 시작 로직
  console.log('Game started');
}
