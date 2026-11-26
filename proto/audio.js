/* ---------- v56 : système sonore complet ----------
   Un seul moteur (le contexte audio et les bus existants), un seul catalogue (assets/audio/, dérivés MP3 dans web/),
   une seule file de présentation pour les voix et les réponses des unités.
   Le son ne lit jamais truth, ne crée ni capacité, ni indice, ni résultat : il suit des événements que le joueur connaît
   (fxEv, sfx, ordres) et son propre hasard (Math.random). Sans fichier chargé, les sons synthétisés d'origine servent de repli. */
const AUDLIB=__AUDLIB__;
var AUD={on:false,buf:{},ld:{},bus:{},amb:{},q:[],cur:null,busy:0,log:[],ev:0,cmd:0,cool:{},n:{},mem:{seen:new Set(),last:new Map(),selAt:-1e9,vr:new Map()},selPend:null,supClick:-9,rcptAt:-9,ordPend:0,grp:null,act:null,game:null,crSeen:new Set(),simQ:[],tk:0,ttsL:[],subT:0,load:0,
 master:.65,db:{ambience:-13,music:-17,ui:-5,sonar:-4,comms:-3,alerts:-3,weapons:-9},duck:{ambience:-6,music:-10,weapons:-5,atk:.07,rel:.65},cd:{ui_select:.08,ui_order_ack:.3,ui_unavailable:.3,classification_update:2,crisis_attention:3,crisis_critical:10,sonar_emit:.35,sonar_contact:.6,impact_observed:.5,unit_damage:1,missile_launch:.25,torpedo_release:.5,comms_degraded:4,mission_resolved:20},max:{sonar:3,weapons:4},
 pri:{crit:100,alert:80,report:60,receipt:40,sonar:35,weapon:30,sel:10},
 set:{master:1,ambience:1,music:1,ui:1,sonar:1,comms:1,alerts:1,weapons:1,voice:'auto',tts:0,sub:'auto',mono:0,comfort:0,hidden:'fade',detail:0}};
try{const s=JSON.parse(localStorage.getItem('seuil.aud')||'null');if(s&&typeof s==='object')Object.keys(AUD.set).forEach(k=>{if(typeof s[k]===typeof AUD.set[k])AUD.set[k]=s[k]})}catch(_){}
const audNow=()=>performance.now()/1000,audLin=k=>Math.pow(10,AUD.db[k]/20)*AUD.set[k]*(AUD.set.comfort&&(k==='alerts'||k==='weapons')?.7:1)*((k==='ambience'||k==='music')&&sndMode!==0?0:1),audMaster=()=>AUD.master*AUD.set.master,audEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const audBase=()=>window.__audBase!==undefined?window.__audBase:(/\/proto\/[^\/]*$/.test(location.pathname)?'../':'')+'assets/audio/web/';
function audLogP(o){if(!window.__audLog)return;o.t=+audNow().toFixed(3);o.st=S?+S.t.toFixed(2):0;AUD.log.push(o);if(AUD.log.length>600)AUD.log.shift()}
function audLog(){return AUD.log}
const audBeds=()=>AUD.on&&!!AUD.amb.amb_ops_room;
/* bus : ambiances, musique, interface, sonar, voix, alertes, armes. Les gains de départ sont ceux du contrat de mixage, à régler à l'écoute. */
function audInit(){if(AUD.on||!ac||!master||AUD.fail)return;try{const cf=AUD.cf=ac.createBiquadFilter();cf.type='lowpass';cf.frequency.value=AUD.set.comfort?4200:20000;cf.connect(master);
  const mk=(k,to)=>{const d=ac.createGain(),g=ac.createGain();g.gain.value=audLin(k);d.connect(g);g.connect(to);AUD.bus[k]={in:d,g}};mk('ambience',bedLP);mk('music',duckG);mk('ui',cf);mk('sonar',cf);mk('comms',master);mk('alerts',cf);mk('weapons',cf);
  AUD.on=true;audApply();audLoad();if(window.speechSynthesis){const up=()=>{try{AUD.ttsL=[...new Set(speechSynthesis.getVoices().map(v=>(v.lang||'').slice(0,2).toLowerCase()))]}catch(_){AUD.ttsL=[]}};up();try{speechSynthesis.addEventListener('voiceschanged',up)}catch(_){}}}catch(_){AUD.fail=true}}
