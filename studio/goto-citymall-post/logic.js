// 投稿の箱の決まり。ブラウザと Apps Script の両方で同じファイルを使う（この中で画面やシートに触らない）
var PostRules = (function () {
  var LIMIT = 4;        // 月の投稿枠（案）
  var LEAD_DAYS = 5;    // 公開希望日は、今日から何営業日あとから選べるか（案。土日のみ除く・祝日は見ない）
  var MAX_REVISIONS = 3; // 作り直しの回数（案）。前の案へ戻るのは数えない
  var MAX_PHOTOS = 4;
  var DRAFT_DAYS = 3;   // 受付から下書きまでの営業日（案）
  var KINDS = ["お店の紹介", "セール・催し", "新しい商品", "お知らせ", "そのほか"];
  // 公開を数える状態（取り下げは枠に数えない）
  var LIVE = ["受付", "下書きあり", "直し依頼", "承認済み"];

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseYmd(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] ? d : null;
  }
  function earliest(today) {
    var d = new Date(today.getFullYear(), today.getMonth(), today.getDate()), left = LEAD_DAYS;
    while (left > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) left--; }
    return d;
  }
  function monthKey(s) { return String(s || "").slice(0, 7); }
  function used(rows, month) {
    return rows.filter(function (r) { return monthKey(r.when) === month && LIVE.indexOf(r.state) >= 0; }).length;
  }
  // 問題があれば日本語の文を返す。なければ null
  function checkSubmit(p, today, rows) {
    if (!p || typeof p !== "object") return "内容を読み取れませんでした。";
    if (!String(p.message || "").trim()) return "伝えたいことを書いてください。";
    if (String(p.message).length > 1000) return "伝えたいことは1000字までにしてください。";
    if (String(p.shop || "").length > 100) return "お店の名前は100字までにしてください。";
    if (KINDS.indexOf(p.kind) < 0) return "投稿の種類を選んでください。";
    var photos = p.photos || [];
    if (!photos.length) return "写真を1枚以上入れてください。";
    if (photos.length > MAX_PHOTOS) return "写真は" + MAX_PHOTOS + "枚までです。";
    if (p.consent !== true) return "写真の掲載の確認にチェックを入れてください。";
    var d = parseYmd(p.when);
    if (!d) return "公開を希望する日を選んでください。";
    if (d < earliest(today)) return "公開を希望する日は " + ymd(earliest(today)) + " 以降を選んでください。";
    if (used(rows, monthKey(p.when)) >= LIMIT) return monthKey(p.when).replace("-", "年") + "月の枠（" + LIMIT + "本）は埋まっています。別の月を選ぶか、ご相談ください。";
    return null;
  }
  function checkApprove(row, version) {
    if (!row) return "投稿が見つかりません。";
    if (row.state !== "下書きあり") return "この投稿は、今は確認できる状態ではありません。";
    var n = (row.versions || []).length;
    if (typeof version !== "number" || version % 1 !== 0 || version < 0 || version >= n) return "どの案かを読み取れませんでした。画面を開き直してください。";
    return null;
  }
  function checkRevise(row, note) {
    if (!row) return "投稿が見つかりません。";
    if (row.state !== "下書きあり") return "この投稿は、今は直しを頼める状態ではありません。";
    if (!String(note || "").trim()) return "直してほしい所を書いてください。";
    if (String(note).length > 500) return "直してほしい所は500字までにしてください。";
    if ((+row.revisions || 0) >= MAX_REVISIONS) return "作り直しは" + MAX_REVISIONS + "回までです。続きはメールでご相談ください。";
    return null;
  }
  // シートに入れる時、数式として動かないようにする
  function safeCell(v) {
    var s = String(v == null ? "" : v);
    return /^[\s\u0000-\u001f\u3000]*[=+\-@]/.test(s) || /^[\t\r]/.test(s) ? "'" + s : s;
  }
  return {LIMIT: LIMIT, LEAD_DAYS: LEAD_DAYS, MAX_REVISIONS: MAX_REVISIONS, MAX_PHOTOS: MAX_PHOTOS, DRAFT_DAYS: DRAFT_DAYS, KINDS: KINDS, ymd: ymd, parseYmd: parseYmd, earliest: earliest, monthKey: monthKey, used: used, checkSubmit: checkSubmit, checkApprove: checkApprove, checkRevise: checkRevise, safeCell: safeCell};
})();
if (typeof module !== "undefined") module.exports = PostRules;
