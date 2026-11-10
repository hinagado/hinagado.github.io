// 館内図。階の切り替えと、押したお店の案内。JavaScript がなくても両方の階の図と、お店へのリンクは使える
(function () {
  const map = document.getElementById("fm"), info = document.getElementById("fm-info");
  if (!map || !info) return;
  document.documentElement.classList.add("js-fm");
  const btns = [...map.querySelectorAll("[data-fl]")], floors = [...map.querySelectorAll(".fm-floor")];
  // 押したお店をアドレスに残す（file:// などで使えないときは黙って飛ばす）
  const remember = sid => { try { history.replaceState(null, "", location.pathname + location.search + "#fm-" + sid); } catch (e) { /* 何もしない */ } };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const setFloor = f => {
    btns.forEach(b => b.setAttribute("aria-pressed", b.dataset.fl === f));
    floors.forEach(x => { x.hidden = x.dataset.floor !== f; });
  };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
  function show(sid, scroll) {
    const box = document.getElementById("fm-" + sid), card = document.getElementById("shop-" + sid);
    if (!box || !card) return;
    setFloor(box.closest(".fm-floor").dataset.floor);
    map.querySelectorAll(".fm-b.on").forEach(x => { x.classList.remove("on"); x.removeAttribute("aria-current"); });
    box.classList.add("on"); box.setAttribute("aria-current", "true");
    const name = card.querySelector("h3").textContent;
    info.replaceChildren();
    info.append(el("b", "fm-nm", name), el("p", "", card.querySelector(".sb > p").textContent));
    const dl = el("p", "fm-meta");
    dl.append(el("span", "floor f" + card.dataset.f[0], card.dataset.f.replace("F", "階")));
    const h = card.querySelector(".hrs"); if (h) dl.append(el("span", "hrs", h.textContent));
    info.append(dl);
    const t = card.querySelector(".tel");
    if (t) { const a = el("a", "tel", t.textContent); a.href = t.getAttribute("href"); info.append(a); }
    const go = el("a", "fm-go", "お店の情報を見る ↑"); go.href = "#shop-" + sid;
    go.addEventListener("click", e => {
      if (card.hidden) { e.preventDefault(); location.href = "shops.html?q=" + encodeURIComponent(name) + "#shop-" + sid; return; }
      const d = card.querySelector("details"); if (d) d.open = true;
    });
    info.append(go);
    if (scroll) map.scrollIntoView({block: "start", behavior: reduce ? "auto" : "smooth"});
  }
  map.addEventListener("click", e => {
    const a = e.target.closest(".fm-b"); if (!a) return;
    e.preventDefault(); show(a.dataset.shop, false); remember(a.dataset.shop);
    // スマホでは案内が図の下に出るので、画面の外なら見える所まで動かす
    const r = info.getBoundingClientRect();
    if (r.top > innerHeight - 80 || r.bottom < 0) info.scrollIntoView({block: "nearest", behavior: reduce ? "auto" : "smooth"});
  });
  btns.forEach(b => b.addEventListener("click", () => setFloor(b.dataset.fl)));
  document.addEventListener("click", e => {
    const a = e.target.closest(".fml"); if (!a) return;
    e.preventDefault(); show(a.dataset.shop, true); remember(a.dataset.shop);
    // キーボードで押した人の操作位置も、館内図のそのお店へ移す
    const box = document.getElementById("fm-" + a.dataset.shop); if (box) box.focus({preventScroll: true});
  });
  setFloor("1F");
  // 現在地（QRコードから ?here=キー で開いたとき）
  let here = null;
  try { here = new URLSearchParams(location.search).get("here"); } catch (e) { /* 何もしない */ }
  const pin = here && [...map.querySelectorAll(".here-pin")].find(x => x.dataset.here === here);
  if (pin) {
    pin.hidden = false;
    setFloor(pin.closest(".fm-floor").dataset.floor);
    const bar = document.getElementById("fm-herebar");
    if (bar) { bar.textContent = "現在地：" + pin.dataset.hereText + "。図の赤い印が、いまいる場所です。"; bar.hidden = false; }
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
