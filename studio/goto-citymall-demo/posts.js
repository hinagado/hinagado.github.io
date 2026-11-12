// お店から届いた求人・お知らせ・お支払い方法（運営が「載せる」に印を付けた物だけ）を読み込んで並べる。
// 読めないとき・0件のときは、ページに書いてある例のまま。文字は textContent で入れる（HTML として読まない）
(function () {
  const src = document.body.dataset.postsSrc;
  const boxes = [...document.querySelectorAll("[data-posts]")];
  const cards = [...document.querySelectorAll("article.shop[data-n]")];
  if ((!boxes.length && !cards.length) || !src || !window.fetch) return;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const day = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? `${+m[2]}月${+m[3]}日` : ""; };
  // 「くわしく見る」の並び（build.py の JOB_ROWS と同じ）
  const ROWS = [["time", "時間"], ["pay", "基本給"], ["off", "休日"], ["type", "雇用の形"], ["job", "職種"], ["work", "仕事の内容"], ["bonus", "賞与"], ["commute", "通勤費"], ["ins", "社会保険"], ["apply", "応募の方法"]];
  const PAYS = ["cash", "card", "ic", "paypay", "dpay"];
  const CLOCK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  const jobOk = x => x && x.job && typeof x.job === "object" && ["type", "job", "pay", "time"].every(k => typeof x.job[k] === "string" && x.job[k]);
  const meta = x => [day(x.date) && `${day(x.date)}に掲載`, day(x.until) && `${day(x.until)}まで`].filter(Boolean).join("・");
  const jobCard = x => {
    const j = x.job, li = el("li", "job post");
    const role = el("p", "jrole"); role.append(el("span", "jtype t-" + ({"正社員": "full", "パート": "part", "アルバイト": "arb"}[j.type] || "other"), String(j.type)), String(j.job));
    const time = el("p", "jtime"); time.innerHTML = CLOCK; time.append(String(j.time)); // CLOCK は決まった絵だけ。届いた文字は append で入れる
    const det = el("details", "jd"), dl = el("dl");
    const cl = el("button", "dclose", "閉じる"); cl.type = "button";
    det.append(el("summary", "", "条件の詳細を見る"), dl, cl);
    ROWS.forEach(([k, lab]) => { if (j[k]) dl.append(el("dt", "", lab), el("dd", "", String(j[k]))); });
    li.append(el("h3", "", String(x.shop || "")), role, el("p", "jpay", String(j.pay)), time, det);
    if (meta(x)) li.append(el("p", "post-meta", meta(x)));
    return li;
  };
  const postCard = x => {
    const li = el("li", "post");
    li.append(el("p", "post-shop", String(x.shop || "")), el("h3", "", String(x.title)), el("p", "post-body", String(x.body || "")));
    if (meta(x)) li.append(el("p", "post-meta", meta(x)));
    return li;
  };
  fetch(src, {credentials: "omit"}).then(r => r.ok ? r.json() : null).then(d => {
    const ok = d && d.ok === true;
    const items = ok && Array.isArray(d.items) ? d.items : [];
    const pay = ok && d.pay && typeof d.pay === "object" ? d.pay : {};
    boxes.forEach(box => {
      const kind = box.dataset.posts;
      const mine = items.filter(x => x && x.kind === kind && x.title && (kind !== "求人" || jobOk(x))).slice(0, 30);
      if (!mine.length) return;
      box.querySelector("ul").replaceChildren(...mine.map(x => kind === "求人" ? jobCard(x) : postCard(x)));
      box.querySelectorAll(".posts-ex").forEach(e => e.hidden = true);
      box.hidden = false;
      box.classList.add("live");
    });
    // お店の一覧：お支払いのマークと、求人があれば求人のページへ
    const tpl = document.getElementById("paytpl");
    cards.forEach(c => {
      const n = c.dataset.n;
      const keys = Array.isArray(pay[n]) ? PAYS.filter(k => pay[n].includes(k)) : [];
      const pd = c.querySelector("[data-pay]");
      if (pd && tpl && keys.length) pd.replaceChildren(...keys.map(k => tpl.content.querySelector(".pay-" + k).cloneNode(true)));
      const jd = c.querySelector("[data-jobs]");
      const jobs = items.filter(x => x && x.kind === "求人" && x.shop === n && jobOk(x));
      if (jd && jobs.length) { const a = el("a", "", `求人 ${jobs.length}件を見る`); a.href = "recruit.html#jobs"; jd.replaceChildren(a); }
    });
  }).catch(() => {});
})();
