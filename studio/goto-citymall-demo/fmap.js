// 館内図。階の切り替えと、押したお店の案内。JavaScript がなくても両方の階の図と、お店へのリンクは使える
(function () {
  const map = document.getElementById("fm"), info = document.getElementById("fm-info");
  if (!map || !info) return;
  document.documentElement.classList.add("js-fm");
  const btns = [...map.querySelectorAll("[data-fl]")], floors = [...map.querySelectorAll(".fm-floor")];
  const infoInit = info.innerHTML; // 2026-11-22 階を替えたときに戻す最初の文
  // 押したお店をアドレスに残す（file:// などで使えないときは黙って飛ばす）
  const remember = sid => { try { history.replaceState(null, "", location.pathname + location.search + "#fm-" + sid); } catch (e) { /* 何もしない */ } };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const setFloor = f => {
    btns.forEach(b => b.setAttribute("aria-pressed", b.dataset.fl === f));
    floors.forEach(x => { x.hidden = x.dataset.floor !== f; });
    floors.forEach(x => { const sc = x.querySelector(".fm-scroll"); if (sc && sc.clientWidth) x.classList.toggle("end", sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 8); });
  };
  // 海外の方向けのページ（<html lang>）の言葉
  const L = {en: {go: "Shop details ↑", fl: f => f}, "zh-Hant": {go: "查看店鋪資訊 ↑", fl: f => f}, ko: {go: "매장 정보 보기 ↑", fl: f => f}}[document.documentElement.lang] || {go: "お店の情報を見る ↑", fl: f => f.replace("F", "階")};
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
  function show(sid, scroll) {
    const box = document.getElementById("fm-" + sid), card = document.getElementById("shop-" + sid);
    if (!box || !card) return;
    setFloor(box.closest(".fm-floor").dataset.floor);
    map.querySelectorAll(".fm-b.on").forEach(x => { x.classList.remove("on"); x.removeAttribute("aria-current"); });
    box.classList.add("on"); box.setAttribute("aria-current", "true");
    map.querySelectorAll(".fm-pin.on").forEach(x => x.classList.remove("on"));
    map.querySelectorAll(`.fm-pin[data-shop="${sid}"]`).forEach(x => x.classList.add("on"));
    const name = card.querySelector("h3").textContent;
    info.replaceChildren();
    info.append(el("b", "fm-nm", name), el("p", "", card.querySelector(".sb > p:not(.roma)").textContent));
    const ro = card.querySelector(".sb > p.roma"); if (ro) info.append(el("p", "fm-ro", ro.textContent));
    const dl = el("p", "fm-meta");
    dl.append(el("span", "floor f" + card.dataset.f[0], L.fl(card.dataset.f)));
    const h = card.querySelector(".hrs"); if (h) dl.append(el("span", "hrs", h.textContent));
    info.append(dl);
    const t = card.querySelector(".tel");
    if (t) { const a = el("a", "tel", t.textContent); a.href = t.getAttribute("href"); info.append(a); }
    const go = el("a", "fm-go", L.go.replace(" ↑", "")); go.href = "#shop-" + sid;
    const ar = el("span", "ar up"); ar.setAttribute("aria-hidden", "true"); go.append(ar);
    go.addEventListener("click", e => {
      if (card.hidden) { e.preventDefault(); location.href = "shops.html?q=" + encodeURIComponent(name) + "#shop-" + sid; return; }
      const d = card.querySelector("details"); if (d) d.open = true;
    });
    info.append(go);
    const sj = card.querySelector(".showja"); if (sj) { const c2 = sj.cloneNode(true); c2.removeAttribute("data-map"); info.append(c2); }
    info.classList.remove("in"); void info.offsetWidth; info.classList.add("in"); // 案内の箱が少し上がって出る（動きは CSS。reduce の時は動かない）
    if (scroll) map.scrollIntoView({block: "start", behavior: reduce ? "auto" : "smooth"});
  }
  map.addEventListener("click", e => {
    const a = e.target.closest(".fm-b, .fm-pin"); if (!a) return;
    e.preventDefault(); show(a.dataset.shop, false); remember(a.dataset.shop);
    // スマホでは案内が図の下に出るので、画面の外なら見える所まで動かす
    const r = info.getBoundingClientRect(), tb = document.querySelector(".tabbar");
    const low = innerHeight - (tb && getComputedStyle(tb).display !== "none" ? tb.getBoundingClientRect().height : 0) - 16; // 箱の下の端は、下の固定メニューの少し上まで
    if (r.bottom > low) scrollBy({top: Math.min(r.bottom - low, r.top - 80), behavior: reduce ? "auto" : "smooth"});
    else if (r.bottom < 0) info.scrollIntoView({block: "nearest", behavior: reduce ? "auto" : "smooth"});
  });
  const atEnd = sc => { if (sc.clientWidth) sc.parentElement.classList.toggle("end", sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 8); };
  const markEnds = () => map.querySelectorAll(".fm-scroll").forEach(atEnd);
  btns.forEach(b => b.addEventListener("click", () => {
    setFloor(b.dataset.fl);
    const on = map.querySelector(".fm-b.on");
    if (on && on.closest(".fm-floor").dataset.floor !== b.dataset.fl) { on.classList.remove("on"); on.removeAttribute("aria-current"); info.innerHTML = infoInit; }
    fitNow();
  }));
  // 2026-11-22 スマホでは図が画面より広いので、「全体を見る」で縮めて1画面に入れる（もう一度押すと元の大きさ）
  const FT = {en: ["See the whole map", "Zoom in"], "zh-Hant": ["看全圖", "放大"], ko: ["전체 보기", "크게 보기"]}[document.documentElement.lang] || ["全体を見る", "大きく見る"];
  const fitBtn = el("button", "fm-fit", FT[0]); fitBtn.type = "button"; fitBtn.setAttribute("aria-pressed", "false");
  const sw = map.querySelector(".fm-swipe"); if (sw) sw.after(fitBtn);
  const FH = {en: "Tap a shop to see its name below.", "zh-Hant": "點選店鋪，下方會顯示店名。", ko: "매장을 누르면 아래에 이름이 나옵니다."}[document.documentElement.lang] || "お店を押すと、下に名前と場所が出ます。";
  const fitHint = el("span", "fm-fithint", FH); fitBtn.after(fitHint);
  function fitNow() {
    const on = map.classList.contains("fit");
    map.querySelectorAll(".fm-floor:not([hidden]) .fm-scroll").forEach(sc => {
      const g = sc.querySelector(".fm-grid"); if (!g) return;
      g.style.zoom = "";
      if (on && g.offsetWidth > sc.clientWidth) g.style.zoom = String(Math.floor(sc.clientWidth / g.offsetWidth * 1000) / 1000);
    });
    markEnds();
  }
  fitBtn.addEventListener("click", () => {
    const on = map.classList.toggle("fit");
    fitBtn.setAttribute("aria-pressed", String(on)); fitBtn.textContent = on ? FT[1] : FT[0];
    fitNow();
  });
  addEventListener("resize", fitNow);
  document.addEventListener("click", e => {
    const a = e.target.closest(".fml"); if (!a) return;
    e.preventDefault(); show(a.dataset.shop, true); remember(a.dataset.shop);
    // キーボードで押した人の操作位置も、館内図のそのお店へ移す
    const box = document.getElementById("fm-" + a.dataset.shop); if (box) box.focus({preventScroll: true});
  });
  // 図を右の端まで動かしたら、「まだ右に続きます」の印（▶）を消す
  map.querySelectorAll(".fm-scroll").forEach(sc => { sc.addEventListener("scroll", () => atEnd(sc), {passive: true}); });
  addEventListener("resize", markEnds);
  setFloor("1F");
  markEnds();
  // 現在地（QRコードから ?here=キー で開いたとき）
  let here = null;
  try { here = new URLSearchParams(location.search).get("here"); } catch (e) { /* 何もしない */ }
  const pin = here && [...map.querySelectorAll(".here-pin")].find(x => x.dataset.here === here);
  if (pin) {
    pin.hidden = false;
    setFloor(pin.closest(".fm-floor").dataset.floor);
    const bar = document.getElementById("fm-herebar");
    if (bar) { bar.textContent = bar.dataset.tpl ? bar.dataset.tpl.replace("{t}", pin.dataset.hereText) : "現在地：" + pin.dataset.hereText + "。図の赤い印が、いまいる場所です。"; bar.hidden = false; }
    // 印のある場所が、画面の真ん中に来るように動かす（スマホでは図も横に動く）
    const toPin = () => pin.parentElement.scrollIntoView({block: "center", inline: "center", behavior: "instant"});
    toPin();
    // アドレスの「#fm」でブラウザが後から動かすので、読み込みのあとにもう一度合わせる
    if (document.readyState === "complete") requestAnimationFrame(toPin); else addEventListener("load", () => requestAnimationFrame(toPin), {once: true});
  }
  const fromHash = () => { const m = location.hash.match(/^#fm-(s\d+)$/); if (m) show(m[1], true); };
  addEventListener("hashchange", fromHash);
  fromHash();
})();

// 2026-11-24 絵の館内図の名札が重ならないようにする（代表「名札の重なりも改善して」）。
// 文字の大きさは画面の幅や言葉で変わるので、出した後に測って、重なる名札だけを上下に少しずらす。
// お店の名札を先に置き、設備の名札（階段など）は置けない時だけ隠す。JavaScript がない時は元の位置のまま。
(function () {
  const boxes = [...document.querySelectorAll(".fm-ill-in")];
  if (!boxes.length) return;
  const hit = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
  function layout(box) {
    const B = box.getBoundingClientRect();
    if (!B.width) return;
    const els = [...box.querySelectorAll(".fm-fac.tr"), ...box.querySelectorAll(".fm-pin"), ...box.querySelectorAll(".fm-fac:not(.tr)")]; // 乗り物（タクシー・バス）を先に置く
    els.forEach(e => { e.style.transform = ""; e.style.visibility = ""; });
    const placed = [];
    for (const e of els) {
      const r0 = e.getBoundingClientRect();
      if (!r0.width) continue;
      const step = r0.height + 2, fac = e.classList.contains("fm-fac");
      const tries = [0, 0.5, -0.5, 1, -1, 1.5, -1.5, 2, -2];
      let ok = null;
      for (const k of tries) {
        const dy = k * step, r = {left: r0.left, right: r0.right, top: r0.top + dy, bottom: r0.bottom + dy};
        if (r.top < B.top || r.bottom > B.bottom) continue;
        if (!placed.some(p => hit(p, r))) { ok = {dy, r}; break; }
      }
      if (!ok) {
        if (fac) { e.style.visibility = "hidden"; continue; }
        ok = {dy: 0, r: r0}; // どうしても置けないお店は元の位置（隠さない）
      }
      if (ok.dy) e.style.transform = `translate(-50%, calc(-50% + ${Math.round(ok.dy)}px))`;
      placed.push(ok.r);
    }
  }
  const run = () => boxes.forEach(layout);
  let t = 0;
  const later = () => { clearTimeout(t); t = setTimeout(run, 60); };
  if ("ResizeObserver" in window) { const ro = new ResizeObserver(later); boxes.forEach(b => ro.observe(b)); }
  addEventListener("resize", later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
  addEventListener("load", run);
  run();
})();

// 2026-11-24 館内図の車と人：図が画面に見えている時だけ動かす。「動きを止める」で止め、選んだことを覚える
(function () {
  const boxes = [...document.querySelectorAll(".fm-ill-in")].filter(b => b.querySelector(".fm-anim"));
  if (!boxes.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const W = {en: ["Stop the animation", "Play the animation"], "zh-Hant": ["停止動畫", "播放動畫"], ko: ["움직임 멈추기", "움직임 보기"]}[document.documentElement.lang] || ["動きを止める", "動かす"];
  let stop = false;
  try { stop = localStorage.getItem("fm-anim-stop") === "1"; } catch (e) { /* 何もしない */ }
  const seen = new Map();
  const apply = () => boxes.forEach(b => { b.classList.toggle("stop", stop); b.classList.toggle("run", !stop && !!seen.get(b)); });
  boxes.forEach(b => {
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "fm-move";
    const label = () => { btn.textContent = stop ? W[1] : W[0]; btn.setAttribute("aria-pressed", String(stop)); };
    label();
    btn.addEventListener("click", () => { stop = !stop; try { localStorage.setItem("fm-anim-stop", stop ? "1" : "0"); } catch (e) { /* 何もしない */ } document.querySelectorAll(".fm-move").forEach(x => { x.textContent = stop ? W[1] : W[0]; x.setAttribute("aria-pressed", String(stop)); }); apply(); });
    b.parentElement.before(btn);
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => { es.forEach(x => seen.set(x.target, x.isIntersecting)); apply(); });
    boxes.forEach(b => io.observe(b));
  } else { boxes.forEach(b => seen.set(b, true)); }
  apply();
})();