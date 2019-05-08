
// 차단하기 버튼 생성
defaultButtonCreate();

// 차단하기
!function filter() {
    go(
        $.all('.ub-content'),
        C.map(pipe($.find('.ub-writer'), postFilter))
    );


    $('.comment_box ') && go(
        docEl,
        $.on('click', e => {
            setTimeout(filter, 0);
        })
    );



}();


// 버튼별 동작
!function recur() {

    $('#filter') && go(
        $('#filter'),
        $.on('click',
            pipe(selectView, storageSet(false), recur)
        )
    );


    // 차단 목록 편집기
    $('#edit') && go(
        $('#edit'),
        $.on('click',
            pipe(editView, storageSet(true), recur)
        )
    );

    // 추첨
    $('#rPick') && go(
        $('#rPick') ,
        $.on('click', pipe(rPickView, recur))
    );


}();





