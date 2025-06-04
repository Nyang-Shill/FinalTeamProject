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
    // const canvas = document.getElementById('game-canvas');
    // const ctx = canvas.getContext('2d');
    // ctx.font = '32px sans-serif';
    // ctx.fillStyle = '#888';
    // ctx.textAlign = 'center';
    // ctx.fillText('여기서 게임이 시작됩니다!', canvas.width / 2, canvas.height / 2);
    // 현재 이미지 인덱스 관리
    let currentImageIndex = 1;
    const maxImageIndex = 3;  // 최대 이미지 번호

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
            introImage.attr('src', `scenes_images/stage2_${index}.png`);
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
            if (typeof setLevelAndStart === 'function') setLevelAndStart();
            startGameTimer();
        });
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
                isGameClear = true;
                cancelAnimationFrame(animationId);
                animationId = null;
                showClearModal();
            }
        }, 1000);
    }

    // 스테이지 클리어 팝업 표시
    function showClearModal() {
        if (typeof stopGame === 'function') {
            stopGame();
        }
        $('#clear-modal').fadeIn(200);
    }

    // 팝업 버튼 동작
    $('.clear-next-btn').click(function () {
        window.location.href = 'stage3.html';
    });
    $('.clear-home-btn').click(function () {
        window.location.href = 'home.html';
    });

    function getStageLevelFromFilename() {
        const match = window.location.pathname.match(/stage(\d+)/);
        if (match) {
            return parseInt(match[1], 10) - 1;
        }
        return 0;
    }

    function setLevelAndStart() {

        currentLevel = getStageLevelFromFilename();
        brickTypes = levels[currentLevel];
        bricks = [];
        grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));
        randomPlaceBricks();

        if (typeof startGame === 'function') startGame();
    }
});
