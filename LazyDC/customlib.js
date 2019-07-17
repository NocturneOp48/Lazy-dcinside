$.animate = curry((options, el) =>
    go(anime(Object.assign({ targets: el, easing: 'easeInOutQuart', duration: 500 }, options)).finished, _ => el));


const commentScript = _ => {
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//gall.dcinside.com/_js/comment.js';
    head.appendChild(script);
};




const loading = `<svg class="spinner" id="spin_loading" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>`;

const stopAnchor = e => (e.preventDefault(), e.stopPropagation(), e);
const get = pipe($.attr('href'), $.get);
const testURI = curry((param, url)  => new RegExp( param + '=([^&#]*)').test(url));

const string = iter => reduce((a, b) => `${a}${b}`, "", iter);
const strMap = curry(pipe(L.map, string));

const Imgsloader = limit => tap(
    $.findAll('img'),
    L.map(img => _ => new Promise(resolve => {
        img.onload = () => resolve(img);
        img.src = img.getAttribute('lazy-src');
    })),
    C.takeAllWithLimit(limit),
    each(each($.addClass('fade-in')))
);

const groupBySize = curry((size, iter) => {
    let r = L.range(Infinity);
    return groupBy(_ => Math.floor(r.next().value / size), iter);
});

C.takeAllWithLimit = curry((limit = Infinity, iter) => go(
    iter,
    groupBySize(limit),
    L.values,
    L.map(L.map(f => f())),
    L.map(C.takeAll)));

const UI = {};

UI.message = curry((btns, msg, before = a => a, after = a => a) => new Promise(resolve => go(
    `
    <div class="confirm">
      <div class="body">
        <div class="msg">${msg}</div>
        <textarea id="user_list"></textarea>
        <div class="buttons">
          ${strMap(btn => `
            <button type="button" class="${btn.type}">${btn.name}</button>
          `, btns)}
        </div>
      </div>
    </div>
  `,
    $.el,
    $.append($('body')),
    tap(before),
    ...map(btn => tap(
        $.find(`.${btn.type}`),
        $.on('click', e => go(
            e.currentTarget,
            $.closest('.confirm'),
            tap(after),
            $.remove,
            _ => resolve(btn.value)
        ))), btns)
)));

UI.confirm = UI.message([
    { name: '취소', type: 'cancel', value: false },
    { name: '저장', type: 'ok', value: true }
]);


UI.rPick = curry((btns, msg, before = a => a, after = a => a) => new Promise(resolve => go(
    `
    <div class="confirm">
      <div class="body">
        <div class="msg">${msg}</div>
        <textarea id="user_list"></textarea>
        <div class="buttons">
          ${strMap(btn => `
            <button type="button" class="${btn.type}">${btn.name}</button>
          `, btns)}
        </div>
      </div>
    </div>
  `,
    $.el,
    $.append($('body')),
    tap(before),
    tap(
        $.find('.start'),
        $.on('click', ({currentTarget}) => go(currentTarget, $.closest('.confirm'), hi, after))
    ),
    $.find('.cancel'),
    $.on('click', e => go(
        e.currentTarget,
        $.closest('.confirm'),
        $.remove,
        _ => resolve(false)
        )
    )
))
);

UI.rPickConfirm = UI.rPick([
    { name: '취소', type: 'cancel', value: false },
    { name: '시작', type: 'start', value: true }
]);





const esno = $.val($('#e_s_n_o'));


const isIterable = iter => !!iter && iter[Symbol.iterator] ;

const strRplce = str =>
    str == "data-uid" ? "유저 ID" :
        str == "data-ip" ? "유저 IP" :
            str == "data-nick" ? "유저 닉네임" :
                str == "user_name" ? "유저 이름" :
                    ""
const inversestrRplce = str =>
    str == "유저 ID" ?"data-uid" :
        str == "유저 IP" ? "data-ip" :
            str == "유저 닉네임" ? "data-nick" :
                str == "유저 이름" ? "user_name" :
                    "";


