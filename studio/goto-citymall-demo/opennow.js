// 「今やっている？」の印。お店の営業時間・定休日（御社の一覧表 11/13）から、日本時間で判定する。
// 海外からの方が見ても日本時間で数える。年末年始（12/31〜1/3）は特別な時間なので出さない。
// 試験用：URL に ?now=2026-11-17T11:00 を付けると、その日本時間で判定する。
(function () {
  'use strict';
  // 祝日（内閣府の一覧。振替休日・国民の休日を含む）
  const HOL = new Set([
    '2026-01-01', '2026-01-12', '2026-02-11', '2026-02-23', '2026-03-20', '2026-04-29', '2026-05-03', '2026-05-04', '2026-05-05', '2026-05-06',
    '2026-07-20', '2026-08-11', '2026-09-21', '2026-09-22', '2026-09-23', '2026-10-12', '2026-11-03', '2026-11-23',
    '2027-01-01', '2027-01-11', '2027-02-11', '2027-02-23', '2027-03-21', '2027-03-22', '2027-04-29', '2027-05-03', '2027-05-04', '2027-05-05',
    '2027-07-19', '2027-08-11', '2027-09-20', '2027-09-23', '2027-10-11', '2027-11-03', '2027-11-23'
  ]);
  const YEARS = new Set([...HOL].map(k => +k.slice(0, 4)));
  const WD = ['日', '月', '火', '水', '木', '金', '土'];
  const T = {
    ja: { open: '営業中', openIrr: '営業時間内（休みはお店に確認）', before: '{t}から', after: '本日の営業は終了', closed: '本日は定休日', ask: 'お休みの場合あり（お店に確認）' },
    en: { open: 'Open now', openIrr: 'Within hours (days off vary; ask the shop)', before: 'Opens at {t}', after: 'Closed for today', closed: 'Closed today', ask: 'May be closed today (ask the shop)' },
    'zh-Hant': { open: '營業中', openIrr: '營業時間內（公休日不定，請向店家確認）', before: '{t} 開始營業', after: '今日營業已結束', closed: '今日公休', ask: '今日可能公休（請向店家確認）' },
    ko: { open: '영업 중', openIrr: '영업시간 내(휴무일은 매장에 확인)', before: '{t}부터 영업', after: '오늘 영업 종료', closed: '오늘 휴무', ask: '오늘 휴무일 수 있음(매장에 확인)' }
  };

  function jstNow() {
    const q = new URLSearchParams(location.search).get('now');
    const m = q && q.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{2})$/);
    if (m) return { y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5] };
    const t = new Date(Date.now() + 9 * 3600 * 1000);
    return { y: t.getUTCFullYear(), mo: t.getUTCMonth() + 1, d: t.getUTCDate(), h: t.getUTCHours(), mi: t.getUTCMinutes() };
  }
  const key = (y, mo, d) => `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  function dayInfo(y, mo, d, shift) {
    const t = new Date(Date.UTC(y, mo - 1, d + (shift || 0)));
    const k = key(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
    return { wd: t.getUTCDay(), hol: HOL.has(k) };
  }
  const mins = s => { const m = s.match(/(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : null; };
  function range(s) {
    const p = (s || '').split('〜');
    const a = mins(p[0] || ''), b = mins(p[1] || '');
    return a == null || b == null ? null : [a, b];
  }

  // 戻り値: null（出さない）/ {k: 'open'|'openIrr'|'before'|'after'|'closed', t}
  function judge(el, now) {
    if ((now.mo === 12 && now.d === 31) || (now.mo === 1 && now.d <= 3)) return null;
    if (!YEARS.has(now.y)) return null; // 祝日の一覧が無い年は判定しない（一覧を足せば出る）
    const today = dayInfo(now.y, now.mo, now.d);
    const c = el.dataset.c || '';
    const irr = c.includes('不定休');
    const wd = WD.findIndex(w => c.startsWith(w + '曜日'));
    if (wd >= 0) {
      const nextIfHol = c.includes('祝日のときは翌日');
      if (today.wd === wd && !(nextIfHol && today.hol)) return { k: 'closed' };
      if (nextIfHol) {
        const y = dayInfo(now.y, now.mo, now.d, -1);
        // 祝日の翌日が休み。翌日も祝日（連休）のときは開ける場合があるので言い切らない（11/13 吉田様）
        if (y.wd === wd && y.hol) return { k: today.hol ? 'ask' : 'closed' };
      }
    }
    const weekend = today.wd === 0 || today.wd === 6 || today.hol;
    const r = range(weekend && el.dataset.x ? el.dataset.x : el.dataset.h);
    if (!r) return null;
    const m = now.h * 60 + now.mi;
    if (m < r[0]) return { k: 'before', t: `${Math.floor(r[0] / 60)}:${String(r[0] % 60).padStart(2, '0')}` };
    if (m >= r[1]) return { k: 'after' };
    return { k: irr ? 'openIrr' : 'open' };
  }

  function run() {
    const lang = T[document.documentElement.lang] ? document.documentElement.lang : 'ja';
    const now = jstNow();
    document.querySelectorAll('.shop[data-h]').forEach(el => {
      const b = el.querySelector('.now');
      if (!b) return;
      const r = judge(el, now);
      if (!r) { b.hidden = true; return; }
      b.textContent = T[lang][r.k].replace('{t}', r.t || '');
      b.className = 'now' + (r.k === 'open' ? ' open' : r.k === 'closed' ? ' off' : '');
      b.dataset.state = r.k;
      b.hidden = false;
    });
  }
  window.hinaOpenNow = { judge, run };
  run();
  // 分の変わり目に合わせて更新。別のタブから戻ったときもすぐ更新
  const tick = () => { run(); setTimeout(tick, 60000 - (Date.now() % 60000) + 50); };
  setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
})();
