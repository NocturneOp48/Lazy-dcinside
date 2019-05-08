// 버튼
const filterButton = `<button type="button" class="list_bottom btn_white" id="filter">유저차단</button>`;
const doneButton = `<button type="button" class="list_bottom btn_white" id="done">차단완료</button>`;
const cancelButton = `<button type="button" class="list_bottom btn_white" id="cancel">취소</button>`;
const editButton = `<button type="button" class="list_bottom btn_white" id="edit">차단목록</button>`;
const saveButton = `<button type="button" class="list_bottom btn_white" id="save">저장</button>`;
const rPickButton = `<button type="button" class="list_bottom btn_white" id="rPick">추첨</button>`;
const rPickStartButton = `<button type="button" class="list_bottom btn_white" id="rPickStart">추첨시작</button>`;

const defaultButtonCreate = (_, _2) => {
    if(!_) filterToggleButton();
    if(!_2) editToggleButton();
    rPickToggleButton();
};

const editHtml = `<div class="edit container">
                        <div class="head-container">
                        <h2>차단 id</h2> <h2>차단 ip</h2>
                        </div>
                        <div class="list-container">
                        <textarea id="id-list"></textarea><textarea id="ip-list"></textarea>
                        </div>
                                                </div>`;

const rPickHtml = `<div class="rPick container">
                        <div class="head-container">
                        <h2>추첨 목록</h2> 
                        </div>
                        <div class="list-container">
                        <textarea id="rpick-list"></textarea>
                        </div></div>`;

const filterToggleButton = button => {
    if(button) $.remove(button);
    !!(button) && button.id == 'filter' ? (appendButton(doneButton), appendButton(cancelButton)):
        (appendButton(filterButton));
};

const editToggleButton = button => {
    if(button) $.remove(button);
    !!(button) && button.id == 'edit' ? (appendButton(saveButton), appendButton(cancelButton)):
        (appendButton(editButton));
};

const rPickToggleButton = button => {
    if ($('.cmt_nickbox')) {
        if(button) $.remove(button);
        !!(button) && button.id == 'rPick' ? (appendButton(rPickStartButton), appendButton(cancelButton)):
            (appendButton(rPickButton));
    }
};

const baseDrawElement = f => where => pipe($.el, f(where));
const appendElement = baseDrawElement($.append)
const appendButton = appendElement($('.left_box') ? $('.left_box') : $('.view_bottom_btnbox'));
const beforeElement = baseDrawElement($.before);
const afterElement = baseDrawElement($.after);
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

    const id = $.attr('data-uid', el);
    const ip = $.attr('data-ip', el);

    return el.parentNode.className == 'cmt_nickbox' ?
        id ? (saved.filter_id.has(id) ? $.remove(el.parentNode.parentNode.parentNode) : el)
            : (saved.filter_ip.has(ip) ? $.remove(el.parentNode.parentNode.parentNode) : el)
        : id ? (saved.filter_id.has(id) ? $.remove(el.parentNode) : el)
            : (saved.filter_ip.has(ip) ? $.remove(el.parentNode) : el);
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

const selectView = e => new Promise((resolve, reject) => {

    filterToggleButton(e.target);

    go(
        $.all('.ub-content'),
        C.map(
            pipe(
                $.find('.ub-writer'),
                parent =>  ($.prepend(parent, $.el(`<input type="checkbox" class="banned">`)), parent),
                $.delegate('click', '.banned',e => {
                    go(
                        e.delegateTarget,
                        $.toggleClass('redBox')
                    );
                })
            )
        )
    )

    go(
        $('#done'),
        $.on('click', e => {
            go(
                $.all('.redBox'),
                classify_users,
                resolve
            );
            window.location.reload();
        })
    );

    go(
        $('#cancel'),
        $.on('click', e => {
            $.remove($('#edit'));
            $.remove($('#done'));
            if($('#rPick')) $.remove($('#rPick'))
            $.remove(e.target);
            C.map($.removeClass('redBox'), $.all('.redBox'));
            C.map($.remove, $.all('.banned'));
            defaultButtonCreate();
            resolve(null);
        })
    );
});



const editView = e => new Promise((resolve, reject) => {

    editToggleButton(e.target);
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
        );
            window.location.reload();

        })
    );

    go(
        $('#cancel'),
        $.on('click', e => {
            $.remove($('#save'));
            $.remove(e.target);
            $.remove($('.edit'));
            if($('#rPick')) $.remove($('#rPick'));
            defaultButtonCreate('filter exclude');
            resolve(null);
        })
    );

});

// 추첨기능

const rPickView = e => new Promise( resolve => {

    rPickToggleButton(e.target);

    const nicknames = go(
        $.all('.cmt_nickbox'),
        C.map(
            pipe($.find('.ub-writer'),
                    el => $.attr('data-ip', el) ? $.attr('data-nick', el) + "(" + $.attr('data-ip', el) + ")"
                        : $.attr('data-nick', el)
                    )
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
            $.remove($('#rPickStart'));
            $.remove(e.target);
            go(
                $('.rPick'),
                $.remove
            );
            C.map($.remove, $.all('#win'));
            rPickToggleButton();
            resolve(null);
        })
    );
})

// 페이지 로드 시, 차단목록 불러오기

const saved = {};
saved.filter_id = new Set(go(localStorage.getItem('filter_id'), JSON.parse));
saved.filter_ip = new Set(go(localStorage.getItem('filter_ip'), JSON.parse));
