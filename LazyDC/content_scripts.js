
// 차단하기 버튼 생성


topMenu(["directView", "filter", "edit", "rPick"]) || btmMenu(["filter", "edit", "rPick"]);





!filtering();

// 버튼별 동작
!function buttonClick() {


    $('#dView') && (go(
        $('#dView'),
        $.on('click', dView)
    ), dViewToggle(), dViewMode && dViewLoad());


    $('#filter') && go(
        $('#filter'),
        $.on('click',
            pipe(selectView, storageSet(false), filtering, buttonClick)
        )
    );


    // 차단 목록 편집기
    $('#edit') && go(
        $('#edit'),
        $.on('click', editView)
    );

    // 추첨
    $('#rPick') && go(
        $('#rPick') ,
        $.on('click', rPickView));


}();



// 갤 목록 새로고침
!function gallLoad() {


    testURI('id', document.location.href) && testURI('no', document.location.href) || commentScript();

    testURI('s_type', document.location.href) || testURI('no', document.location.href) ||  go(
        $('.page_head > .fl a'),
        $.on('click', e => {

            $('#dlg_position') && $.remove($('#dcs_dialog')) && $.remove($('#dlg_position'));
            $.append($('.page_head > .fl'), $.el(loading));
            //setTimeout(_ => $('#spin_loading') && window.location.reload(), 3000);
            stopAnchor(e);
            const {currentTarget: ct} = e;
            const gallList = html => new RegExp('<table class="gall_list(?:[\\s]*">)([\\w\\W\\s."]*)<\\/table>').exec(html)[1] || null;
            const gallListLoad = pipe(get, gallList);
            const targetHref = $.attr('href', ct);
            history.replaceState({data : 'replace'}, 'title', targetHref);


            go(
                ct,
                gallListLoad,
                list => $('.gall_list').innerHTML = list,
                filtering,
                _ => dViewMode && dViewLoad(),
                _ => $.remove($('.spinner'))
            );

        })
    );



}();
