function audApply(){if(!AUD.on)return;const n=ac.currentTime;Object.keys(AUD.bus).forEach(k=>AUD.bus[k].g.gain.setTargetAtTime(audLin(k),n,.08));AUD.cf.frequency.setTargetAtTime(AUD.set.comfort?4200:20000,n,.1);if(!muted)master.gain.setTargetAtTime(audMaster(),n,.08);
 if(typeof sndOut!=='undefined'&&sndOut){try{sndOut.channelCountMode=AUD.set.mono?'explicit':'max';sndOut.channelCount=AUD.set.mono?1:2}catch(_){}}}
function audSave(){try{localStorage.setItem('seuil.aud',JSON.stringify(AUD.set))}catch(_){}}
function audSet(v){const i=String(v).indexOf(':'),k=String(v).slice(0,i),x=String(v).slice(i+1),s=AUD.set;if(!(k in s))return;if(typeof s[k]==='number'&&['mono','comfort','tts','detail'].includes(k))s[k]=x==='1'?1:0;else if(typeof s[k]==='number')s[k]=clamp(+x||0,0,1);else if({voice:['auto','en','off'],sub:['auto','fr','en','off'],hidden:['fade','keep']}[k].includes(x))s[k]=x;audSave();audApply();if(k==='sub'&&x==='off')audSubHide();if(typeof MENU!=='undefined'&&MENU&&(typeof s[k]!=='number'||['mono','comfort','tts','detail'].includes(k)))renderMenu()}
/* chargement : après une interaction, les signaux essentiels d'abord, puis les fonds, puis les signatures ; les voix à la demande */
function audFetch(rel){if(AUD.ld[rel])return AUD.ld[rel];if(location.protocol==='file:'&&window.__audBase===undefined)return AUD.ld[rel]=Promise.resolve(null);/* page ouverte depuis le disque : pas de chargement possible, les sons synthétisés servent de repli */return AUD.ld[rel]=fetch(audBase()+rel).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>ac.decodeAudioData(b)).catch(()=>{audLogP({k:'miss',id:rel});return null})}
async function audLoad(){const E=Object.keys(AUDLIB.env),first=E.filter(k=>!AUDLIB.env[k][2]),loops=E.filter(k=>AUDLIB.env[k][2]);
 for(const k of first.concat(['command_pending','command_rejected'])){const b=await audFetch((AUDLIB.env[k]?'env/':'sfx/')+k+'.mp3');if(b)AUD.buf[k]=b}AUD.load=1;
 for(const k of loops){const b=await audFetch('env/'+k+'.mp3');if(b&&!AUD.amb[k]){try{const s=ac.createBufferSource();s.buffer=sndLoopBuf(b);s.loop=true;const g=ac.createGain();g.gain.value=0;s.connect(g);g.connect(AUD.bus[AUDLIB.env[k][0]].in);s.start(0,Math.random()*4);AUD.amb[k]=g}catch(_){}}}AUD.load=2;
 for(const k of AUDLIB.sfx){if(AUD.buf[k])continue;const b=await audFetch('sfx/'+k+'.mp3');if(b)AUD.buf[k]=b}AUD.load=3}
/* lecture d'un son bref : bus, délai minimal en temps d'écoute, nombre de sources borné */
function audPlay(id,o){o=o||{};const bus=o.bus||(AUDLIB.env[id]?AUDLIB.env[id][0]:'ui'),now=audNow(),cd=(AUD.cd[id]||0)*(AUD.set.comfort&&bus!=='ui'?2:1);
 if(!AUD.on||muted){return false}if(now<(AUD.cool[id]||0)){audLogP({k:'sup',id,why:'cooldown'});return true}const b=AUD.buf[id];if(!b){audLogP({k:'nobuf',id});return false}
 if(AUD.max[bus]&&(AUD.n[bus]||0)>=AUD.max[bus]){audLogP({k:'sup',id,why:'max'});return true}AUD.cool[id]=now+cd;
 try{const s=ac.createBufferSource(),g=ac.createGain();s.buffer=b;g.gain.value=o.g==null?1:o.g;s.connect(g);let out=g;if(o.pan&&ac.createStereoPanner&&!AUD.set.mono){const p=ac.createStereoPanner();p.pan.value=clamp(o.pan,-.7,.7);g.connect(p);out=p}out.connect(AUD.bus[bus].in);AUD.n[bus]=(AUD.n[bus]||0)+1;s.onended=()=>{AUD.n[bus]=Math.max(0,(AUD.n[bus]||1)-1);try{out.disconnect();g.disconnect()}catch(_){}};s.start(ac.currentTime+(o.at||0));audLogP({k:'play',id,bus,ex:o.ex?1:0});return true}catch(_){return false}}