const baseDrawElement = f => where => pipe($.el, f(where));
const appendElement = baseDrawElement($.append);
// const justifyButton = el => $('.cmt_write_box') ? el : go(el, $.removeClass("list_bottom btn_white"), _ => el);


// 버튼

const Button = {};


Button.interface = (id, value) => `<button type="button" class="btn_extension qp" id=${id}>${value}</button>`;
// const filterBtn = `<button type="button" class="list_bottom btn_white" id="filter">유저차단</button>`;
Button.filter = Button.interface('filter', '차단');
Button.done = Button.interface('done', '완료');
Button.cancel = Button.interface('cancel', '취소');
Button.edit = Button.interface('edit', '목록');
Button.save = Button.interface('save', '저장');
Button.rPick = Button.interface('rPick', '추첨');
Button.rPickStart = Button.interface('rPickStart', '시작');
Button.directView = Button.interface('dView', '빠른글보기');


// 버튼 삭제
Button.remove = els => go(
    els,
    L.reject(el => el === undefined),
    each($.remove)
);

// 상단부 버튼 그리기. 유저차단/차단목록


const baseMenu = where => btns => $(where) && go(
    btns,
    L.map(btnSel => Button[btnSel]),
    each(appendElement($(where)))
);

const topMenu = baseMenu('.list_array_option');
const btmMenu = baseMenu('.view_bottom_btnbox');
const filterMenu = btns => baseMenu('.list_array_option')(btns) || baseMenu('.view_bottom_btnbox')(btns);



const classify_user = (dataMap, el) =>
    go(
        ['data-uid', 'data-ip', 'data-nick', 'user_name'],
        L.filter(key => $.attr(key, el)),
        take1,
        key => (dataMap.set($.attr(key, el), key), dataMap)
    );


const classify_users = els => reduce(classify_user, new Map(), els);


// 이번 선택으로 추가된 Set을 원래의 Set에 추가한다.
const mergeMap = dataMap => new Map([...saved.filter_users, ...dataMap]);


const storageSet = curry( (edited, F)  => {
    if(F) {
        const merged = edited ? F : mergeMap(F);
        localStorage.setItem('filter_users', JSON.stringify(object(merged)));
        return Promise.resolve('Success');
    }
});

const postFilter = els => {
    go(
        ['data-uid', 'data-ip', 'data-nick', 'user_name'],
        iter => reduce((acc, key)  => [...acc, ...L.filter(el => saved.filter_users.has($.attr(key, el)), els)], [], iter),
        each(pipe($.closest('.ub-content'), $.setCss(['display', 'none'])))
    )
};

const splitext = (sep = ',') => text => text ? text.split(sep) : [];
const textToMap = pipe(splitext('\n'), L.map(a => a.split(":")),
    map(([k, v]) => [v, inversestrRplce(k)]), entries => new Map(entries));
const checkMap = map => (map.delete(""), map.delete(undefined), map);
const editText = pipe($.val, textToMap, checkMap);


const randomArray = array => array[Math.floor(Math.random() * array.length)];



// 차단하기
const filtering = _ => {
    postFilter($.all('.ub-content .ub-writer'));
};

// 생성한 버튼에 차단 진입기 이벤트(차단목록 선택)

const selectView = e => new Promise((resolve) => {

    Button.remove($.all('.qp'));
    filterMenu(["done", "cancel"]);

    go(
        $.all('.ub-content .ub-writer'),
        L.map(el => ($.prepend(el, $.el(`<input type="checkbox" class="banned">`)), el)),
        each($.delegate('click', '.banned', ({delegateTarget : dt}) => $.toggleClass('redBox', dt)))
    )


    go(
        $('#done'), $.on('click', e => {
                go(
                    $.all('.redBox'),
                    classify_users,
                    resolve
                )
                window.location.reload();
            }
        )
    );

    go(
        $('#cancel'),
        $.on('click', e => {
            Button.remove($.all('.qp'));
            topMenu(["directView", "filter", "edit", "rPick"]) || btmMenu(["filter", "edit", "rPick"]);
            each($.removeClass('redBox'), $.all('.redBox'));
            each($.remove, $.all('.banned'));
            resolve(false);
        })
    );
});



