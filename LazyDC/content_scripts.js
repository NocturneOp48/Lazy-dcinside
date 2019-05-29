
// 차단하기 버튼 생성


topMenu(["filter", "edit"]) || btmMenu(["filter", "edit", "rPick"]);


// 차단하기
!function filter() {
    go(
        $.all('.ub-content'), each(pipe($.find('.ub-writer'), postFilter))
    );

    $('.comment_box ') && go(
        docEl,
        $.on('click', e => {
            setTimeout(filter, 0);
        })
    );
}();

// 버튼별 동작
!function buttonClick() {

    $('#filter') && go(
        $('#filter'),
        $.on('click',
            pipe(selectView, storageSet(false), buttonClick)
        )
    );


    // 차단 목록 편집기
    $('#edit') && go(
        $('#edit'),
        $.on('click',
            pipe(editView, storageSet(true), buttonClick)
        )
    );

    // 추첨
    $('#rPick') && go(
        $('#rPick') ,
        $.on('click', pipe(rPickView, buttonClick))
    );


}();


/*


!function f() {
    const quickView = `<div>
    <h4>abc</h4>
       <div>
        def
         </div>
    </div>`


    go(
        $.all('.ub-content.us-post a'),
       map(
           $.on('click', e => {
               e.preventDefault();
               e.stopPropagation();

               const header = new Headers({"Accept":"text/html, application/xhtml+xml, application/xml, *!/!*"});
               const cmtheader = new Headers({})
               go(
                $.attr('href', e.target),
                   _ => $.get('https://gall.dcinside.com', _, header),
                   _ => _.text(),
                       console.log
                       // e.target.append($.el(quickView))
           )}
       )
    )
)

}();
*/





