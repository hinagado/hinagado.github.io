document.documentElement.classList.add('js');
// メニューの開閉
const btn = document.querySelector('.menu-btn');
const nav = document.querySelector('.gnav');
if (btn && nav) {
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? '閉じる' : 'メニュー';
  });
}

// 見えたらふわっと出す
const items = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add('in'));
}

// 年の表示
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

// 商品一覧の検索（カナ・ひらがな、全角・半角、大文字・小文字をそろえてから、空白で区切ったことばを全部ふくむ商品だけ出す）
(function () {
  const q = document.getElementById('item-q');
  if (!q) return;
  const cards = Array.from(document.querySelectorAll('.item-card[data-search]'));
  const secs = Array.from(document.querySelectorAll('.item-cat'));
  const chips = document.querySelector('.cat-chips');
  const count = document.getElementById('item-q-count');
  const none = document.getElementById('item-q-none');
  const norm = (s) => s.normalize('NFKC').toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
  cards.forEach((c) => { c._s = norm(c.dataset.search); });
  q.addEventListener('input', () => {
    const words = norm(q.value).split(/\s+/).filter(Boolean);
    let n = 0;
    cards.forEach((c) => {
      const hit = words.every((w) => c._s.includes(w));
      c.hidden = !hit;
      if (hit) { n++; c.classList.add('in'); }
    });
    secs.forEach((s) => { s.hidden = !s.querySelector('.item-card:not([hidden])'); });
    if (chips) chips.hidden = words.length > 0;
    count.textContent = !words.length ? '' : n ? n + ' 点あります' : '見つかりませんでした';  // 0件も読み上げる
    none.hidden = !(words.length && n === 0);
  });
})();

// 商品ページの動画: 画面に入ったら音なしで再生、出たら止める。「動きを減らす」設定の人には自動で再生しない
(function () {
  const vids = document.querySelectorAll('video[data-autoplay]');
  if (!vids.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { const p = e.target.play(); if (p && p.catch) p.catch(() => {}); } else e.target.pause();
  }), { threshold: 0.5 });
  vids.forEach((v) => io.observe(v));
})();