const editView = async ({currentTarget: ct}) => {

    saved.filter_users = new Map(go(localStorage.getItem('filter_users'), JSON.parse, L.entries));


    const listFill = pipe(
        $.find('#user_list'),
        $.setVal(
            go(
                saved.filter_users,
                map(([k, v]) => `${strRplce(v)}:${k}`)
            ).join('\n')
        ));

    const save = pipe(
        $.find('#user_list'),
        editText,
        storageSet(true),
    );

    await UI.confirm("차단목록", listFill, save);

    filtering();


};

// 추첨기능

const rPickView = async ({currentTarget: ct}) => {

    const nicknames = go(
        $.all('.cmt_nickbox .ub-writer'),
        L.map(
            el => el && $.attr('data-ip', el) ? $.attr('data-nick', el) + "(" + $.attr('data-ip', el) + ")"
                : $.attr('data-nick', el)

        ),
        array => new Set(array),
        set => (set.delete("댓글돌이"), set)
    );


    const listFill = pipe($.find('#user_list'),
        $.setVal([...nicknames].join(', '))
    );

    const start = el => go(el,
            $.find('#user_list'),
            $.val,
            splitext(', '),
            randomArray,
            winner => `<div id="win">당첨자는 ${winner}입니다.</div>`,
            $.el,
            $.after($.find('#user_list', el))
        );


    await UI.rPickConfirm("추첨목록", listFill, start);

    filtering();


};


var dViewMode = !!(JSON.parse(localStorage.getItem('dViewMode')));

const dViewToggle = _ => dViewMode ? go($('#dView'), $.addClass('on')) : go($('#dView'), $.removeClass('on'));

const dView = e => {
    dViewMode = !dViewMode;
    localStorage.setItem('dViewMode', JSON.stringify(dViewMode));
    dViewToggle();
    dViewMode && dViewLoad();
};

