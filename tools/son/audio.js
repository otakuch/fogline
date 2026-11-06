/* ---------- son : salle de commandement ----------
   Fonds enregistrés en boucle, événements discrets, mixage piloté par la situation.
   Lit l'état visible (tension, crises ouvertes, pause), jamais la vérité d'une crise.
   Math.random est réservé au son : la reproductibilité du moteur n'est pas touchée.
   Si un fichier manque ou ne se décode pas, le son synthétisé prend le relais. */
const SND=__SND__;
let ac=null,muted=false,master,sndMode=0,sndBuf={},bedBus,bedLP,duckG,fxBus,distBus,revIn,droneG,jamG,beds={},sndT=null,sndNext=0,sndSeen=new Set(),sndGame=null,sndLast={},sndBusy=0,sndPing=-1,sndSub=0;
try{const m=+localStorage.getItem('seuil.snd');if(m===1||m===2){sndMode=m;muted=m===2}}catch(_){}
const sndKey=()=>['sound.on','sound.fx','sound.off'][sndMode];
function sndCycle(){sndMode=(sndMode+1)%3;muted=sndMode===2;try{localStorage.setItem('seuil.snd',String(sndMode))}catch(_){}if(master)master.gain.setTargetAtTime(muted?0:.8,ac.currentTime,.05);if(sndMode===0&&ac)sndNext=ac.currentTime+4}
function ensureAudio(){if(ac){if(ac.state==='suspended'&&!document.hidden)ac.resume().catch(()=>{});return}try{
 ac=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume().catch(()=>{});
 const lim=ac.createDynamicsCompressor();lim.threshold.value=-10;lim.ratio.value=8;lim.attack.value=.004;lim.release.value=.25;lim.connect(ac.destination);
 master=ac.createGain();master.gain.value=muted?0:.8;master.connect(lim);
 duckG=ac.createGain();duckG.connect(master);
 bedLP=ac.createBiquadFilter();bedLP.type='lowpass';bedLP.frequency.value=7000;bedLP.connect(duckG);
 bedBus=ac.createGain();bedBus.gain.value=0;bedBus.connect(bedLP);
 /* réverbération courte : tous les événements sont dans la même pièce */
 const len=Math.floor(ac.sampleRate*.9),ir=ac.createBuffer(2,len,ac.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);let lp=0;for(let i=0;i<len;i++){lp+=.32*((Math.random()*2-1)-lp);d[i]=lp*Math.pow(1-i/len,3.2)}}
 const rev=ac.createConvolver();rev.buffer=ir;const revG=ac.createGain();revG.gain.value=.9;rev.connect(revG);revG.connect(master);revIn=rev;
 fxBus=ac.createGain();fxBus.connect(master);const fs=ac.createGain();fs.gain.value=.1;fxBus.connect(fs);fs.connect(rev);
 const dl=ac.createBiquadFilter();dl.type='lowpass';dl.frequency.value=3200;const dg=ac.createGain();dg.gain.value=.8;const ds=ac.createGain();ds.gain.value=.5;dl.connect(dg);dg.connect(duckG);dl.connect(ds);ds.connect(rev);distBus=dl;
 /* nappe de tension : presque rien au calme */
 const o1=ac.createOscillator(),o2=ac.createOscillator(),f=ac.createBiquadFilter();o1.type='sawtooth';o2.type='sawtooth';o1.frequency.value=98;o2.frequency.value=98.7;f.type='lowpass';f.frequency.value=260;droneG=ac.createGain();droneG.gain.value=0;o1.connect(f);o2.connect(f);f.connect(droneG);droneG.connect(bedBus);o1.start();o2.start();
 /* souffle de brouillage */
 const nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;const ns=ac.createBufferSource();ns.buffer=nb;ns.loop=true;const nf=ac.createBiquadFilter();nf.type='bandpass';nf.frequency.value=1900;nf.Q.value=.6;jamG=ac.createGain();jamG.gain.value=0;ns.connect(nf);nf.connect(jamG);jamG.connect(bedBus);ns.start();
 sndLoad();sndT=setInterval(()=>{try{sndTick()}catch(_){}},300);
 document.addEventListener('visibilitychange',()=>{if(!ac)return;if(document.hidden)ac.suspend().catch(()=>{});else ac.resume().catch(()=>{})});
}catch(_){ac=null}}
async function sndLoad(){for(const k of Object.keys(SND)){try{const s=atob(SND[k]),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);const b=await ac.decodeAudioData(u.buffer);sndBuf[k]=b;if(k==='room'||k==='srv'||k==='ops')sndBed(k,b)}catch(_){}await new Promise(r=>setTimeout(r,0))}}
/* boucle sans couture : la fin est fondue dans le début, quel que soit le format */
function sndLoopBuf(b){const X=Math.floor(b.sampleRate*1.5),L=b.length-X,o=ac.createBuffer(b.numberOfChannels,L,b.sampleRate);for(let c=0;c<b.numberOfChannels;c++){const s=b.getChannelData(c),d=o.getChannelData(c);d.set(s.subarray(0,L));for(let i=0;i<X;i++){const t=i/X;d[i]=s[i]*Math.sqrt(t)+s[L+i]*Math.sqrt(1-t)}}return o}
function sndBed(k,b){const s=ac.createBufferSource();s.buffer=sndLoopBuf(b);s.loop=true;const g=ac.createGain();g.gain.value=0;s.connect(g);g.connect(bedBus);s.start(0,Math.random()*5);beds[k]=g}
function sndState(){if(typeof HOME!=='undefined'&&HOME)return'home';if(!S)return'home';if(S.over)return'end';const ov=$('over');if(ov&&!ov.hidden)return'brief';return S.running?'run':'pause'}
function sndOpen(){return S&&S.crises?S.crises.filter(c=>!c.closed&&!c.silent):[]}
/* charge de la salle, de 0 à 1 : crises ouvertes et tension visibles par le joueur */
function sndLoad01(){const n=sndOpen().length,tn=S&&S.tension||0;return Math.min(1,.55*Math.min(1,n/3)+.45*Math.min(1,tn/4.2))}
function sndTick(){if(!ac)return;const st=sndState(),i=(st==='run'||st==='pause')?sndLoad01():0,now=ac.currentTime,T=(p,v,tc=1.2)=>{if(p)p.setTargetAtTime(v,now,tc)};
 const M={home:[.5,.3,.1],brief:[.65,.32,.3],run:[.65,.32,.38+.5*i],pause:[.5,.25,.28+.35*i],end:[.5,.25,.06]}[st];
 T(bedBus.gain,sndMode===0?1:0,.4);if(beds.room)T(beds.room.gain,M[0]);if(beds.srv)T(beds.srv.gain,M[1]);if(beds.ops)T(beds.ops.gain,M[2]);
 T(bedLP.frequency,st==='pause'?1500:7000,.5);T(droneG.gain,(st==='run'||st==='pause')?.045*i*i:0,2.5);
 if(S&&sndGame!==S){sndGame=S;sndSeen=new Set();sndPing=-1;sndSub=0}
 const open=sndOpen();T(jamG.gain,st==='run'&&open.some(c=>c.type==='jam')?.012:0,.8);
 if(st==='run'&&!muted){open.forEach(c=>{if(sndSeen.has(c.id))return;sndSeen.add(c.id);if(c.type==='jam')sndPlay('intf',{g:.3});if(c.type==='cyber')sndPlay('glit',{g:.5});if(c.type==='desinfo'&&sndMode===0)sndPlay('tele',{g:.5,far:1,pan:.5});if(c.type==='sar'&&sndMode===0)sndRadio(.7)});
  const subs=open.filter(c=>c.type==='sub');if(!subs.length)sndPing=-1;else{const nb=(S.buoys||[]).length+subs.reduce((a,c)=>a+(c.ev?c.ev.length:0),0);if(sndPing<0)sndPing=now+.9;else if(nb>sndSub)sndPing=0;sndSub=nb;if(now>sndPing){sndPing=now+(subs.some(c=>c.located)?6:9);sndSonar()}}}
 if(sndMode===0&&(st==='run'||st==='brief')&&now>sndNext&&now>sndBusy){sndAmb(i);sndNext=now+(7+Math.random()*12)/(1+1.2*i)}}
