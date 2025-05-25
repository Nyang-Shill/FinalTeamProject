$(document).ready(function () {
    // 게임 시작 버튼 클릭 시 스테이지 모달 표시
    $('#startBtn').click(function () {
        $('#stageModal').fadeIn(300);
    });

    // 테마 변경 버튼 클릭 시 테마 모달 표시
    $('#themeBtn').click(function () {
        $('#themeModal').fadeIn(300);
        // 초기에는 버튼 비활성화
        $('#themeConfirmBtn').prop('disabled', true);
    });

    // 모달 닫기 버튼
    $('.modal-close').click(function () {
        $(this).closest('.modal-overlay').fadeOut(300);
    });

    // 모달 외부 클릭 시 닫기
    $('.modal-overlay').click(function (e) {
        if ($(e.target).hasClass('modal-overlay')) {
            $(this).fadeOut(300);
        }
    });

    // 스테이지 선택 시
    $('.stage-item').click(function () {
        const stageNumber = $(this).data('stage');
        // 여기에 스테이지별 페이지 이동 로직 추가
        console.log(`스테이지 ${stageNumber} 선택됨`);
        window.location.href = `stage${stageNumber}.html`;
    });

    // 테마 옵션 선택 시
    $('.theme-option').click(function () {
        const themeType = $(this).closest('.theme-section').find('.theme-title').text();
        const themeId = $(this).data('theme');
        $(this).closest('.theme-options').find('.theme-option').removeClass('selected');
        $(this).addClass('selected');
        console.log(`선택된 ${themeType}: ${themeId}`);

        // 확인 버튼 활성화 (인테리어와 냥실이 모두 선택되어야 함)
        let interiorSelected = false;
        let catSelected = false;

        $('.theme-section').each(function () {
            const sectionTitle = $(this).find('.theme-title').text();
            if (sectionTitle.includes('인테리어') && $(this).find('.theme-option.selected').length > 0) {
                interiorSelected = true;
            }
            if (sectionTitle.includes('냥실') && $(this).find('.theme-option.selected').length > 0) {
                catSelected = true;
            }
        });

        // 두 테마가 모두 선택되었을 때만 버튼 활성화
        $('#themeConfirmBtn').prop('disabled', !(interiorSelected && catSelected));
    });

    // 확인 버튼 클릭 시 모달 닫기
    $('#themeConfirmBtn').click(function () {
        // 선택된 냥실이 테마 저장
        const selectedCat = $('.theme-section')
            .find('.theme-title:contains("냥실")')
            .next()
            .find('.theme-option.selected')
            .data('theme');
        console.log('선택된 테마:', selectedCat); // 저장되는 값 확인
        localStorage.setItem('selectedCatTheme', selectedCat);
        console.log('localStorage에 저장된 값:', localStorage.getItem('selectedCatTheme')); // 저장된 값 확인
        $('#themeModal').fadeOut(300);
    });
});