/* position connue → léger panoramique ; les alertes générales restent centrées */
const audPan=o=>o&&o.x!==undefined&&typeof cam!=='undefined'?clamp((o.x-cam.x)*cam.z/Math.max(300,window.innerWidth*.5),-.6,.6):0;
function audDuck(on){if(!AUD.on)return;const n=ac.currentTime,D=AUD.duck,f=k=>AUD.bus[k].in.gain.setTargetAtTime(on?Math.pow(10,D[k]/20):1,n,(on?D.atk:D.rel)/3);f('ambience');f('music');f('weapons')}
/* sous-titres : le texte réellement présenté, dans la langue choisie */
const audSubL=()=>AUD.set.sub==='auto'?LANG:AUD.set.sub;
function audSub(who,txt,cls,dur){if(AUD.set.sub==='off'||!txt)return;const e=$('subt');if(!e)return;e.className=cls||'';e.innerHTML=(who?`<b>${audEsc(who)}</b>`:'')+audEsc(txt);e.hidden=false;AUD.subT=audNow()+(dur||2.4);audLogP({k:'sub',id:txt,who:who||''})}
function audSubHide(){const e=$('subt');if(e&&!e.hidden)e.hidden=true;AUD.subT=0}
/* file commune : une voix à la fois, deux messages en attente au plus, priorités, péremption, revalidation avant lecture */
function audEnq(it){if(!AUD.on)return;it.exp=audNow()+(it.life||6);if(it.pri>=AUD.pri.alert){AUD.q=AUD.q.filter(x=>x.kind!=='sel');if(AUD.cur&&AUD.cur.kind==='sel'){audLogP({k:'cut',id:AUD.cur.id,why:'alerte prioritaire'});try{if(AUD.src)AUD.src.stop()}catch(_){}try{window.speechSynthesis&&speechSynthesis.cancel()}catch(_){}AUD.busy=audNow()}}if(it.kind==='sel')AUD.q=AUD.q.filter(x=>x.kind!=='sel');if(it.key){if(AUD.q.some(x=>x.key===it.key)||(AUD.cur&&AUD.cur.key===it.key))return;}
 AUD.q.push(it);AUD.q.sort((a,b)=>b.pri-a.pri);while(AUD.q.length>2){const d=AUD.q.pop();audLogP({k:'drop',id:d.id,why:'file pleine'})}audLogP({k:'q',id:it.id,pri:it.pri})}
function audText(it){const L=audSubL()==='off'?LANG:audSubL();return typeof it.text==='function'?it.text(L):it.text?it.text[L==='en'?1:0]:''}
function audNext(){const now=audNow();if(AUD.subT&&now>AUD.subT)audSubHide();if(AUD.cur&&now>=AUD.busy){AUD.cur=null;audDuck(false)}if(AUD.cur||!AUD.q.length)return;
 const it=AUD.q.shift();if(now>it.exp){audLogP({k:'drop',id:it.id,why:'périmé'});return}if(it.valid&&!it.valid()){audLogP({k:'drop',id:it.id,why:'plus valable'});return}
 let dur=0;const s=AUD.set,vl=s.voice==='en'?'en':LANG,ph=it.ph&&AUDLIB.ph[it.ph],hasFile=!!ph&&s.voice!=='off'&&sndMode===0&&(vl==='en'?ph[2]:ph[3])/* mode « effets » : signatures et sous-titres, sans voix */,txtV=ph?ph[vl==='en'?1:0]:(it.text?it.text[vl==='en'?1:0]:'');
 if(it.sfx&&!audPlay(it.sfx,{bus:it.sbus||'ui',pan:it.pan,ex:it.ex}))if(it.fb)it.fb();dur=it.sfx?.25:0;let spoke='';
 if(hasFile&&!it.offline){const rel='vo/'+vl+'/'+it.ph+'.mp3',b=AUD.buf[rel];if(b){try{const src=ac.createBufferSource(),g=ac.createGain();src.buffer=b;src.connect(g);g.connect(AUD.bus.comms.in);src.start(ac.currentTime+dur);AUD.src=src;audDuck(true);dur+=b.duration+.15;spoke='file:'+vl}catch(_){}}else audFetch(rel).then(x=>{if(x)AUD.buf[rel]=x})}
 else if(!it.offline&&s.voice!=='off'&&s.tts&&txtV&&window.speechSynthesis&&AUD.ttsL.includes(vl)&&sndMode===0){try{const u=new SpeechSynthesisUtterance(txtV);u.lang=vl==='en'?'en-US':'fr-FR';u.volume=clamp(AUD.master*s.master*s.comms*1.2);u.rate=1.05;speechSynthesis.cancel();speechSynthesis.speak(u);dur+=Math.max(1.2,txtV.length*.07);spoke='tts:'+vl;audDuck(true)}catch(_){}}
 const tx=it.offline?(audSubL()==='en'?'Unit selected. Last report available.':'Unité sélectionnée. Dernier rapport disponible.'):audText(it);audSub(it.who,tx,it.cls,Math.max(2.2,dur+.6));AUD.cur=it;AUD.busy=now+Math.max(dur,it.kind==='sel'?.5:.9);audLogP({k:'say',id:it.id,ph:it.ph||'',sfx:it.sfx||'',spoke,txt:tx,pri:it.pri})}
