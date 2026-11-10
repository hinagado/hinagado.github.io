// お店から届いた求人・お知らせ（運営が「載せる」に印を付けた物だけ）を読み込んで並べる。
// 読めないとき・0件のときは、ページに書いてある例のまま。文字は textContent で入れる（HTML として読まない）
(function () {
  const boxes = [...document.querySelectorAll("[data-posts]")];
  const src = document.body.dataset.postsSrc;
  if (!boxes.length || !src || !window.fetch) return;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const day = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? `${+m[2]}月${+m[3]}日` : ""; };
  fetch(src, {credentials: "omit"}).then(r => r.ok ? r.json() : null).then(d => {
    const items = d && d.ok === true && Array.isArray(d.items) ? d.items : [];
    boxes.forEach(box => {
      const kind = box.dataset.posts;
      const mine = items.filter(x => x && x.kind === kind && x.title).slice(0, 30);
      if (!mine.length) return;
      const ul = box.querySelector("ul");
      ul.replaceChildren(...mine.map(x => {
        const li = el("li", "post");
        li.append(el("p", "post-shop", String(x.shop || "")), el("h3", "", String(x.title)), el("p", "post-body", String(x.body || "")));
        const meta = [day(x.date) && `${day(x.date)}に掲載`, day(x.until) && `${day(x.until)}まで`].filter(Boolean).join("・");
        if (meta) li.append(el("p", "post-meta", meta));
        return li;
      }));
      box.querySelectorAll(".posts-ex").forEach(e => e.hidden = true);
      box.hidden = false;
      box.classList.add("live");
    });
  }).catch(() => {});
})();
