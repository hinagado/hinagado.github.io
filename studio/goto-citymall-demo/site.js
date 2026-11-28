// スマホのメニュー、ふわっと出る動き。JavaScript がなくても中身は読める
(function () {
  const b = document.querySelector(".menu-btn"), n = document.getElementById("gnav");
  if (b && n) {
    const set = o => { n.classList.toggle("open", o); b.setAttribute("aria-expanded", o); b.setAttribute("aria-label", o ? (b.dataset.close || "メニューを閉じる") : (b.dataset.open || "メニューを開く")); };
    b.addEventListener("click", ev => { const o = !n.classList.contains("open"); set(o); if (o && ev.detail === 0) { const a = n.querySelector("a"); if (a) a.focus(); } });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && n.classList.contains("open")) { set(false); b.focus(); } });
    document.addEventListener("click", e => { if (n.classList.contains("open") && !n.contains(e.target) && !b.contains(e.target)) set(false); });
    n.addEventListener("click", e => { if (e.target.tagName === "A") set(false); });
    // 2026-11-23 引き出しの中の「×」（右上の三本線は引き出しの下に隠れるため）
    const x = document.createElement("button"); x.type = "button"; x.className = "nav-x";
    x.setAttribute("aria-label", b.dataset.close || "メニューを閉じる");
    x.addEventListener("click", () => { set(false); b.focus(); }); n.prepend(x);
    // 2026-11-24 代表「言葉えらびはサイドメニューへ」：上の帯の言語を、引き出しの下にも並べる（スマホでは上の帯を隠す）
    const lb = document.querySelector(".langbar");
    if (lb && !n.querySelector(".nav-lang")) {
      const box = document.createElement("div"); box.className = "nav-lang"; box.setAttribute("role", "group"); box.setAttribute("aria-label", lb.getAttribute("aria-label") || "言語 / Language");
      lb.querySelectorAll("a").forEach(a => box.append(a.cloneNode(true)));
      n.append(box); document.documentElement.classList.add("langin");
      // 2026-11-26 操作性監査「日本語が読めない人は、文字のない三本線の奥の一番下まで辿り着けない」：
      // スマホの上の帯に、いつも見える「Language」ボタン。押すと引き出しを開き、言葉えらびを先頭に出す
      const lg = document.createElement("button"); lg.type = "button"; lg.className = "hd-lang";
      lg.setAttribute("aria-controls", "gnav"); lg.setAttribute("aria-label", "言語 / Language / 語言 / 언어"); lg.setAttribute("aria-expanded", "false");
      // 引き出しがどの閉じ方で閉じても、ボタンの状態と「言葉を先頭に」をそろえる
      new MutationObserver(() => { const o = n.classList.contains("open"); const v = String(o && n.classList.contains("lang-first")); if (lg.getAttribute("aria-expanded") !== v) lg.setAttribute("aria-expanded", v); if (!o && n.classList.contains("lang-first")) n.classList.remove("lang-first"); }) /* 付いていない印を外すだけでも知らせが出て無限に回るので、付いている時だけ外す */.observe(n, {attributes: true, attributeFilter: ["class"]});
      lg.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/></svg><span>Language</span>';
      lg.addEventListener("click", ev => { ev.stopPropagation(); n.classList.add("lang-first"); set(true); const a = box.querySelector("a"); if (a) a.focus({preventScroll: true}); n.scrollTop = 0; });
      b.addEventListener("click", () => n.classList.remove("lang-first"));
      b.before(lg);
    }
  }
  // 2026-11-16 区切りを透明から出す動きはやめた（背の高い区切りが、画面に5%入らず出ないままになっていた）。中身は最初から見せる
  // 催事に「開催中」「まもなく」（7日以内）の印
  // ?now=2026-12-08T12:00 で日付を変えて確かめられる（試験用。お店の営業中の表示と同じ書き方）
  let nowQ = null; try { nowQ = new URLSearchParams(location.search).get("now"); } catch (e) { /* 何もしない */ }
  const today = nowQ && !isNaN(new Date(nowQ).getTime()) ? new Date(nowQ) : new Date(); today.setHours(0, 0, 0, 0);
  document.querySelectorAll("[data-start][data-end]").forEach(li => {
    const st = new Date(li.dataset.start + "T00:00:00"), en = new Date(li.dataset.end + "T23:59:59");
    const lang = document.documentElement.lang;
    const W = {ja: ["開催中", "まもなく"], en: ["Now on", "Coming soon"], "zh-Hant": ["舉辦中", "即將開始"], ko: ["진행 중", "곧 시작"]}[lang] || ["開催中", "まもなく"];
    let w = null;
    if (st <= today && today <= en) w = [W[0], "now"]; else if (st > today && (st - today) / 864e5 <= 7) w = [W[1], "soon"];
    if (w) { const b = document.createElement("span"); b.className = "evtag " + w[1]; b.textContent = w[0]; li.prepend(b); }
    if (en < today && li.classList.contains("ev")) li.hidden = true; // 終わった催事は「これからのイベント」に出さない（2026-11-22）
  });
  // 2026-11-26 トップを短く：これからのイベントは先頭から data-top-n 件（終わった催しを隠したあとで数える）。残りは「予定をすべて見る」
  document.querySelectorAll("[data-top-n]").forEach(sec => { const n = +sec.dataset.topN || 2; let k = 0; sec.querySelectorAll(".ev[data-start]").forEach(li => { if (li.hidden) return; if (li.querySelector(".evtag.now")) { li.hidden = true; li.dataset.topCut = "now"; return; } k++; if (k > n) { li.hidden = true; li.dataset.topCut = "1"; } }); });
  // 2026-11-25 第三者評価「終わった催しが『次のイベント』のまま」：今日の日付で、開催中か次の催しを選び直す
  document.querySelectorAll("[data-evs]").forEach(a => {
    let evs = []; try { evs = JSON.parse(a.dataset.evs); } catch (e) { return; }
    if (!Array.isArray(evs)) return;
    const okDay = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
    evs = evs.filter(x => Array.isArray(x) && x.length >= 6 && okDay(x[0]) && okDay(x[1]) && x[0] <= x[1]);
    // 施設のある日本の日付（海外から見ても同じ催しを出す）。?now= の時はその日
    let jd = ""; try { jd = new Intl.DateTimeFormat("sv-SE", {timeZone: "Asia/Tokyo"}).format(nowQ ? today : new Date()); } catch (e) { jd = ""; }
    if (!okDay(jd)) jd = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    const byStart = (p, q) => p[0] < q[0] ? -1 : p[0] > q[0] ? 1 : 0;
    const pick = evs.filter(x => x[0] <= jd && jd <= x[1]).sort(byStart)[0] || evs.filter(x => x[0] > jd).sort(byStart)[0];
    const b = a.querySelector("[data-evlabel]");
    if (!pick || !b) { if (!pick) a.hidden = true; return; }
    b.dataset.start = pick[0]; b.dataset.end = pick[1];
    const set = (sel, v) => { const x = a.querySelector(sel); if (x) x.textContent = v; };
    set(".evn-when", pick[2]); set(".evn-what", pick[3] + "「" + pick[4] + "」"); set(".evn-sub", pick[5]);
  });
  // トップの「次のイベント」が開催中なら言い方を替える（2026-11-23）
  document.querySelectorAll("[data-evlabel]").forEach(b => {
    const st = new Date(b.dataset.start + "T00:00:00"), en = new Date(b.dataset.end + "T23:59:59");
    if (st <= today && today <= en) b.textContent = document.documentElement.lang === "ja" ? "開催中のイベント" : b.textContent;
  });
  // 2026-11-26 操作性監査「最初の画面に『きょう・いま』が無い。12/31・1/1 でも同じ表示」：
  // トップの帯の先頭に「きょう 11/25（水） いま営業中」。年末年始（お知らせの表と同じ時間）はその日の時間に替える
  const hs = document.documentElement.lang === "ja" && document.querySelector(".hello .hstrip");
  if (hs) {
    let ymd = "", hm = 0;
    try {
      // 試験用の ?now=2026-12-31T14:00 は、端末の時刻帯によらず「日本の時計」として読む
      const d = nowQ && String(nowQ).match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{1,2}):(\d{2}))?/);
      if (d) { ymd = d[1]; hm = d[2] ? +d[2] * 60 + +d[3] : 12 * 60; }
      else {
        const p = {}; new Intl.DateTimeFormat("en-CA", {timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"}).formatToParts(new Date()).forEach(x => { p[x.type] = x.value; });
        ymd = p.year + "-" + p.month + "-" + p.day; hm = (+p.hour % 24) * 60 + +p.minute;
      }
    } catch (e) { ymd = ""; }
    if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
      const md = ymd.slice(5), SP = {"12-31": [9, 19], "01-01": [11, 19], "01-02": [10, 19], "01-03": [10, 19]};
      const [o, c] = SP[md] || [10, 20], early = !SP[md]; // ふだんは つばき屋・ダイソーが9:00から
      const wd = "日月火水木金土"[new Date(ymd + "T12:00:00").getDay()];
      const st = hm < (early ? 9 : o) * 60 ? "before" : hm < o * 60 ? "early" : hm < c * 60 ? "open" : "closed";
      const T = {before: `開店前・${o}:00から`, early: `まもなく開店・${o}:00から`, open: `いま営業中・${c}:00まで`, closed: "本日の営業は終了"}[st];
      const sp = document.createElement("span"); sp.className = "hs-today " + st;
      const lab = document.createElement("b"); lab.textContent = "きょう " + (+md.slice(0, 2)) + "/" + (+md.slice(3)) + "（" + wd + "）";
      const v = document.createElement("em"); v.textContent = T;
      sp.append(lab, v);
      if (SP[md]) { const a = document.createElement("a"); a.href = "news.html#nenmatsu"; a.textContent = `年末年始の時間 ${o}:00〜${c}:00`; sp.append(a); }
      else if (st === "early") { const s2 = document.createElement("small"); s2.textContent = "つばき屋・ダイソーは開いています"; sp.append(s2); }
      hs.prepend(sp);
    }
  }
  // 「公開したときの見え方」：見本の説明（.prov）・例（.tag.ex のある物）・制作の説明を隠す。見本なので保存は端末の中だけ
  const pv = document.querySelector(".pubview");
  const setPub = on => { document.documentElement.classList.toggle("public", on); if (pv) pv.setAttribute("aria-pressed", on); try { sessionStorage.setItem("pubview", on ? "1" : ""); } catch (e) { /* 何もしない */ } };
  let pub = false;
  try { pub = new URLSearchParams(location.search).get("view") === "public" || sessionStorage.getItem("pubview") === "1"; } catch (e) { /* 何もしない */ }
  if (pv) setPub(pub); // 2026-11-28 見直し：切り替えのボタンがある見本のページだけ。公開版（ボタン無し・最初から public）では触らない
  if (pv) pv.addEventListener("click", () => setPub(!document.documentElement.classList.contains("public")));
})();