function sndPlay(k,o={}){const b=sndBuf[k];if(!b||!ac||muted)return false;const s=ac.createBufferSource(),g=ac.createGain();s.buffer=b;s.playbackRate.value=o.rate||1;g.gain.value=o.g==null?.5:o.g;s.connect(g);let out=g;if(ac.createStereoPanner&&o.pan){const p=ac.createStereoPanner();p.pan.value=o.pan;g.connect(p);out=p}out.connect(o.to||(o.far?distBus:fxBus));s.start(ac.currentTime+(o.at||0));if(o.dur)s.stop(ac.currentTime+(o.at||0)+o.dur);return true}
const sndPick=a=>a[Math.floor(Math.random()*a.length)],sndR=(a,b)=>a+Math.random()*(b-a);
function sndAmb(i){const r=Math.random(),pan=sndR(-.8,.8),rate=sndR(.96,1.04);
 if(r<.3)sndPlay(sndPick(['cmp0','cmp1','cmp2']),{g:.035,far:1,pan,rate,dur:sndR(1.2,3)});
 else if(r<.58)sndPlay('kbd',{g:.5,far:1,pan,rate});
 else if(r<.84)sndRadio(.32+.2*i,pan);
 else if(r<.92)sndPlay('tune',{g:.4,far:1,pan,rate});
 else if(r<.97)sndPlay('tele',{g:.4,far:1,pan});
 else sndPlay('phon',{g:.32,far:1,pan})}