/* ----- réponses des unités : résolveur du pack, porté tel quel pour la page ----- */
function audProfile(u){if(!u)return null;if(S.hc&&(u===S.convoy||u.hcs))return'humanitarian';const T=UT[u.type];if(!T||!S.units.includes(u))return null;if(u.grpL)return'task_group';if(T.sub)return'submarine';if(u.type==='helo')return u.kind==='mq8'?'drone':'helicopter';
 return{recon:'maritime_patrol',fighter:'fighter',drone:'drone',armed:'drone',sof:'special_forces',guard:'ground',battery:'ground',team:'cyber',analysis:'support',comm:'support',repair:'support'}[u.type]||(T.naval?((T.def||T.ssm)?'surface':'support'):'support')}
function audResolve(ev){const M=AUD.mem,now=audNow(),pid=ev.group?'task_group':audProfile(ev.u),P=pid&&AUDLIB.profiles[pid];if(!P)return null;const st=['queued','rejected','busy','cancelled'].includes(ev.kind);
 if(ev.kind==='accepted'&&(!ev.cid||ev.stage!=='unit_received'))return null;if(ev.kind!=='selection'&&!ev.cid)return null;const key=ev.kind==='selection'?'selection:'+ev.id:'order:'+ev.cid+':'+ev.kind;if(M.seen.has(key))return null;
 if(ev.kind==='selection'){if(now-(M.last.get(ev.u.id)||-1e9)<5||now-M.selAt<.7)return null}
 const det=ev.kind==='accepted'&&AUD.set.detail&&AUDLIB.ord[ev.type],list=st?['status.'+ev.kind]:ev.kind==='selection'?P.sel:det||P.acc,rk=pid+':'+ev.kind+':'+(det?ev.type:''),i=M.vr.get(rk)||0,ph=list[i%list.length],sl=ev.kind==='selection'?P.ss:P.as,sfx=st?AUDLIB.st[ev.kind]:sl[i%sl.length];
 M.seen.add(key);if(M.seen.size>2048)M.seen.delete(M.seen.values().next().value);M.vr.set(rk,i+1);if(ev.kind==='selection'){M.last.set(ev.u.id,now);M.selAt=now}
 return{id:key,ph,sfx,who:st||det?t('aud.cc'):(ev.u.id||ev.u.name||''),pri:ev.kind==='selection'?AUD.pri.sel:st?25:AUD.pri.receipt,life:ev.kind==='selection'?1.2:5,kind:ev.kind==='selection'?'sel':'ord',text:AUDLIB.ph[ph],key,offline:ev.kind==='selection'&&!!S.svc&&!!S.svc.c2&&svcDown('c2')}}
/* sélection explicite (clic, toucher, clavier) : jamais au survol ni au rendu. Une unité adverse ou inconnue ne répond pas. */
function audSel(){AUD.selPend=null;const u=S&&S.sel;if(!AUD.on||!u||!S||HOME||S.over||!audProfile(u))return;const now=audNow(),M=AUD.mem;if(AUD.q.some(x=>x.pri>=AUD.pri.alert)||(AUD.cur&&AUD.cur.pri>=AUD.pri.alert))return;if(now-(M.last.get(u.id)||-1e9)<5||now-M.selAt<.7)return;AUD.selPend={u,at:now+.12,id:++AUD.ev};AUD.supClick=now;audPre(audProfile(u))}
/* voix d'un profil : chargées à la première sélection, seulement si une voix enregistrée existe dans la langue demandée */
function audPre(pid){const P=AUDLIB.profiles[pid],vl=AUD.set.voice==='en'?'en':LANG;if(!P||AUD.set.voice==='off'||vl!=='en')return;P.sel.concat(P.acc).forEach(ph=>{const rel='vo/en/'+ph+'.mp3';if(!AUD.buf[rel]&&!AUD.ld[rel])audFetch(rel).then(b=>{if(b)AUD.buf[rel]=b})})}
/* ordres : la demande, la validation locale, l'attente, la réception par l'unité et le résultat sont des phases distinctes */
function audCmd(){return ++AUD.cmd}
function audOrder(u,type,stage,cid){if(!AUD.on){if(typeof window!=='undefined'&&S&&S.demoT===undefined)sfx('order');return}if(!S||HOME||S.demoT!==undefined||!u)return;cid=cid||audCmd();if(AUD.act)AUD.act.n++;
 if(AUD.grp){AUD.grp.n++;AUD.grp.u=AUD.grp.u||u;AUD.grp.type=type;if(stage==='queued')AUD.grp.q=1;return}/* un groupe répond une fois : les accusés des membres sont retenus */
 if(stage==='local'){AUD.ordPend=audNow()+.09;return}const ev={u,type,cid,stage,kind:stage==='unit_received'?'accepted':stage==='queued'?'queued':stage==='rejected'?'rejected':'accepted'},r=audResolve(ev);if(!r)return;
 if(stage==='unit_received'){AUD.rcptAt=audNow();AUD.ordPend=0}r.valid=()=>!S.over&&(!UT[u.type]||S.units.includes(u));r.fb=()=>{tone(660,.07,.08);tone(990,.12,.08,'sine',.07)};audEnq(r)}
