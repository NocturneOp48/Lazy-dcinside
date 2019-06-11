//Comment
var getURLParameter = function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
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

//답글 달기 폼
var addReplyForm = function(no,rCnt) {
    var data = { "no" : no };
    $("#cmt_write_box").parent('li').remove();
    $('#addReplyForm-tmpl').tmpl(data).prependTo('#reply_list_'+ no);
    if((rCnt <= 0) || ($("#reply_list"+no).length <= 0)) $("#reply_" + no).toggleClass("show");
    if($("#kcaptcha_use").val() == 'Y') kcaptcha_init(no);

    set_default_nickname();
};

//수정 폼
var addModifyForm = function(data) {
    //console.log(data);
    var my_li = "";
    if(data.cmt_type == 'cmt') {
        my_li = "comment_li_"+data.re_no;
        if($("#reply_list_"+data.re_no).length) { //답글 접기
            $("#reply_list_"+data.re_no).parent("div.reply_box").parent("div.reply").removeClass("show");
        }
    } else {
        my_li = "reply_li_"+data.re_no;
        data['small_class'] = 'small';
    }

    $("#cmt_write_box").parent('li').remove();
    $('#commentModify-tmpl').tmpl(data).insertAfter('#'+my_li);
};

//앨범형 댓글 쓰기 폼
var addCmtWriteForm = function(no) {
    var cmt_wr = $("#cmt_wr").val();
    if(cmt_wr < 9) return false;
    var data = { "no" : no};
    if($('#cmt_write_box_'+ no).length) return false;
    $('#albumCommentWriteForm-tmpl').tmpl(data).appendTo('#comment_wrap_'+ no);
    if($("#kcaptcha_use").val() == 'Y') kcaptcha_init(no);

    set_default_nickname();
};

