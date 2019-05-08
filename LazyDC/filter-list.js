


// 페이지 로드 시, 차단목록 불러오기
// const saved = {};
// saved.filter_id = new Set(go(localStorage.getItem('filter_id'), JSON.parse));
// saved.filter_ip = new Set(go(localStorage.getItem('filter_ip'), JSON.parse));
//
// const join = scat(identity);


console.log(localStorage.getItem('filter_id'));

chrome.storage.local.set({"filter_id": 'abc'}, function (items) {
    console.log(items);
})


chrome.storage.local.get("filter_id", function (items) {
    console.log(items);
})

//    $('#id-list')