function audGB(){AUD.grp={n:0,u:null,q:0,cid:audCmd()}}
function audGE(){const g=AUD.grp;AUD.grp=null;if(!g||!g.n||!AUD.on)return;const r=audResolve({u:g.u,group:g.n>1,type:g.type,cid:g.cid,stage:'unit_received',kind:g.q?'queued':'accepted'});if(r){AUD.rcptAt=audNow();AUD.ordPend=0;audEnq(r)}}
function domOrder(d,k){audGB();try{return domOrder0(d,k)}finally{audGE()}}
const AUD_ACT=[[/^(ping|pingp|dip|sonar)/,'sonar'],[/^(torpu|kill|fire|fu:|fs:|salvo)/,'engage'],[/^(follow|seek|visual|eye|track|drone|recon|flag)/,'observe'],[/^buoy/,'buoy'],[/^(acana|ana|traj|osint|sig)/,'analyze'],[/^(blind|cslow|counter|hunt|isol|jam)/,'cyber'],[/^(board|da|sof|evac|secure|tm)/,'deploy'],[/^(z|dep)/,'depth'],[/^(rtb|recall|helorec)/,'return'],[/^(escort)/,'escort']];
function audActPre(a){if(!AUD.on)return null;return AUD.act={n:0,q:S.queue?S.queue.length:0,cid:audCmd()}}
function audActPost(a,k){if(!k)return;AUD.act=null;if(k.n||!a.unit)return;const u=S.units.find(x=>x.id===a.unit);if(!u)return;const m=AUD_ACT.find(q=>q[0].test(a.id));audOrder(u,m?m[1]:'move',S.queue&&S.queue.length>k.q?'queued':'unit_received',k.cid)}
function audReject(a){if(!AUD.on||!S||HOME)return;if(!audPlay('ui_unavailable'))return;audSub(t('aud.cc'),a.why||t('aud.rej'),'al',2.6)}
/* ----- adaptateur des anciens appels sfx(k) : une source ne joue qu'une fois ----- */
function audSfx(k){if(!AUD.on||muted)return false;const now=audNow();if(typeof HOME!=='undefined'&&HOME&&k!=='click')return true;
 if(k==='click'){if(now-AUD.supClick<.2){audLogP({k:'sup',id:'ui_select',why:'signature de sélection'});return true}return audPlay('ui_select')}
 if(k==='order'){if(now-AUD.rcptAt<.3||AUD.grp){audLogP({k:'sup',id:'ui_order_ack',why:'accusé de l’unité'});return true}if(!AUD.buf.ui_order_ack)return false;AUD.ordPend=now+.09;return true}
 if(k==='bad')return audPlay('ui_unavailable');if(k==='alarm'||k==='alarmS')return audPlay('crisis_attention');if(k==='crit')return audPlay('crisis_critical');if(k==='dmg')return audPlay('unit_damage');if(k==='impact')return audPlay('impact_observed');return false}
