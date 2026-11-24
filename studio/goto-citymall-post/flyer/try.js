// 2026-11-24 お試し用（見本だけ）：見本の送る画面から送ったチラシを、このスマホの中（localStorage）にだけ保存する。
// ネットには何も送らない。運営の表の見本（admin.html）と、見本のホームページ（お店のチラシ欄）がこれを読む。
(function () {
  'use strict';
  const KEY = 'gcm-flyer-try';
  const MAX = 5;

  function shrink(url, width, quality) {
    return new Promise(function (resolve, reject) {
      const im = new Image();
      im.onload = function () {
        const s = Math.min(1, width / im.naturalWidth);
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(im.naturalWidth * s));
        c.height = Math.max(1, Math.round(im.naturalHeight * s));
        const g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
        g.drawImage(im, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      im.onerror = function () { reject(new Error('画像を読み取れませんでした。')); };
      im.src = url;
    });
  }

  function pdfMark(title) {
    const t = String(title).replace(/[<>&"]/g, '');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050"><rect width="800" height="1050" fill="#eef4ef"/>' +
      '<rect x="45" y="45" width="710" height="960" rx="24" fill="#fff"/><text x="400" y="420" text-anchor="middle" font-size="120" font-family="sans-serif" font-weight="700" fill="#b7352c">PDF</text>' +
      '<text x="400" y="560" text-anchor="middle" font-size="44" font-family="sans-serif" fill="#174f35">' + t.slice(0, 14) + '</text>' +
      '<text x="400" y="680" text-anchor="middle" font-size="34" font-family="sans-serif" fill="#555">（本番では1ページ目が出ます）</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function load() {
    try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  }

  function save(list) {
    for (;;) {
      try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) {
        if (list.length <= 1) return false;
        list.shift(); // 入りきらない時は古い物から外す
      }
    }
  }

  window.flTryStore = async function (o, shop) {
    const pdf = o.mime === 'application/pdf';
    const url = 'data:' + o.mime + ';base64,' + o.data;
    const item = {id: Date.now(), shop: shop || '見本のお店A', title: o.title, start: o.start, end: o.end,
      received: new Date().toISOString(), kind: pdf ? 'pdf' : 'image', status: '', memo: ''};
    if (pdf) { item.img = item.open = pdfMark(o.title); } else { item.img = await shrink(url, 480, 0.8); item.open = await shrink(url, 1100, 0.82); }
    if (o.data2) {
      const url2 = 'data:' + o.mime2 + ';base64,' + o.data2;
      item.img2 = await shrink(url2, 480, 0.8); item.open2 = await shrink(url2, 1100, 0.82);
    }
    const list = load();
    list.push(item);
    while (list.length > MAX) list.shift();
    save(list);
  };

  // 「受け付けました」の下に、次の手順（運営の表の見本）へのボタンを出す
  document.addEventListener('DOMContentLoaded', function () {
    const done = document.getElementById('fl-done');
    if (!done) return;
    const p = document.createElement('p');
    p.className = 'try-next';
    p.innerHTML = '<b>お試しの続き：</b>運営のご担当者の画面（見本）で、届いたチラシを確かめて「載せる」を選んでみてください。';
    const a = document.createElement('a');
    a.href = 'admin.html'; a.className = 'try-btn'; a.textContent = '運営の表（見本）を開く →';
    done.append(p, a);
    const st = document.createElement('style');
    st.textContent = '.try-next{margin:16px 0 8px;font-size:16px;line-height:1.7}.try-btn{display:flex;align-items:center;justify-content:center;min-height:52px;border-radius:12px;background:#1b6b4a;color:#fff;font-weight:700;text-decoration:none;font-size:17px}';
    document.head.append(st);
  });
})();
