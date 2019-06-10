
const Imgsloader = limit => tap(
    $$.findAll('img'),
    L.map(img => _ => new Promise(resolve => {
        img.onload = () => resolve(img);
        img.src = img.getAttribute('lazy-src');
    })),
    C.takeAllWithLimit(limit),
    each(each($$.addClass('fade-in')))
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



const editHtml = `<div class="edit container qp">
                    <div class="head-container">
                        <h2>차단 id</h2> <h2>차단 ip</h2>
                    </div>
                    <div class="list-container">
                        <textarea id="id-list"></textarea>
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


const esno = $$.val($$('#e_s_n_o'));


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


const baseDrawElement = f => where => pipe($$.el, justifyButton, f(where));
const appendElement = baseDrawElement($$.append);
const justifyButton = el => $$('.cmt_write_box') ? el : go(el, $$.removeClass("list_bottom btn_white"), _ => el);
const beforeElement = baseDrawElement($$.before);
const afterElement = baseDrawElement($$.after);

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


// 버튼 삭제
Button.remove = els => go(
    els,
    L.reject(el => el === undefined),
    each($$.remove)
);

// 상단부 버튼 그리기. 유저차단/차단목록


const baseMenu = where => btns => $$(where) && go(
    btns,
    L.map(btnSel => Button[btnSel]),
    each(appendElement($$(where)))
);

const topMenu = baseMenu('.left_box');
const btmMenu = baseMenu('.view_bottom_btnbox');
const filterMenu = btns => baseMenu('.left_box')(btns) || baseMenu('.view_bottom_btnbox')(btns);
const rPickMenu = baseMenu('.view_bottom_btnbox');



// el => Map([112. 123, 'data-ip'])

// const pushMap = k => (dataMap, data) => (dataMap.set(data, k), dataMap);
// const checkAttr = (k, iter) => go(iter, L.map($$.attr(k)), L.filter(identity));
// const makeMap_by_attr = (dataMap, els) => k => reduce(pushMap(k), dataMap, checkAttr(k, els));
// map(makeMap_by_attr(dataMap, els), ['data-uid', 'data-ip'])

//
// const saveMap = (dataMap, data_key) => attr => (dataMap.set(attr, data_key), dataMap);
// const classify = (f, el, data_key) => go([el], L.map($$.attr(data_key)), L.filter(identity), each(f), ([attr]) => attr);
// const classify_saveMap = (dataMap, el) => data_key => classify(saveMap(dataMap, data_key), el, data_key);

// go(
//     ['data-uid', 'data-ip', 'data-nick', 'user-name'],
//     L.filter(classify_saveMap(dataMap, el)),
//     take1
// );



const classify_user = (dataMap, el) =>
    go(
        ['data-uid', 'data-ip', 'data-nick', 'user_name'],
        L.filter(key => $$.attr(key, el)),
        take1,
        key => (dataMap.set($$.attr(key, el), key), dataMap)
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
        iter => reduce((acc, key)  => [...acc, ...L.filter(el => saved.filter_users.has($$.attr(key, el)), els)], [], iter),
        each(pipe($$.closest('.ub-content'), $$.remove))
    )
};

const splitext = (sep = ',') => text => text ? text.split(sep) : [];
const textToMap = pipe(splitext('\n'), L.map(a => a.split(":")),
                            map(([k, v]) => [v, inversestrRplce(k)]), entries => new Map(entries));
const checkMap = map => (map.delete(""), map.delete(undefined), map);
const editText = el => go(el, $$.find('#id-list'), $$.val, hi, textToMap, hi, checkMap);

const randomArray = array => array[Math.floor(Math.random() * array.length)];




// 생성한 버튼에 차단 진입기 이벤트(차단목록 선택)

const selectView = e => new Promise((resolve) => {

    Button.remove($$.all('.qp'));
    filterMenu(["done", "cancel"]);

    go(
        $$.all('.ub-content .ub-writer'),
        L.map(el => ($$.prepend(el, $$.el(`<input type="checkbox" class="banned">`)), el)),
        each($$.delegate('click', '.banned', ({delegateTarget : dt}) => $$.toggleClass('redBox', dt)))
        )


    go(
        $$('#done'), $$.on('click', e => {
                go(
                    $$.all('.redBox'),
                    classify_users,
                    resolve
                )
                window.location.reload();
            }
        )
    );

    go(
        $$('#cancel'),
        $$.on('click', e => {
            Button.remove($$.all('.qp'));
            topMenu(["filter", "edit"]) || btmMenu(["filter", "edit", "rPick"]);
            each($$.removeClass('redBox'), $$.all('.redBox'));
            each($$.remove, $$.all('.banned'));
            resolve(false);
        })
    );
});



const editView = e => new Promise((resolve) => {


    Button.remove($$.all('.qp'));
    filterMenu(["save", "cancel"]);

    go(
        editHtml,
        $$('.list_array_option') ? afterElement($$('.list_array_option'))
            : afterElement($$('.view_bottom_btnbox')),
        $$.find('#id-list'),
            $$.setVal(
                go(
                    saved.filter_users,
                    map(([k, v]) => `${strRplce(v)}:${k}`)
                ).join('\n')
            )

    );

    go(
        $$('#save'),
        $$.on('click', e => {
                go(
                    $$('.edit'),
                    editText,
                    resolve,
                )
                window.location.reload();
            }
        )
    );

    go(
        $$('#cancel'),
        $$.on('click', e => {
            Button.remove($$.all('.qp'));
            topMenu(["filter", "edit"]) || btmMenu(["filter", "edit", "rPick"]);
            resolve(false);
        })
    );

});

// 추첨기능

const rPickView = e => new Promise( resolve => {

    Button.remove($$.all('.qp'));
    rPickMenu(["rPickStart", "cancel"]);

    const nicknames = go(
        $$.all('.cmt_nickbox .ub-writer'),
        L.map(
                    el => el && $$.attr('data-ip', el) ? $$.attr('data-nick', el) + "(" + $$.attr('data-ip', el) + ")"
                        : $$.attr('data-nick', el)

        ),
        array => new Set(array),
        set => (set.delete("댓글돌이"), set)
    );

    go(
        rPickHtml,
        beforeElement($$('.bottom_paging_box')),
        $$.find('#rpick-list'),
        $$.setVal([...nicknames].join(', '))
    );


    go(
        $$('#rPickStart'),
        $$.on('click', e => {
            go(
                $$('.rPick'),
            $$.find('#rpick-list'),
            $$.val,
                splitext,
                randomArray,
                winner => `<div id="win">당첨자는 ${winner}입니다.</div>`,
                beforeElement($$('.bottom_paging_box')),
            )
        })
    );

    go(
        $$('#cancel'),
        $$.on('click', e => {
            Button.remove($$.all('.qp'));
            topMenu(["filter", "edit"]) || btmMenu(["filter", "edit", "rPick"]);
            each($$.remove, $$.all('#win'));
            resolve(false);
        })
    );
});

// 페이지 로드 시, 차단목록 불러오기

const saved = {};
saved.filter_users = new Map(go(localStorage.getItem('filter_users'), JSON.parse, L.entries));
