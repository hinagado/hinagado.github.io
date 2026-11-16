// お店の検索。HTML に入っている一覧を出し入れするだけ（作り直さないので入力中も操作位置が失われない）
(function () {
  const cards = [...document.querySelectorAll(".shop")], groups = [...document.querySelectorAll(".grp")];
  const input = document.getElementById("q"), count = document.getElementById("count"), empty = document.getElementById("empty");
  const bar = document.getElementById("bar"), list = document.getElementById("list"), clear = document.getElementById("clear");
  const tabBtns = [...document.querySelectorAll("#tabs button")];
  const kindBtns = [...document.querySelectorAll("#kinds button")], ownBtn = document.querySelector("#owns button");
  const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  const norm = s => toHira(s.normalize("NFKC").toLowerCase()).replace(/[-‐ー]/g, "");
  const floorWord = t => t.replace(/([123])\s*階/g, "$1F").replace(/([123])\s*かい/g, "$1F");
  const index = cards.map(c => norm(c.dataset.s));
  const u = new URLSearchParams(location.search);
  const state = {
    q: u.get("q") || "",
    // 上のタブは階（その階の全部のお店）。モール直営は「しぼる」の中の選び方（前の形のアドレス ?tab= も読む）
    floor: tabBtns.some(b => b.dataset.tab === (u.get("floor") || u.get("tab"))) ? (u.get("floor") || u.get("tab")) : "all",
    kind: kindBtns.some(b => b.dataset.kind === u.get("kind")) ? u.get("kind") : "すべて",
    own: u.get("own") === "1" || u.get("tab") === "own",
  };
  input.value = state.q;
  function draw(save) {
    const words = norm(floorWord(state.q)).split(/\s+/).filter(Boolean);
    let n = 0;
    cards.forEach((c, i) => {
      const ok = (!state.own || c.dataset.tab === "own")
        && (state.kind === "すべて" || c.dataset.k === state.kind)
        && (state.floor === "all" || c.dataset.f === state.floor)
        && words.every(w => index[i].includes(w));
      c.hidden = !ok; if (ok) n++;
    });
    groups.forEach(g => {
      const shown = g.querySelectorAll(".shop:not([hidden])").length;
      g.hidden = shown === 0;
      g.querySelector("small").textContent = shown + "店";
    });
    count.textContent = n + "店";
    empty.hidden = n > 0;
    // 見つからない時の案内と「すべてのお店を見る」が、下の固定メニューの裏に隠れないように（出た時に1回だけ、必要な分だけ送る）
    if (n === 0 && !draw.wasEmpty && save) empty.scrollIntoView({block: "nearest", behavior: "instant"});
    draw.wasEmpty = n === 0;
    clear.hidden = !state.q && state.kind === "すべて" && state.floor === "all" && !state.own;
    bar.classList.toggle("filtered", !clear.hidden); // しぼっている間は、貼り付いた検索欄を縮めない（「解除」と選んだ条件を見せる）
    tabBtns.forEach(b => b.setAttribute("aria-pressed", b.dataset.tab === state.floor));
    kindBtns.forEach(b => b.setAttribute("aria-pressed", b.dataset.kind === state.kind));
    if (ownBtn) ownBtn.setAttribute("aria-pressed", state.own);
    if (save) {
      list.classList.add("live"); // しぼった後だけ、出てくるカードを少し動かす（開いた直後は動かさない）
      const p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      if (state.kind !== "すべて") p.set("kind", state.kind);
      if (state.floor !== "all") p.set("floor", state.floor);
      if (state.own) p.set("own", "1");
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
  const resetAll = () => { state.q = ""; state.own = false; state.kind = "すべて"; state.floor = "all"; input.value = ""; draw(true); toResult(); };
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
})();