// 下の固定メニューの「今ここ」：同じページの中の場所（#fm・#ev）を開いているときは、そちらに印を移す
(function () {
  const tb = [...document.querySelectorAll(".tabbar a")];
  if (!tb.length) return;
  const file = p => p.split("/").pop() || "index.html";
  const mark = () => {
    const same = tb.filter(a => file(new URL(a.href, location.href).pathname) === file(location.pathname));
    const hash = a => new URL(a.href, location.href).hash;
    const best = same.find(a => hash(a) && location.hash.indexOf(hash(a)) === 0) || same.find(a => !hash(a)) || null;
    tb.forEach(a => { if (a === best) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  };
  mark();
  addEventListener("hashchange", mark);
})();

// 開いた欄の下の「閉じる」：閉じて、見出しが画面に入るように戻す
document.addEventListener("click", ev => {
  const b = ev.target.closest && ev.target.closest(".dclose");
  if (!b) return;
  const d = b.closest("details");
  if (!d) return;
  d.open = false;
  const s = d.querySelector("summary");
  if (s && s.getBoundingClientRect().top < 80) s.scrollIntoView({block: "center"});
  if (s) s.focus({preventScroll: true});
});

// ---- 動き（2026-11-16）。<html class="anim"> が付いている時だけ（「視差効果を減らす」の端末では付かない）。
// 中身は最初から HTML にあり、最初から見えている。動きは見えている物に後から足すだけ
(function () {
  if (!document.documentElement.classList.contains("anim")) return;
  // 最初の写真：7秒ごとに、ゆっくり寄りながら次の写真へ。3枚を2周したら1枚目で自動で止まる。右下のボタンでも止められる
  // 写真が1枚だけのとき（2026-11-23 から外観1枚）：ボタンで、ゆっくり寄る動きを止める・動かす
  const one = document.querySelector(".hello-ph:not([data-slides])"), b1 = one && one.querySelector(".kbpause");
  if (one && b1) b1.addEventListener("click", () => { const p = !one.classList.contains("paused"); one.classList.toggle("paused", p); b1.setAttribute("aria-pressed", p); b1.setAttribute("aria-label", p ? b1.dataset.play : b1.dataset.pause); });
  const ph = document.querySelector(".hello-ph[data-slides]"), btn = ph && ph.querySelector(".kbpause");
  if (ph && btn) {
    const first = ph.querySelector("img.kb"), all = [first];
    let cur = 0, timer = null, paused = false, turns = 0;
    const play = () => { if (!timer) timer = setInterval(go, 7000); };
    const stop = () => { clearInterval(timer); timer = null; };
    const set = p => { paused = p; if (!p) turns = 0; ph.classList.toggle("paused", p); btn.setAttribute("aria-pressed", p); btn.setAttribute("aria-label", p ? btn.dataset.play : btn.dataset.pause); if (p) stop(); else play(); };
    function go() {
      const imgs = all.filter(Boolean);
      if (imgs.length < 2) return;
      const a = imgs[cur % imgs.length], nx = (cur + 1) % imgs.length, b = imgs[nx];
      b.classList.remove("kbgo"); void b.offsetWidth; b.classList.add("on", "kbgo");
      a.classList.remove("on");
      setTimeout(() => { if (!a.classList.contains("on")) a.classList.remove("kbgo"); }, 1400);
      cur = nx; turns++;
      if (nx === 0 && turns >= imgs.length * 2) set(true); // 2周したら1枚目で止める
    }
    btn.addEventListener("click", () => set(!paused));
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else if (!paused) play(); });
    // 2枚目・3枚目は、1枚目が出てから読み込む。読み込みが済んだ写真だけを足す（空の絵は見せない）
    const more = () => ph.dataset.slides.split(",").forEach((src, n) => {
      const im = new Image();
      im.onload = () => { im.alt = ""; im.className = "kb"; im.setAttribute("aria-hidden", "true"); ph.insertBefore(im, btn); all[n + 1] = im; };
      im.src = src;
    });
    if (first.complete && first.naturalWidth) more(); else first.addEventListener("load", more, {once: true});
    play();
  }
  // トップだけ：下のほうのカードが、画面に入った時に12px上がる（最初から見えている。開いた直後の画面に入っている物には使わない）
  if (document.body.classList.contains("page-index") && "IntersectionObserver" in window) {
    const items = [];
    document.querySelectorAll(".forwho,.evs,.facs,.picks,.floors-in").forEach(g => [...g.children].forEach((el, i) => {
      if (el.getBoundingClientRect().top <= innerHeight) return;
      el.classList.add("rv"); el.style.setProperty("--d", Math.min(i, 2) * 0.06 + "s"); items.push(el);
    }));
    const show = el => el.classList.add("rv-in");
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), {rootMargin: "0px 0px -6% 0px"});
    items.forEach(el => io.observe(el));
    // 保険：画面に入っているのに1.5秒たっても上がっていない物は、強制的に上げる
    setInterval(() => items.forEach(el => {
      if (el.classList.contains("rv-in")) return;
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) { el._seen = el._seen || Date.now(); if (Date.now() - el._seen > 1500) show(el); }
    }), 500);
  }
  // お店：「営業中」の点の脈は、画面に入った最初の3枚だけ（2回で止まる）
  if ("IntersectionObserver" in window && document.querySelector(".shop .now")) {
    addEventListener("load", () => setTimeout(() => {
      let n = 0;
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting && n < 3) { n++; e.target.classList.add("beat"); io.unobserve(e.target); }
        if (n >= 3) io.disconnect();
      }), {threshold: 1});
      document.querySelectorAll(".shop:not([hidden]) .now.open").forEach(b => io.observe(b));
    }, 300));
  }
})();

// 2026-11-28 デザイン審査「スマホは上の帯・検索欄・下のメニューが同時に残り、見る場所が狭い」：
// 720px以下では、下へ動かしている間は上の帯を隠し、上へ戻すとすぐ出す（メニューや写真の窓を開いている間は隠さない）
(function () {
  var mq = window.matchMedia("(max-width:720px)"), root = document.documentElement, last = window.scrollY || 0;
  function onScroll() {
    var y = window.scrollY || 0, d = y - last;
    var busy = root.classList.contains("lb-open") || document.querySelector("#gnav.open") || (document.activeElement && document.activeElement.closest && document.activeElement.closest("header"));
    if (!mq.matches || busy || y < 120) root.classList.remove("hdr-up");
    else if (d > 8) root.classList.add("hdr-up");
    else if (d < -8) root.classList.remove("hdr-up");
    if (Math.abs(d) > 8 || y < 120) last = y;
  }
  window.addEventListener("scroll", onScroll, {passive: true});
  mq.addEventListener ? mq.addEventListener("change", onScroll) : 0;
})();
