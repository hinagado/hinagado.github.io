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