//댓글 리스트 ul
var getCommentListHtml = function(comments, article_no) {
    var htmlComment = "";
    var cur_c_no = 0;
    var comment_start = false;
    var reply_start = false;
    var cmt_wr = $("#cmt_wr").val();

    htmlComment = "<ul class=\"cmt_list\">";

    $.each(comments, function(key, value){

        var dory_class = ''; //댓글돌이
        var reply_area_all_cls = ' btn_reply_write_all'; //답글쓰기 전체 영역 클래스

        if(comments[key]['nicktype'] == "COMMENT_BOY") { //댓글돌이 답글쓰기 안됨.
            dory_class = " dory";
            reply_area_all_cls = '';
        }
        if(comments[key]['vr_player'] || comments[key]['reply_w'] == 'N') { reply_area_all_cls = '';} //보이스 리플 답글쓰기 영역 전체 x

        if(comments[key]['depth'] == 0) {

            comment_start = true;

            htmlComment += "<li id=\"comment_li_"+comments[key]['no']+"\" class=\"ub-content"+dory_class+"\">";
            htmlComment += "<div class=\"cmt_info clear\" data-no=\""+comments[key]['no']+"\" data-rcnt=\""+comments[key]['rcnt']+"\" data-article-no=\""+article_no+"\">";
            if(comments[key]['del_yn'] != 'Y') {
                htmlComment += "<div class=\"cmt_nickbox\">";
                htmlComment += "<span class=\"gall_writer ub-writer\" data-nick=\""+comments[key]['name']+"\" data-uid=\""+comments[key]['user_id']+"\" data-ip=\""+comments[key]['ip']+"\">"+ comments[key]['gallog_icon'] +"</span>";
                htmlComment += "</div>";
                htmlComment += "<div class=\"clear cmt_txtbox"+reply_area_all_cls+"\">";
                if(comments[key]['vr_player']) {
                    htmlComment += comments[key]['vr_player'];
                    htmlComment += "<button type=\"button\" class=\"transparent_btn btn_reply_write\">답글쓰기</button>";
                } else if(dory_class != "") { //댓글돌이
                    htmlComment += comments[key]['memo'];
                } else {
                    if (comments[key]['memo'].match('written_dccon')) {
                        htmlComment += '<div class="comment_dccon clear"><div class="coment_dccon_img">' + $.trim(comments[key]['memo']) +'</div>';
                        htmlComment += '<div class="coment_dccon_info clear dccon_over_box" onmouseover="dccon_btn_over(this);" onmouseout="dccon_btn_over(this);" style="display:none;"><span class="over_alt"></span><button type="button" class="btn_dccon_infoview div_package" data-type = "comment" onclick="dccon_btn_click();" reqpath="/dccon">디시콘 보기</button></div></div>';
                    } else {
                        comments[key]['memo'] = comments[key]['memo'].replace('http://dcimg', 'https://dcimg')
                        htmlComment += "<p class=\"usertxt ub-word\">"+comments[key]['memo'].replace(/(?:\r\n|\r|\n)/g, '<br>')+"</p>";
                    }
                }
                htmlComment += "</div>";
                htmlComment += "<div class=\"fr clear\">";
                htmlComment += "<span class=\"date_time\">"+comments[key]['reg_date']+"</span>";
            } else {
                htmlComment += "<div class=\"cmt_nickbox\"></div>";

                htmlComment += "<p class=\"del_reply\">"+comments[key]['memo']+"</p>";

            }
            if(comments[key]['nicktype'] !== "COMMENT_BOY" && comments[key]['del_yn'] != 'Y') {
                //if(cmt_wr >= 9) htmlComment += "<button type=\"button\" class=\"font_red btn_reply_write\">답글쓰기<em class=\"sp_img icon_blue_show\"></em></button>";
                htmlComment += "<div class=\"cmt_mdf_del\" data-type=\"cmt\" re_no=\""+comments[key]['no']+"\" data-my=\""+comments[key]['my_cmt']+"\" data-article-no=\""+article_no+"\">";
                if(comments[key]['del_yn'] != 'Y') {
                    if(comments[key]['del_btn'] == 'Y' || comments[key]['mod_btn'] == 'Y'){
                        if(comments[key]['mod_btn'] == 'Y') htmlComment += "<button type=\"button\" class=\"btn_cmt_modify\">수정</button>";
                        if(comments[key]['del_btn'] == 'Y') htmlComment += "<button type=\"button\" class=\"btn_cmt_delete\">삭제</button>";
                    }
                }
                htmlComment += "</div>";
                htmlComment += "</div>";
            }
            htmlComment += "</div>";

            if(comment_start && comments[key]['next_type'] == 0) { //답글 닫아주기
                htmlComment += "</li>";
                comment_start = false;
            }
        } else {
            if(cur_c_no != comments[key]['c_no']) {
                reply_start = true;

                htmlComment += "<li><div class=\"reply show\">";
                htmlComment += "<div class=\"reply_box\">";
                htmlComment += "<ul class=\"reply_list\" id=\"reply_list_"+comments[key]['c_no']+"\">";
                cur_c_no = comments[key]['c_no'];
            }

            htmlComment += "<li id=\"reply_li_"+comments[key]['no']+"\" class=\"ub-content"+dory_class+"\">";
            htmlComment += "<div class=\"reply_info clear\" data-no=\""+comments[key]['no']+"\">";
            if(comments[key]['del_yn'] != 'Y') {
                htmlComment += "<div class=\"cmt_nickbox\">";
                htmlComment += "<span class=\"gall_writer ub-writer\" data-nick=\""+comments[key]['name']+"\" data-uid=\""+comments[key]['user_id']+"\" data-ip=\""+comments[key]['ip']+"\">"+ comments[key]['gallog_icon'] +"</span>";
                htmlComment += "</div>";
                htmlComment += "<div class=\"clear cmt_txtbox\">";
                if(comments[key]['vr_player']) {
                    htmlComment += "<p class=\"uservoice\">"+comments[key]['vr_player']+"</p>";
                } else if(dory_class != "") { //댓글돌이
                    htmlComment += comments[key]['memo'];
                } else {
                    if (comments[key]['memo'].match('written_dccon')) {
                        htmlComment += '<div class="comment_dccon clear"><div class="coment_dccon_img">' + $.trim(comments[key]['memo']) +'</div>';
                        htmlComment += '<div class="coment_dccon_info clear dccon_over_box" onmouseover="dccon_btn_over(this);" onmouseout="dccon_btn_over(this);" style="display:none;"><span class="over_alt"></span><button type="button" class="btn_dccon_infoview div_package" data-type = "reply" onclick="dccon_btn_click();" reqpath="/dccon">디시콘 보기</button></div></div>';
                    } else {
                        htmlComment += "<p class=\"usertxt ub-word\">" + comments[key]['memo'].replace(/(?:\r\n|\r|\n)/g, '<br>') + "</p>";
                    }

                }
                htmlComment += "</div>";
                htmlComment += "<div class=\"fr clear\">";
                htmlComment += "<span class=\"date_time\">"+comments[key]['reg_date']+"</span>";
            } else {
                htmlComment += "<div class=\"clear\">";
                htmlComment += "<div class=\"cmt_nickbox\"></div>";
                htmlComment += "<p class=\"del_reply\">" + comments[key]['memo'].replace(/(?:\r\n|\r|\n)/g, '<br>') + "</p>";
            }
            if(comments[key]['nicktype'] !== "COMMENT_BOY" && comments[key]['del_yn'] != 'Y') {
                if(comments[key]['del_btn'] == 'Y' || comments[key]['mod_btn'] == 'Y'){
                    htmlComment += "<div class=\"cmt_mdf_del\" data-type=\"rep\" re_no=\""+comments[key]['no']+"\" data-my=\""+comments[key]['my_cmt']+"\" data-article-no=\""+article_no+"\">";
                    if(comments[key]['mod_btn'] == 'Y') htmlComment += "<button type=\"button\" class=\"btn_cmt_modify\">수정</button>";
                    if(comments[key]['del_btn'] == 'Y') htmlComment += "<button type=\"button\" class=\"btn_cmt_delete\">삭제</button>";
                    htmlComment += "</div>";
                }
            }
            htmlComment += "</div>";
            htmlComment += "</div>";
            htmlComment += "</li>";

            if(reply_start && comments[key]['next_type'] == 0) { //답글 닫아주기
                htmlComment += "</ul>";
                htmlComment += "</div>";
                htmlComment += "</div>";
                htmlComment += "</li>";
                reply_start = false;
            }
        }

    });
    htmlComment += "</ul>";

    return htmlComment;
};

