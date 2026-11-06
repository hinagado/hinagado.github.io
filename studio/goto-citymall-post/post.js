// 投稿の箱の画面。本番は Apps Script、見本（?demo=1 か送信先が未設定）は画面の中だけで動く
(function () {
  var ENDPOINT = "";
  var $ = function (id) { return document.getElementById(id); };
  var demo = !ENDPOINT || new URLSearchParams(location.search).get("demo") === "1";
  var pass = "", photos = [], R = PostRules, today = new Date();

  // ---- 通信
  var Demo = {
    rows: [{id: "例-1", shop: "BLOSSOM", kind: "お店の紹介", message: "（例）1階のレストラン・カフェを紹介したい", when: R.ymd(R.earliest(today)), state: "下書きあり", revisions: 0, title: "BLOSSOM", caption: "1階のレストラン・カフェ BLOSSOM。\nお買い物のあとに、ひと息つきませんか。\n\n営業時間 11:00〜21:00\n#五島シティモール #福江島", image: "sample_blossom.jpg"}],
    call: function (action, b) {
      var rows = this.rows, find = function (id) { return rows.filter(function (r) { return r.id === id; })[0]; }, quota = function () { var k = R.monthKey(R.ymd(today)); return {month: k, used: R.used(rows, k), limit: R.LIMIT}; }, bad;
      if (action === "status") return {ok: true, quota: quota()};
      if (action === "list") return {ok: true, items: rows.slice().reverse(), quota: quota()};
      if (action === "submit") {
        bad = R.checkSubmit(b, today, rows); if (bad) return {ok: false, error: bad};
        var id = "例-" + (rows.length + 1);
        // 見本だけの仮の下書き。本番は、こちらで写真を整えて文章を作ってからお見せする
        rows.push({id: id, shop: b.shop, kind: b.kind, message: b.message, when: b.when, state: "下書きあり", revisions: 0, title: b.shop || b.kind, caption: b.message + "\n\n#五島シティモール #福江島", image: b.photos[0]});
        return {ok: true, id: id, quota: quota()};
      }
      var r = find(b.id);
      if (action === "approve") { bad = R.checkApprove(r); if (bad) return {ok: false, error: bad}; r.state = "承認済み"; return {ok: true}; }
      if (action === "revise") { bad = R.checkRevise(r, b.note); if (bad) return {ok: false, error: bad}; r.state = "下書きあり"; r.revisions = 1; r.note = b.note; return {ok: true, demoRedo: true}; }
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
    var t = document.createElement("span"); t.textContent = m + "月は、あと "; var b = document.createElement("b"); b.textContent = left; var u = document.createElement("span"); u.textContent = " 本入れられます（" + q.limit + "本のうち）";
    $("quota").append(t, b, u);
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
      var w = document.createElement("div"), im = new Image(), x = document.createElement("button");
      im.src = p; im.alt = "選んだ写真 " + (i + 1); x.type = "button"; x.textContent = "外す"; x.setAttribute("aria-label", "写真" + (i + 1) + "を外す");
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
    var data = {photos: photos, kind: $("kind").value, shop: $("shop").value.trim(), message: $("message").value.trim(), when: $("when").value, consent: $("consent").checked};
    var local = R.checkSubmit(data, today, []);
    if (local) return showErr(local);
    showErr(""); $("send").disabled = true; $("send").textContent = "送っています…";
    api("submit", data).then(function (r) {
      if (!r.ok) return showErr(r.error);
      showQuota(r.quota);
      $("form").hidden = true; $("done").hidden = false; $("done").innerHTML = "";
      var h = document.createElement("h2"); h.textContent = "受け付けました";
      var p = document.createElement("p"); p.textContent = "受付番号 " + r.id + "。" + (demo ? "見本なので、すぐ下書きができました。本番では、" + R.DRAFT_DAYS + "営業日以内に下書きを作り、メールでお知らせします。" : R.DRAFT_DAYS + "営業日以内に下書きを作り、メールでお知らせします。");
      var a = document.createElement("button"); a.className = "btn wide"; a.type = "button"; a.textContent = demo ? "下書きを確認する" : "確認の画面へ"; a.onclick = function () { tab("check"); };
      var n = document.createElement("button"); n.className = "btn line wide"; n.type = "button"; n.textContent = "もう1件入れる"; n.onclick = reset;
      $("done").append(h, p, a, n);
    }).catch(function () { showErr(NET); }).finally(function () { $("send").disabled = false; $("send").textContent = "箱に入れる"; });
  };
  function reset() { $("form").reset(); photos = []; drawThumbs(); showErr(""); $("form").hidden = false; $("done").hidden = true; setWhen(); scrollTo({top: 0, behavior: "instant"}); }

  // ---- 確認
  var STATE = {"受付": "下書きを作っています", "直し依頼": "直しています", "承認済み": "✓ 確認済み", "下書きあり": "確認をお願いします"};
  function loadList() {
    var list = $("list"); list.textContent = "読み込み中…";
    api("list").then(function (r) {
      if (!r.ok) { list.textContent = r.error; return; }
      showQuota(r.quota); list.innerHTML = "";
      var wait = r.items.filter(function (x) { return x.state === "下書きあり"; }).length;
      $("badge").textContent = wait; $("badge").hidden = !wait;
      if (!r.items.length) { list.textContent = "まだありません。"; return; }
      r.items.forEach(function (x) { list.append(card(x)); });
    }).catch(function () { list.textContent = NET; });
  }
  function card(x) {
    var c = document.createElement("article"); c.className = "card";
    var top = document.createElement("div"); top.className = "st" + (x.state === "承認済み" ? " ok" : x.state === "下書きあり" ? " wait" : ""); top.textContent = STATE[x.state] || x.state; c.append(top);
    if (x.image) { var im = new Image(); im.src = x.image; im.alt = "投稿の下書きの画像"; c.append(im); }
    var meta = document.createElement("p"); meta.className = "h"; meta.textContent = "公開希望 " + x.when.replace(/-/g, "/") + "　" + x.kind + (x.shop ? "　" + x.shop : ""); c.append(meta);
    if (x.caption) { var cap = document.createElement("p"); cap.className = "cap"; cap.textContent = x.caption; c.append(cap); }
    else { var msg = document.createElement("p"); msg.className = "cap"; msg.textContent = x.message; c.append(msg); }
    if (x.state === "下書きあり") {
      var ok = document.createElement("button"); ok.className = "btn wide"; ok.type = "button"; ok.textContent = "✓ これで投稿する";
      ok.onclick = function () { if (!confirm("この内容で投稿を進めます。よろしいですか？")) return; act("approve", {id: x.id}); };
      c.append(ok);
      if (!x.revisions) {
        var re = document.createElement("button"); re.className = "btn line wide"; re.type = "button"; re.textContent = "直してほしい（1回まで）";
        re.onclick = function () { re.hidden = true; ok.hidden = true; c.append(reviseForm(x, function () { re.hidden = false; ok.hidden = false; })); };
        c.append(re);
      } else { var nt = document.createElement("p"); nt.className = "h"; nt.textContent = "作り直しは済みました。ご不安な点があれば、メールでお気軽にご相談ください。"; c.append(nt); }
    }
    return c;
  }
  function reviseForm(x, cancel) {
    var w = document.createElement("div"), l = document.createElement("label"), t = document.createElement("textarea"), s = document.createElement("button"), n = document.createElement("button"), id = "note-" + x.id;
    w.className = "f"; l.textContent = "直してほしい所"; l.htmlFor = id; t.id = id; t.rows = 3; t.maxLength = 500;
    s.className = "btn wide"; s.type = "button"; s.textContent = "この内容で頼む"; n.className = "btn line wide"; n.type = "button"; n.textContent = "やめる";
    s.onclick = function () { act("revise", {id: x.id, note: t.value}); };
    n.onclick = function () { w.remove(); cancel(); };
    w.append(l, t, s, n); return w;
  }
  function act(action, data) {
    api(action, data).then(function (r) { if (!r.ok) alert(r.error); loadList(); }).catch(function () { alert(NET); });
  }

  // ---- 始める
  function setWhen() { var d = R.earliest(today), s = R.ymd(d); $("when").min = s; $("when").value = ""; $("whenHelp").textContent = s.replace(/-/g, "/") + " 以降を選べます（" + R.LEAD_DAYS + "営業日あと）。"; }
  $("after").textContent = "受け付けたあと、" + R.DRAFT_DAYS + "営業日以内に下書きを作り、メールでお知らせします。";
  R.KINDS.forEach(function (k) { var o = document.createElement("option"); o.textContent = k; $("kind").append(o); });
  setWhen();
  function start() {
    $("login").hidden = true; $("app").hidden = false;
    api("status").then(function (r) { if (r.ok) showQuota(r.quota); });
    api("list").then(function (r) { if (r.ok) { var w = r.items.filter(function (x) { return x.state === "下書きあり"; }).length; $("badge").textContent = w; $("badge").hidden = !w; } });
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