/* comptes rendus de mission : scripts non enregistrés, donc sous-titre (et voix de l'appareil si choisie) */
function audReport(id,o){o=o||{};const tx=AUDLIB.radio[id];if(!tx)return;audEnq({id:'radio:'+id+':'+(o.key||''),key:o.key?'radio:'+id+':'+o.key:null,text:tx,who:o.who||t('aud.cc'),pri:o.pri||AUD.pri.report,life:o.life||6,kind:'rep',cls:o.cls||'',valid:o.valid,sfx:o.sfx,sbus:o.sbus,pan:o.pan})}
/* ----- événements connus du joueur, émis par le moteur (fxEv) ----- */
function audFx(k,d){if(!AUD.on||!S||HOME||S.over&&k!=='end')return;const P=AUD.pri;
 if(k==='fire'){audPlay('missile_launch',{pan:audPan(d.u)});return}
 if(k==='efire'){audPlay('missile_launch',{pan:audPan(d.s),g:.8});audReport('missile_launch',{pri:P.weapon,key:'ef'+Math.floor(S.t/5)});return}
 if(k==='icp'){if(dist(d.u,d.m)>=V3D.gun)audPlay('missile_launch',{pan:audPan(d.u),g:.45});return}
 if(k==='torp'){const T=d.T;if(AUD.crSeen.has('T'+T.pid))return;AUD.crSeen.add('T'+T.pid);audPlay('torpedo_release',{pan:audPan(d.u)});audReport('torpedo_release',{pri:P.weapon,key:T.pid,who:d.u.id});return}
 if(k==='torpEnd'){if(d.out==='hit'||d.out==='wrong')audPlay('impact_observed',{pan:audPan({x:d.T.tx})});else audReport('result_unconfirmed',{pri:P.weapon,key:d.T.pid});return}
 if(k==='trk'){if(d.st==='arr'&&d.o&&d.o.side==='b')audPlay('impact_observed',{pan:audPan(d.o),g:.8});return}
 if(k==='hit'){audReport('damage',{pri:P.alert,key:'h'+d.u.id+Math.floor(S.t/4),who:d.u.id,cls:'cr'});return}
 if(k==='ping'){audPlay('sonar_emit',{pan:audPan(d.u)});if(d.echo)audPlay('sonar_contact',{at:.9,pan:audPan(d.u)});return}
 if(k==='bping'){const n=audNow();if(n<(AUD.bp||0))return;AUD.bp=n+(AUD.set.comfort?4:1.2);audPlay('sonar_emit',{pan:audPan(d.b),g:.35});return}
 if(k==='echo'){audPlay('sonar_contact');audReport('contact_unknown',{pri:P.sonar,key:'e'+d.c.id,valid:()=>!d.c.closed&&!(d.c.cls&&d.c.cls.h)});return}
 if(k==='cls'){const f=d.f,h=d.h;audPlay('classification_update');const sub=f.type==='sub',host=sub?(h==='sousmarin'&&typeof dtAff==='function'&&dtAff(f)==='hostile'):['rouge','raider','leurre'].includes(h),neu=sub?(h==='bio'||h==='epave'):h==='civil';
  if(host||neu)audReport(host?'classified_hostile':'classified_neutral',{pri:P.report,key:'c'+f.id+h,valid:()=>!!f.cls&&f.cls.h===h&&!f.closed});return}
 if(k==='trkLost'){audReport('track_lost',{pri:P.sonar,key:'l'+d.c.id+Math.floor(S.t/10),valid:()=>!d.c.closed&&d.c.trkSt==='lost'});return}
 if(k==='helo'){audOrder(d.p,'deploy','unit_received');const h=d.h;AUD.simQ.push({at:S.t+(h.dep>S.t?h.dep-S.t:3),g:S,fn:()=>{if(S.units.includes(h)&&!h.recov)audReport('helicopter_airborne',{who:h.id,key:'ha'+h.id+Math.round(h.born||0),pri:P.report})}});return}
 if(k==='crisis'){const c=d.c;if(c.silent||AUD.crSeen.has(c.id))return;AUD.crSeen.add(c.id);const hum=c.type==='hcloss';audPlay(hum?'crisis_critical':'crisis_attention');audReport(hum?'humanitarian_crisis':'new_crisis',{pri:hum?P.crit:P.alert,key:'k'+c.id,cls:hum?'cr':'al',valid:()=>!c.closed});return}
 if(k==='svc'){audPlay('comms_degraded');audReport('comms_degraded',{pri:P.alert,key:'s'+d.k+Math.floor(S.t/20),cls:'al'});return}
 if(k==='end'){let w=false;try{w=score().ok}catch(_){}const ok=w&&!(S.hc&&S.hc.lostIds&&S.hc.lostIds.length)&&!(S.falseEng>0)&&!(S.torpBad>0);AUD.q.length=0;if(ok){audPlay('mission_resolved');audReport('resolved',{pri:P.report,key:'end'})}}}