//댓글
var viewComments = function(nPage, sType, bScroll) {
    var gall_id = $(document).data('gallery_id') || getURLParameter("id");
    var no = $(document).data('article_no') || getURLParameter("no");
    var cmt_id = $(document).data('comment_id') || getURLParameter("id");
    var cmt_no = $(document).data('comment_no') || getURLParameter("no");
    if(no === null) { no = cmt_no = $("#no").val(); }
    var e_s_n_o  =$("#e_s_n_o").val();
    //var token  = get_cookie('ci_c');
    var board_type = $("#board_type").val();
    if(list_type === null) list_type = board_type;
    var isFirstViewPg = false; //처음 뷰페이지 스크롤 이동 안함.
    var prevCommentCnt = $("#comment_wrap_"+no).attr('data-comment-cnt');

    var bScroll = typeof bScroll !== 'undefined' ?  bScroll : true; //스크롤 이동 여부

    if(sType == 'VIEW_PAGE' || sType == 'LIST_ALBUM' || sType == 'ADD') {
        isFirstViewPg = true;
        if(sType == 'ADD') { //글등록은 정렬 확인.
            sType = $("#comment_wrap_"+no).attr('data-sort-type');
        } else {
            sType = '';
        }
    }

    if(gall_id == "" || e_s_n_o == "" || no == ""){
        alert("잘못된 접근입니다!!");
        return false;
    }

    var htmlCommentBox = "";

    if(board_type == 'album') $("#cmt_write_box_"+no).remove();

    $.ajax({
        type:'POST',
        url:'/board/comment/',
        cache: false,
        async: false,
        dataType: "json",
        data:{ id:gall_id, no: no, cmt_id: cmt_id, cmt_no: cmt_no, e_s_n_o: e_s_n_o, comment_page: nPage, sort: sType, prevCnt: prevCommentCnt, board_type: board_type},
        success:function(data){
            try {
                var comments = data.comments;
                var total_cnt = data.total_cnt;

                $("#comment_wrap_"+cmt_no).attr('data-comment-cnt',data.comment_cnt);
                $("#comment_wrap_"+cmt_no).attr('data-article-no',cmt_no);
                $("#comment_wrap_"+cmt_no).attr('data-sort-type',sType);
                $("#comment_total_"+cmt_no).text(total_cnt);
                if(comments !== null){
                    htmlCommentBox = "<div class=\"comment_box\">";
                    htmlCommentBox += getCommentListHtml(comments, cmt_no);
                    //페이징
                    htmlCommentBox += "<div class=\"bottom_paging_box\">";
                    if(data.pagination !== null) {
                        htmlCommentBox += "<div class=\"cmt_paging\">";
                        htmlCommentBox += data.pagination;
                        htmlCommentBox += "</div>";
                    }
                    //하단버튼
                    htmlCommentBox += "<div class=\"cmt_inner\">";
                    htmlCommentBox += "<button type=\"button\" class=\"btn_cmt_close\" data-no=\""+cmt_no+"\" data-loc=\"BTM\" data-status=\"close\"><span>댓글닫기</span><em class=\"sp_img icon_cmt_more\"></em></button>";
                    htmlCommentBox += "<button type=\"button\" class=\"btn_cmt_refresh\" data-no=\""+cmt_no+"\" data-sort=\"\" data-loc=\"BTM\">새로고침</button>";
                    htmlCommentBox += "</div>";
                    htmlCommentBox += "</div>";
                    htmlCommentBox += "</div>";
                    $("#comment_wrap_"+cmt_no).addClass('show');
                }
                //console.log(htmlCommentBox);
                $("#comment_wrap_"+cmt_no+" .comment_box").remove();
                $("#comment_wrap_"+cmt_no).append(htmlCommentBox);

                if(board_type == 'album') {
                    addCmtWriteForm(cmt_no);
                    $(".cmt_nickbox").children("span.checkbox").remove(); //기존 체크 박스 삭제
                }

                // minor manager
                if($('#minor_manager_checkbox-tmpl').index() >= 0) {
                    $('#minor_manager_commment_del_btn-tmpl').tmpl(null).appendTo('.cmt_mdf_del:not(:has(.btn_cmt_delete))');
                    $('#minor_manager_checkbox-tmpl').tmpl(null).prependTo($('.nickname').not('.cmtboy').closest('.cmt_nickbox').has(':not(.del_reply)'));
                    $('#minor_manager_commment_buttons-tmpl').tmpl([{ no: cmt_no }]).prependTo('.comment_wrap .bottom_paging_box');
                    $('#minor_block_pop-tmpl').tmpl([{ id: 'avoid_pop_cmt', no: cmt_no, iscmt: true }]).appendTo('.useradmin_btnbox');
                }
                if(!isFirstViewPg && bScroll) {
                    document.getElementById('comment_wrap_'+cmt_no).scrollIntoView(); //댓글 영역으로 포커스 이동
                }
                clipinit(); //보플클립보드

                if(typeof(chk_user_block) == 'function') {
                    chk_user_block(gall_id);
                }
            } catch(e) {
                //console.log(e);
            }
        }
    });
};

