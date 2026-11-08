// 「表を直すと、ホームページが変わります」の体験。表の文字を、その場で催事の札に写す（見本なので保存しない）
(function () {
  const tb = document.querySelector(".sheet tbody"), out = document.getElementById("sprev");
  if (!tb || !out) return;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; e.textContent = text; return e; };
  function draw() {
    out.replaceChildren();
    [...tb.rows].forEach(r => {
      const v = [...r.querySelectorAll("input")].map(i => i.value.trim());
      if (!v.some(Boolean)) return;
      const li = el("li", "ev", "");
      li.append(el("time", "", v[0]), el("span", "where", v[1]), el("b", "", v[2]), el("span", "", v[3]));
      out.append(li);
    });
    if (!out.children.length) out.append(el("li", "ev empty-ev", "表が空のときは、催事の欄は出ません"));
  }
  tb.addEventListener("input", draw);
})();
