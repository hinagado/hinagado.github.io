// 投稿の箱の画面。本番は Apps Script、見本（?demo=1 か送信先が未設定）は画面の中だけで動く
(function () {
  var ENDPOINT = "https://script.google.com/macros/s/AKfycbxToqVQEdKxT9cMdM1YpEziujtM99mTaIusrJLzWvEOi34N57LHu60N2g2U90DQnzWJ/exec";
  var HANDLE = "goto.citymall";
  var $ = function (id) { return document.getElementById(id); };
  var demo = !ENDPOINT || new URLSearchParams(location.search).get("demo") === "1";
  var pass = "", photos = [], R = PostRules, today = new Date(), viewing = {};
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // ---- 通信
  var Demo = {
    rows: [{id: "例-1", shop: "BLOSSOM", kind: "お店の紹介", message: "（例）1階のレストラン・カフェを紹介したい", when: R.ymd(R.earliest(today)), state: "下書きあり", revisions: 0, versions: [
      {title: "BLOSSOM", caption: "1階のレストラン・カフェ BLOSSOM。\nお買い物のあとに、ひと息つきませんか。\n\n営業時間 11:00〜21:00\n#五島シティモール #福江島", image: "sample_blossom.jpg"}]}],
    call: function (action, b) {
      var rows = this.rows, find = function (id) { return rows.filter(function (r) { return r.id === id; })[0]; }, quota = function () { var k = R.monthKey(R.ymd(today)); return {month: k, used: R.used(rows, k), limit: R.LIMIT}; }, bad;
      if (action === "status") return {ok: true, quota: quota()};
      if (action === "list") return {ok: true, items: rows.slice().reverse(), quota: quota()};
      if (action === "submit") {
        bad = R.checkSubmit(b, today, rows); if (bad) return {ok: false, error: bad};
        var id = "例-" + (rows.length + 1);
        rows.push({id: id, shop: b.shop, kind: b.kind, message: b.message, when: b.when, state: "下書きあり", revisions: 0, versions: [{title: b.shop || b.kind, caption: b.message + "\n\n#五島シティモール #福江島", image: b.photos[0]}]});
        return {ok: true, id: id, quota: quota()};
      }
      var r = find(b.id);
      if (action === "approve") { bad = R.checkApprove(r, b.version); if (bad) return {ok: false, error: bad}; r.state = "承認済み"; r.approvedVersion = b.version; return {ok: true}; }
      if (action === "revise") {
        bad = R.checkRevise(r, b.note); if (bad) return {ok: false, error: bad};
        r.revisions++;
        var base = r.versions[b.version] || r.versions[r.versions.length - 1];
        // 見本なので、すぐ直ったことにして案を増やす
        r.versions.push({title: base.title, caption: "（" + (r.versions.length + 1) + "案目・直しの見本）\n" + base.caption, image: base.image, note: b.note});
        return {ok: true};
      }
      return {ok: false, error: "できない操作です。"};
    },
  };
  function api(action, data) {
    data = data || {};
    if (demo) return Promise.resolve(Demo.call(action, data));
    data.action = action; data.pass = pass;
    return fetch(ENDPOINT, {method: "POST", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify(data), redirect: "follow", credentials: "omit"}).then(function (r) { return r.json(); });
  }
  var NET = "つながりませんでした。電波の良い所でもう一度お試しください。";

  // ---- 枠
  function showQuota(q) {
    if (!q) return;
    var left = Math.max(0, q.limit - q.used), m = +q.month.slice(5);
    $("quota").innerHTML = "";
    $("quota").append(el("span", "", m + "月は、あと "), el("b", "", left), el("span", "", " 本入れられます"), el("small", "", q.limit + "本のうち"));
    $("ring").setAttribute("stroke-dasharray", (left / q.limit * 100) + " 100");
  }

  // ---- タブ
  function tab(name) {
    var box = name === "box";
    $("box").hidden = !box; $("check").hidden = box;
    $("tBox").setAttribute("aria-selected", box); $("tCheck").setAttribute("aria-selected", !box);
    if (!box) loadList();
    scrollTo({top: 0, behavior: "instant"});
  }
  $("tBox").onclick = function () { tab("box"); };
  $("tCheck").onclick = function () { tab("check"); };

  // ---- 種類
  var ICON = {"お店の紹介": '<path d="M4 10l1.5-5h13L20 10M5 10v9h14v-9M4 10h16M10 19v-5h4v5"/>', "セール・催し": '<path d="M4 12l8-8h8v8l-8 8zM15.5 8.5h.01"/>', "新しい商品": '<path d="M12 3l2.5 6 6.5.5-5 4.2 1.6 6.3L12 16.5 6.4 20 8 13.7l-5-4.2 6.5-.5z"/>', "お知らせ": '<path d="M4 10v4h3l8 5V5L7 10zM18 9.5a3.5 3.5 0 010 5"/>', "そのほか": '<circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>'};
  R.KINDS.forEach(function (k, i) {
    var l = el("label", "kind"), r = el("input"), s = el("span");
    r.type = "radio"; r.name = "kind"; r.value = k; r.id = "kind" + i;
    s.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + "</svg>"; s.append(el("b", "", k));
    l.append(r, s); $("kinds").append(l);
  });
  function kindValue() { var c = document.querySelector('input[name=kind]:checked'); return c ? c.value : ""; }
  $("message").oninput = function () { $("count").textContent = this.value.length + " / 1000"; };

  // ---- 写真: 端末の中で縮小してから送る
  function shrink(file) {
    return new Promise(function (ok, ng) {
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var k = Math.min(1, 1600 / Math.max(im.width, im.height)), c = document.createElement("canvas");
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        ok(c.toDataURL("image/jpeg", 0.85));
      };
      im.onerror = function () { URL.revokeObjectURL(url); ng(new Error("image")); };
      im.src = url;
    });
  }
  function drawThumbs() {
    $("thumbs").innerHTML = "";
    photos.forEach(function (p, i) {
      var w = el("div", "thumb"), im = new Image(), x = el("button", "", "×");
      im.src = p; im.alt = "選んだ写真 " + (i + 1); x.type = "button"; x.setAttribute("aria-label", "写真" + (i + 1) + "を外す");
      x.onclick = function () { photos.splice(i, 1); drawThumbs(); };
      w.append(im, x); $("thumbs").append(w);
    });
  }
  $("photos").onchange = function () {
    var files = [].slice.call(this.files), room = R.MAX_PHOTOS - photos.length;
    showErr(files.length > room ? "写真は" + R.MAX_PHOTOS + "枚までです。" : "");
    Promise.all(files.slice(0, room).map(function (f) { return shrink(f).catch(function () { return null; }); })).then(function (list) {
      var bad = list.filter(function (x) { return !x; }).length;
      photos = photos.concat(list.filter(Boolean)); drawThumbs();
      if (bad) showErr("読み込めない写真がありました。JPEG か PNG の写真でお試しください。");
    });
    this.value = "";
  };
  function showErr(s) { $("formErr").textContent = s; $("formErr").hidden = !s; }

  // ---- 送る
  $("form").onsubmit = function (e) {
    e.preventDefault();
    var data = {photos: photos, kind: kindValue(), shop: $("shop").value.trim(), message: $("message").value.trim(), when: $("when").value, consent: $("consent").checked};
    var local = R.checkSubmit(data, today, []);
    if (local) return showErr(local);
    showErr(""); $("send").disabled = true; $("send").textContent = "送っています…";
    api("submit", data).then(function (r) {
      if (!r.ok) return showErr(r.error);
      showQuota(r.quota);
      $("form").hidden = true; $("done").hidden = false; $("done").innerHTML = "";
      var a = el("button", "btn wide", demo ? "下書きを確認する" : "確認の画面へ"); a.type = "button"; a.onclick = function () { tab("check"); };
      var n = el("button", "btn line wide", "もう1件入れる"); n.type = "button"; n.onclick = reset;
      $("done").append(el("div", "tick", "✓"), el("h2", "", "受け付けました"), el("p", "", "受付番号 " + r.id + "。" + (demo ? "見本なので、すぐ下書きができました。本番では、" : "") + R.DRAFT_DAYS + "営業日以内に下書きを作り、メールでお知らせします。"), a, n);
      scrollTo({top: 0, behavior: "instant"});
    }).catch(function () { showErr(NET); }).finally(function () { $("send").disabled = false; $("send").textContent = "この内容で下書きを頼む"; });
  };
  function reset() { $("form").reset(); photos = []; drawThumbs(); showErr(""); $("count").textContent = "0 / 1000"; $("form").hidden = false; $("done").hidden = true; setWhen(); scrollTo({top: 0, behavior: "instant"}); }

  // ---- 確認: 実際の投稿に近い形で見せる
  var STATE = {"受付": "下書きを作っています", "直し依頼": "直しています", "承認済み": "✓ 確認済み", "下書きあり": "確認をお願いします"};
  var I = {
    heart: '<path d="M12 20.5s-8-5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 9.5c0 6-8 11-8 11z"/>',
    talk: '<path d="M20.5 12a8.5 8.5 0 01-12.6 7.4L3.5 20.5l1.1-4.4A8.5 8.5 0 1120.5 12z"/>',
    send: '<path d="M21 3L10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z"/>',
    save: '<path d="M6 3h12v18l-6-5-6 5z"/>',
    home: '<path d="M3.5 11L12 3.5l8.5 7.5V20.5h-6v-6h-5v6h-6z"/>',
    find: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',
    plus: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M12 8v8M8 12h8"/>',
    reel: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M10 9l5 3-5 3z"/>',
  };
  function icon(n) { var s = el("span", "ig-i"); s.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + I[n] + "</svg>"; return s; }
  function captionTo(box, text) {
    String(text).split(/(#[^\s#]+)/).forEach(function (part) { box.append(/^#/.test(part) ? el("span", "tag", part) : document.createTextNode(part)); });
  }
  function dateText(when) { var d = R.parseYmd(when); return d ? (d.getMonth() + 1) + "月" + d.getDate() + "日" : ""; }
  var imgs = {};
  function loadImage(id, at, im) {
    var key = id + ":" + at;
    (imgs[key] = imgs[key] || api("image", {id: id, version: at})).then(function (r) { if (r.ok) im.src = r.image; else { delete imgs[key]; im.alt = r.error; } }).catch(function () { delete imgs[key]; im.alt = NET; });
  }
  function phone(v, when, id, at) {
    var p = el("div", "ig"); p.setAttribute("aria-label", "投稿の見え方");
    var bar = el("div", "ig-bar"); bar.append(el("span", "ig-back", "‹"), el("b", "", "投稿"), el("span", "ig-sp"));
    var hd = el("div", "ig-hd"), av = el("span", "ig-av"), name = el("b", "", HANDLE); av.append(el("i", "", "五")); hd.append(av, name, el("span", "ig-dots", "•••"));
    var im = new Image(); im.alt = "投稿の画像"; im.className = "ig-img";
    if (v.image) im.src = v.image; else loadImage(id, at, im);
    var acts = el("div", "ig-acts"); acts.append(icon("heart"), icon("talk"), icon("send"), el("span", "ig-sp"), icon("save"));
    var cap = el("p", "ig-cap"); cap.append(el("b", "", HANDLE + " ")); captionTo(cap, v.caption);
    var date = el("p", "ig-date", dateText(when));
    var nav = el("div", "ig-nav"); ["home", "find", "plus", "reel"].forEach(function (n) { nav.append(icon(n)); }); var me = el("span", "ig-av sm"); me.append(el("i", "", "五")); nav.append(me);
    p.append(bar, hd, im, acts, cap, date, nav);
    return p;
  }
  function loadList() {
    var list = $("list"); list.textContent = "読み込み中…";
    api("list").then(function (r) {
      if (!r.ok) { list.textContent = r.error; return; }
      showQuota(r.quota); list.innerHTML = "";
      var wait = r.items.filter(function (x) { return x.state === "下書きあり"; }).length;
      $("badge").textContent = wait; $("badge").hidden = !wait;
      if (!r.items.length) { list.append(el("p", "lead", "まだありません。")); return; }
      r.items.forEach(function (x) { list.append(card(x)); });
    }).catch(function () { list.textContent = NET; });
  }
  function card(x) {
    var c = el("article", "card"), vs = x.versions || [];
    var top = el("div", "card-top"); top.append(el("span", "st" + (x.state === "承認済み" ? " ok" : x.state === "下書きあり" ? " wait" : ""), STATE[x.state] || x.state), el("span", "hint", "公開希望 " + x.when.replace(/-/g, "/")));
    c.append(top);
    if (!vs.length) { c.append(el("p", "memo", x.message)); return c; }
    var at = viewing[x.id]; if (at == null || at >= vs.length) at = vs.length - 1;
    if (x.state === "承認済み" && x.approvedVersion != null) at = x.approvedVersion;
    var draw = function () { viewing[x.id] = at; var old = c.querySelector(".card-body"); if (old) old.remove(); c.append(body()); };
    function body() {
      var b = el("div", "card-body"), v = vs[at];
      if (vs.length > 1 && x.state === "下書きあり") {
        var sw = el("div", "vers"), prev = el("button", "vbtn", "‹ 前の案に戻る"), next = el("button", "vbtn", "次の案 ›");
        prev.type = next.type = "button"; prev.disabled = at === 0; next.disabled = at === vs.length - 1;
        prev.onclick = function () { at--; draw(); }; next.onclick = function () { at++; draw(); };
        sw.append(prev, el("b", "vnow", (at + 1) + "案目 / " + vs.length + "案"), next); b.append(sw);
        b.append(el("p", "hint center", "案を切り替えても、まだ決定されません。"));
        if (v.note) b.append(el("p", "was", "この案で頼んだ直し：" + v.note));
      }
      b.append(phone(v, x.when, x.id, at));
      if (x.state === "下書きあり") {
        b.append(el("p", "hint center", "✓を押しても、すぐには公開されません。公開希望日に合わせて投稿します。"));
        var ok = el("button", "btn wide big", "✓ この案で公開をお願いする"); ok.type = "button";
        ok.onclick = function () { if (confirm((at + 1) + "案目の内容で公開をお願いします。よろしいですか？")) act("approve", {id: x.id, version: at}); };
        b.append(ok);
        var left = R.MAX_REVISIONS - (+x.revisions || 0);
        if (left > 0) {
          var re = el("button", "btn line wide", "直してほしい（あと" + left + "回）"); re.type = "button";
          re.onclick = function () { re.hidden = true; ok.hidden = true; b.append(reviseForm(x, at, function () { re.hidden = false; ok.hidden = false; })); };
          b.append(re);
        } else b.append(el("p", "hint center", "作り直しは" + R.MAX_REVISIONS + "回まで済みました。ご不安な点があれば、メールでお気軽にご相談ください。"));
      }
      return b;
    }
    c.append(body());
    return c;
  }
  function reviseForm(x, at, cancel) {
    var w = el("div", "revise"), l = el("label", "", "直してほしい所"), t = el("textarea"), s = el("button", "btn wide", "この内容で頼む"), n = el("button", "btn line wide", "やめる"), id = "note-" + x.id;
    l.htmlFor = id; t.id = id; t.rows = 3; t.maxLength = 500; t.placeholder = "例：文章をもっと短く。写真を明るく。";
    s.type = n.type = "button";
    s.onclick = function () { delete viewing[x.id]; act("revise", {id: x.id, note: t.value, version: at}); };
    n.onclick = function () { w.remove(); cancel(); };
    w.append(l, t, s, n); return w;
  }
  function act(action, data) {
    api(action, data).then(function (r) { if (!r.ok) alert(r.error); loadList(); }).catch(function () { alert(NET); });
  }

  // ---- 始める
  function setWhen() { var s = R.ymd(R.earliest(today)); $("when").min = s; $("when").value = ""; $("whenHelp").textContent = s.replace(/-/g, "/") + " 以降を選べます（" + R.LEAD_DAYS + "営業日あと）。"; }
  $("after").textContent = "受け付けたあと、" + R.DRAFT_DAYS + "営業日以内に下書きを作り、メールでお知らせします。";
  setWhen();
  function refreshBadge() { api("list").then(function (r) { if (r.ok) { var w = r.items.filter(function (x) { return x.state === "下書きあり"; }).length; $("badge").textContent = w; $("badge").hidden = !w; } }); }
  function start() {
    $("login").hidden = true; $("app").hidden = false;
    api("status").then(function (r) { if (r.ok) showQuota(r.quota); });
    refreshBadge();
    if (location.hash === "#check") tab("check");
  }
  if (demo) { $("demoBand").hidden = false; start(); return; }
  $("login").hidden = false;
  $("loginForm").onsubmit = function (e) {
    e.preventDefault(); pass = $("pass").value; $("loginErr").hidden = true;
    api("status").then(function (r) {
      if (!r.ok) { $("loginErr").textContent = r.error; $("loginErr").hidden = false; pass = ""; return; }
      $("pass").value = ""; start();
    }).catch(function () { $("loginErr").textContent = NET; $("loginErr").hidden = false; });
  };
})();
