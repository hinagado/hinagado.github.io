// お店の検索。HTML に入っている一覧を出し入れするだけ（作り直さないので入力中も操作位置が失われない）
(function () {
  const cards = [...document.querySelectorAll(".shop")], groups = [...document.querySelectorAll(".grp")];
  const input = document.getElementById("q"), count = document.getElementById("count"), empty = document.getElementById("empty");
  const bar = document.getElementById("bar"), list = document.getElementById("list"), clear = document.getElementById("clear");
  const kindBtns = [...document.querySelectorAll("#kinds button")], floorBtns = [...document.querySelectorAll("#floors button")];
  const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  const norm = s => toHira(s.normalize("NFKC").toLowerCase()).replace(/[-‐ー]/g, "");
  const floorWord = t => t.replace(/([12])\s*階/g, "$1F").replace(/([12])\s*かい/g, "$1F");
  const index = cards.map(c => norm(c.dataset.s));
  const u = new URLSearchParams(location.search);
  const state = {
    q: u.get("q") || "",
    kind: kindBtns.some(b => b.dataset.kind === u.get("kind")) ? u.get("kind") : "すべて",
    floor: floorBtns.some(b => b.dataset.floor === u.get("floor")) ? u.get("floor") : "all",
  };
  input.value = state.q;
  function draw(save) {
    const words = norm(floorWord(state.q)).split(/\s+/).filter(Boolean);
    let n = 0;
    cards.forEach((c, i) => {
      const ok = (state.kind === "すべて" || c.dataset.k === state.kind)
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
    clear.hidden = !state.q && state.kind === "すべて" && state.floor === "all";
    kindBtns.forEach(b => b.setAttribute("aria-pressed", b.dataset.kind === state.kind));
    floorBtns.forEach(b => b.setAttribute("aria-pressed", b.dataset.floor === state.floor));
    if (save) {
      const p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      if (state.kind !== "すべて") p.set("kind", state.kind);
      if (state.floor !== "all") p.set("floor", state.floor);
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
  kindBtns.forEach(b => b.addEventListener("click", () => { state.kind = b.dataset.kind; draw(true); toResult(); }));
  floorBtns.forEach(b => b.addEventListener("click", () => { state.floor = b.dataset.floor; draw(true); toResult(); }));
  const resetAll = () => { state.q = ""; state.kind = "すべて"; state.floor = "all"; input.value = ""; draw(true); toResult(); };
  document.getElementById("reset").addEventListener("click", resetAll);
  clear.addEventListener("click", resetAll);
  draw(false);
})();
