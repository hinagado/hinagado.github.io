// お店の検索。HTML に入っている一覧を出し入れするだけ（作り直さないので入力中も操作位置が失われない）
(function () {
  const cards = [...document.querySelectorAll(".shop")], groups = [...document.querySelectorAll(".grp")];
  const input = document.getElementById("q"), count = document.getElementById("count"), empty = document.getElementById("empty");
  const bar = document.getElementById("bar"), list = document.getElementById("list"), clear = document.getElementById("clear");
  const tabBtns = [...document.querySelectorAll("#tabs button")];
  const kindBtns = [...document.querySelectorAll("#kinds button")], ownBtn = document.querySelector("#owns [data-own]");
  const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  const norm = s => toHira(s.normalize("NFKC").toLowerCase().replace(/子供/g, "子ども")).replace(/[-‐ー]/g, "");
  // 2026-11-25 第三者評価「レストラン・夕食で0件」：探す言葉の言い換え（どれかに当たれば出す）
  const ALT = {}; [[["レストラン", "ごはん", "ご飯", "食事", "夕食", "夕飯", "晩ごはん", "ディナー", "食堂", "グルメ"], ["飲食"]], [["お菓子", "おかし", "スイーツ"], ["菓子", "ケーキ", "スイーツ"]]].forEach(([ks, vs]) => ks.forEach(k => { ALT[norm(k)] = [norm(k), ...vs.map(norm)]; }));
  const floorWord = t => t.replace(/([123])\s*階/g, "$1F").replace(/([123])\s*かい/g, "$1F");
  const index = cards.map(c => norm(c.dataset.s));
  const u = new URLSearchParams(location.search);
  const state = {
    q: u.get("q") || "",
    // 上のタブは階（その階の全部のお店）。モール直営は「しぼる」の中の選び方（前の形のアドレス ?tab= も読む）
    floor: tabBtns.some(b => b.dataset.tab === (u.get("floor") || u.get("tab"))) ? (u.get("floor") || u.get("tab")) : "all",
    kind: kindBtns.some(b => b.dataset.kind === u.get("kind")) ? u.get("kind") : "すべて",
    own: u.get("own") === "1" || u.get("tab") === "own",
    open: u.get("open") === "1",
  };
  const openBtn = document.getElementById("openbtn");
  const isOpen = c => { const b = c.querySelector(".now"); return !!b && !b.hidden && (b.dataset.state === "open" || b.dataset.state === "openIrr"); };
  input.value = state.q;
  const foldMq = matchMedia("(max-width:720px)"), FOLD_N = 3;
  function fold(g, on) {
    const cs = [...g.querySelectorAll(".shop")];
    cs.forEach((c, i) => c.classList.toggle("fold", on && i >= FOLD_N));
    let b = g.querySelector(".more-shops");
    const rest = cs.length - FOLD_N;
    if (on && rest > 0) {
      if (!b) {
        b = document.createElement("button"); b.type = "button"; b.className = "more-shops";
        b.addEventListener("click", () => { g.dataset.opened = "1"; fold(g, false); const nx = cs[FOLD_N]; if (nx) nx.querySelector("a, summary")?.focus({preventScroll: true}); });
        g.append(b);
      }
      b.textContent = "残り" + rest + "店を見る"; b.hidden = false;
    } else if (b) b.hidden = true;
  }
  // 館内図などから、たたんだお店へ飛ぶときは開いてから見せる（11/25 館内図の札は図の下に案内を出すので対象外。巻き込まれて図から飛んでいた）
  const unfoldTo = id => { const c = document.getElementById(id); if (c && c.classList.contains("fold")) { const g = c.closest(".grp"); g.dataset.opened = "1"; fold(g, false); c.scrollIntoView({block: "start"}); } };
  addEventListener("hashchange", () => { const m = location.hash.match(/^#(shop-s\d+)$/); if (m) unfoldTo(m[1]); });
  document.addEventListener("click", e => { const a = e.target.closest && e.target.closest('a[href^="#shop-"]'); if (a && !a.closest("#fm")) setTimeout(() => unfoldTo(a.getAttribute("href").slice(1)), 0); });
  foldMq.addEventListener && foldMq.addEventListener("change", () => draw(false));
  function draw(save) {
    const words = norm(floorWord(state.q)).split(/\s+/).filter(Boolean);
    let n = 0, all = 0; // n はお店の数（コインランドリー・ATM＝data-nc は数えない）、all は出ている札の数
    cards.forEach((c, i) => {
      const ok = (!state.own || c.dataset.tab === "own") && (!state.open || isOpen(c))
        && (state.kind === "すべて" || c.dataset.k === state.kind)
        && (state.floor === "all" || c.dataset.f === state.floor)
        && words.every(w => (ALT[w] || [w]).some(x => index[i].includes(x)));
      c.hidden = !ok; if (ok) { all++; if (!c.dataset.nc) n++; }
    });
    const filtered = !!(state.q || state.own || state.open || state.kind !== "すべて" || state.floor !== "all");
    groups.forEach(g => {
      const shown = g.querySelectorAll(".shop:not([hidden])").length, shownN = g.querySelectorAll(".shop:not([hidden]):not([data-nc])").length;
      fold(g, !filtered && foldMq.matches && !g.dataset.opened);
      g.hidden = shown === 0;
      g.querySelector("small").textContent = shownN ? shownN + "店" : "";
    });
    count.textContent = n ? n + "店" : all + "件";
    empty.hidden = all > 0;
    const emp = empty.querySelector("p");
    if (emp) { if (!emp.dataset.def) emp.dataset.def = emp.textContent; emp.textContent = n === 0 && state.open ? "いま営業中のお店はありません（開店前か、本日の営業が終わった時間です）。通常は10:00〜20:00、つばき屋・ダイソーは9:00から開いています。" : emp.dataset.def; }
    // 見つからない時の案内と「すべてのお店を見る」が、下の固定メニューの裏に隠れないように（出た時に1回だけ、必要な分だけ送る）
    if (n === 0 && !draw.wasEmpty && save) empty.scrollIntoView({block: "nearest", behavior: "instant"});
    draw.wasEmpty = n === 0;
    clear.hidden = !state.q && state.kind === "すべて" && state.floor === "all" && !state.own && !state.open;
    bar.classList.toggle("filtered", !clear.hidden); // しぼっている間は、貼り付いた検索欄を縮めない（「解除」と選んだ条件を見せる）
    tabBtns.forEach(b => b.setAttribute("aria-pressed", b.dataset.tab === state.floor));
    kindBtns.forEach(b => b.setAttribute("aria-pressed", b.dataset.kind === state.kind));
    if (ownBtn) ownBtn.setAttribute("aria-pressed", state.own);
    if (openBtn) openBtn.setAttribute("aria-pressed", state.open);
    if (save) {
      list.classList.add("live"); // しぼった後だけ、出てくるカードを少し動かす（開いた直後は動かさない）
      const p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      if (state.kind !== "すべて") p.set("kind", state.kind);
      if (state.floor !== "all") p.set("floor", state.floor);
      if (state.own) p.set("own", "1");
      if (state.open) p.set("open", "1");
      const qs = p.toString();
      try { history.replaceState(null, "", qs ? "?" + qs : location.pathname); } catch (e) { /* file:// では保存しない */ }
    }
  }
  // しぼった結果の先頭が、追従する検索欄の裏に隠れないようにする
  function toResult() {
    if (list.getBoundingClientRect().top < bar.getBoundingClientRect().bottom) list.scrollIntoView({block: "start", behavior: "instant"});
  }
  input.addEventListener("input", () => { state.q = input.value; draw(true); });
  document.getElementById("sform").addEventListener("submit", e => { e.preventDefault(); state.q = input.value; draw(true); input.blur(); toResult(); });
  tabBtns.forEach(b => b.addEventListener("click", () => { state.floor = b.dataset.tab; draw(true); toResult(); }));
  kindBtns.forEach(b => b.addEventListener("click", () => { state.kind = b.dataset.kind; draw(true); toResult(); }));
  if (ownBtn) ownBtn.addEventListener("click", () => { state.own = !state.own; draw(true); toResult(); });
  if (openBtn) openBtn.addEventListener("click", () => { state.open = !state.open; draw(true); toResult(); });
  const resetAll = () => { state.q = ""; state.own = false; state.open = false; state.kind = "すべて"; state.floor = "all"; input.value = ""; draw(true); toResult(); };
  document.getElementById("reset").addEventListener("click", resetAll);
  clear.addEventListener("click", resetAll);
  // スマホ：下へ動かして検索欄が上に貼り付いたら、1段（検索だけ）に縮める。「しぼる」を押すと階と種類が出る
  const ft = document.getElementById("ftoggle"), tabs = document.getElementById("tabs"), hd = document.querySelector("header");
  if (ft && tabs && hd) {
    const mq = matchMedia("(max-width:720px)");
    const setOpen = o => { bar.classList.toggle("open", o); ft.setAttribute("aria-expanded", o); };
    const onScroll = () => {
      const stuck = mq.matches && tabs.getBoundingClientRect().bottom < hd.getBoundingClientRect().bottom;
      if (stuck === bar.classList.contains("stuck")) return;
      bar.classList.toggle("stuck", stuck); ft.hidden = !stuck;
      if (!stuck) setOpen(false);
    };
    ft.addEventListener("click", () => setOpen(!bar.classList.contains("open")));
    addEventListener("scroll", onScroll, {passive: true}); addEventListener("resize", onScroll);
    onScroll();
  }
  draw(false);
  { const m = location.hash.match(/^#(shop-s\d+)$/); if (m) unfoldTo(m[1]); }
  if (state.open) addEventListener("load", () => draw(false)); // 営業中の印は opennow.js が後で付けるので、読み込みのあとにもう一度しぼる
})();
