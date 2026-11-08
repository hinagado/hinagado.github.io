// スマホのメニュー、ふわっと出る動き。JavaScript がなくても中身は読める
(function () {
  const b = document.querySelector(".menu-btn"), n = document.getElementById("gnav");
  if (b && n) {
    const set = o => { n.classList.toggle("open", o); b.setAttribute("aria-expanded", o); b.setAttribute("aria-label", o ? "メニューを閉じる" : "メニューを開く"); };
    b.addEventListener("click", () => { const o = !n.classList.contains("open"); set(o); if (o) { const a = n.querySelector("a"); if (a) a.focus(); } });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && n.classList.contains("open")) { set(false); b.focus(); } });
    document.addEventListener("click", e => { if (n.classList.contains("open") && !n.contains(e.target) && !b.contains(e.target)) set(false); });
    n.addEventListener("click", e => { if (e.target.tagName === "A") set(false); });
  }
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } }), {threshold: .05});
    document.querySelectorAll("main section").forEach(s => { s.classList.add("fade"); io.observe(s); });
  }
})();
