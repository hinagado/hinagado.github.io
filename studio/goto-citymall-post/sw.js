/* このファイルは _offline/make_sw.mjs から生成されます。直接編集しないでください。 */
"use strict";

const CACHE_NAME = "gcm-goto-citymall-post-6839e555bd14";
const CACHE_PREFIX = "gcm-goto-citymall-post-";
const FONT_CACHE = "gcm-fonts-v1";
const PRE = [
  "flyer/send.html",
  "./",
  "index.html",
  "logic.js",
  "manual/after_back.webp",
  "manual/after_front.webp",
  "manual/b1.webp",
  "manual/b4.webp",
  "manual/b5.webp",
  "manual/b9.webp",
  "manual/bc.webp",
  "manual/bd.webp",
  "manual/before.webp",
  "manual/box.html",
  "manual/f1.webp",
  "manual/flyer.html",
  "manual/h1.webp",
  "post.css",
  "post.html",
  "post.js",
  "sample_blossom.jpg",
  "sample_flyer_bonpati.jpg",
  "shot_box.png",
  "shot_check.png",
  "shot_vers.png",
  "tool.css"
];
const META_URL = new URL("__meta", self.registration.scope).href;
const OFFLINE_HTML = "<!doctype html><html lang=\"ja\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><title>オフライン</title><body><p>電波がありません。この画面はまだ保存されていません</p></body></html>";

function wait(milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds);
  });
}

async function fetchForInstall(url) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "reload" });
      if (response.ok) return response;
      lastError = new Error("HTTP " + response.status + ": " + url);
    } catch (error) {
      lastError = error;
    }
    if (attempt < 2) await wait(300 * (attempt + 1));
  }
  throw lastError || new Error("取得できませんでした: " + url);
}

async function installAll() {
  const cache = await caches.open(CACHE_NAME);
  let wasAlreadyReady = false;
  try {
    const oldMeta = await cache.match(META_URL);
    // __meta は全件保存後にだけ書くため、これがあれば旧版は完成済み。
    wasAlreadyReady = !!oldMeta;
  } catch (_) {
    wasAlreadyReady = false;
  }
  let next = 0;
  const failures = [];

  async function worker() {
    while (true) {
      const index = next;
      next += 1;
      if (index >= PRE.length) return;
      const url = PRE[index];
      try {
        const response = await fetchForInstall(url);
        await cache.put(url, response);
      } catch (error) {
        failures.push({ url: url, error: error });
      }
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(6, PRE.length); i += 1) workers.push(worker());
  await Promise.all(workers);

  // 1件でも欠けたキャッシュは準備済みにせず、丸ごと捨てる。
  if (failures.length) {
    // 同一内容の完成済み旧版がある場合は、当日使える保存を壊さない。
    if (!wasAlreadyReady) await caches.delete(CACHE_NAME);
    throw failures[0].error;
  }

  const at = new Date().toISOString();
  await cache.put(
    META_URL,
    new Response(JSON.stringify({ at: at }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    })
  );
  await self.skipWaiting();
}

self.addEventListener("install", function (event) {
  event.waitUntil(installAll());
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.map(function (name) {
          if (name.indexOf(CACHE_PREFIX) === 0 && name !== CACHE_NAME) {
            return caches.delete(name);
          }
          return false;
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function hasSecretKey(url) {
  try {
    return new URL(url).searchParams.has("k");
  } catch (_) {
    return true;
  }
}

async function saveLocal(request, response) {
  if (!response || !response.ok || response.type !== "basic" || hasSecretKey(request.url)) return;
  try {
    // 呼び出し直後に複製し、画面へ返した応答との読み取り競合を避ける。
    const copy = response.clone();
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, copy);
  } catch (_) {
    // 容量不足などでも、取得できた画面そのものは返す。
  }
}

async function findLocal(request) {
  const cache = await caches.open(CACHE_NAME);
  let response = await cache.match(request);
  if (!response) response = await cache.match(request, { ignoreSearch: true });
  return response;
}

function pageNetworkFirst(event) {
  const request = event.request;
  const fetched = fetch(request);
  const update = fetched.then(
    function (response) {
      return saveLocal(request, response);
    },
    function () {}
  );
  const network = fetched.then(
    function (response) { return { kind: "network", response: response }; },
    function () { return { kind: "error" }; }
  );

  // 保存版を返した後も通信を完了させ、次回用の内容を更新する。
  event.waitUntil(update);

  return Promise.race([
    network,
    wait(4000).then(function () { return { kind: "timeout" }; }),
  ]).then(async function (result) {
    if (result.kind === "network") return result.response;
    const cached = await findLocal(request);
    if (cached) return cached;
    return new Response(OFFLINE_HTML, {
      status: 503,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  });
}

function assetCacheFirst(event) {
  const request = event.request;
  const network = fetch(request);
  const update = network.then(
    function (response) { return saveLocal(request, response); },
    function () {}
  );

  // 保存版が見つかった場合も、裏側では最新版を取りに行く。
  event.waitUntil(update);
  return findLocal(request).then(function (cached) {
    if (cached) return cached;
    return network;
  });
}

async function fontCacheFirst(request) {
  const cache = await caches.open(FONT_CACHE);
  const mayStore = !hasSecretKey(request.url);
  const corsRequest = new Request(request.url, {
    mode: "cors",
    credentials: "omit",
  });
  const cached = mayStore ? await cache.match(corsRequest) : null;
  if (cached) return cached;

  try {
    const response = await fetch(corsRequest);
    if (response.ok && mayStore) {
      try {
        await cache.put(corsRequest, response.clone());
      } catch (_) {}
    }
    return response;
  } catch (_) {
    // CORS で取り直せない場合は、ブラウザ本来の取得方法へ戻す。
    return fetch(request);
  }
}

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(fontCacheFirst(request));
    return;
  }

  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || url.href.indexOf(scope.href) !== 0) return;

  const accept = request.headers.get("accept") || "";
  const isPage = request.mode === "navigate" || accept.indexOf("text/html") !== -1;
  if (isPage) {
    event.respondWith(pageNetworkFirst(event));
  } else {
    event.respondWith(assetCacheFirst(event));
  }
});

self.addEventListener("message", function (event) {
  if (!event.data || event.data.type !== "check" || !event.ports || !event.ports[0]) return;
  const port = event.ports[0];

  (async function () {
    let have = 0;
    let at = null;
    try {
      const cache = await caches.open(CACHE_NAME);
      for (const url of PRE) {
        if (await cache.match(url)) have += 1;
      }
      const meta = await cache.match(META_URL);
      if (meta) {
        const data = await meta.json();
        if (data && typeof data.at === "string") at = data.at;
      }
    } catch (_) {}

    port.postMessage({
      ok: have === PRE.length && !!at,
      have: have,
      total: PRE.length,
      cache: CACHE_NAME,
      at: at,
    });
  })();
});
