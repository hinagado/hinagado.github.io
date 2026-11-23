/* Apps Scriptへ送るsubmitのdata:
formats[], sides, backNote, uses[], kind, kindOther, shop, photos[], heroPhoto, noPhoto,
headline, details, products[{name,size,price}], hidePrices, tax,
startDate, endDate, deadline, time, contacts{phone,hours,location}, mood,
season, color, requiredText, bannedText, wantedDate, when, consentShop,
consentPeople, consentDetails。whenはwantedDateと同じ値を送る。 */
var PostRules=(function(){
  var LIMIT=4,LEAD_DAYS=5,MAX_REVISIONS=3,MAX_PHOTOS=4,DRAFT_DAYS=3;
  var FORMATS=["チラシ（A4縦）","ポスター（A3縦）","両方"];
  var USES=["店頭に貼る","お客様に配る","HPのチラシ欄に載せる"];
  var KINDS=["催事・イベント","セール・お得","新商品・季節の商品","予約受付","求人","その他"];
  var LIVE=["受付","下書きあり","直し依頼","承認済み"];
  function pad(n){return(n<10?"0":"")+n;}
  function ymd(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
  function parseYmd(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||""));if(!m)return null;var d=new Date(+m[1],+m[2]-1,+m[3]);return d.getFullYear()===+m[1]&&d.getMonth()===+m[2]-1&&d.getDate()===+m[3]?d:null;}
  function earliest(today){var d=new Date(today.getFullYear(),today.getMonth(),today.getDate()),left=LEAD_DAYS;while(left>0){d.setDate(d.getDate()+1);if(d.getDay()!==0&&d.getDay()!==6)left--;}return d;}
  function monthKey(s){return String(s||"").slice(0,7);}
  function used(rows,month){return(rows||[]).filter(function(r){return monthKey(r.wantedDate||r.when)===month&&LIVE.indexOf(r.state)>=0;}).length;}
  function has(a,b){return Array.isArray(a)&&a.length>=1&&a.length<=b.length&&a.every(function(v,i){return typeof v==="string"&&b.indexOf(v)>=0&&a.indexOf(v)===i;});}
  function str(v,max,need){if(v==null||v==="")return!need;return typeof v==="string"&&v.length<=max&&(!need||v.trim()!=="");}
  function bool(v){return v===true||v===false;}
  function plain(v){return!!v&&typeof v==="object"&&!Array.isArray(v);}
  var TAXES=["税込","税込と税抜を併記"],SIDES=["片面","両面","おまかせ"],MAX_PRODUCTS=8; // 11/24 お客様向けは税込の総額（税抜だけは選べない）
  function tx(v){return String(v||"").trim();}
  function checkSubmit(p,today,rows){
    if(!plain(p))return"内容を読み取れませんでした。";
    // 型と長さ（画面を通さない送信でも、表やメールを壊さないように）
    if(!str(p.kind,20)||!str(p.kindOther,40)||!str(p.shop,100)||!str(p.headline,100)||!str(p.details,200)||!str(p.tax,10)||!str(p.sides,10)||!str(p.backNote,200)||!str(p.time,40)||!str(p.mood,30)||!str(p.season,30)||!str(p.color,60)||!str(p.requiredText,300)||!str(p.bannedText,300)||!str(p.startDate,10)||!str(p.endDate,10)||!str(p.deadline,10)||!str(p.wantedDate,10)||!str(p.when,10))return"入力の形を読み取れませんでした。画面を開き直してください。";
    if(!bool(p.noPhoto)||(p.hidePrices!=null&&!bool(p.hidePrices))||!Array.isArray(p.photos))return"入力の形を読み取れませんでした。画面を開き直してください。";
    if(p.contacts!=null&&(!plain(p.contacts)||Object.keys(p.contacts).some(function(k){return["phone","hours","location"].indexOf(k)<0||!bool(p.contacts[k]);})))return"入力の形を読み取れませんでした。画面を開き直してください。";
    if(p.products!=null&&(!Array.isArray(p.products)||p.products.length>MAX_PRODUCTS||!p.products.every(function(x){return plain(x)&&str(x.name,40)&&str(x.size,30)&&str(x.price,30);})))return"商品は"+MAX_PRODUCTS+"行まで、それぞれ短く書いてください。";
    if(p.tax&&TAXES.indexOf(p.tax)<0)return"値段の表示を選び直してください。";
    if(p.sides&&SIDES.indexOf(p.sides)<0)return"片面か両面かを選び直してください。";
    if(p.wantedDate&&p.when&&p.wantedDate!==p.when)return"受け取り希望日を選び直してください。";
    if(!has(p.formats,FORMATS))return"何を作るか選んでください。";
    if(!has(p.uses,USES))return"使い道を1つ以上選んでください。";
    if(KINDS.indexOf(p.kind)<0)return"何のお知らせか選んでください。";
    if(p.kind==="その他"&&!tx(p.kindOther))return"その他のお知らせの内容を書いてください。";
    if(!tx(p.shop))return"お店を選んでください。";
    if(p.noPhoto&&p.photos.length)return"「写真なし」を選んだ時は、選んだ写真を外してください。";
    var ps=p.photos||[];
    if(!p.noPhoto&&!ps.length)return"写真を選ぶか、「写真なし」を選んでください。";
    if(ps.length>MAX_PHOTOS)return"写真は"+MAX_PHOTOS+"枚までです。";
    if(!p.noPhoto&&(typeof p.heroPhoto!=="number"||p.heroPhoto%1!==0||p.heroPhoto<0||p.heroPhoto>=ps.length))return"主役にする写真を1枚選んでください。";
    if(!tx(p.headline))return"いちばん伝えたい一言を書いてください。";
    if(String(p.headline).length>20)return"いちばん伝えたい一言は20字までにしてください。";
    if(String(p.details||"").length>60)return"補足は60字までにしてください。";
    var start=tx(p.startDate)?parseYmd(p.startDate):null,end=tx(p.endDate)?parseYmd(p.endDate):null;
    if((tx(p.startDate)&&!start)||(tx(p.endDate)&&!end)||(tx(p.deadline)&&!parseYmd(p.deadline)))return"日にちを正しく選んでください。";
    if(start&&end&&end<start)return"終了日は開始日より後を選んでください。";
    if(p.consentShop!==true)return"お店（主催の方）の了承について確認してください。";
    if(p.consentPeople!==true)return"写真に写っている人の了承について確認してください。";
    if(p.consentDetails!==true)return"値段・日にちに間違いがないことを確認してください。";
    var wt=p.wantedDate||p.when,w=parseYmd(wt);
    if(!w)return"受け取り希望日を選んでください。";
    if(w<earliest(today))return"受け取り希望日は "+ymd(earliest(today))+" 以降を選んでください。";
    if(used(rows,monthKey(wt))>=LIMIT)return monthKey(wt).replace("-","年")+"月の枠（"+LIMIT+"回）は埋まっています。別の月を選ぶか、ご相談ください。";
    return null;
  }
  function checkApprove(r,v){if(!r)return"ご依頼が見つかりません。";if(r.state!=="下書きあり")return"今は決定できる状態ではありません。";var n=(r.versions||[]).length;return typeof v!=="number"||v%1!==0||v<0||v>=n?"どの案かを読み取れませんでした。画面を開き直してください。":null;}
  function checkRevise(r,n){if(!r)return"ご依頼が見つかりません。";if(r.state!=="下書きあり")return"今は直しを頼める状態ではありません。";if(!tx(n))return"直してほしい所を書いてください。";if(String(n).length>500)return"直してほしい所は500字までにしてください。";return(+r.revisions||0)>=MAX_REVISIONS?"作り直しは"+MAX_REVISIONS+"回までです。続きはメールでご相談ください。":null;}
  function safeCell(v){var s=String(v==null?"":v);return/^[\s\u0000-\u001f\u3000]*[=+\-@]/.test(s)||/^[\t\r]/.test(s)?"'"+s:s;}
  return{MAX_PRODUCTS:MAX_PRODUCTS,TAXES:TAXES,SIDES:SIDES,LIMIT:LIMIT,LEAD_DAYS:LEAD_DAYS,MAX_REVISIONS:MAX_REVISIONS,MAX_PHOTOS:MAX_PHOTOS,DRAFT_DAYS:DRAFT_DAYS,FORMATS:FORMATS,USES:USES,KINDS:KINDS,ymd:ymd,parseYmd:parseYmd,earliest:earliest,monthKey:monthKey,used:used,checkSubmit:checkSubmit,checkApprove:checkApprove,checkRevise:checkRevise,safeCell:safeCell};
})();
if(typeof module!=="undefined")module.exports=PostRules;
