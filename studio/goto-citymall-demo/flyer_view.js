// JSON の flyers を、ホームページ内の data-flyers の箱へ安全に表示する。
(function () {
  'use strict';
  const flBox = document.querySelector('[data-flyers]');
  if (!flBox) return;
  const flSection = flBox.closest('section') || flBox;
  const flParams = new URLSearchParams(location.search);
  // 2026-11-28 見直し：?demo=1 は見本のページ（見本の帯がある）でだけ効く。公開版では効かない
  const flDemo = !!document.querySelector('.demo-band') && (flParams.get('demo') === '1' || document.body.dataset.flyersDemo === '1' || flBox.dataset.demo === '1'); // 見本のページでは箱に data-demo="1"（公開するときに外す）
  const flSource = document.body.dataset.postsSrc;
  const FL_SLOTS = 8; // 2026-11-23 打合せ：ホームページに載るチラシは8枠まで
  // 日本時間の今日（YYYY-MM-DD）。載せ終わりが今日より前のチラシは出さない（期日が終わったら自動で消える）。試験用に ?today=2026-12-01
  const flToday = (/^\d{4}-\d{2}-\d{2}$/.test(flParams.get('today') || '') ? flParams.get('today') : new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10));

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
    return /^https:\/\/drive\.google\.com\/thumbnail\?id=[-\w]{20,}&sz=w1200(?:&resourcekey=[-\w]{1,500})?$/.test(String(flUrl || ''));
  }

  function flDriveOpen(flUrl) {
    return /^https:\/\/drive\.google\.com\/file\/d\/[-\w]{20,}\/view(?:\?resourcekey=[-\w]{1,500})?$/.test(String(flUrl || ''));
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

  // 2026-11-24 お試し：見本の送る画面から送り、運営の表（見本）で「載せる」にしたチラシ（このスマホの中だけ・見本のページだけ）
  function flTryItems() {
    let flList = [];
    try { flList = JSON.parse(localStorage.getItem('gcm-flyer-try') || '[]'); } catch (flError) { flList = []; }
    if (!Array.isArray(flList)) return [];
    return flList.filter(function (flItem) { return flItem && flItem.status === '載せる' && String(flItem.start) <= flToday && String(flItem.end) >= flToday; })
      .sort(function (flA, flB) { return String(flB.start).localeCompare(String(flA.start)); })
      .map(function (flItem) { return {shop: flItem.shop, title: flItem.title, start: flItem.start, end: flItem.end, kind: flItem.kind, img: flItem.img, open: flItem.open, img2: flItem.img2, open2: flItem.open2, try: true}; });
  }

  function flDemoItems() {
    if (flBox.dataset.demo === '1') return flTryItems().concat([
      // 2026-11-24 チラシの箱の見本1号（表＝チラシ、裏＝予約申込書）。届いた写真は加工してから使う
      {shop: 'ボンパティ', title: 'クリスマスケーキ ご予約承り中', start: '2026-11-24', end: '2026-12-10', kind: 'image', img: 'img/flyer/bonpati_xmas_1_s.webp', open: 'img/flyer/bonpati_xmas_1.webp'} /* 11/25 先方の依頼で裏面は外した。11/27 代表：本番として扱う（見本の文字を外した） */,
      // 2026-11-22 吉田様経由でお店から届いたチラシ（元は PDF。img/flyer/）。1つの投稿に2枚（表・裏）載せる形の見本にした
      {shop: '家具プラス ツーピース', title: '秋のリビング・ダイニングフェア／快眠ベッドフェア', start: '2026-11-01', end: '2026-11-30', kind: 'image', img: 'img/flyer/twopiece_1_s.webp', open: 'img/flyer/twopiece_1.webp', img2: 'img/flyer/twopiece_2_s.webp', open2: 'img/flyer/twopiece_2.webp'},
      {shop: '家具プラス ツーピース', title: 'LAST BARGAIN（ラストバーゲン）', start: '2026-12-01', end: '2026-12-31', kind: 'image', img: 'img/flyer/twopiece12_1_s.webp', open: 'img/flyer/twopiece12_1.webp', img2: 'img/flyer/twopiece12_2_s.webp', open2: 'img/flyer/twopiece12_2.webp'} /* 11/27 吉田様：12月分に差し替え・12月1日から（新聞折込は11月30日） */,
      {shop: '未来ごとう', title: 'シティモールにデイサービスがあります（見学歓迎）', always: '見学・資料請求はいつでも', kind: 'image', img: 'img/flyer/mirai_1_s.webp', open: 'img/flyer/mirai_1.webp'}
    ]);
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
    const flTry = flDemo && flItem.try === true && flBox.dataset.demo === '1'; // お試しのチラシ（このスマホの中の画像）
    const flTryImg = function (flValue) { return /^data:image\/(jpeg|svg\+xml)[;,]/.test(String(flValue || '')); };
    const flImageOk = flTry ? flTryImg(flItem.img) : flDemo ? /^(data:image\/svg\+xml|img\/flyer\/[a-z0-9_]+\.(svg|webp)$)/.test(String(flItem.img || '')) : flDriveImage(flItem.img);
    const flOpenOk = flTry ? flTryImg(flItem.open) : flDemo ? /^(#flyer-demo-[12]|img\/flyer\/[a-z0-9_]+\.(svg|webp))$/.test(String(flItem.open || '')) : flDriveOpen(flItem.open);
    const flAlways = String(flItem.always || '').trim();
    if (!flShop || !flTitle || (!(flStart && flEnd) && !flAlways) || !flImageOk || !flOpenOk) return null;
    if (flItem.end && String(flItem.end) < flToday) return null; // 期日が終わったチラシは出さない
    if (flItem.start && String(flItem.start) > flToday) return null; // 11/27 載せ始めの日より前は出さない（本番の箱と同じ。ツーピース12月分は12月1日から）
    const flHas2 = !!(flItem.img2 || flItem.open2);
    const fl2Ok = !flHas2 || (flTry ? flTryImg(flItem.img2) && flTryImg(flItem.open2) : flDemo ? /^img\/flyer\/[a-z0-9_]+\.(svg|webp)$/.test(String(flItem.img2 || '')) && /^img\/flyer\/[a-z0-9_]+\.(svg|webp)$/.test(String(flItem.open2 || '')) : flDriveImage(flItem.img2) && flDriveOpen(flItem.open2));
    if (!fl2Ok) return null;

    const flArticle = flElement('article', 'flyer-card');
    const flImage = flElement('img', 'flyer-image');
    flImage.src = String(flItem.img);
    flImage.loading = 'lazy';
    flImage.alt = flShop + 'のチラシ：' + flTitle;
    // 2026-11-28 見直し：絵が読めなかったチラシは、壊れた絵の印を出さずに外す（全部外れたら欄ごと隠す）
    flImage.addEventListener('error', function () { flArticle.remove(); if (!flBox.querySelector('.flyer-card')) flSection.hidden = true; });
    const flText = flElement('div', 'flyer-text');
    flText.append(flElement('p', 'flyer-shop', flShop), flElement('h3', 'flyer-title', flTitle),
      flElement('p', 'flyer-period', flStart && flEnd ? flStart + '〜' + flEnd : flAlways));
    const flGroup = 'flyer-' + (flCard.n = (flCard.n || 0) + 1); // 表と裏を、拡大表示で続けて見られるように同じ組に
    const flLink = flElement('a', 'flyer-open', flHas2 ? '表を大きく見る' : '大きく見る');
    flLink.href = String(flItem.open);
    flLink.dataset.lb = flGroup;
    if (!flDemo) flLink.dataset.lbimg = String(flItem.img); // 2026-11-28 見直し：拡大の窓には絵の住所を渡す（open は Drive の閲覧ページで、絵として読めない）
    flLink.dataset.cap = flShop + '：' + flTitle + (flHas2 ? '（表）' : '');
    flText.appendChild(flLink);
    // 2026-11-25 第三者評価「チラシの絵を押しても開かない」：絵を押しても「大きく見る」と同じに開く（キーボードではボタンの方を使う）
    flImage.classList.add('flyer-zoomable');
    flImage.addEventListener('click', function () { flLink.click(); });
    if (flHas2) {
      const flBack = flElement('a', 'flyer-open flyer-back', '裏面を見る');
      flBack.href = String(flItem.open2);
      flBack.dataset.lb = flGroup;
      if (!flDemo) flBack.dataset.lbimg = String(flItem.img2);
      flBack.dataset.cap = flShop + '：' + flTitle + '（裏）';
      flText.appendChild(flBack);
      flArticle.classList.add('has-back');
      const flTag = flElement('span', 'flyer-pages', '表・裏');
      flText.prepend(flTag);
    }
    flArticle.append(flImage, flText);
    return flArticle;
  }

  function flRender(flItems) {
    const flCards = Array.isArray(flItems) ? flItems.map(flCard).filter(Boolean).slice(0, FL_SLOTS) : [];
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
