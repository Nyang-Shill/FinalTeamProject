
// 전역 변수 선언
let timeLeft = 30;
let timerInterval = null;
let currentEndImageIndex = 1;
const maxEndImageIndex = 6;
let isGameEndModalShown = false;
let currentImageIndex = 1;
const maxImageIndex = 2;

$(document).ready(function () {
    // 테마에 따른 배경 이미지 매핑
    const backgroundThemeMapping = {
        'interior1': 'background1.png',
        'interior2': 'background2.png',
        'interior3': 'background3.png'
    };

    // 테마에 따른 stage-title 색상 매핑
    const titleColorMapping = {
        'interior1': '#617131',
        'interior2': '#878A37',
        'interior3': '#AC9903'
    };

    // 배경 이미지 설정
    const selectedTheme = localStorage.getItem('selectedInteriorTheme');
    console.log('선택된 인테리어 테마:', selectedTheme);
    
    if (selectedTheme && backgroundThemeMapping[selectedTheme]) {
        const backgroundImageName = backgroundThemeMapping[selectedTheme];
        document.body.style.backgroundImage = `url('./images/${backgroundImageName}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        // stage-title 색상 설정
        $('.stage-title').css({
            'color': titleColorMapping[selectedTheme],
            'border-color': titleColorMapping[selectedTheme]
        });
        console.log("배경 이미지 설정:", backgroundImageName);
    } else {
        // 기본 배경 이미지 설정
        document.body.style.backgroundImage = `url('./images/background1.png')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        // 기본 stage-title 색상 설정
        $('.stage-title').css({
            'color': '#617131',
            'border-color': '#617131'
        });
        console.log("기본 배경 이미지 설정: background1.png");
    }

    // 저장된 테마 적용
    const selectedCatTheme = localStorage.getItem('selectedCatTheme');
    console.log('stage3에서 읽은 테마:', selectedCatTheme);


    // 테마 적용
    if (selectedCatTheme && ['cat1', 'cat2', 'cat3'].includes(selectedCatTheme)) {
        changeBallImage(selectedCatTheme);
    }

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

    // SKIP 버튼 클릭 시 즉시 닫힘
    $('#skip-btn').click(function () {
        if ($('#intro-modal').is(':visible')) {
            $('#intro-modal').fadeOut(200, function () {
                if (typeof setLevelAndStart === 'function') setLevelAndStart();
                startGameTimer();
            });
        }
    });

    function getStageLevelFromFilename() {
        const match = window.location.pathname.match(/stage(\d+)/);
        if (match) {
            return parseInt(match[1], 10) - 1;
        }
        return 0;
    }

    function setLevelAndStart() {
        if (typeof currentLevel !== 'undefined') {
            currentLevel = getStageLevelFromFilename();
            brickTypes = levels[currentLevel];
            randomPlaceBricks();
        }
        if (typeof startGame === 'function') startGame();
    }


    // 인트로 모달 표시
    $('#intro-modal').show();
    updateIntroArrows();
    updateIntroSkipButton();

    // 게임 시작 관련 함수들
    function updateIntroImage() {
        const introImage = $('#intro-modal .intro-image');
        introImage.fadeOut(200, function() {
            introImage.attr('src', `scenes_images/stage3_${currentImageIndex}.png`);
            introImage.fadeIn(200);
            updateIntroArrows();
            updateIntroSkipButton();
        });
    }

    function updateIntroArrows() {
        if (currentImageIndex === 1) {
            $('#intro-modal .left-arrow').css('visibility', 'hidden');
        } else {
            $('#intro-modal .left-arrow').css('visibility', 'visible');
        }

        if (currentImageIndex === maxImageIndex) {
            $('#intro-modal .right-arrow').css('visibility', 'hidden');
            $('#intro-modal #skip-btn').text('게임 시작');
        } else {
            $('#intro-modal .right-arrow').css('visibility', 'visible');
            $('#intro-modal #skip-btn').text('SKIP');
        }
    }

    function updateIntroSkipButton() {
        if (currentImageIndex === maxImageIndex) {
            $('#intro-modal #skip-btn').text('게임 시작');
        } else {
            $('#intro-modal #skip-btn').text('SKIP');
        }
    }

    // 게임 시작 화살표 클릭 이벤트
    $('#intro-modal .left-arrow').click(function() {
        if (currentImageIndex > 1) {
            currentImageIndex--;
            updateIntroImage();
        }
    });

    $('#intro-modal .right-arrow').click(function() {
        if (currentImageIndex < maxImageIndex) {
            currentImageIndex++;
            updateIntroImage();
        }
    });

    // 게임 시작 SKIP 버튼 클릭
    $('#intro-modal #skip-btn').click(function() {
        $('#intro-modal').fadeOut(200, function() {
            if (typeof setLevelAndStart === 'function') setLevelAndStart();
            startGameTimer();
        });
    });

    // 게임 종료 관련 함수들
    function updateEndImage() {
        const endImage = $('#game-end-modal .intro-image');
        endImage.fadeOut(200, function() {
            endImage.attr('src', `scenes_images/stage3_end_${currentEndImageIndex}.png`);
            endImage.fadeIn(200);
            updateEndArrows();
        });
    }

    function updateEndArrows() {
        if (currentEndImageIndex === 1) {
            $('#game-end-modal .left-arrow').css('visibility', 'hidden');
            $('#game-end-modal #skip-btn').text('SKIP');
        } else {
            $('#game-end-modal .left-arrow').css('visibility', 'visible');
        }

        if (currentEndImageIndex === maxEndImageIndex) {
            $('#game-end-modal .right-arrow').css('visibility', 'hidden');
            $('#game-end-modal #skip-btn').text('다음');
        } else {
            $('#game-end-modal .right-arrow').css('visibility', 'visible');
            if (currentEndImageIndex !== 1) {
                $('#game-end-modal #skip-btn').text('SKIP');
            }
        }
    }

    // 게임 종료 화살표 클릭 이벤트
    $('#game-end-modal .left-arrow').click(function() {
        if (currentEndImageIndex > 1) {
            currentEndImageIndex--;
            updateEndImage();
        }
    });

    $('#game-end-modal .right-arrow').click(function() {
        if (currentEndImageIndex < maxEndImageIndex) {
            currentEndImageIndex++;
            updateEndImage();
        }
    });

    // 게임 종료 SKIP/다음 버튼 클릭
    $('#game-end-modal #skip-btn').click(function() {
        $('#game-end-modal').fadeOut(200, function() {
            setTimeout(function() {
                $('#clear-modal').fadeIn(200);
            }, 100);
        });
    });

    function startGameTimer() {
        $('#time-remaining').text(timeLeft);
        timerInterval = setInterval(function () {
            timeLeft--;
            $('#time-remaining').text(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                if (!isGameEndModalShown) {
                    isGameEndModalShown = true;
                    $('#intro-modal').hide();
                    currentEndImageIndex = 1;
                    updateEndImage();
                    updateEndArrows();
                    $('#game-end-modal').fadeIn(200);
                }
            }
        }, 1000);
    }

    function checkGameEnd() {
        if (bricks.length === 0) {
            setTimeout(() => {
                if (!isGameEndModalShown) {
                    isGameEndModalShown = true;
                    $('#intro-modal').hide();
                    currentEndImageIndex = 1;
                    updateEndImage();
                    updateEndArrows();
                    $('#game-end-modal').fadeIn(200);
                }
            }, 1500);
        }
    }

    // 스테이지 클리어 팝업 표시
    function showClearModal() {
        $('.clear-score-btn').text(`점수: ${score}`);
        $('#clear-modal').fadeIn(200);
    }

    // 팝업 버튼 동작
    $('.clear-next-btn').click(function () {
        window.location.href = 'stage4.html';
    });
    $('.clear-home-btn').click(function () {
        window.location.href = 'home.html';
    });
});

// 게임 시작 함수
function startGame() {
    console.log('Game started');
}

// 게임 초기화 함수
function initGame() {
    console.log("게임 초기화 시작");
    
    // 캔버스 초기화
    canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context!');
        return;
    }
    
    // 캔버스 크기 설정
    canvas.width = 800;
    canvas.height = 600;
    
    // 캔버스 스타일 설정
    canvas.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    
    // 게임 변수 초기화
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    score = 0;
    timeLeft = 30;
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 이미지 초기화
    initImages();
}

