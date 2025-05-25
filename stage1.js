$(document).ready(function () {
    // 캔버스 안내 텍스트
    // const canvas = document.getElementById('game-canvas');
    // const ctx = canvas.getContext('2d');
    // ctx.font = '32px sans-serif';
    // ctx.fillStyle = '#888';
    // ctx.textAlign = 'center';
    // ctx.fillText('여기서 게임이 시작됩니다!', canvas.width/2, canvas.height/2);

    // 저장된 테마 적용
    const selectedCatTheme = localStorage.getItem('selectedCatTheme');
    console.log('stage1에서 읽은 테마:', selectedCatTheme); // 읽은 값 확인

    if (selectedCatTheme) {
        // 테마 값이 'cat1', 'cat2', 'cat3'인 경우에만 적용
        if (selectedCatTheme === 'cat1' || selectedCatTheme === 'cat2' || selectedCatTheme === 'cat3') {
            console.log('테마 적용:', selectedCatTheme);
            changeBallImage(selectedCatTheme);
        }
    }

    // 인트로 팝업 자동 표시
    $('#intro-modal').fadeIn(200);

    // 5초 후 자동 닫힘
    let introTimeout = setTimeout(function () {
        $('#intro-modal').fadeOut(200, function () {
            if (typeof startGame === 'function') startGame();
            startGameTimer();
        });
    }, 5000);

    // SKIP 버튼 클릭 시 즉시 닫힘
    // $('#skip-btn').click(function () {
    //     $('#intro-modal').fadeOut(200, startGameTimer);
    //     clearTimeout(introTimeout);
    // });
    $('#skip-btn').click(function () {
        $('#intro-modal').fadeOut(200, function () {
            if (typeof startGame === 'function') startGame(); // ✅ 추가
            startGameTimer();
        });
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
                isGameClear = true;
            }
        }, 1000);
    }

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

    // let gameStarted = false;
    // function startGame() {
    //     if (gameStarted) return;
    //     gameStarted = true;
    //     document.addEventListener('keydown', keyDownHandler, false);
    //     document.addEventListener('keyup', keyUpHandler, false);
    //     document.addEventListener('mousemove', mouseMoveHandler, false);
    //     $('#restartBtn').click(restartGame);
    //     draw();
    // }
});