/* une fois par image : fonds selon l'état connu, file, sélection stabilisée, accusé d'interface différé */
function audTick(real){if(!ac)return;if(!AUD.on){audInit();if(!AUD.on)return}const now=audNow();
 if(S&&AUD.game!==S){AUD.game=S;AUD.crSeen=new Set((S.crises||[]).map(c=>c.id).concat((S.torps||[]).map(T=>'T'+T.pid)));AUD.simQ.length=0;AUD.q.length=0;AUD.selPend=null;AUD.ordPend=0}/* nouvelle partie ou sauvegarde chargée : rien de l'historique n'est rejoué */
 if(AUD.selPend&&now>=AUD.selPend.at){const p=AUD.selPend;AUD.selPend=null;if(S&&S.sel===p.u&&!S.over){const r=audResolve({kind:'selection',u:p.u,id:p.id});if(r){r.valid=()=>S.sel===p.u;r.pan=audPan(p.u);audEnq(r)}}}
 if(AUD.ordPend&&now>=AUD.ordPend){AUD.ordPend=0;if(now-AUD.rcptAt>=.3)audPlay('ui_order_ack')}
 if(S&&S.running&&!HOME&&AUD.simQ.length)AUD.simQ=AUD.simQ.filter(q=>{if(q.g!==S)return false;if(S.t>=q.at){try{q.fn()}catch(_){}return false}return true});
 audNext();if(now<AUD.tk)return;AUD.tk=now+.25;
 const st=sndState(),n=ac.currentTime,T=(k,v,tc)=>{const g=AUD.amb[k];if(g)g.gain.setTargetAtTime(v,n,tc||1.2)},i=(st==='run'||st==='pause')?sndLoad01():0,sel=S&&S.sel,asw=!!sel&&(st==='run'||st==='pause')&&((sel.type==='sub'&&!!sel.title)||(UT[sel.type]&&(UT[sel.type].sub||sel.type==='helo'||sel.type==='recon'||(typeof pingR==='function'&&S.units.includes(sel)&&pingR(sel)>0)))),v3=typeof V3D!=='undefined'&&V3D.on,p=st==='pause'?.45:1;
 const M={home:[.8,0,0,.12],brief:[.8,0,0,.18],run:[.6,v3?.6:.32,0,.04+.8*i*i],pause:[.6,.2,0,.04+.5*i*i],end:[.5,0,0,.08]}[st]||[0,0,0,0];
 T('amb_ops_room',M[0]*p*(asw?.75:1));T('amb_open_sea',M[1]*p*(asw?.4:1));T('amb_underwater',asw?.7*p:0,.9);T('amb_tension',M[3],2.5);
 if(AUD.mode!==sndMode){AUD.mode=sndMode;audApply();if(sndMode===2){AUD.q.length=0;try{window.speechSynthesis&&speechSynthesis.cancel()}catch(_){}}}}
/* onglet masqué : atténuer puis suspendre (défaut), ou laisser le son ; au retour, les messages périmés ne sont pas lus */
function audHidden(h){if(!ac)return;if(AUD.set.hidden==='keep'&&AUD.on)return;if(h){try{master.gain.setTargetAtTime(0,ac.currentTime,.1)}catch(_){}setTimeout(()=>{if(document.hidden)ac.suspend().catch(()=>{})},350)}else{ac.resume().catch(()=>{});AUD.q=AUD.q.filter(x=>audNow()<=x.exp);try{master.gain.setTargetAtTime(muted?0:audMaster(),ac.currentTime,.3)}catch(_){}}}
/* « Écouter un exemple » : uniquement de la présentation ; aucun ordre, ping, projectile ni score */
function audExample(){ensureAudio();audInit();if(!AUD.on)return;const P=AUDLIB.profiles.surface,i=AUD.exI=(AUD.exI||0)+1;audPlay('ui_select',{ex:1});audPlay('sonar_emit',{at:1.6,g:.7,ex:1});audPlay('crisis_attention',{at:3.6,ex:1});AUD.q=AUD.q.filter(x=>!x.ex);audEnq({id:'ex'+i,ex:1,ph:P.sel[i%P.sel.length],sfx:P.ss[i%P.ss.length],text:AUDLIB.ph[P.sel[i%P.sel.length]],who:t('aud.ex.who'),pri:AUD.pri.report,life:4,kind:'ex'})}
/* réglages du menu */
function audMenu(){const s=AUD.set,row=(k,opts)=>`<div class="qx-r"><span class="m">${t('aud.'+k)}</span><div class="fl">${opts.map(o=>`<button class="btn ${String(s[k])===String(o)?'on':''}" data-a="audset" data-v="${k}:${o}" aria-pressed="${String(s[k])===String(o)}">${t('aud.'+k+'.'+o)}</button>`).join('')}</div></div>`,
 lv=k=>`<label class="ar"><span>${t('aud.l.'+k)}</span><input type="range" min="0" max="100" step="5" value="${Math.round(s[k]*100)}" data-aud="${k}" aria-label="${t('aud.l.'+k)}"><output>${Math.round(s[k]*100)} %</output></label>`;
 return `<details class="more audm" ${dOpen('audm')}><summary>${t('aud.h')}</summary><div class="audset">${['master','ambience','music','ui','sonar','comms','alerts','weapons'].map(lv).join('')}</div>${row('voice',['auto','en','off'])}${row('tts',[0,1])}${row('sub',['auto','fr','en','off'])}${row('detail',[0,1])}${row('mono',[0,1])}${row('comfort',[0,1])}${row('hidden',['fade','keep'])}<p class="q" style="font-size:12px">${t('aud.note')}</p><button class="btn" data-a="audtest">${t('aud.test')}</button></details>`}
