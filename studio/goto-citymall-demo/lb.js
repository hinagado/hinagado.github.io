// チラシとメニューを、ページの中で大きく見る（2026-11-22。別の画面に飛ばない・前後へめくれる・2倍に拡大できる）
(function () {
  'use strict';
  let box, img, cap, num, prev, next, zoomBtn, sc, list = [], at = 0, back = null;
  function el(t, c, txt) { const n = document.createElement(t); if (c) n.className = c; if (txt != null) n.textContent = txt; return n; }
  function build() {
    box = el('div', 'lb'); box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', '大きく見る');
    const top = el('div', 'lb-top'); cap = el('p', 'lb-cap'); zoomBtn = el('button', 'lb-zoom', '拡大'); zoomBtn.type = 'button';
    const close = el('button', 'lb-close', '閉じる ✕'); close.type = 'button';
    top.append(cap, zoomBtn, close);
    sc = el('div', 'lb-sc'); img = el('img'); img.alt = ''; sc.append(img);
    const bot = el('div', 'lb-bot'); prev = el('button', 'lb-prev', '← 前'); next = el('button', 'lb-next', '次 →'); num = el('span', 'lb-num');
    prev.type = next.type = 'button'; bot.append(prev, num, next);
    box.append(top, sc, bot); document.body.append(box);
    close.addEventListener('click', hide);
    prev.addEventListener('click', () => show(at - 1));
    next.addEventListener('click', () => show(at + 1));
    zoomBtn.addEventListener('click', () => { const z = box.classList.toggle('zoom'); zoomBtn.textContent = z ? '縮小' : '拡大'; });
    box.addEventListener('keydown', e => {
      if (e.key === 'Escape') hide();
      else if (e.key === 'ArrowLeft') show(at - 1);
      else if (e.key === 'ArrowRight') show(at + 1);
    });
    let sx = null;
    sc.addEventListener('touchstart', e => { sx = box.classList.contains('zoom') ? null : e.touches[0].clientX; }, {passive: true});
    sc.addEventListener('touchend', e => { if (sx == null) return; const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 60) show(at + (d < 0 ? 1 : -1)); sx = null; });
  }
  function show(i) {
    if (!list.length) return;
    at = (i + list.length) % list.length;
    const a = list[at], th = a.querySelector('img') || a.closest('article, .menus')?.querySelector('img');
    img.src = a.getAttribute('href');
    img.alt = (th && th.alt) || a.dataset.cap || '';
    cap.textContent = a.dataset.cap || img.alt;
    num.textContent = list.length > 1 ? (at + 1) + ' / ' + list.length : '';
    prev.hidden = next.hidden = list.length < 2;
    box.classList.remove('zoom'); zoomBtn.textContent = '拡大'; sc.scrollTo(0, 0);
  }
  function hide() { box.hidden = true; document.documentElement.classList.remove('lb-open'); if (back) back.focus(); }
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[data-lb]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    if (!box) build();
    list = [...document.querySelectorAll('a[data-lb="' + a.dataset.lb + '"]')];
    back = a; box.hidden = false; document.documentElement.classList.add('lb-open');
    show(list.indexOf(a)); box.querySelector('.lb-close').focus();
  });
})();
