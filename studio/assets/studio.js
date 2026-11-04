/* ひなが堂 制作室の小さな動き（外への通信なし）。
   - .rv … 画面に入ったら、ふわっと現れる（最初から見えている物と、動きを減らす設定の方には何もしない）
   - .stg … ご依頼の流れの段階に、画面に入ったら印を付ける
   - [data-vid] … 動画は、見えている間だけ音なしで再生。止めるボタンを出す。動きを減らす設定の方には自動で再生しない
   JS が動かなくても、全部の中身は見え、動画は再生の操作で見られる。 */
(function () {
  var d = document;
  var rm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var io = 'IntersectionObserver' in window;
  d.documentElement.classList.add('js');

  function each(sel, fn) { Array.prototype.forEach.call(d.querySelectorAll(sel), fn); }

  // 画面に入ったら現れる
  if (!rm && io) {
    var vh = window.innerHeight || 800;
    var ob = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('rv-on'); ob.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    each('.rv', function (el) {
      if (el.getBoundingClientRect().top < vh * 0.94) { el.classList.add('rv-on'); return; }
      el.classList.add('rv-wait');
      ob.observe(el);
    });
    var ob2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('stg-on'); ob2.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -30% 0px' });
    each('.stg', function (el) { el.classList.add('stg-wait'); ob2.observe(el); });
  }

  // 動画
  each('[data-vid]', function (w) {
    var v = w.querySelector('video');
    var b = w.querySelector('.vid-btn');
    if (!v || !b) return;
    var userPaused = false; // 利用者が「止める」を押したら、次に見えても勝手には動かさない
    v.removeAttribute('controls');
    b.hidden = false;
    function label() {
      b.textContent = v.paused ? '▶ 再生する' : '❚❚ 止める';
      b.setAttribute('aria-label', v.paused ? '動画を再生する' : '動画を止める');
    }
    function play() { var p = v.play(); if (p && p.catch) p.catch(function () { label(); }); }
    b.addEventListener('click', function () {
      if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); }
    });
    v.addEventListener('play', label);
    v.addEventListener('pause', label);
    label();
    if (!io) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) { v.pause(); return; } // 画面の外では、だれが再生しても止める
        if (!rm && !userPaused) play(); // 動きを減らす設定では、自分で押したときだけ再生
      });
    }, { threshold: 0.4 }).observe(v);
  });
})();
