const editHtml = `<div class="edit container qp">
                    <div class="head-container">
                        <h2>차단 id</h2> <h2>차단 ip</h2>
                    </div>
                    <div class="list-container">
                        <textarea id="id-list"></textarea> <textarea id="ip-list"></textarea>
                    </div>
                  </div>`;

const rPickHtml = `<div class="rPick container qp">
                    <div class="head-container">
                        <h2>추첨 목록</h2> 
                    </div>
                    <div class="list-container">
                        <textarea id="rpick-list"></textarea>
                    </div>
                   </div>`;




const baseDrawElement = f => where => pipe($.el, justifyButton, f(where));
const appendElement = baseDrawElement($.append);
const justifyButton = el => $('.cmt_write_box') ? el : go(el, $.removeClass("list_bottom btn_white"), _ => el);
const beforeElement = baseDrawElement($.before);
const afterElement = baseDrawElement($.after);

// 버튼

const Button = {};


Button.interface = (id, value) => `<button type="button" class="list_bottom btn_white qp" id=${id}>${value}</button>`;
// const filterBtn = `<button type="button" class="list_bottom btn_white" id="filter">유저차단</button>`;
Button.filter = Button.interface('filter', '유저차단');
Button.done = Button.interface('done', '차단완료');
Button.cancel = Button.interface('cancel', '취소');
Button.edit = Button.interface('edit', '차단목록');
Button.save = Button.interface('save', '저장');
Button.rPick = Button.interface('rPick', '추첨');
Button.rPickStart = Button.interface('rPickStart', '추첨시작');

const isIterable = iter => !!iter && iter[Symbol.iterator] ;
const eventOn = (event, f) => els => each(el => el.addEventListener(event, f) , isIterable(els) ? els : [els]);

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

const topMenu = baseMenu('.left_box');
const btmMenu = baseMenu('.view_bottom_btnbox');
const filterMenu = btns => baseMenu('.left_box')(btns) || baseMenu('.view_bottom_btnbox')(btns);
const rPickMenu = baseMenu('.view_bottom_btnbox');


const check_data = curry((set, data) => data ? set.add(data) : set);
const baseSet = id_or_ip => (set, data) => go(data, $.attr(id_or_ip), check_data(set))
const classify_users = users => {
    const F = {};
    F.filter_id = reduce(baseSet('data-uid'), new Set(), users);
    F.filter_ip = reduce(baseSet('data-ip'), new Set(), users);
    return F
};

// 이번 선택으로 추가된 Set을 원래의 Set에 추가한다.
const mergeSet = obj => {
    const filter_id = new Set([...saved.filter_id, ...obj.filter_id]);
    const filter_ip = new Set([...saved.filter_ip, ...obj.filter_ip]);
    return {filter_id, filter_ip};
};

const storageSet = curry( (edited, F)  => {
    if(F) {
        const merged = edited ? F : mergeSet(F);
        localStorage.setItem('filter_id', JSON.stringify(Array.from(merged.filter_id)));
        localStorage.setItem('filter_ip', JSON.stringify(Array.from(merged.filter_ip)));
        return Promise.resolve('Set Success');
    }
});

const postFilter = el => {

    const id = el && $.attr('data-uid', el);
    const ip = el && $.attr('data-ip', el);

    return el && ('parentNode' in el) && (el.parentNode.className == 'cmt_nickbox' ?
        id ? (saved.filter_id.has(id) ? $.remove(el.parentNode.parentNode.parentNode) : el)
            : (saved.filter_ip.has(ip) ? $.remove(el.parentNode.parentNode.parentNode) : el)
        : id ? (saved.filter_id.has(id) ? $.remove(el.parentNode) : el)
            : (saved.filter_ip.has(ip) ? $.remove(el.parentNode) : el));
};

const textToArray = text => text.split(', ');
const textToSet = text => new Set(text.split('\n'));
const checkSet = set => (set.delete(""), set);
const editText = el => {
    const F = {};
    F.filter_id = go(el, $.find('#id-list'), $.val, textToSet, checkSet);
    F.filter_ip = go(el, $.find('#ip-list'), $.val, textToSet, checkSet);
    return F;
};

const randomArray = array => array[Math.floor(Math.random() * array.length)];


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
            topMenu(["filter", "edit"]) || btmMenu(["filter", "edit", "rPick"]);
            each($.removeClass('redBox'), $.all('.redBox'));
            each($.remove, $.all('.banned'));
            resolve(false);
        })
    );
});



const editView = e => new Promise((resolve) => {


    Button.remove($.all('.qp'));
    filterMenu(["save", "cancel"]);

    go(
        editHtml,
        $('.list_array_option') ? afterElement($('.list_array_option'))
            : afterElement($('.view_bottom_btnbox')) ,
        tap($.find('#id-list'),
            $.setVal([...saved.filter_id].join('\n'))),
        tap($.find('#ip-list'),
            $.setVal([...saved.filter_ip].join('\n'))),
    );

    go(
        $('#save'),
        $.on('click', e => {
                go(
                    $('.edit'),
                    editText,
                    resolve,
                )
                window.location.reload();
            }
        )
    );

    go(
        $('#cancel'),
        $.on('click', e => {
            Button.remove($.all('.qp'));
            topMenu(["filter", "edit"]) || btmMenu(["filter", "edit", "rPick"]);
            resolve(false);
        })
    );

});

// 추첨기능

const rPickView = e => new Promise( resolve => {

    Button.remove($.all('.qp'));
    rPickMenu(["rPickStart", "cancel"]);

    const nicknames = go(
        $.all('.cmt_nickbox .ub-writer'),
        L.map(
                    el => el && $.attr('data-ip', el) ? $.attr('data-nick', el) + "(" + $.attr('data-ip', el) + ")"
                        : $.attr('data-nick', el)

        ),
        array => new Set(array),
        set => (set.delete("댓글돌이"), set)
    );

    go(
        rPickHtml,
        beforeElement($('.bottom_paging_box')),
        $.find('#rpick-list'),
        $.setVal([...nicknames].join(', '))
    );


    go(
        $('#rPickStart'),
        $.on('click', e => {
            go(
                $('.rPick'),
            $.find('#rpick-list'),
            $.val,
                textToArray,
                randomArray,
                winner => `<div id="win">당첨자는 ${winner}입니다.</div>`,
                beforeElement($('.bottom_paging_box')),
            )
        })
    );

    go(
        $('#cancel'),
        $.on('click', e => {
            Button.remove($.all('.qp'));
            topMenu(["filter", "edit"]) || btmMenu(["filter", "edit", "rPick"]);
            each($.remove, $.all('#win'));
            resolve(false);
        })
    );
});

// 페이지 로드 시, 차단목록 불러오기

const saved = {};
saved.filter_id = new Set(go(localStorage.getItem('filter_id'), JSON.parse));
saved.filter_ip = new Set(go(localStorage.getItem('filter_ip'), JSON.parse));
