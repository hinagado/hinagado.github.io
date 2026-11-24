// 海外の方向けのページ：日本語を大きく見せる窓（店員・運転手に見せる）と、お店の一覧の絞り込み（?k=souv などで開いたときも）
(function () {
  const dlg = document.getElementById("showbox");
  if (dlg) {
    document.addEventListener("click", e => {
      const b = e.target.closest(".showja"); if (!b) return;
      dlg.querySelector(".sb-ja").textContent = b.dataset.ja; dlg.querySelector(".sb-sub").textContent = b.dataset.sub || ""; const tr = dlg.querySelector(".sb-tr"); if (tr) { tr.textContent = b.dataset.tr || ""; tr.hidden = !b.dataset.tr; }
      const m = document.getElementById("showmap"); if (m) { m.hidden = !b.dataset.map; if (b.dataset.map) m.href = b.dataset.map; }
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    });
    document.getElementById("showclose").addEventListener("click", () => { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); });
    const m = document.getElementById("showmap"); if (m) m.addEventListener("click", () => { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); });
  }
  const box = document.querySelector(".intl-filter");
  if (!box) return;
  const btns = [...box.querySelectorAll("button")], shops = [...document.querySelectorAll("#list .shop")];
  const q = document.getElementById("iq"), none = document.getElementById("inohit");
  let cur = "all";
  const set = k => {
    cur = k;
    btns.forEach(b => b.setAttribute("aria-pressed", b.dataset.k === k));
    const words = (q ? q.value : "").toLowerCase().trim().split(/\s+/).filter(Boolean);
    const ok = s => k === "all" || (k === "souv" ? s.dataset.souv === "1" : k.startsWith("f:") ? s.dataset.f === k.slice(2) : s.dataset.k === k);
    shops.forEach(s => { s.hidden = !(ok(s) && words.every(w => (s.dataset.s || "").includes(w))); });
    const n = shops.filter(s => !s.hidden && !s.dataset.nc).length, cnt = document.getElementById("icount"), clr = document.getElementById("iclear"), sb = document.getElementById("souvback");
    if (cnt) cnt.textContent = cnt.dataset.tpl.replace("{n}", n);
    if (clr) clr.hidden = k === "all" && !words.length;
    if (sb) sb.hidden = k !== "souv";
    if (none) none.hidden = shops.some(s => !s.hidden);
    document.querySelectorAll("#list .grp").forEach(g => { const n = g.querySelectorAll(".shop:not([hidden])").length, nc = g.querySelectorAll(".shop:not([hidden]):not([data-nc])").length; g.hidden = !n; const sm = g.querySelector("h2 small"); if (sm) sm.textContent = nc || ""; /* 11/25 ATM・開店前の店は数えない（日本語と同じ） */ });
    fold(k === "all" && !words.length && mq.matches);
  };
  // 2026-11-23 スマホのお店の一覧は、階ごとに3店＋「残りを見る」（日本語版と同じ）
  const list = document.getElementById("list"), mq = matchMedia("(max-width:720px)"), FOLD_N = 3;
  function fold(on) {
    document.querySelectorAll("#list .grp").forEach(g => {
      const cs = [...g.querySelectorAll(".shop")], open = on && !g.dataset.opened;
      cs.forEach((c, i) => c.classList.toggle("fold", open && i >= FOLD_N));
      let b = g.querySelector(".more-shops"); const rest = cs.length - FOLD_N;
      if (open && rest > 0) {
        if (!b) { b = document.createElement("button"); b.type = "button"; b.className = "more-shops"; b.addEventListener("click", () => { g.dataset.opened = "1"; fold(true); const nx = cs[FOLD_N]; if (nx) nx.querySelector("a, summary, button")?.focus({preventScroll: true}); }); g.append(b); }
        b.textContent = (list && list.dataset.more || "+{n}").replace("{n}", rest); b.hidden = false;
      } else if (b) b.hidden = true;
    });
  }
  const unfoldTo = id => { const c = document.getElementById(id); if (c && c.classList.contains("fold")) { const g = c.closest(".grp"); g.dataset.opened = "1"; fold(true); c.scrollIntoView({block: "start"}); } };
  addEventListener("hashchange", () => { const m = location.hash.match(/^#(shop-s\d+)$/); if (m) unfoldTo(m[1]); });
  document.addEventListener("click", e => { const a = e.target.closest && e.target.closest('a[href^="#shop-"]'); if (a && !a.closest("#fm")) setTimeout(() => unfoldTo(a.getAttribute("href").slice(1)), 0); });
  mq.addEventListener && mq.addEventListener("change", () => set(cur));
  btns.forEach(b => b.addEventListener("click", () => set(b.dataset.k)));
  if (q) q.addEventListener("input", () => set(cur));
  const clr = document.getElementById("iclear"); if (clr) clr.addEventListener("click", () => { if (q) q.value = ""; set("all"); });
  let k = "all";
  try { k = new URLSearchParams(location.search).get("k") || "all"; } catch (e) { /* 何もしない */ }
  if (!btns.some(b => b.dataset.k === k)) k = "all";
  set(k);
  { const m = location.hash.match(/^#(shop-s\d+)$/); if (m) unfoldTo(m[1]); }
  // 館内図の階の切り替え（fmap.js）で高さが変わるので、読み込みが終わってから一覧の見出しへ
  const go = () => { const h = document.querySelector("#list h2"); if (h) scrollTo({top: h.getBoundingClientRect().top + scrollY - 70, behavior: "instant"}); };
  if (k !== "all") { if (document.readyState === "complete") requestAnimationFrame(go); else addEventListener("load", () => requestAnimationFrame(go), {once: true}); }
})();
