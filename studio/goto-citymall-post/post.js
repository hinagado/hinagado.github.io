// チラシ・ポスターの箱。本番はApps Script、?demo=1ではこの画面の中だけで動く。
(function(){
  var ENDPOINT="https://script.google.com/macros/s/AKfycbxToqVQEdKxT9cMdM1YpEziujtM99mTaIusrJLzWvEOi34N57LHu60N2g2U90DQnzWJ/exec";
  var $=function(id){return document.getElementById(id);},R=PostRules;
  var demo=!ENDPOINT||new URLSearchParams(location.search).get("demo")==="1";
  var pass="",photos=[],heroPhoto=0,today=new Date(),viewing={};
  function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
  function val(name){var c=document.querySelector('input[name="'+name+'"]:checked');return c?c.value:"";}
  function vals(name){return[].slice.call(document.querySelectorAll('input[name="'+name+'"]:checked')).map(function(x){return x.value;});}

  var Demo={rows:[{id:"見本-1",shop:"ボンパティ",kind:"予約受付",headline:"クリスマスケーキご予約承り中",wantedDate:R.ymd(R.earliest(today)),when:R.ymd(R.earliest(today)),state:"下書きあり",revisions:0,versions:[{label:"案A",image:"sample_flyer_bonpati.jpg"},{label:"案B",image:"sample_flyer_bonpati.jpg"}]}],call:function(action,b){
    var rows=this.rows,find=function(id){return rows.filter(function(x){return x.id===id;})[0];};
    function quota(){var k=R.monthKey(R.ymd(today));return{month:k,used:R.used(rows,k),limit:R.LIMIT};}
    if(action==="status")return{ok:true,quota:quota()};
    if(action==="list")return{ok:true,items:rows.slice().reverse(),quota:quota()};
    if(action==="image")return{ok:true,image:"sample_flyer_bonpati.jpg"};
    if(action==="submit"){
      var bad=R.checkSubmit(b,today,rows);if(bad)return{ok:false,error:bad};
      var id="見本-"+(rows.length+1);rows.push({id:id,shop:b.shop,kind:b.kind,headline:b.headline,wantedDate:b.wantedDate,when:b.when,state:"下書きあり",revisions:0,versions:[{label:"案A",image:"sample_flyer_bonpati.jpg"},{label:"案B",image:"sample_flyer_bonpati.jpg"}]});return{ok:true,id:id,quota:quota()};
    }
    var row=find(b.id),err;
    if(action==="approve"){err=R.checkApprove(row,b.version);if(err)return{ok:false,error:err};row.state="承認済み";row.approvedVersion=b.version;return{ok:true};}
    if(action==="revise"){err=R.checkRevise(row,b.note);if(err)return{ok:false,error:err};row.revisions++;var base=row.versions[b.version]||row.versions[0];row.versions.push({label:"修正版"+row.revisions,image:base.image,note:b.note});return{ok:true};}
    return{ok:false,error:"できない操作です。"};
  }};
  function api(action,data){data=data||{};if(demo)return Promise.resolve(Demo.call(action,data));data.action=action;data.pass=pass;return fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(data),redirect:"follow",credentials:"omit"}).then(function(r){return r.json();}).then(function(r){if(r&&r.auth===false&&!$("app").hidden)lockOut();return r;});}
  function lockOut(){pass="";forgetKey();$("app").hidden=true;$("login").hidden=false;$("loginErr").textContent="このアドレスは使えなくなっています。ひなが堂にお問い合わせください。";$("loginErr").hidden=false;}
  var KEY_RE=/^[A-Za-z0-9_-]{43}$/,KEY_STORE="postBoxKey",KEEP_DAYS=90,NET="つながりませんでした。電波の良い所でもう一度お試しください。";
  function savedKey(){try{var v=JSON.parse(localStorage.getItem(KEY_STORE)||"null");if(v&&KEY_RE.test(v.k)&&+v.until>Date.now())return v.k;localStorage.removeItem(KEY_STORE);}catch(e){try{localStorage.removeItem(KEY_STORE);}catch(e2){}}return"";}
  function saveKey(k){try{localStorage.setItem(KEY_STORE,JSON.stringify({k:k,until:Date.now()+KEEP_DAYS*864e5}));}catch(e){}}
  function forgetKey(){try{localStorage.removeItem(KEY_STORE);}catch(e){}}
  function rememberUi(){var on=!!savedKey();$("keepBox").hidden=false;$("keepOn").hidden=on;$("keepOff").hidden=!on;$("keepNote").textContent=on?"このスマホは、90日間このページを開くだけで箱が開きます。":"家族と共用のスマホ・パソコンでは押さないでください。";}
  $("keepOn").onclick=function(){if(pass){saveKey(pass);rememberUi();}};$("keepOff").onclick=function(){forgetKey();rememberUi();};

  function showQuota(q){if(!q)return;var left=Math.max(0,q.limit-q.used);$("quota").innerHTML="";$("quota").append(el("span","","今月あと"),el("b","",left),el("span","","回"),el("small","","月4回まで"));$("ring").setAttribute("stroke-dasharray",(left/q.limit*100)+" 100");}
  function tab(name){var box=name==="box";$("box").hidden=!box;$("check").hidden=box;$("tBox").setAttribute("aria-selected",box);$("tCheck").setAttribute("aria-selected",!box);if(!box)loadList();scrollTo({top:0,behavior:"instant"});}
  $("tBox").onclick=function(){tab("box");};$("tCheck").onclick=function(){tab("check");};

  R.KINDS.forEach(function(k){var l=el("label"),i=el("input"),s=el("span","",k);i.type="radio";i.name="kind";i.value=k;i.onchange=function(){$("kindOtherWrap").hidden=k!=="その他";};l.append(i,s);$("kinds").append(l);});
  var SHOPS="小麦の奴隷／ボンパティ／文明堂／御菓子司はたなか／和敬庵／つばき屋／ダイソー／楽天モバイル／ピーパラダイス／hair salon VITA／美髪・髪質改善クリニックLeon／携帯相談室／ドコモショップ サテライト／麺屋まる福／リトル・クルサ／BLOSSOM／釣具店 釣りします／たこ焼きけんちゃん／ファンタジーランド／メガネのヨネザワ／パレット／ツーピース／託児所シティハウス／おもちゃ屋 おやこパンダ／肩こり、ほぐし(隊) 恵-megumi-／SpRay／未来ごとう／オックスフォード／森補正専門店／パレット HOMME／リトルシアター／バッグの多津屋 Hanako／白寿ヘルストロン／たびのコンパス／十八親和銀行／モール全体".split("／");
  SHOPS.forEach(function(n){var o=el("option","",n);o.value=n;$("shop").append(o);});
  function count(input,out,max){$(input).oninput=function(){$(out).textContent=this.value.length+" / "+max;};}
  count("headline","headlineCount",20);count("details","detailsCount",60);

  function shrink(file){return new Promise(function(ok,ng){var url=URL.createObjectURL(file),im=new Image();im.onload=function(){var k=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(url);ok(c.toDataURL("image/jpeg",.85));};im.onerror=function(){URL.revokeObjectURL(url);ng(new Error("image"));};im.src=url;});}
  function drawThumbs(){$("thumbs").innerHTML="";photos.forEach(function(p,i){var w=el("div","thumb"),im=new Image(),star=el("button","star",i===heroPhoto?"★ 主役":"☆ 主役にする"),x=el("button","remove","×");im.src=p;im.alt="選んだ写真 "+(i+1);star.type=x.type="button";star.setAttribute("aria-label","写真"+(i+1)+"を主役にする");x.setAttribute("aria-label","写真"+(i+1)+"を外す");star.onclick=function(){heroPhoto=i;drawThumbs();};x.onclick=function(){photos.splice(i,1);if(heroPhoto>=photos.length)heroPhoto=Math.max(0,photos.length-1);drawThumbs();};w.append(im,star,x);$("thumbs").append(w);});}
  $("photos").onchange=function(){var files=[].slice.call(this.files),room=R.MAX_PHOTOS-photos.length;$("noPhoto").checked=false;showErr(files.length>room?"写真は4枚までです。":"");Promise.all(files.slice(0,room).map(function(f){return shrink(f).catch(function(){return null;});})).then(function(list){var bad=list.filter(function(x){return!x;}).length;photos=photos.concat(list.filter(Boolean));drawThumbs();if(bad)showErr("読み込めない写真がありました。JPEGかPNGでお試しください。");});this.value="";};
  $("noPhoto").onchange=function(){if(this.checked){photos=[];heroPhoto=0;drawThumbs();}};
  function productRow(){var row=el("div","product-row");[{c:"product-name",p:"品名",m:40},{c:"product-size",p:"大きさ・量",m:30},{c:"product-price",p:"値段",m:20}].forEach(function(a){var i=el("input",a.c);i.placeholder=a.p;i.maxLength=a.m;i.setAttribute("aria-label",a.p);row.append(i);});var x=el("button","remove-row","×");x.type="button";x.setAttribute("aria-label","この商品の行を消す");x.onclick=function(){row.remove();};row.append(x);return row;}
  function resetProducts(){$("products").innerHTML="";$("products").append(productRow());}
  $("addProduct").onclick=function(){if($("products").children.length<8)$("products").append(productRow());};resetProducts();
  function products(){return[].slice.call(document.querySelectorAll(".product-row")).map(function(r){return{name:r.querySelector(".product-name").value.trim(),size:r.querySelector(".product-size").value.trim(),price:r.querySelector(".product-price").value.trim()};}).filter(function(x){return x.name||x.size||x.price;});}
  function showErr(s){$("formErr").textContent=s;$("formErr").hidden=!s;if(s)$("formErr").scrollIntoView({block:"center"});}
  function collect(){var cs=vals("contact");return{formats:val("format")?[val("format")]:[],sides:val("sides"),backNote:$("backNote").value.trim(),uses:vals("use"),kind:val("kind"),kindOther:$("kindOther").value.trim(),shop:$("shop").value,photos:photos,heroPhoto:heroPhoto,noPhoto:$("noPhoto").checked,headline:$("headline").value.trim(),details:$("details").value.trim(),products:products(),hidePrices:$("hidePrices").checked,tax:val("tax"),startDate:$("startDate").value,endDate:$("endDate").value,deadline:$("deadline").value,time:$("time").value.trim(),contacts:{phone:cs.indexOf("phone")>=0,hours:cs.indexOf("hours")>=0,location:cs.indexOf("location")>=0},mood:val("mood"),season:$("season").value,color:$("color").value.trim(),requiredText:$("requiredText").value.trim(),bannedText:$("bannedText").value.trim(),wantedDate:$("wantedDate").value,when:$("wantedDate").value,consentShop:$("consentShop").checked,consentPeople:$("consentPeople").checked,consentDetails:$("consentDetails").checked};}
  $("form").onsubmit=function(e){e.preventDefault();var data=collect(),bad=R.checkSubmit(data,today,[]);if(bad)return showErr(bad);showErr("");$("send").disabled=true;$("send").textContent="送っています…";api("submit",data).then(function(r){if(!r.ok)return showErr(r.error);showQuota(r.quota);$("form").hidden=true;$("done").hidden=false;$("done").innerHTML="";var a=el("button","btn wide","案を確認する"),n=el("button","btn line wide","もう1件入れる");a.type=n.type="button";a.onclick=function(){tab("check");};n.onclick=reset;$("done").append(el("div","tick","✓"),el("h2","","受け付けました"),el("p","","受付番号 "+r.id+"。2〜3営業日を目安に案A・案Bを作り、メールでお知らせします。"),a,n);scrollTo({top:0,behavior:"instant"});}).catch(function(){showErr(NET);}).finally(function(){$("send").disabled=false;$("send").textContent="この材料で制作を頼む";});};
  function reset(){$("form").reset();photos=[];heroPhoto=0;drawThumbs();resetProducts();showErr("");$("headlineCount").textContent="0 / 20";$("detailsCount").textContent="0 / 60";$("form").hidden=false;$("done").hidden=true;setWhen();scrollTo({top:0,behavior:"instant"});}

  var STATE={"受付":"案を制作しています","直し依頼":"直しています","承認済み":"✓ 決定済み","下書きあり":"確認をお願いします"},imgs={};
  function loadImage(id,at,im){var key=id+":"+at;(imgs[key]=imgs[key]||api("image",{id:id,version:at})).then(function(r){if(r.ok)im.src=r.image;else{delete imgs[key];im.alt=r.error;}}).catch(function(){delete imgs[key];im.alt=NET;});}
  function flyer(v,id,at){var wrap=el("div","flyer-wrap"),im=new Image();im.className="flyer";im.alt=(v.label||"案")+"のチラシ";if(v.image)im.src=v.image;else loadImage(id,at,im);wrap.append(im);return wrap;}
  function loadList(){var list=$("list");list.textContent="読み込み中…";api("list").then(function(r){if(!r.ok){list.textContent=r.error;return;}showQuota(r.quota);list.innerHTML="";var wait=r.items.filter(function(x){return x.state==="下書きあり";}).length;$("badge").textContent=wait;$("badge").hidden=!wait;if(!r.items.length){list.append(el("p","lead","まだありません。"));return;}r.items.forEach(function(x){list.append(card(x));});}).catch(function(){list.textContent=NET;});}
  function card(x){var c=el("article","card"),vs=x.versions||[],top=el("div","card-top");top.append(el("span","st"+(x.state==="承認済み"?" ok":x.state==="下書きあり"?" wait":""),STATE[x.state]||x.state),el("span","hint","受け取り希望 "+String(x.wantedDate||x.when||"").replace(/-/g,"/")));c.append(top,el("h2","card-title",x.shop+"　"+(x.headline||x.kind||"")));if(!vs.length){c.append(el("p","memo","案を制作しています。"));return c;}var at=viewing[x.id];if(at===-1)at=vs.length-1;if(at==null||at<0||at>=vs.length)at=0;if(x.state==="承認済み"&&x.approvedVersion!=null)at=x.approvedVersion;
    function draw(){viewing[x.id]=at;var old=c.querySelector(".card-body");if(old)old.remove();c.append(body());}
    function body(){var b=el("div","card-body"),v=vs[at],sw=el("div","vers"),prev=el("button","vbtn","‹ 前の案"),next=el("button","vbtn","次の案 ›"),label=v.label||("案"+String.fromCharCode(65+at));prev.type=next.type="button";prev.disabled=at===0;next.disabled=at===vs.length-1;prev.onclick=function(){at--;draw();};next.onclick=function(){at++;draw();};sw.append(prev,el("b","vnow",label+"（"+(at+1)+" / "+vs.length+"）"),next);b.append(sw);if(v.note)b.append(el("p","was","この修正で頼んだこと："+v.note));b.append(flyer(v,x.id,at));if(x.state==="承認済み"){b.append(el("p","delivery","✓ この案で決まりました。印刷用PDFと画像（HP用）をお渡しします。"));return b;}if(x.state==="下書きあり"){var ok=el("button","btn wide big","✓ この案で決定する");ok.type="button";ok.onclick=function(){if(confirm(label+"で決定します。よろしいですか？"))act("approve",{id:x.id,version:at});};b.append(ok);var left=R.MAX_REVISIONS-(+x.revisions||0);if(left>0){var re=el("button","btn line wide","直してほしい所を書く（あと"+left+"回）");re.type="button";re.onclick=function(){re.hidden=true;ok.hidden=true;b.append(reviseForm(x,at,function(){re.hidden=false;ok.hidden=false;}));};b.append(re);}else b.append(el("p","hint center","作り直しは3回まで済みました。続きはメールでご相談ください。"));}return b;}
    c.append(body());return c;
  }
  function reviseForm(x,at,cancel){var w=el("div","revise"),l=el("label","","直してほしい所"),t=el("textarea"),s=el("button","btn wide","この内容で頼む"),n=el("button","btn line wide","やめる"),id="note-"+x.id;l.htmlFor=id;t.id=id;t.rows=3;t.maxLength=500;t.placeholder="例：見出しを大きく。写真をもう少し明るく。";s.type=n.type="button";s.onclick=function(){viewing[x.id]=-1;act("revise",{id:x.id,note:t.value,version:at});};/* 11/24 頼んだ後は、できた修正版（いちばん後ろ）を見せる */n.onclick=function(){w.remove();cancel();};w.append(l,t,s,n);return w;}
  function act(action,data){api(action,data).then(function(r){if(!r.ok)alert(r.error);loadList();}).catch(function(){alert(NET);});}

  function setWhen(){var s=R.ymd(R.earliest(today));$("wantedDate").min=s;$("wantedDate").value="";$("whenHelp").textContent=s.replace(/-/g,"/")+" 以降を選べます（"+R.LEAD_DAYS+"営業日あと）。";}
  $("after").textContent="受付後、2〜3営業日を目安に案A・案Bをお送りします。";setWhen();
  function refreshBadge(){api("list").then(function(r){if(r.ok){var w=r.items.filter(function(x){return x.state==="下書きあり";}).length;$("badge").textContent=w;$("badge").hidden=!w;}});}
  function start(first){$("login").hidden=true;$("app").hidden=false;if(first&&first.ok)showQuota(first.quota);else api("status").then(function(r){if(r.ok)showQuota(r.quota);});if(!demo)rememberUi();if(wantCheck)tab("check");else refreshBadge();}
  var wantCheck=/(?:^#|&)check(?:&|$)/.test(location.hash);if(demo){$("demoBand").hidden=false;start();return;}
  var keyInUrl=/(?:^#|&)k=([^&]*)/.exec(location.hash),fromUrl=false,candidate="";
  if(keyInUrl){try{history.replaceState(null,"",location.pathname+location.search+(wantCheck?"#check":""));}catch(e){}try{candidate=decodeURIComponent(keyInUrl[1]||"");}catch(e){candidate="";}fromUrl=true;}else candidate=savedKey();
  function showLoginError(text){$("login").hidden=false;$("loginErr").textContent=text;$("loginErr").hidden=false;}
  if(KEY_RE.test(candidate)){pass=candidate;api("status").then(function(r){if(r.ok&&r.role==="admin"){pass="";showLoginError("この鍵はここでは使えません。");return;}if(r.ok){if(fromUrl&&savedKey()&&savedKey()!==candidate)forgetKey();start(r);return;}pass="";if(r.auth===false){forgetKey();showLoginError("このアドレスは使えなくなっています。ひなが堂にお問い合わせください。");}else showLoginError(r.error||"うまくいきませんでした。少し待ってもう一度お試しください。");}).catch(function(){pass="";showLoginError(NET);});}else if(keyInUrl)showLoginError("このアドレスは正しくありません。お渡しした専用のアドレスをそのまま開いてください。");else $("login").hidden=false;
  $("loginForm").onsubmit=function(e){e.preventDefault();$("loginErr").hidden=true;var typed=$("pass").value.trim();if(!KEY_RE.test(typed)){$("loginErr").textContent="鍵が違います。お渡しした専用のアドレスから開いてください。";$("loginErr").hidden=false;return;}pass=typed;api("status").then(function(r){if(!r.ok){$("loginErr").textContent=r.error;$("loginErr").hidden=false;pass="";return;}if(r.role==="admin"){$("loginErr").textContent="この鍵はここでは使えません。";$("loginErr").hidden=false;pass="";return;}$("pass").value="";start(r);}).catch(function(){$("loginErr").textContent=NET;$("loginErr").hidden=false;});};
})();
