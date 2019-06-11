
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




    copyScript('//gall.dcinside.com/_js/comment.js');



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
                ,qckPstLoad
            )
        )
    )

    $(document).on('click','.repley_add, .repley_add_vote', function(e){
        var formData = '';
        var gall_id = $(document).data('comment_id') || getURLParameter("id");
        var no = $(document).data('comment_no') || getURLParameter("no");

        if(!no) {
            no = $('#no').val();
        }

        formData += "&id=" + gall_id + "&no=" + no;

        var _no = "";
        var c_no = $(this).attr('r_idx');
        if(c_no) { _no = c_no; formData += "&c_no=" + c_no; }
        else if(no) { _no = no; }
        else { _no = ""; }

        var name =  $("#name_" + _no);
        var pw =  $("#password_" + _no);
        var memo = $("#memo_" + _no);
        var code = $("#code_" + _no);

        if(name.length > 0) {
            if(!name.val()) {
                alert("닉네임을 입력하세요.");
                name.focus();
                return false;
            } else {
                formData += "&name=" + name.val();
            }
        }

        if(pw.length > 0) {
            if (!pw.val()) {
                alert("비밀번호을 입력하세요.");
                pw.focus();
                return false;
            } else if(pw.val().length < 2) {
                alert("비밀번호를 최소 2자리 이상 입력하셔야 합니다. 쉬운 비밀번호는 타인이 수정 또는 삭제하기 쉬우니, 어려운 비밀번호를 입력해 주세요.");
                pw.focus();
                return false;
            } else {
                formData += "&password=" + pw.val();
            }
        }

        if(code.length > 0) {
            if(!code.val()) {
                alert('자동입력 방지코드를 입력해주세요.');
                code.focus();
                return false;
            }else {
                formData += "&code=" + code.val();
            }
        }

        if(!memo.val()) {
            alert("내용을 입력하세요.");
            memo.focus();
            return false;
        }

        if($("#clickbutton").val() == "Y") {
            return false;
        }

        $("#clickbutton").val("Y");

        // 등록+추천
        if($(this).attr('class') == 'btn_lightblue small repley_add_vote') {
            formData += "&vote=vote";
        }

        //push alram
        var check_6		= $('#check_6').val();
        var check_7		= $('#check_7').val();
        var check_8		= $('#check_8').val();
        var check_9		= $('#check_9').val();

        var recommend = $('#recommend').val();
        var csrf_token	= $('input[name=ci_t]').val();
        var _svar = window.atob('c2VydmljZV9jb2Rl');

        formData += "&memo=" + encodeURIComponent(memo.val());
        formData += "&cur_t=" + $("#cur_t").val();
        formData += "&check_6=" + check_6 + "&check_7=" + check_7 + "&check_8=" + check_8 + "&check_9=" + check_9;
        formData += "&recommend=" + recommend;
        formData += "&user_ip=" + $("#user_ip").val();
        formData += "&t_vch2=" + $(document).data('t_vch2');
        formData += '&'+ _svar +'='+ eval('document.'+_svar);

        $.ajax({
            type : "POST",
            cache: false,
            async: false,
            url : "/board/forms/comment_submit",
            data : formData ,
            success : function(data) {
                console.log(data);
                k_cnt = 0;
                var split_string = data.split('||');
                $("#clickbutton").val("N");
                if(split_string[0] == "false") {
                    alert(split_string[1]);
                    return false;
                } else {
                    console.log(typeof(setRequestNotification));
                    if(typeof(setRequestNotification) == 'function') {
                        setRequestNotification(gall_id, no, data);
                    }

                    memo.val("");
                    memo.focus();
                }
            },
            error : function(request,status,error) {
                //	comment_error_log(csrf_token,gall_id,request,status,error);
            }
        });

        if(list_type == 'album') {
            $("#no").val(no);
            viewComments(1,'ADD');
        } else {
            viewComments(1,'ADD');
            if($("#kcaptcha_use").val() == 'Y') kcaptcha_init(_no);
        }
    });



}();





