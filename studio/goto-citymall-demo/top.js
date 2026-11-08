// トップページのスライド写真と、お知らせ・セール案内のタブ。JavaScript がなくても、写真は指で横に送れ、タブの中身は両方読める
(function () {
  // スライド
  const track = document.getElementById("track");
  if (track) {
    const slides = [...track.children], dots = [...document.querySelectorAll(".dot")];
    let cur = 0, timer = null, lock = 0; // lock: ボタンで動かしている間は、指で送ったときの位置読みをしない
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const go = (i, smooth = true) => {
      cur = (i + slides.length) % slides.length;
      lock = Date.now() + 800;
      track.scrollTo({left: slides[cur].offsetLeft - track.offsetLeft, behavior: smooth && !calm ? "smooth" : "instant"});
      mark();
    };
    const mark = () => dots.forEach((d, j) => j === cur ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current"));
    track.addEventListener("scroll", () => {
      if (Date.now() < lock) return;
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== cur && i >= 0 && i < slides.length) { cur = i; mark(); }
    }, {passive: true});
    document.querySelector(".arr.prev").addEventListener("click", () => { go(cur - 1); restart(); });
    document.querySelector(".arr.next").addEventListener("click", () => { go(cur + 1); restart(); });
    dots.forEach(d => d.addEventListener("click", () => { go(+d.dataset.go); restart(); }));
    track.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); restart(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); restart(); }
    });
    // 自動で切り替える（6秒ごと）。指やマウスを乗せている間・動きを減らす設定のときは止める
    const box = document.querySelector(".slidesec");
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { if (!calm && !timer && !document.hidden) timer = setInterval(() => go(cur + 1), 6000); };
    const restart = () => { stop(); start(); };
    box.addEventListener("mouseenter", stop); box.addEventListener("mouseleave", start);
    box.addEventListener("focusin", stop); box.addEventListener("focusout", start);
    box.addEventListener("touchstart", stop, {passive: true});
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
    document.documentElement.classList.add("js-slider");
    start();
  }
  // タブ
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  if (tabs.length) {
    const show = t => {
      tabs.forEach(x => {
        const on = x === t;
        x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => show(t));
      t.addEventListener("keydown", e => {
        const n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (n) { e.preventDefault(); const x = tabs[(i + n + tabs.length) % tabs.length]; show(x); x.focus(); }
      });
    });
    document.documentElement.classList.add("js-tabs");
    show(tabs[0]);
  }
})();