/* passage radio : voix sans mots réels, filtrée, ouverte et fermée par un bruit de canal */
function sndSquelch(at,g,to,pan){if(!ac||muted)return;const n=Math.floor(ac.sampleRate*.07),b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=ac.createBufferSource(),f=ac.createBiquadFilter(),a=ac.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=2300;f.Q.value=.8;a.gain.value=g;s.connect(f);f.connect(a);let out=a;if(ac.createStereoPanner&&pan){const p=ac.createStereoPanner();p.pan.value=pan;a.connect(p);out=p}out.connect(to||fxBus);s.start(ac.currentTime+at)}
function sndRadio(g=.5,pan=0){if(!ac||muted||!sndBuf.vox1)return;const hp=ac.createBiquadFilter(),lp=ac.createBiquadFilter(),sh=ac.createWaveShaper(),a=ac.createGain(),c=new Float32Array(257);for(let i=0;i<257;i++){const x=i/128-1;c[i]=Math.tanh(2.4*x)}sh.curve=c;hp.type='highpass';hp.frequency.value=520;lp.type='lowpass';lp.frequency.value=2500;a.gain.value=g*.5;hp.connect(sh);sh.connect(lp);lp.connect(a);let out=a;if(ac.createStereoPanner&&pan){const p=ac.createStereoPanner();p.pan.value=pan;a.connect(p);out=p}out.connect(distBus);
 const fam=Math.random()<.5?['vox1','vox2']:['vox3','vox4'],n=1+Math.floor(Math.random()*3);let t=.09;sndSquelch(0,g*.5,distBus,pan);for(let j=0;j<n;j++){const k=sndPick(fam);sndPlay(k,{g:1,to:hp,at:t,rate:sndR(.97,1.03)});t+=sndBuf[k].duration+sndR(.05,.25)}sndSquelch(t,g*.6,distBus,pan);sndBusy=ac.currentTime+t+1}
/* ping de sonar synthétisé : note pure, longue résonance, échos qui s'éteignent. La cadence ne dépend que de ce que le joueur voit. */
function sndSonar(g=.18){if(!ac||muted)return;const u=ac.currentTime,a=ac.createGain(),o=ac.createOscillator(),o2=ac.createOscillator(),a2=ac.createGain(),d=ac.createDelay(1.5),fb=ac.createGain(),lp=ac.createBiquadFilter(),w=ac.createGain();
 o.type='sine';o.frequency.setValueAtTime(1180,u);o.frequency.exponentialRampToValueAtTime(1140,u+1.6);o2.type='sine';o2.frequency.value=2360;a2.gain.value=.12;
 a.gain.setValueAtTime(0,u);a.gain.linearRampToValueAtTime(g,u+.006);a.gain.exponentialRampToValueAtTime(g*.3,u+.25);a.gain.exponentialRampToValueAtTime(.0004,u+1.7);
 o.connect(a);o2.connect(a2);a2.connect(a);a.connect(fxBus);d.delayTime.value=.46;fb.gain.value=.42;lp.type='lowpass';lp.frequency.value=1700;w.gain.value=.45;a.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(w);w.connect(fxBus);
 o.start(u);o2.start(u);o.stop(u+1.75);o2.stop(u+1.75);sndDuck(.72,1.1);setTimeout(()=>{try{w.disconnect();fb.disconnect();lp.disconnect();d.disconnect();a.disconnect()}catch(_){}},7000)}
