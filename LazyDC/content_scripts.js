
// 차단하기 버튼 생성


topMenu(["filter", "edit"]) || btmMenu(["filter", "edit", "rPick"]);


// 차단하기
!function filter() {

    postFilter($$.all('.ub-content .ub-writer'));

    $$('.comment_box ') && go(
        docEl,
        $$.on('click', e => {
            setTimeout(filter, 0);
        })
    );
}();

// 버튼별 동작
!function buttonClick() {

    $$('#filter') && go(
        $$('#filter'),
        $$.on('click',
            pipe(selectView, storageSet(false), buttonClick)
        )
    );


    // 차단 목록 편집기
    $$('#edit') && go(
        $$('#edit'),
        $$.on('click',
            pipe(editView, storageSet(true), buttonClick)
        )
    );

    // 추첨
    $$('#rPick') && go(
        $$('#rPick') ,
        $$.on('click', pipe(rPickView, buttonClick))
    );


}();


//\w\W\s."
// const reg = new RegExp('<span class="title_subject">([^</]+)</span>');
// const esno = htmltxt => new RegExp('name="e_s_n_o" value=([^>]*)').exec(htmltxt)[1];


// Todo
//
// 1. 위 아래 파란줄 넣기 완료
// 2. Set ip id를 그냥 Map 하나로 만들기 완료
// 3. 댓글 전송 POST
// 6. 글 오른쪽 투명한 div를 눌러서 닫게하기 또는 글을 다시눌러서 닫기 또는 다른글을 눌러서 닫기
// 7. 빠른글보기 체크설정(로컬스토리지로 설정?
// 8. CSS 다듬기. UI 메시지창 뜨게하기.
// 5. 이미지 병렬처리(필수)
// 9. 빠른 글로딩(갤러리 이름 클릭시, 글 목록만 빠르게 불러옴)


!function qckPstLoad() {

    const string = iter => reduce((a, b) => `${a}${b}`, "", iter);
    const strMap = curry(pipe(L.map, string));

    const getURI = curry((param, url)  => new RegExp( param + '=([^&#]*)').exec(url)[1] || null);
    const stopAnchor = e => (e.preventDefault(), e.stopPropagation(), e);
    const pstReg = new RegExp('(<div class="writing_view_box">[\\w\\W\\s."]*)(?:<!--  본문 우측 광고 -->)' +
        '(?:\\s*<div class="con_banner writing_banbox")');
    const cmtPstRtdReg = new RegExp('(?:<!-- 답글 입력 -->)([\\w\\W\\s."]*)(?:\\s*<div class="cmt_write_box clear">)');
    const lazyImg = str => str.replace(/img src=/gi, "img src=_ class=\"fade\"  lazy-src=")

    const nick = $$.attr('title', $$('div.user_info strong'));

    const copyScript = function() {
        const head = $$('head')[0];
        const script = $$.el(`<script></script>`);
        script.type = 'text/javascript';
        script.src = '//gall.dcinside.com/_js/comment.js';
        head.appendChild(script);
    };


    const view =  (ct, no = go(ct, $$.attr('href'), getURI('no')) ) => go(
        `<tr class="quickView" data-no=${no}>
                <td colspan="6">
                <div class="post_view"></div>              
                <div class="writing_view_box">
                    <div class="cmt_write_box">
                        <div class="id_pw_items">
                            <input type=${nick ? "hidden" : "text"} name="name"  placeholder="닉네임" id="name_${no}" maxlength="20" value=${nick ? nick : ""}>
                            <input type=${nick ? "hidden" : "password"} name="password"  placeholder="비밀번호" id="pw_${no}" maxlength="20" value=${nick ? nick : ""}>
                        </div>
                        <div class="cmt_write">
                            <textarea id="cmt_text"></textarea>
                            <button id="cmt_submit">등록</button>
                        </div>
                    </div>
                </div>
                </td>
             </tr>`,
        $$.el,
        $$.after($$.closest('.ub-content.us-post', ct))
        );


    const postView = pipe(
        txt => pstReg.exec(txt)[1],
        lazyImg,
        $$.el
    );


    const cmtFetch = url => $$.post('https://gall.dcinside.com/board/comment/',
        {
            'id': getURI( 'id', document.location.href),
            'no': getURI( 'no', url),
            'cmt_id' : getURI( 'id', document.location.href),
            'cmt_no': getURI( 'no', url),
            'e_s_n_o': esno,
            'comment_page': 1,
            'sort': "",
        }
        , new Headers({'Accept': "application/json",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"}) );

    const drawCmtView = ({comments}) => go(
        comments,
        L.reject(({user_id, ip, name}) => saved.filter_users.has(user_id || ip || name)),
        comments =>
            `<div class="comment_box" style="margin-top: 20px;">
                <div class="comment_box_inner">
                    <div>
                        <ul class="cmt_list">
                        ${strMap(
                         ({no, rcnt, parent, name, user_id, ip, gallog_icon, memo, reg_date}) => `
                            <li id="comment_li_" class="ub-content">
                             <div class="cmt_info" data-no="${no}" data-rcnt="${rcnt}" data-article-no="${parent}">
                                <span class="gall_writer ub-writer" data-nick="${name}" data-uid="${user_id}" data-ip="${ip}">
                                ${gallog_icon}</span>
                                <div class="clear">
                                    <p class="usertxt ub-word btn_reply_write">${unescape(memo)}</p>
                                <span class="date_time">${reg_date}</span>
                                <div class="cmt_mdf_del" display="inline-block" data-type="cmt" re_no="${no}" data-my="N" data-article-no="${parent}">
                                <button type="button" class="btn_cmt_delete">삭제</button>
                                </div>
                                </div>
                                
                             </div>
                            </li>`, comments)}
                        </ul>
                            <div class="bottom_paging_box">
                                <div class="cmt_inner">
                                </div>
                            </div>
                    </div>
                </div>
            </div>`,
        $$.el);

    const postLoad = pipe($$.attr('href'), $$.get, postView);
    const cmtLoad = pipe($$.attr('href'), cmtFetch, drawCmtView);




    go(
        $$.all('.ub-content.us-post a'),
        map(
            $$.on('click', e => {
               stopAnchor(e);
               const {currentTarget: ct} = e;
               const works = ct.className =="reply_numbox" ? [view, cmtLoad] : [view, cmtLoad, postLoad];
               go(
                   works,
                   C.map(f => f(ct)),
                   ([vw, cmvw, pvw]) => {
                       pvw && go(pvw, $$.append($$.find('.post_view', vw)), Imgsloader(4));
                       $$.before($$.find('.cmt_write_box', vw), cmvw);
                   },
                )}

            )
        )
    )


}();





