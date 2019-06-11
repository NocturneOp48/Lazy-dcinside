
// 차단하기 버튼 생성


topMenu(["filter", "edit"]) || btmMenu(["filter", "edit", "rPick"]);


// 차단하기
!function filter() {
    go(
        $$.all('.ub-content'), each(pipe($$.find('.ub-writer'), postFilter))
    );

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


//console.dir(reply_length_count(123));


!function qckPstLoad() {

    const string = iter => reduce((a, b) => `${a}${b}`, "", iter);
    const strMap = curry(pipe(L.map, string));

    const getURI = curry((param, url)  => new RegExp( param + '=([^&#]*)').exec(url)[1] || null);
    const stopAnchor = e => (e.preventDefault(), e.stopPropagation(), e);
    // const pstReg = new RegExp('(<div class="writing_view_box">[\\w\\W\\s."]*)(?:<!--  본문 우측 광고 -->)' +
    //     '(?:\\s*<div class="con_banner writing_banbox")');

    const pstReg = new RegExp('(<form name="frm">[\\w\\W\\s."]*)(?:<!-- //본문 -->)');

    // const cmtPstRtdReg = new RegExp('(?:<!-- 답글 입력 -->)([\\w\\W\\s."]*)(?:\\s*<div class="cmt_write_box clear">)');
    const lazyImg = str => str.replace(/img src=/gi, "img src=_ class=\"fade\"  lazy-src=")

    const nick = $$.attr('title', $$('div.user_info strong'));

    const copyScript = src => {
        const head = $$('head');
        const script = $$.el(`<script></script>`);
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.src = src;
        head.appendChild(script);
    };


    const view =  (ct, no = go(ct, $$.attr('href'), getURI('no')) ) => go(
        `<tr class="quickView" data-no=${no}>
                <td colspan="6">
                <div class="post_view"></div>              
                </td>
             </tr>`,
        $$.el,
        $$.after($$.closest('.ub-content.us-post', ct))
        );


    const postView = pipe(
        txt => `<section><article>` + pstReg.exec(txt)[1],
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
            `<div class="comment_box">
                <ul class="cmt_list">
                        ${strMap(
                         ({no, rcnt, parent, name, user_id, ip, gallog_icon, memo, reg_date}) => `
                            <li id=comment_li_${no} class="ub-content">
                             <div class="cmt_info clear" data-no="${no}" data-rcnt="${rcnt}" data-article-no="${parent}">
                                <div class="cmt_nickbox">
                                    <span class="gall_writer ub-writer" data-nick="${name}" data-uid="${user_id}" data-ip="${ip}">
                                        </span>
                                    ${gallog_icon}
                                    </span>
                                </div>
                                <div class="clear cmt_txtbox btn_reply_write_all">
                                    <p class="usertxt ub-word">${unescape(memo)}</p>
                                </div>
                                <div class="fr clear">
                                    <span class="date_time">${reg_date}</span>
                                        <div class="cmt_mdf_del" display="inline-block" data-type="cmt" re_no="${no}" data-my="N" data-article-no="${parent}">
                                            <button type="button" class="btn_cmt_delete">삭제</button>
                                        </div>
                                </div>
                             </div>
                            </li>`, comments)}
                </ul>
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
                       $$.setCss({'width':'880', 'display':'visible'}, $$('.view_comment'));
                       $$.append($$.find('.comment_wrap', vw), cmvw);
                   },
                )}
            )
        )
    )






}();


var reply_length_count = function(no) {
    if(no) {
        var memo = $("#memo_" + no);
    } else {
        var memo = $("#memo");
    }
    var cnt	= memo.val().length || 0;

    if(cnt > 400) {
        if(event.keyCode != "13"){
            alert("글자수 제한이 있습니다.");
        }

        var ls_str2 = memo.val().substr(0, 400);
        memo.val(ls_str2);
        memo.focus();
    }
};

var getURLParameter = function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}
var list_type = getURLParameter("board_type");

var c_key;

//쿠키 저장.
var setCookie = function(cname, cvalue, exdays, domain) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;domain=" + domain;
};

//비밀번호 입력 폼
var getPwdInputHtml = function(type,no,mode) {
    var html = "";
    html += "<div id=\"cmt_delpw_box\" class=\"cmt_delpw_box\" data-type=\""+type+"\" re_no=\""+no+"\" c_mode=\""+mode+"\" style=\"margin:-16px 0 0 -242px\">";
    html += "<input type=\"password\" title=\"비밀번호\" placeholder=\"비밀번호\" id=\"cmt_password\" class=\"cmt_delpw\">";
    html += "<button type=\"button\" class=\"btn_ok\">확인</button>";
    html += "<button type=\"button\" class=\"btn_cmtpw_close\"><span class=\"blind\">닫기</span><em class=\"sp_img icon_cmtpw_close\"></em></button>";
    html += "</div>";

    return html;
};



