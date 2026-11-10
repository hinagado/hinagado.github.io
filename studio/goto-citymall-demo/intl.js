// 海外の方向けのページ：日本語を大きく見せる窓（店員・運転手に見せる）と、お店の一覧の絞り込み（?k=souv などで開いたときも）
(function () {
  const dlg = document.getElementById("showbox");
  if (dlg) {
    document.addEventListener("click", e => {
      const b = e.target.closest(".showja"); if (!b) return;
      dlg.querySelector(".sb-ja").textContent = b.dataset.ja; dlg.querySelector(".sb-sub").textContent = b.dataset.sub || "";
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
    const n = shops.filter(s => !s.hidden).length, cnt = document.getElementById("icount"), clr = document.getElementById("iclear"), sb = document.getElementById("souvback");
    if (cnt) cnt.textContent = cnt.dataset.tpl.replace("{n}", n);
    if (clr) clr.hidden = k === "all" && !words.length;
    if (sb) sb.hidden = k !== "souv";
    if (none) none.hidden = shops.some(s => !s.hidden);
    document.querySelectorAll("#list .grp").forEach(g => { const n = g.querySelectorAll(".shop:not([hidden])").length; g.hidden = !n; const sm = g.querySelector("h2 small"); if (sm) sm.textContent = n; });
  };
  btns.forEach(b => b.addEventListener("click", () => set(b.dataset.k)));
  if (q) q.addEventListener("input", () => set(cur));
  const clr = document.getElementById("iclear"); if (clr) clr.addEventListener("click", () => { if (q) q.value = ""; set("all"); });
  let k = "all";
  try { k = new URLSearchParams(location.search).get("k") || "all"; } catch (e) { /* 何もしない */ }
  if (!btns.some(b => b.dataset.k === k)) k = "all";
  set(k);
  // 館内図の階の切り替え（fmap.js）で高さが変わるので、読み込みが終わってから一覧の見出しへ
  const go = () => { const h = document.querySelector("#list h2"); if (h) scrollTo({top: h.getBoundingClientRect().top + scrollY - 70, behavior: "instant"}); };
  if (k !== "all") { if (document.readyState === "complete") requestAnimationFrame(go); else addEventListener("load", () => requestAnimationFrame(go), {once: true}); }
})();
