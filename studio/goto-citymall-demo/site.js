// スマホのメニュー、ふわっと出る動き。JavaScript がなくても中身は読める
(function () {
  const b = document.querySelector(".menu-btn"), n = document.getElementById("gnav");
  if (b && n) {
    const set = o => { n.classList.toggle("open", o); b.setAttribute("aria-expanded", o); b.setAttribute("aria-label", o ? (b.dataset.close || "メニューを閉じる") : (b.dataset.open || "メニューを開く")); };
    b.addEventListener("click", () => { const o = !n.classList.contains("open"); set(o); if (o) { const a = n.querySelector("a"); if (a) a.focus(); } });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && n.classList.contains("open")) { set(false); b.focus(); } });
    document.addEventListener("click", e => { if (n.classList.contains("open") && !n.contains(e.target) && !b.contains(e.target)) set(false); });
    n.addEventListener("click", e => { if (e.target.tagName === "A") set(false); });
  }
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } }), {threshold: .05});
    document.querySelectorAll("main section").forEach(s => { s.classList.add("fade"); io.observe(s); });
  }
  // 催事に「開催中」「まもなく」（7日以内）の印
  const today = new Date(); today.setHours(0, 0, 0, 0);
  document.querySelectorAll("[data-start][data-end]").forEach(li => {
    const st = new Date(li.dataset.start + "T00:00:00"), en = new Date(li.dataset.end + "T23:59:59");
    const lang = document.documentElement.lang;
    const W = {ja: ["開催中", "まもなく"], en: ["Now on", "Coming soon"], "zh-Hant": ["舉辦中", "即將開始"], ko: ["진행 중", "곧 시작"]}[lang] || ["開催中", "まもなく"];
    let w = null;
    if (st <= today && today <= en) w = [W[0], "now"]; else if (st > today && (st - today) / 864e5 <= 7) w = [W[1], "soon"];
    if (w) { const b = document.createElement("span"); b.className = "evtag " + w[1]; b.textContent = w[0]; li.prepend(b); }
  });
  // 「公開したときの見え方」：見本の説明（.prov）・例（.tag.ex のある物）・制作の説明を隠す。見本なので保存は端末の中だけ
  const pv = document.querySelector(".pubview");
  const setPub = on => { document.documentElement.classList.toggle("public", on); if (pv) pv.setAttribute("aria-pressed", on); try { sessionStorage.setItem("pubview", on ? "1" : ""); } catch (e) { /* 何もしない */ } };
  let pub = false;
  try { pub = new URLSearchParams(location.search).get("view") === "public" || sessionStorage.getItem("pubview") === "1"; } catch (e) { /* 何もしない */ }
  setPub(pub);
  if (pv) pv.addEventListener("click", () => setPub(!document.documentElement.classList.contains("public")));
})();