//댓글삭제
var comment_delete_submit = function(no) {
    var gall_id = $(document).data('comment_id') || getURLParameter("id");
    var token	= get_cookie('ci_c');

    if(confirm("댓글을 삭제하시겠습니까?")){
        $.ajax({
            type : "POST",
            cache: false,
            async: false,
            url : '/board/comment/comment_delete_submit',
            data:{ ci_t:token,  id : gall_id, re_no : no , mode : "del"},
            success : function(data) {
                sleep(0.6);

                var split_string = data.split('||');
                $("#clickbutton").val("N");
                if(split_string['0'] == 'false') {
                    alert(split_string['1']);
                    return false;
                } else {
                    $('.btn_cmt_refresh').first().click();
                }
            },
            error : function(request,status,error) {
                //	comment_error_log(csrf_token,gall_id,request,status,error);
            }
        });
    }

};

//답글(사용 X)
function getReply(no) {
    var html = '';
    var gall_id = document.frmView.gallery_id.value;
    var e_s_n_o = document.frmView.e_s_n_o.value;
    var token  = get_cookie('ci_c');
    var test_no = 5995250;

    if(gall_id == "" || token == "" || e_s_n_o == "" || no == ""){
        alert("잘못된 접근입니다!!");
        return false;
    }

    var last_comma = ",";
    var tagLiReply = "";

    $.ajax({
        type:'POST',
        url:'/board/comment/',
        cache: false,
        async: false,
        dataType: "json",
        data:{ ci_t:token,  id:gall_id, no: test_no, e_s_n_o: e_s_n_o},
        success:function(data){
            try {
                $.each(data, function(key, value){
                    tagLiReply += "<li>";
                    tagLiReply += "<div class=\"reply_info\">";
                    tagLiReply += data[key]['gallog_icon'];
                    tagLiReply += "<span class=\"date_time\">"+data[key]['reg_date']+"</span>";
                    tagLiReply += "<p class=\"usertxt\">"+data[key]['memo']+"</p>";
                    tagLiReply += "</div>";
                    tagLiReply += "</li>";
                });
                $('#reply_list_'+no+' li').remove();
                $('#reply_list_'+no).append(tagLiReply);

                $('#reply_'+no).css('overflow','visible');
                $('#reply_'+no).css('height','100%');
                $('#reply_'+no).css('display','block');

            }
            catch(e) {
                //console.log(e);
            }
        }
    });
}



// 리플 글쓰기 글자수 제한하기
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

//권한 확인
var chk_auth = function(no, mode) {
    var gall_id	= $('#id').val();
    var e_s_n_o = $("#e_s_n_o").val();
    var token	= get_cookie('ci_c');
    var strRst = "";
    $.ajax({
        type : "POST",
        cache: false,
        async: false,
        url : "/board/comment/chk_auth",
        data:{ ci_t:token,  id : gall_id, re_no : no, e_s_n_o: e_s_n_o , mode : mode},
        success : function(data) {
            strRst = data;
        },
        error : function(request,status,error) {
            //	comment_error_log(csrf_token,gall_id,request,status,error);
            strRst = "false||댓글 서버에 오류가 발생했습니다";
        }
    });
    return strRst;
};

//답글 펼침 설정
var set_reply_folder = function(data) {
    var old_data = get_cookie("reply_fold_set");
    var old_gall = "";
    var arr_gall = new Array();
    if(old_data != "") {
        var old_json = JSON.parse(old_data);
        old_gall = old_json.gall;
        if(old_gall != "") {
            var temp_gall = old_gall;
            arr_gall = temp_gall.split(',');
        }
    }

    var new_data = {
        "all":data.all_state
    };

    if(data.gall_state == "off") {
        arr_gall.splice(arr_gall.indexOf(data.gall_id),1);
    } else {
        if(arr_gall.indexOf(data.gall_id) == -1) arr_gall.push(data.gall_id);
    }

    new_data['gall'] = arr_gall.join(',');

    setCookie("reply_fold_set", JSON.stringify(new_data), 10*365,'dcinside.com');
};

