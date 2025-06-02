let timerInterval = null;
$(document).ready(function () {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    // 테마 적용
    const selectedCatTheme = localStorage.getItem('selectedCatTheme');
    if (selectedCatTheme && ['cat1', 'cat2', 'cat3'].includes(selectedCatTheme)) {
        changeBallImage(selectedCatTheme);
    }

    // 안내 텍스트
    // ctx.font = '32px sans-serif';
    // ctx.fillStyle = '#888';
    // ctx.textAlign = 'center';
    // ctx.fillText('여기서 게임이 시작됩니다!', canvas.width / 2, canvas.height / 2);

    // 모달 이미지 슬라이드
    let currentImageIndex = 1;
    const maxImageIndex = 2;

    $('#intro-modal').fadeIn(200);
    updateArrowVisibility();
    updateSkipButton();

    $('.left-arrow').click(function () {
        if (currentImageIndex > 1) {
            currentImageIndex--;
            updateImage();
            updateArrowVisibility();
            updateSkipButton();
        }
    });

    $('.right-arrow').click(function () {
        if (currentImageIndex < maxImageIndex) {
            currentImageIndex++;
            updateImage();
            updateArrowVisibility();
            updateSkipButton();
        }
    });

    $('#skip-btn').click(function () {
        $('#intro-modal').fadeOut(200, function () {
            if (typeof setLevelAndStart === 'function') setLevelAndStart();
            startGameTimer();
        });
    });

    // 타이머
    let timeLeft = 10;

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

    function showClearModal() {
        $('.clear-score-btn').text(`점수: ${score}`);
        $('#clear-modal').fadeIn(200);
    }

    $('.clear-next-btn').click(function () {
        window.location.href = 'stage4.html';
    });

    $('.clear-home-btn').click(function () {
        window.location.href = 'home.html';
    });

    function updateImage() {
        $('.intro-image').attr('src', `scenes_images/stage3_${currentImageIndex}.png`);
    }

    function updateArrowVisibility() {
        $('.left-arrow').css('visibility', currentImageIndex === 1 ? 'hidden' : 'visible');
        $('.right-arrow').css('visibility', currentImageIndex === maxImageIndex ? 'hidden' : 'visible');
    }

    function updateSkipButton() {
        $('#skip-btn').text(currentImageIndex === maxImageIndex ? '게임시작' : 'SKIP');
    }

    function getStageLevelFromFilename() {
        const match = window.location.pathname.match(/stage(\d+)/);
        return match ? parseInt(match[1], 10) - 1 : 0;
    }

    function setLevelAndStart() {
        if (typeof currentLevel !== 'undefined') {
            currentLevel = getStageLevelFromFilename();
            brickTypes = levels[currentLevel];
            randomPlaceBricks();
        }
        if (typeof startGame === 'function') startGame();
    }
}); // <-- 이 닫는 중괄호/괄호가 빠져있었음

// // 게임 시작 외부 정의
// function startGame() {
//     console.log('Game started');
// }