const dViewLoad = _ => {


    commentScript();

    const postHTML = html => new RegExp('(<div class="view_content_wrap">[\\w\\W\\s."]*)<!-- 댓글 -->').exec(html)[1] || null;
    const lazyImg = str => str.replace(/img src=/gi, "img src=_ class=\"fade\"  lazy-src=");
    const cmtHTML = html => new RegExp('(<div class=\"view_comment\">[\\w\\W\\s."]*)<script id=\"reply-setting-tmpl\"').exec(html)[1] || null;

    const dialogtml = `<div id="dcs_dialog" click="${stopAnchor}"></div>`;
    const dlgps = `<tr id="dlg_position"></tr>`;

    const postView = pipe(postHTML, lazyImg, $.el);
    const cmtView = pipe(cmtHTML, $.el);

    const postLoad = pipe(get, html => [postView(html), cmtView(html)]);




    go(
        $.all('.ub-content.us-post a'),
        map(
            $.on('click', e => {

                    stopAnchor(e);
                    $('#dlg_position') && $.remove($('#dcs_dialog')) && $.remove($('#dlg_position'));


                    const dialog = $.el(dialogtml);
                    const {currentTarget: ct} = e;
                    const targetHref = $.attr('href', ct);

                    dViewMode || (window.location.href = targetHref);

                    $.after($.closest('.us-post', ct), $.el(dlgps));
                    // const top = $.offset($('#dlg_position')).top;
                    // const left = $.offset($('#dlg_position')).left;

                    go(
                        dialog,
                        $.append($('#dlg_position'))
                    );


                    history.replaceState({data : 'replace'}, 'title', targetHref);

                    go(
                        ct,
                        postLoad,
                        ([post, cmt]) => {
                            Imgsloader(3)(post);

                            $.append(dialog, post);
                            //$.animate({'top': top, 'left' : left, 'opacity' : 1}, dialog);
                            $.animate({'top': 0, 'opacity' : 1}, dialog);
                            



                            $.append(dialog, $.el(`<a id="dcs_viewComment" href="javascript:viewComments(1, 'VIEW_PAGE')"></a>`));
                            $.append(dialog, cmt);


                            setTimeout(function() {
                                dialog.append($.el(`<iframe id="dcs_iframe" style="display: none;" src=${targetHref}></iframe>`))
                                go(
                                    $('#dcs_iframe'),
                                    $.on('load', e => {
                                    const iframe = document.querySelector('#dcs_iframe').contentDocument.body;
                                    const script = document.createElement('script');
                                    script.type = "text/javascript";
                                    script.innerHTML = `window.alert = function () {}; window.confirm = function() {};`;
                                    iframe.prepend(script);
                                }
                                    )
                                )
                            }, 0);




                            go(
                                $('.repley_add'),
                                $.removeClass('btn_blue btn_svc small repley_add'),
                                $.addClass('btn_blue small dcs_replyButton')
                            );


                            go(
                                $("textarea[id^=\"memo\"]"),
                                $.addClass('directMemobox')
                            );


                            $('#dcs_viewComment').click();


                            //$.animate({'height': $.height($('#dcs_dialog'))}, $('#dlg_position'));



                            setTimeout(filtering, 300);

                            go(
                                $("textarea[id^=\"memo\"][class^=\"directMemobox\"]"),
                                $.on('keydown', e => {
                                    const {keyCode} = e;
                                    keyCode == 13 &&
                                    stopAnchor(e) && $.trigger('click', $('.dcs_replyButton'));

                                })
                            );



                            // esc로 글 닫기
                            go(
                                docEl,
                                $.on('keydown', e => {

                                    const {keyCode} = e;

                                    keyCode == '27' &&
                                    $('#dlg_position') &&
                                    $.remove($('#dcs_dialog')) &&
                                    $.remove($('#dlg_position'));
                                })

                            );

                            // 다른 곳을 클릭해서 글 닫기
                            go(
                                $('#container'),
                                $.on('click', e => {
                                    $.closest('.gall_list', e.target)
                                    || $('#dlg_position')
                                    && $.remove($('#dcs_dialog'))
                                    && $.remove($('#dlg_position'));
                                })
                            );



                            go(
                                docEl,
                                $.delegate('click', '.tx_dccon', e => {

                                    $('#div_con') ?
                                        $.toggleClass('off', $('#div_con')):
                                        go(
                                            $('#dcs_iframe').contentDocument.body,
                                            $.find('#div_con'),
                                            $.append($('.dccon_guidebox')
                                            )
                                        );

                                })
                            );



                        }
                    );

                }

            )
        )
    );





    dViewMode && go(
        docEl,
        $.delegate('click', '.dcs_replyButton', e => {
            bypassSubmitComment();
            go($('#dcs_dialog'), el => el.parentNode, $.focus);
        })
    );

    const bypassSubmitComment = _ => {
        const id = $("input[id^='name']");
        const pw = $("input[id^='password']");
        const text = go( $("textarea[id^=\"memo\"]"), $.val, val => val.toString());

        const iframeContents = $('#dcs_iframe').contentDocument.body;


        // go(iframeContents, $.findAll(':not(.cmt_write_box)'), each($.setCss(['display', 'none'])));

        pw && pw.length == 1 && go(iframeContents,
            tap($.find("input[id^='name']"), $.setVal(go(id, $.val, val => val.toString()))),
            tap($.find("input[id^='password']"), $.setVal(go(pw, $.val, val => val.toString()))),
        )

        go(iframeContents,
            tap($.find('textarea'), $.setVal(text)),
            tap($.find('.comment_count'), el => $.trigger('click', el)),
            tap($.find('.btn_blue.btn_svc.small.repley_add'), el => $.trigger('click', el))
        );

        $('#dcs_viewComment').click();
        setTimeout(filtering, 300);
        go($("textarea[id^=\"memo\"]"), $.setVal(""));
    }

};


// 페이지 로드 시, 차단목록 불러오기

const saved = {};
saved.filter_users = new Map(go(localStorage.getItem('filter_users'), JSON.parse, L.entries));