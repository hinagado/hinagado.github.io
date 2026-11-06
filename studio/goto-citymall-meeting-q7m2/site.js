// 打ち合わせサイトの動き。入力はこの端末の中にだけ残し、外へは送らない
(function () {
  var KEY = "goto-citymall-meeting-v1", TOTAL = 200000;
  var $ = function (id) { return document.getElementById(id); };
  var pages = [].slice.call(document.querySelectorAll(".page")), form = $("decide"), questions = [].slice.call(form.querySelectorAll("fieldset.q"));
  var seen = {};

  // ---- 画面の切り替え
  function show(id, move) {
    if (!$(id) || !$(id).classList.contains("page")) id = "p1";
    pages.forEach(function (p) { p.hidden = p.id !== id; });
    seen[id] = true;
    document.querySelectorAll(".nav button").forEach(function (b) {
      var on = b.dataset.go === id;
      if (on) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      b.classList.toggle("seen", !!seen[b.dataset.go]);
      if (on && move && b.scrollIntoView) b.scrollIntoView({block: "nearest", inline: "center", behavior: "auto"});
    });
    if (id === "p8") renderSummary();
    if (move) {
      var top = document.querySelector(".shell").offsetTop;
      scrollTo({top: top, behavior: "auto"});
      if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    }
  }
  document.querySelectorAll("[data-go]").forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.go, true); }); });
  window.addEventListener("hashchange", function () { show(location.hash.slice(1), true); });

  // ---- 金額の内訳
  function yen(n) { return n.toLocaleString("ja-JP"); }
  function parseYen(s) {
    var t = String(s || "").replace(/[０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); }).replace(/[,，\s円]/g, "");
    if (!t) return null;
    return /^\d+$/.test(t) ? +t : NaN;
  }
  function updateSplit() {
    var n = parseYen($("design").value), ok = n === null || (n >= 0 && n <= TOTAL);
    $("splitErr").hidden = ok;
    $("coding").textContent = n !== null && ok ? yen(TOTAL - n) : "―";
    return ok && n !== null ? n : null;
  }

  // ---- 入力の保存と復元（読み書きできない端末でも画面は動く）
  function save() {
    var data = {};
    [].forEach.call(form.elements, function (e) {
      if (!e.name) return;
      if (e.type === "radio") { if (e.checked) data[e.name] = e.value; }
      else if (e.type === "checkbox") { if (e.checked) (data[e.name] = data[e.name] || []).push(e.value); }
      else if (e.value) data[e.name] = e.value;
    });
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (err) { /* 保存できなくても続ける */ }
  }
  function load() {
    var data = {};
    try { data = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (err) { data = {}; }
    [].forEach.call(form.elements, function (e) {
      if (!e.name || data[e.name] == null) return;
      if (e.type === "radio") e.checked = e.value === data[e.name];
      else if (e.type === "checkbox") e.checked = [].concat(data[e.name]).indexOf(e.value) >= 0;
      else e.value = data[e.name];
    });
  }

  // ---- 記入の数
  function isFilled(q) {
    return [].some.call(q.querySelectorAll("input"), function (e) { return e.type === "radio" || e.type === "checkbox" ? e.checked : !!e.value.trim(); });
  }
  function refresh() {
    updateSplit();
    var n = 0;
    questions.forEach(function (q) { var on = isFilled(q); q.classList.toggle("filled", on); if (on) n++; });
    $("doneCount").textContent = n; $("allCount").textContent = questions.length;
    $("navCount").textContent = n ? n + "/" + questions.length : "";
    return n;
  }

  // ---- まとめ
  function answer(q) {
    var out = [];
    if (q.querySelector("#design")) {
      var n = updateSplit();
      if (n !== null) out.push("デザイン・文章 " + yen(n) + "円／コーディング・設定・アカウント整備 " + yen(TOTAL - n) + "円（合計 " + yen(TOTAL) + "円）");
      else if ($("design").value.trim()) out.push("金額を確かめてください");
      return out;
    }
    var checks = [];
    [].forEach.call(q.querySelectorAll("input"), function (e) {
      if (e.type === "radio") { if (e.checked) out.push(e.value); }
      else if (e.type === "checkbox") { if (e.checked) checks.push(e.value); }
    });
    if (checks.length) out.push(checks.join("、"));
    [].forEach.call(q.querySelectorAll("input:not([type=radio]):not([type=checkbox])"), function (e) {
      var v = e.value.trim(); if (!v) return;
      var l = q.querySelector('label[for="' + e.id + '"]'), name = l ? l.childNodes[0].textContent.trim() : "";
      out.push(name + "：" + v);
    });
    return out;
  }
  function renderSummary() {
    var box = $("summary"); box.textContent = "";
    questions.forEach(function (q) {
      var a = answer(q), row = document.createElement("div"), t = document.createElement("b"), d = document.createElement("div");
      row.className = "sm" + (a.length ? "" : " none");
      t.textContent = q.dataset.title; d.textContent = a.length ? a.join("\n") : "未定（あとでご連絡）";
      row.append(t, d); box.append(row);
    });
  }
  function summaryText() {
    return "【お打ち合わせのまとめ】五島シティモール様／ひなが堂\n\n" + questions.map(function (q) {
      var a = answer(q);
      return "■ " + q.dataset.title + "\n" + (a.length ? a.join("\n") : "未定（あとでご連絡）");
    }).join("\n\n") + "\n";
  }

  form.addEventListener("input", function () { refresh(); save(); });
  form.addEventListener("change", function () { refresh(); save(); });
  form.addEventListener("submit", function (e) { e.preventDefault(); });

  function say(s) { $("toolStatus").textContent = s; }
  $("copyBtn").onclick = function () {
    var text = summaryText();
    var fallback = function () {
      var t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.append(t); t.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
      t.remove(); say(ok ? "コピーしました。" : "コピーできませんでした。印刷・PDFをお使いください。");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { say("コピーしました。"); }, fallback);
    else fallback();
  };
  $("printBtn").onclick = function () { renderSummary(); window.print(); };
  $("clearBtn").onclick = function () {
    if (!confirm("入力した内容をすべて消します。よろしいですか？")) return;
    form.reset();
    try { localStorage.removeItem(KEY); } catch (err) { /* 保存がなければ何もしない */ }
    refresh(); renderSummary(); say("入力を消しました。");
  };

  load(); refresh();
  show(location.hash.slice(1) || "p1", false);
})();