//답글 펼침 설정
var get_reply_folder = function(gall_id) {
    var set_data = get_cookie("reply_fold_set");
    var set_gall = "";
    var arr_gall = new Array();
    var cur_on_off = "off";
    var all_on_off = "off";
    if(set_data != "") {
        var set_json = JSON.parse(set_data);
        all_on_off = set_json.all;
        set_gall = set_json.gall;
        if(set_gall != "") {
            var temp_gall = set_gall;
            arr_gall = temp_gall.split(',');
            if(arr_gall.indexOf(gall_id) >= 0) cur_on_off = "on";
        }
    }

    var data = {
        "gall_id" : gall_id,
        "cur_on_off" : cur_on_off,
        "all_on_off" : all_on_off
    };

    return data;
};

$(function() {
    var dor_arr = new Array();
    // 댓글돌이
    $(document).on('click','.dory_rolling_btn', function(e){
        var this_obj = $(this);
        var now_num = parseInt(this_obj.parents('.dory_rolling').find('.num .now_num').text());
        var total_num = parseInt(this_obj.parents('.dory_rolling').find('.num .total_num').text());
        var page_move = false;

        this_obj.parents('.dory_rolling').find('.dory_rolling_btn').addClass('on');
        // 이전
        if(this_obj.children("em.icon_prev").length > 0) {
            now_num = now_num -1;
            if(now_num < 1) {
                now_num = total_num;
            } else {
                page_move = true;
            }
        } else {
            now_num = now_num + 1;
            if(now_num >total_num) {
                now_num = 1;
            } else{
                page_move = true;
            }
        }

        if(now_num == 1) {
            this_obj.parents('.dory_rolling').find('.dory_rolling_btn:eq(0)').removeClass('on');
        } else if(now_num == total_num) {
            this_obj.parents('.dory_rolling').find('.dory_rolling_btn:eq(1)').removeClass('on');
        }

        if(dor_arr.length <= 0 || (now_num == 5)) {
            var id = $('#id').val();
            var token  = get_cookie('ci_c');

            //댓글돌이
            $.ajax({
                type : "POST",
                cache: false,
                async: false,
                url : "/board/comment/getCommentBoyAjax",
                dataType: "json",
                data : { ci_t:token,  id : id},
                success : function(data) {
                    dor_arr = data;
                },
                error : function(request,status,error) {
                    //	comment_error_log(csrf_token,gall_id,request,status,error);
                }
            });
        }

        if(dor_arr[now_num]) {
            this_obj.parents('.dory').find('.logClass').attr('href',dor_arr[now_num].link);
            this_obj.parents('.dory').find('.logClass').attr('depth3',dor_arr[now_num].no);
            this_obj.parents('.dory').find('.logClass img').attr('src',dor_arr[now_num].thumb_img);
            this_obj.parents('.dory').find('.dory_txt').attr('href',dor_arr[now_num].link);
            this_obj.parents('.dory').find('.dory_txt').attr('target',dor_arr[now_num].link_target);
            this_obj.parents('.dory').find('.dory_txt').text(decodeURIComponent(dor_arr[now_num].contents.replace(/\+/g, ' ')));
            this_obj.parents('.dory_rolling').find('.num .now_num').text(now_num);
        }
    });

    //댓글 정렬
    $(document).on('click','.comment_sort', function(e) {
        var sort = $(this).attr('data-sort');
        var no = $(this).parent('ul.option_box').attr('data-no');
        var sort_txt = $(this).text();

        $("#no").val(no);
        viewComments(1,sort);

        $(this).parent('ul.option_box').hide();
        $(this).parent('ul.option_box').siblings('div.select_area').children('span.comment_sort_txt').text(sort_txt);
        $("#comment_wrap_"+no).children('div.comment_count').children('div.fr').children('button.btn_cmt_refresh').attr('data-sort',sort);
    });

    //보기, 새로고침, 닫기/열기
    $(document).on('click','.btn_cmt_refresh, .btn_cmt_close, .btn_cmt_open, .bnt_comment_more', function(e) {
        var no = $(this).attr('data-no');
        if($(e.currentTarget).is('.btn_cmt_refresh')) {
            var bScroll = false; //새로고침 버튼은 스크롤 이동 안함.
            var sort= $(this).attr('data-sort');
            var btn_location = $(this).attr('data-loc');
            $("#no").val(no);
            if(sort != '') viewComments(1, sort, bScroll);
            else viewComments(1,'D',bScroll);
        } else if($(e.currentTarget).is('.btn_cmt_close') || $(e.currentTarget).is('.btn_cmt_open')) { //댓글 닫기
            var cur_class = $(e.currentTarget).attr('class');
            var btn_location = $(this).attr('data-loc');
            var status = $(this).attr('data-status');
            var my_btn = $("div.view_comment").find('button.'+cur_class);

            $("#comment_wrap_"+no).toggleClass("show");

            if(status == 'close') {
                if(list_type == 'album') {
                    $("#comment_more_"+no).show();
                    $("#comment_count_"+no).hide();
                } else {
                    $(my_btn).attr('data-status','open');
                    $(my_btn).removeClass('btn_cmt_open');
                    $(my_btn).addClass('btn_cmt_close');
                    $(my_btn).children('span').text('댓글닫기');
                }
            } else {
                $(my_btn).attr('data-status','close');
                $(my_btn).removeClass('btn_cmt_close');
                $(my_btn).addClass('btn_cmt_open');
                $(my_btn).children('span').text('댓글열기');
            }
            //댓글닫기 하단이면 포커스 이동 (앨범형)
            if(btn_location == 'BTM') {
                var offset = $("#title_" + no).offset();
                $('html, body').animate({scrollTop : offset.top}, 1);
            }
        } else if($(e.currentTarget).is('.bnt_comment_more')) { //댓글보기(앨범형)
            $("#no").val(no);
            if(!$("#comment_wrap_"+no).children('div.comment_box').length) {
                viewComments(1,'LIST_ALBUM');
            }

            if(list_type == 'album') {
                $("#comment_more_"+no).hide();
                if(!$("#comment_wrap_"+no).hasClass("show")) $("#comment_wrap_"+no).addClass("show");
                $("#comment_count_"+no).show();
            }
        } else {
            return false;
        }
    });

    //답글쓰기
    $(document).on('click','.btn_reply_write_all,.btn_reply_write', function(e) {
        if($(e.target).is('a')){ //링크면 새창.
            return true;
        }
        //e.preventDefault();
        if($(e.currentTarget).is('.btn_reply_write_all')) {
            var no = $(this).parents('div.cmt_info').attr('data-no');
            var rcnt = $(this).parents('div.cmt_info').attr('data-rcnt');
            var prev_no = $("#cmt_write_box").attr('data-no');
        } else {
            var no = $(this).parents('div.cmt_info').attr('data-no');
            var rcnt = $(this).parents('div.cmt_info').attr('data-rcnt');
            var prev_no = $("#cmt_write_box").attr('data-no');
        }

        $('#div_con').hide().appendTo($('body'));

        var em_sp_img = $(this).children('em.sp_img'); //답글쓰기 화살표 상태 ▲▼

        if($(em_sp_img).hasClass('icon_blue_show')) {
            $(em_sp_img).removeClass('icon_blue_show');
            $(em_sp_img).addClass('icon_blue_hide');
        } else {
            $(em_sp_img).removeClass('icon_blue_hide');
            $(em_sp_img).addClass('icon_blue_show');
        }

        if($("#reply_empty_" + no).length) {
            $("#reply_empty_" + no).remove();
            return false;
        }
        if($("#reply_empty_" + prev_no).length) $("#reply_empty_"+prev_no).remove();

        if($("#reply_empty_last_li_"+no).length) $("#reply_empty_last_li_"+no).remove();

        var bLastChild = $(this).parent('div.cmt_info').parent('li').is(':last-child');

        if(rcnt <= 0 || bLastChild) {
            var replyDiv = "<li id=\"reply_empty_last_li_"+no+"\">";
            replyDiv += "<div class=\"reply show\" id=\"reply_empty_"+no+"\">";
            replyDiv += "<div class=\"reply_box\">";
            replyDiv += "<ul class=\"reply_list\" id=\"reply_list_"+no+"\"></ul>";
            replyDiv += "</div>";
            replyDiv += "</div>"
            replyDiv += "</li>";
            $("#comment_li_"+no).after(replyDiv);
        }
        addReplyForm(no,rcnt)
    });

    //수정/삭제
    $(document).on('click','.btn_cmt_modify, .btn_cmt_delete, .btn_cmtpw_close', function(e) {
        var uid = $(this).parent('div.cmt_mdf_del').siblings('span.ub-writer').attr('data-uid');
        var cmt_type = $(this).parent('.cmt_mdf_del').attr('data-type');
        var re_no = $(this).parent('.cmt_mdf_del').attr('re_no');
        var my_cmt = $(this).parent('.cmt_mdf_del').attr('data-my');
        var article_no = $(this).parent('.cmt_mdf_del').attr('data-article-no');
        var article_lv = $("#comment_wrap_"+article_no).attr("data-article-lv");
        var mode = "update";

        if($(e.currentTarget).is('.btn_cmtpw_close')) {
            if($("#cmt_delpw_box").length) $("#cmt_delpw_box").remove();
            return false;
        }

        if($(e.currentTarget).is('.btn_cmt_delete')) mode = "del";
        if($("#cmt_delpw_box").length) $("#cmt_delpw_box").remove();

        if(my_cmt == 'Y') {
            if(mode == 'update') { //수정
                var cmt_type = $(this).parent('div.cmt_mdf_del').attr("data-type");
                var name = $(this).parent('div.cmt_mdf_del').siblings('span.ub-writer').attr('data-nick');
                var memo = $(this).parent('div.cmt_mdf_del').siblings('div.clear').children('p.usertxt').html();
                var memo_text = memo.replace(/<br>/g, '\r\n');
                var data = {
                    "cmt_type" : cmt_type,
                    "memo" : memo_text,
                    "name" : name,
                    "re_no" : re_no
                };

                var prev_no = $("#cmt_write_box").attr('data-no');
                if($("#reply_empty_"+prev_no).length) $("#reply_empty_"+prev_no).remove();

                addModifyForm(data);
            } else { //삭제
                comment_delete_submit(re_no);
            }
        } else if(typeof(del_comment_manager) == 'function' && mode == 'del') {
            del_comment_manager($(this).closest('.cmt_mdf_del').attr('re_no'));
        } else if(!uid || article_lv > 9) {
            var pwdInputForm = getPwdInputHtml(cmt_type, re_no, mode);
            $(this).parent('.cmt_mdf_del').append(pwdInputForm);
            $("#cmt_password").focus();
        } else {
            //console.log('error');
        }
    });

    // 댓글쓰기(전송)
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

    // 비밀번호 입력창
    $(document).on('click','.btn_ok', function(){
        var re_password = $(this).siblings('#cmt_password').val();

        if(!re_password) {
            alert('비밀번호를 입력하세요.');
            $(this).siblings('#cmt_password').focus();
            return false;
        }

        var gall_id = $(document).data('comment_id') || getURLParameter("id");
        var cmt_type = $(this).parent('.cmt_delpw_box').attr('data-type');
        var re_no = $(this).parent('.cmt_delpw_box').attr('re_no');
        var mode = $(this).parent('.cmt_delpw_box').attr('c_mode');

        var token  = get_cookie('ci_c');
        var html = '';
        var this_tmp = $(this);

        if(mode == 'update') {
            var url = '/board/comment/comment_update_chk';
        } else if (mode == 'del') {
            var url = '/board/comment/comment_delete_submit';
        } else {
            return false;
        }

        $.ajax({
            type : "POST",
            cache: false,
            async: false,
            url : url,
            data:{ ci_t:token,  id : gall_id, re_no : re_no , mode : mode , re_password : re_password},
            success : function(data) {
                var split_string = data.split('||');

                $("#clickbutton").val("N");

                if(split_string[0] == "false") {
                    alert(split_string[1]);
                    $(this).siblings('#cmt_password').focus();
                    return false;
                }

                if(split_string[0] == "true" && mode == 'del') {
                    alert('삭제되었습니다.');
                    $('.btn_cmt_refresh').first().click();
                    return false;
                } else if(split_string[0] == "true" && mode == 'update') {
                    var data = {
                        "cmt_type" : cmt_type,
                        "memo" : split_string[1],
                        "name" : split_string[2],
                        "re_no" : re_no
                    }
                    c_key = split_string[3];

                    var prev_no = $("#cmt_write_box").attr('data-no');
                    if($("#reply_empty_"+prev_no).length) $("#reply_empty_"+prev_no).remove();

                    addModifyForm(data);
                    this_tmp.parents('.cmt_delpw_box').remove();
                }
            },
            error : function(request,status,error) {
                //	comment_error_log(csrf_token,gall_id,request,status,error);
            }
        });

    });

    // 댓글 수정
    $(document).on('click','.comment_update', function(){

        var formData = '';
        var gall_id = $("#id").val();
        var e_s_n_o = $("#e_s_n_o").val();
        var re_no = $(this).attr('r_no');
        var memo = $('#modi_' + re_no).find('#memo_' + re_no);
        formData += "&id=" + gall_id + "&re_no=" + re_no;

        if(!memo.val()) {
            alert("내용을 입력하세요");
            memo.focus();
            return false;
        }

        if($("#clickbutton").val() == "Y") {
            return false;
        }

        $("#clickbutton").val("Y");

        var csrf_token	= $('input[name=ci_t]').val();

        formData += "&memo=" + encodeURIComponent(memo.val());
        formData += "&cur_t=" + $("#cur_t").val();
        formData += "&user_ip=" + $("#user_ip").val();
        formData += "&e_s_n_o=" + e_s_n_o;

        if(c_key) formData += "&c_key=" + c_key;
        var memo_text = memo.val();

        $.ajax({
            type : "POST",
            cache: false,
            async: false,
            url : "/board/comment/comment_update_submit",
            data : formData ,
            success : function(data) {
                var split_string = data.split('||');

                $("#clickbutton").val("N");

                if(split_string[0] == "false") {
                    alert(split_string[1]);
                    return false;
                } else {
                    if(split_string[1]) {
                        memo_text = split_string[1];
                    }
                }

                var memo_text = memo_text.replace(/(\n|\r\n)/g, '<br>');

                if($("#modi_"+ re_no).attr('data-type') == "cmt"){
                    $('#comment_li_' + re_no).find('.usertxt').html(memo_text);
                } else {
                    $('#reply_li_' + re_no).find('.usertxt').html(memo_text);

                }
                $("#cmt_write_box").parent('li').remove();
            },
            error : function(request,status,error) {
                //	comment_error_log(csrf_token,gall_id,request,status,error);
            }
        });
        memo.val("");
        memo.focus();
    });

    //댓글 등록/수정하기 취소
    $(document).on('click','.comment_cancel', function(){
        var r_no = $(this).attr('r_no');
        var r_type = $(this).attr('r-type');
        $("#"+r_type+r_no).remove();

        //수정
        if(r_type == 'modi_') {
            var cmt_type = $("#"+r_type+r_no).attr("data-type");
            if(cmt_type == 'cmt') {
                if($("#reply_list_"+r_no).length){
                    $("#reply_list_"+r_no).parent("div.reply_box").parent("div.reply").addClass("show");
                }
            }
        }
    });

    // 디시콘 안내레이어
    $(document).on('click','.cmt_write_box .btn_dccon_guide, .cmt_write_box .poply_close', function(){
        if($("#dccon_guide_lyr").length || $(this).parent().attr("id") == 'dccon_guide_lyr') $("#dccon_guide_lyr").remove();
        else $('#icon_guide-tmpl').tmpl().insertAfter($(this));
    });

    $(document).on('keypress','textarea', function(e){
        if(e.keyCode == 13 && !e.shiftKey) {
            $(this).blur();
            ls_str2 = $(this).val().substr(0, 400);
            $(this).val(ls_str2);
            $(this).parents('.cmt_write_box').find('.repley_add').click();
            return false;
        } else if(e.shiftKey && e.keyCode == 13) {
            k_cnt++;
            if(k_cnt > 10) {
                return false;
            }
        }
    });

    //답글 펼침 설정
    $(document).on('click','.btn_setreply,.btn_reply_setting_close,.btn_reply_set_onoff,.btn_reply_setting_save', function(e){
        //console.log('답글 펼침 설정');

        //닫기
        if($(e.currentTarget).is('.btn_reply_setting_close')) {
            $("#reply_setting_lyr").hide();
            return false;
        }

        //on/off 설정
        if($(e.currentTarget).is('.btn_reply_set_onoff')) {
            if($(this).hasClass("on")) {
                $(this).children("span.blind").text('off');
                $(this).attr("data-set","off");
                $(this).removeClass("on");
            }else {
                $(this).children("span.blind").text('on');
                $(this).attr("data-set","on");
                $(this).addClass("on");
            }
            return false;
        }

        //저장
        if($(e.currentTarget).is('.btn_reply_setting_save')) {

            var all_state = $("#reply_set_all_data").attr("data-set");
            var gall_state = $("#reply_set_gall_data").attr("data-set");
            var gall_id = $("#reply_set_gall_data").attr("data-id");
            var save_data = {
                all_state : all_state,
                gall_state : gall_state,
                gall_id : gall_id
            };

            set_reply_folder(save_data);

            alert('저장되었습니다.');

            $("#reply_setting_lyr").remove();

            return false;
        }

        if($("#reply_setting_lyr").length <= 0){
            var gall_id = $("#id").val();;
            var data = get_reply_folder(gall_id);

            $('#reply-setting-tmpl').tmpl(data).insertAfter($(this));
        } else {
            $("#reply_setting_lyr").remove();
        }
    });
});

//댓글 에러 로그 기록
var comment_error_log = function(csrf_token,gall_id,request,status,error) {
    var err_info = $(request.responseText).find(".info_box").html();
    if(err_info == undefined) err_info = request.responseText;

    $.ajax({
        method: "POST",
        url: "/comment/comment_err_log",
        data:{ ci_t:csrf_token,gall_id:gall_id,requestTxt:err_info,status:status,error:error }
    }).done(function( msg ) {
        //console.log('success');
    }).fail(function() {
        //console.log('error');
    }).always(function() {
        if(confirm("댓글 서버에 오류가 발생하였습니다.\n다시 진행하시겠습니까?")){ location.reload(); }
    });
};