document.addEventListener('input',e=>{const k=e.target&&e.target.dataset&&e.target.dataset.aud;if(!k)return;audSet(k+':'+(+e.target.value/100));const o=e.target.parentNode.querySelector('output');if(o)o.textContent=Math.round(+e.target.value)+' %'});
function audState(){return{on:AUD.on,load:AUD.load,buf:Object.keys(AUD.buf).length,amb:Object.keys(AUD.amb),q:AUD.q.map(x=>x.id),cur:AUD.cur?AUD.cur.id:null,set:Object.assign({},AUD.set),n:Object.assign({},AUD.n),mode:sndMode,ctx:ac?ac.state:'none',gains:AUD.on?Object.fromEntries(Object.keys(AUD.amb).map(k=>[k,+AUD.amb[k].gain.value.toFixed(3)])):{}}}
Object.assign(I18N.fr,{'aud.h':'Réglages du son','aud.l.master':'Volume général','aud.l.ambience':'Ambiances','aud.l.music':'Musique de tension','aud.l.ui':'Interface','aud.l.sonar':'Sonar','aud.l.comms':'Voix et radio','aud.l.alerts':'Alertes','aud.l.weapons':'Armes',
 'aud.voice':'Voix des unités','aud.voice.auto':'Langue du jeu','aud.voice.en':'Anglaises','aud.voice.off':'Aucune','aud.tts':'Voix de l’appareil','aud.tts.0':'Non','aud.tts.1':'Oui','aud.sub':'Sous-titres','aud.sub.auto':'Langue du jeu','aud.sub.fr':'Français','aud.sub.en':'Anglais','aud.sub.off':'Aucun',
 'aud.detail':'Accusés détaillés','aud.detail.0':'Non','aud.detail.1':'Oui','aud.mono':'Mono','aud.mono.0':'Non','aud.mono.1':'Oui','aud.comfort':'Confort d’écoute','aud.comfort.0':'Non','aud.comfort.1':'Oui','aud.hidden':'Onglet masqué','aud.hidden.fade':'Couper le son','aud.hidden.keep':'Garder le son',
 'aud.note':'Les voix enregistrées sont des prototypes de synthèse, en anglais seulement. En français : voix de l’appareil si vous l’activez, sinon signal court et sous-titre. Aucun réglage sonore ne change le jeu.','aud.test':'Écouter un exemple','aud.cc':'Commandement','aud.rej':'Ordre indisponible. Vérifiez les conditions.','aud.ex.who':'Exemple'});
Object.assign(I18N.en,{'aud.h':'Sound settings','aud.l.master':'Master volume','aud.l.ambience':'Ambience','aud.l.music':'Tension music','aud.l.ui':'Interface','aud.l.sonar':'Sonar','aud.l.comms':'Voices and radio','aud.l.alerts':'Alerts','aud.l.weapons':'Weapons',
 'aud.voice':'Unit voices','aud.voice.auto':'Game language','aud.voice.en':'English','aud.voice.off':'None','aud.tts':'Device voice','aud.tts.0':'No','aud.tts.1':'Yes','aud.sub':'Subtitles','aud.sub.auto':'Game language','aud.sub.fr':'French','aud.sub.en':'English','aud.sub.off':'None',
 'aud.detail':'Detailed acknowledgements','aud.detail.0':'No','aud.detail.1':'Yes','aud.mono':'Mono','aud.mono.0':'No','aud.mono.1':'Yes','aud.comfort':'Listening comfort','aud.comfort.0':'No','aud.comfort.1':'Yes','aud.hidden':'Hidden tab','aud.hidden.fade':'Mute','aud.hidden.keep':'Keep sound',
 'aud.note':'Recorded voices are synthetic prototypes, in English only. In French: the device voice if you turn it on, otherwise a short signal and a subtitle. No sound setting changes the game.','aud.test':'Play an example','aud.cc':'Command','aud.rej':'Order unavailable. Check requirements.','aud.ex.who':'Example'});
