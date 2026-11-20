// JSON の flyers を、ホームページ内の data-flyers の箱へ安全に表示する。
(function () {
  'use strict';
  const flBox = document.querySelector('[data-flyers]');
  if (!flBox) return;
  const flSection = flBox.closest('section') || flBox;
  const flParams = new URLSearchParams(location.search);
  const flDemo = flParams.get('demo') === '1' || document.body.dataset.flyersDemo === '1';
  const flSource = document.body.dataset.postsSrc;

  function flElement(flTag, flClass, flText) {
    const flNode = document.createElement(flTag);
    if (flClass) flNode.className = flClass;
    if (flText != null) flNode.textContent = flText;
    return flNode;
  }

  function flJapaneseDay(flValue) {
    const flMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(flValue || ''));
    return flMatch ? Number(flMatch[2]) + '月' + Number(flMatch[3]) + '日' : '';
  }

  function flDriveImage(flUrl) {
    return /^https:\/\/drive\.google\.com\/thumbnail\?id=[-\w]{20,}&sz=w1200$/.test(String(flUrl || ''));
  }

  function flDriveOpen(flUrl) {
    return /^https:\/\/drive\.google\.com\/file\/d\/[-\w]{20,}\/view$/.test(String(flUrl || ''));
  }

  function flDemoSvg(flColor, flShop, flLine) {
    const flSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050">' +
      '<rect width="800" height="1050" fill="' + flColor + '"/><rect x="45" y="45" width="710" height="960" rx="24" fill="white"/>' +
      '<text x="400" y="250" text-anchor="middle" font-size="62" font-family="sans-serif" font-weight="700" fill="#174f35">' + flShop + '</text>' +
      '<text x="400" y="480" text-anchor="middle" font-size="80" font-family="sans-serif" font-weight="700" fill="#b7352c">' + flLine + '</text>' +
      '<circle cx="400" cy="700" r="135" fill="' + flColor + '"/><text x="400" y="725" text-anchor="middle" font-size="54" font-family="sans-serif" fill="#202124">見本</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(flSvg);
  }

  function flDemoItems() {
    return [
      {shop: 'つばき屋', title: '冬のありがとうセール', start: '2026-12-05', end: '2026-12-20', kind: 'image',
        img: flDemoSvg('#ffe08a', 'つばき屋', '冬のセール'), open: '#flyer-demo-1'},
      {shop: 'BLOSSOM', title: 'クリスマスフェア', start: '2026-12-10', end: '2026-12-25', kind: 'pdf',
        img: flDemoSvg('#cdebd9', 'BLOSSOM', 'フェア開催'), open: '#flyer-demo-2'}
    ];
  }

  function flCard(flItem) {
    if (!flItem || typeof flItem !== 'object') return null;
    const flShop = String(flItem.shop || '').trim();
    const flTitle = String(flItem.title || '').trim();
    const flStart = flJapaneseDay(flItem.start);
    const flEnd = flJapaneseDay(flItem.end);
    const flImageOk = flDemo ? /^data:image\/svg\+xml/.test(String(flItem.img || '')) : flDriveImage(flItem.img);
    const flOpenOk = flDemo ? /^#flyer-demo-[12]$/.test(String(flItem.open || '')) : flDriveOpen(flItem.open);
    if (!flShop || !flTitle || !flStart || !flEnd || !flImageOk || !flOpenOk) return null;

    const flArticle = flElement('article', 'flyer-card');
    const flImage = flElement('img', 'flyer-image');
    flImage.src = String(flItem.img);
    flImage.loading = 'lazy';
    flImage.alt = flShop + 'のチラシ：' + flTitle;
    const flText = flElement('div', 'flyer-text');
    flText.append(flElement('p', 'flyer-shop', flShop), flElement('h3', 'flyer-title', flTitle),
      flElement('p', 'flyer-period', flStart + '〜' + flEnd));
    const flLink = flElement('a', 'flyer-open', '大きく見る');
    flLink.href = String(flItem.open);
    flLink.target = '_blank';
    flLink.rel = 'noopener noreferrer';
    flText.appendChild(flLink);
    flArticle.append(flImage, flText);
    return flArticle;
  }

  function flRender(flItems) {
    const flCards = Array.isArray(flItems) ? flItems.map(flCard).filter(Boolean) : [];
    if (!flCards.length) { flSection.hidden = true; return; }
    flBox.replaceChildren.apply(flBox, flCards);
    flSection.hidden = false;
  }

  flSection.hidden = true;
  if (flDemo) { flRender(flDemoItems()); return; }
  if (!flSource || !window.fetch) return;
  fetch(flSource, {credentials: 'omit'})
    .then(function (flResponse) { return flResponse.ok ? flResponse.json() : null; })
    .then(function (flData) { flRender(flData && flData.ok === true ? flData.flyers : []); })
    .catch(function () { flSection.hidden = true; });
})();
