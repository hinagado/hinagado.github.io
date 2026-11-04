// ひなが堂 くらしのアプリ — 電波がなくても開けるようにする係（service worker。置き場所 /kurashi/sw.js、範囲 /kurashi/）。
// web-tools の build.py が src/kurashi/sw_template.js から作る（手で書きかえない）。
// 決まり:
//   - 扱うのは「同じサイトの GET で、/kurashi/ の中」だけ。外のサイトへの通信（閲覧数の送り先 script.google.com など）と POST には手を出さない
//     （respondWith を呼ばないので、ブラウザがふつうに送る）。
//   - はじめに、くらしのアプリのページ・manifest・アイコンを保存しておく。開くときは保存から出し、うしろで新しい物を取りに行って入れかえる。
//   - 版の番号（VERSION）は中身から作る。番号が変わったら新しく保存し直し、古い保存（hinagado-kurashi- で始まる別の版）を消す。
'use strict';
var VERSION = 'a84bb1fa0066';
var PREFIX = 'hinagado-kurashi-';
var CACHE = PREFIX + VERSION;
var PAGES = ["index.html", "yarukoto.html", "shuchu.html", "alarm.html", "gomi.html", "reizoko.html", "yosan.html", "shukan.html", "otetsudai.html", "subsc.html", "bousai.html", "kinenbi.html", "osouji.html", "otoshidama.html", "nengajo.html", "shogatsu.html", "kigen.html", "mokuhyo.html", "goshugi.html", "tokubetsu.html"];  // 必ず保存する（1つでも取れなければ、この版は入れない＝前の版のまま）
var EXTRA = ["yarukoto.webmanifest", "shuchu.webmanifest", "alarm.webmanifest", "gomi.webmanifest", "reizoko.webmanifest", "yosan.webmanifest", "shukan.webmanifest", "otetsudai.webmanifest", "subsc.webmanifest", "bousai.webmanifest", "kinenbi.webmanifest", "osouji.webmanifest", "otoshidama.webmanifest", "nengajo.webmanifest", "shogatsu.webmanifest", "kigen.webmanifest", "mokuhyo.webmanifest", "goshugi.webmanifest", "tokubetsu.webmanifest", "index.webmanifest", "icons/yarukoto-180.png", "icons/yarukoto-192.png", "icons/yarukoto-512.png", "icons/yarukoto-m512.png", "icons/shuchu-180.png", "icons/shuchu-192.png", "icons/shuchu-512.png", "icons/shuchu-m512.png", "icons/alarm-180.png", "icons/alarm-192.png", "icons/alarm-512.png", "icons/alarm-m512.png", "icons/gomi-180.png", "icons/gomi-192.png", "icons/gomi-512.png", "icons/gomi-m512.png", "icons/reizoko-180.png", "icons/reizoko-192.png", "icons/reizoko-512.png", "icons/reizoko-m512.png", "icons/yosan-180.png", "icons/yosan-192.png", "icons/yosan-512.png", "icons/yosan-m512.png", "icons/shukan-180.png", "icons/shukan-192.png", "icons/shukan-512.png", "icons/shukan-m512.png", "icons/otetsudai-180.png", "icons/otetsudai-192.png", "icons/otetsudai-512.png", "icons/otetsudai-m512.png", "icons/subsc-180.png", "icons/subsc-192.png", "icons/subsc-512.png", "icons/subsc-m512.png", "icons/bousai-180.png", "icons/bousai-192.png", "icons/bousai-512.png", "icons/bousai-m512.png", "icons/kinenbi-180.png", "icons/kinenbi-192.png", "icons/kinenbi-512.png", "icons/kinenbi-m512.png", "icons/osouji-180.png", "icons/osouji-192.png", "icons/osouji-512.png", "icons/osouji-m512.png", "icons/otoshidama-180.png", "icons/otoshidama-192.png", "icons/otoshidama-512.png", "icons/otoshidama-m512.png", "icons/nengajo-180.png", "icons/nengajo-192.png", "icons/nengajo-512.png", "icons/nengajo-m512.png", "icons/shogatsu-180.png", "icons/shogatsu-192.png", "icons/shogatsu-512.png", "icons/shogatsu-m512.png", "icons/kigen-180.png", "icons/kigen-192.png", "icons/kigen-512.png", "icons/kigen-m512.png", "icons/mokuhyo-180.png", "icons/mokuhyo-192.png", "icons/mokuhyo-512.png", "icons/mokuhyo-m512.png", "icons/goshugi-180.png", "icons/goshugi-192.png", "icons/goshugi-512.png", "icons/goshugi-m512.png", "icons/tokubetsu-180.png", "icons/tokubetsu-192.png", "icons/tokubetsu-512.png", "icons/tokubetsu-m512.png", "icons/index-180.png", "icons/index-192.png", "icons/index-512.png", "icons/index-m512.png"];  // 取れた物だけ保存する
var BASE = self.registration ? self.registration.scope : new URL('./', self.location.href).href;
var abs = function (u) { return new URL(u, BASE).href; };
var KNOWN = {};
PAGES.concat(EXTRA).forEach(function (u) { KNOWN[abs(u)] = true; });

function keyOf(url) {
  var p = url.pathname;
  if (p.charAt(p.length - 1) === '/') p += 'index.html';
  return url.origin + p;
}
function usable(r) { return r && r.ok && r.type === 'basic' && !r.redirected; }

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(PAGES.map(function (u) {
      return fetch(new Request(abs(u), { cache: 'reload' })).then(function (r) {
        if (!usable(r)) throw new Error('保存できない ' + u);
        return c.put(abs(u), r);
      });
    })).then(function () {
      return Promise.all(EXTRA.map(function (u) {
        return fetch(new Request(abs(u), { cache: 'reload' })).then(function (r) { if (usable(r)) return c.put(abs(u), r); }).catch(function () { /* 取れない物はとばす */ });
      }));
    });
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf(PREFIX) === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;            // POST などは扱わない
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 外のサイトは扱わない
  if (url.pathname.indexOf(new URL(BASE).pathname) !== 0) return; // /kurashi/ の外は扱わない
  var key = keyOf(url);
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(key).then(function (hit) {
      var net = fetch(req).then(function (r) {
        if (usable(r) && KNOWN[key]) return c.put(key, r.clone()).catch(function () {}).then(function () { return r; });
        return r;
      });
      if (hit) { e.waitUntil(net.catch(function () {})); return hit; }
      return net.catch(function () {
        if (req.mode === 'navigate') return c.match(abs('index.html')).then(function (x) { return x || Response.error(); });
        return Response.error();
      });
    });
  }));
});