function sndDuck(v,d){if(!duckG)return;const n=ac.currentTime;duckG.gain.cancelScheduledValues(n);duckG.gain.setTargetAtTime(v,n,.06);duckG.gain.setTargetAtTime(1,n+d,.8)}
function tone(f,d,gn=.1,type='sine',at=0,to){if(!ac||muted)return;const o=ac.createOscillator(),a=ac.createGain(),u=ac.currentTime+at;o.type=type;o.frequency.value=f;a.gain.setValueAtTime(0,u);a.gain.linearRampToValueAtTime(gn,u+.006);a.gain.exponentialRampToValueAtTime(.0005,u+d);o.connect(a);a.connect(to||fxBus);o.start(u);o.stop(u+d+.02)}
function noise(d,gn,f0,f1,to){if(!ac||muted)return;const n=Math.floor(ac.sampleRate*d),b=ac.createBuffer(1,n,ac.sampleRate),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=Math.random()*2-1;const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),a=ac.createGain(),u=ac.currentTime;s.buffer=b;fl.type='bandpass';fl.frequency.setValueAtTime(f0,u);fl.frequency.exponentialRampToValueAtTime(f1,u+d);a.gain.setValueAtTime(gn,u);a.gain.exponentialRampToValueAtTime(.001,u+d);s.connect(fl);fl.connect(a);a.connect(to||fxBus);s.start()}
/* alarme de salle : deux tons adoucis, dans la réverbération. Aucun bruit d'arme ni d'explosion. */
function sndAlarm(n,gn){const f=ac.createBiquadFilter(),a=ac.createGain();f.type='lowpass';f.frequency.value=1700;a.gain.value=1;f.connect(a);a.connect(fxBus);const s=ac.createGain();s.gain.value=.35;a.connect(s);s.connect(revIn);for(let i=0;i<n;i++)tone(i%2?587:784,.3,gn,'square',i*.3,f)}
const SND_GAP={click:.04,order:.25,turn:.5,notif:.6,bad:1,alarm:3,alarmS:1.5,jet:1};
function sfx(k){if(!ac||muted)return;if(typeof HOME!=='undefined'&&HOME&&k!=='click')return;const n=ac.currentTime;if(n<(sndLast[k]||0))return;sndLast[k]=n+(SND_GAP[k]||0);
 if(k==='click'){if(!sndPlay(sndPick(['clk1','clk2','clk3']),{g:.45,rate:sndR(.97,1.03)}))tone(2000,.03,.06,'square')}
 if(k==='order'){if(sndPlay('blip',{g:.8}))sndSquelch(.16,.1);else{tone(660,.07,.08);tone(990,.12,.08,'sine',.07)}}
 if(k==='turn'){if(!sndPlay('scan',{g:.9})){tone(220,.5,.1);tone(330,.5,.06)}}
 if(k==='notif'){if(!sndPlay('proc',{g:1.2})){tone(740,.1,.09);tone(554,.2,.09,'sine',.1)}}
 if(k==='bad'){sndDuck(.6,.8);if(sndPlay('deny',{g:.5}))sndPlay('thud',{g:.28,at:.04});else{tone(170,.5,.2,'triangle');noise(.4,.1,300,120)}}
 if(k==='alarm'){sndDuck(.42,2.2);sndAlarm(6,.17);sndBusy=n+3}
 if(k==='alarmS'){sndDuck(.6,1);sndAlarm(2,.13);sndBusy=n+1.5}
 if(k==='jet'){sndSquelch(0,.14);noise(2.6,.05,160,700,distBus)}}
