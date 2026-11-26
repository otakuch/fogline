/* ---------- v56 : vue rapprochée 3D ----------
   Couche d'affichage et de rythme. Elle ne lit jamais truth, ne change aucun état du jeu et ne tire aucun nombre par R().
   Ce qu'elle montre vient de fzItems (mêmes objets et même connaissance que la carte), de uRanges (mêmes portées),
   de projList et des événements fxEv que le moteur émet après ses propres tirages. Les modèles ne sont pas à l'échelle ;
   les distances le sont. Valeurs propres à la vue : V3D.in, V3D.full (seuils de zoom), V3D.alt (altitudes d'affichage, en px),
   V3D.fx (vitesse d'affichage d'un intercepteur), V3D.gun (seuil du canon), V3D.spd (vitesse de jeu à l'entrée). */
var V3D={on:false,k:0,tilt:0,pref:true,in:6,full:12,tiltMax:1,az:0,ox:0,oy:0,uox:0,uoy:0,anchor:null,want:null,was:.5,spd:.25,gun:20,fx:110,vs:.35,fz:1,shx:0,shy:0,dtR:.016,zTo:0,
 alt:{recon:150,drone:185,armed:125,fighter:165,helo:70,trk:55,dr:40},
 col:{friendly:'#6AD9EF',neutral:'#8DDCA9',hostile:'#EA6C68',unfriendly:'#F5BF54',unknown:'#C8D3DC'},
 fxs:[],hits:[],frame:null,objs:new Map(),els:new Map(),geo:{},mats:{},slowT:0,slowAsk:false,slowOff:false,ms:16,fps:60,G:null,fail:false,n:0};
try{if(localStorage.getItem('seuil.v3d')==='0')V3D.pref=false}catch(_){}
const ENGL=[];
const v3dCan=()=>!window.__noV3D&&window.innerWidth>980&&hasGL()&&!V3D.fail;
function v3dPref(v){V3D.pref=!!v;try{localStorage.setItem('seuil.v3d',v?'1':'0')}catch(_){}if(!v&&V3D.on)v3dOff()}
function v3dElig(o){if(!o||!S||!UT[o.type]||!S.units.includes(o))return false;const T=UT[o.type];return(!!T.naval||!!T.air||T.dom==='sea')&&!T.land&&!T.off&&o.x!==undefined&&!o.aboard&&!(o.type==='helo'&&o.recov)}
function v3dAlive(o){if(!o||!S)return false;if(UT[o.type]&&S.units.includes(o))return v3dElig(o);if(S.ships.includes(o))return !!o.visible&&!o.gone;if(o.hcs)return o.st==='underway';return o===S.convoy&&!S.hc&&!o.arrived&&!o.lost}
function v3dNear(px){let b=null,bd=px===undefined?1e9:px;for(const u of S.units){if(!v3dElig(u))continue;const d=Math.hypot(u.x-cam.x,u.y-cam.y)*cam.z;if(d<bd){bd=d;b=u}}return b}
function v3dBtn(){const b=$('v3dBtn');if(!b)return;const ok=v3dCan()&&V3D.pref&&!!S&&!HOME&&!S.over;b.hidden=!ok;if(!ok)return;b.classList.toggle('on',V3D.on);b.setAttribute('aria-pressed',V3D.on);b.title=b.ariaLabel=t(V3D.on?'v3d.btn.off':'v3d.btn')}
function v3dOn(a){V3D.on=true;V3D.anchor=a;V3D.ox=V3D.uox=cam.x-a.x;V3D.oy=V3D.uoy=cam.y-a.y;V3D.az=0;V3D.fz=1;V3D.shx=V3D.shy=0;V3D.frame=null;V3D.slowT=0;V3D.was=S.ff?SPD0:S.speed;
 /* lot 4 : le temps passe à ×¼ à l'entrée, sauf s'il est déjà plus lent ; ni au tutoriel ni au tour par tour */
 if(!S.tuto&&S.tmode!=='turn'){S.ff=false;if(S.speed>V3D.spd)S.speed=V3D.spd}if(VIEW==='tac'){VIEW='std';VCAM=null}v3dBtn();D()}
function v3dOff(){if(!V3D.on)return;V3D.on=false;if(S&&!S.tuto&&S.tmode!=='turn'&&!S.over)S.speed=V3D.was;V3D.frame=null;V3D.want=null;const e=$('v3dSlow');if(e)e.remove();v3dBtn();D()}
function v3dSwitch(n){const a=V3D.anchor;if(a&&a.x!==undefined){V3D.ox+=a.x-n.x;V3D.oy+=a.y-n.y}V3D.anchor=n;V3D.frame=null}
function v3dExit(){if(!V3D.on)return;V3D.zTo=minZ()*V3D.in*.9;D()}
function v3dEnter(u){const a=u||(v3dElig(S.sel)?S.sel:v3dNear());if(!a||!v3dCan()||!V3D.pref){hintT=t('v3d.none');D();return false}V3D.want=a;cam.x=a.x;cam.y=a.y;V3D.zTo=Math.min(ZMAX,minZ()*V3D.full*1.15);if(cam.z>V3D.zTo)V3D.zTo=0;D();return true}
function v3dToggle(){if(V3D.on)v3dExit();else v3dEnter()}
function v3dGesture(){if(V3D.frame)V3D.frame.cancel=true}
function v3dCenter(){V3D.uox=V3D.uoy=0;V3D.az=0;v3dGesture();D()}
function v3dPan(dx,dy){const c=Math.max(.45,Math.cos(V3D.tilt)),a=v3dAz(),ux=-dx/cam.z,uy=-dy/(cam.z*c);return[ux*Math.cos(a)+uy*Math.sin(a),-ux*Math.sin(a)+uy*Math.cos(a)]}
function v3dDrag(d,dx,dy){v3dGesture();if(d.rot){V3D.az=d.az-dx*.006;return}const p=v3dPan(dx,dy);V3D.uox=V3D.ox=d.ox+p[0];V3D.uoy=V3D.oy=d.oy+p[1]}
function v3dKey(code,sh){v3dGesture();const s=.1*vc().w,m={ArrowLeft:[s,0],ArrowRight:[-s,0],ArrowUp:[0,s],ArrowDown:[0,-s]}[code];if(sh&&(code==='ArrowLeft'||code==='ArrowRight')){V3D.az+=code==='ArrowLeft'?.15:-.15;return}const p=v3dPan(m[0],m[1]);V3D.uox+=p[0];V3D.uoy+=p[1]}
const v3dAz=()=>V3D.az*clamp(V3D.tilt/(V3D.tiltMax*.5));
function v3dNo(){hintT=t('v3d.noclick');sfx('bad');D()}
function v3dHit(sx,sy){let b=null,bd=1e9;for(const h of V3D.hits){const d=Math.hypot(h.sx-sx,h.sy-sy);if(d<=h.r&&d-(S.sel===h.o?4:0)<bd){bd=d;b=h.o}}return b}
function v3dCur(sx,sy){if(exclEdit||buoyEdit||patrolEdit)return'nogo';return v3dHit(sx,sy)?'pick':'map'}
/* clic dans la vue : sélection d'un objet visible, comme sur la carte. Un ordre au clic sur le décor est refusé avec son motif. */
function v3dClick(e){const r=cv.getBoundingClientRect(),o=v3dHit(e.clientX-r.left,e.clientY-r.top);if(exclEdit||buoyEdit||patrolEdit){v3dNo();return}
 if(o){S.sel=o;audSel();sfx('click');D();return}const s=S.sel;if(s&&UT[s.type]&&S.units.includes(s)&&!UT[s.type].off)v3dNo()}
/* état de la vue, une fois par image, hors de l'interpolation */
function v3dTick(real){V3D.dtR=real;if(!S||HOME){if(V3D.on)v3dOff();return}
 if(V3D.zTo){const k=reduced()?1:Math.min(1,real*5);cam.z+=(V3D.zTo-cam.z)*k;if(Math.abs(V3D.zTo-cam.z)<cam.z*.012){cam.z=V3D.zTo;V3D.zTo=0}cam.z=clamp(cam.z,minZ(),ZMAX)}
 const can=v3dCan()&&V3D.pref&&!S.over&&VIEW!=='macro'&&!R3D,f=fzFactor();
 if(!V3D.on){if(can&&f>V3D.in){const a=v3dElig(V3D.want)?V3D.want:v3dElig(S.sel)?S.sel:v3dNear(60);if(a)v3dOn(a)}if(!V3D.zTo)V3D.want=null;return}
 const a=V3D.anchor;if(S.sel&&S.sel!==a&&v3dAlive(S.sel))v3dSwitch(S.sel);else if(!v3dAlive(a)){const n=v3dElig(S.sel)?S.sel:v3dNear(.6*vc().w);if(n)v3dSwitch(n);else{v3dOff();V3D.zTo=minZ()*V3D.in*.9;return}}
 if(!can||f<V3D.in*.97)v3dOff()}

/* ----- géométries : modèles génériques par classe, construits en code, longueur 1 le long de X (proue vers +X) ----- */
function v3Parts(){const bx=(l,h,w,x,y,z,ry,rz,rx)=>{const g=new THREE.BoxGeometry(l,h,w);if(rx)g.rotateX(rx);if(rz)g.rotateZ(rz);if(ry)g.rotateY(ry);g.translate(x||0,y||0,z||0);return g},
 cx=(rb,rf,l,x,y,z)=>{const g=new THREE.CylinderGeometry(rf,rb,l,10,1);g.rotateZ(-Math.PI/2);g.translate(x||0,y||0,z||0);return g},
 cy=(rt,rb,h,x,y,z)=>{const g=new THREE.CylinderGeometry(rt,rb,h,8,1);g.translate(x||0,y||0,z||0);return g},
 cz=(r,l,x,y,z)=>{const g=new THREE.CylinderGeometry(r,r,l,10,1);g.rotateX(Math.PI/2);g.translate(x||0,y||0,z||0);return g},
 sp=(r,x,y,z,sx,sy,sz)=>{const g=new THREE.SphereGeometry(r,8,6);g.scale(sx||1,sy||1,sz||1);g.translate(x||0,y||0,z||0);return g},
 pr=(P,h,y)=>{const s=new THREE.Shape();for(let i=0;i<P.length;i+=2)i?s.lineTo(P[i],P[i+1]):s.moveTo(P[i],P[i+1]);const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);g.translate(0,y||0,0);return g},
 hull=(B,bow,st)=>[-.5,-B*st/2,-.42,-B/2,.5-bow,-B/2,.5,0,.5-bow,B/2,-.42,B/2,-.5,B*st/2],
 tur=x=>({g:[cy(.02,.024,.022,0,.062,0),bx(.06,.008,.008,.036,.066,0)],p:[x,0,0],ax:'y',k:'tur'}),rad=(x,y)=>({g:[bx(.055,.012,.006,0,0,0)],p:[x,y,0],ax:'y',k:'rad'});
 return{
 ddg:{b:[pr(hull(.125,.3,.7),.05),bx(.2,.055,.095,.14,.078,0),bx(.1,.04,.08,.01,.07,0),bx(.17,.05,.09,-.17,.075,0),bx(.03,.11,.03,.16,.16,0),bx(.05,.06,.05,.0,.115,0,0,.2),bx(.05,.055,.05,-.1,.11,0,0,.2),bx(.2,.006,.1,-.38,.053,0)],m:[tur(.34),rad(.16,.222)],wk:1},
 lcs:{b:[pr(hull(.15,.38,.85),.05),bx(.3,.07,.12,.02,.085,0),bx(.12,.035,.1,.2,.068,0),bx(.02,.09,.02,.05,.165,0),bx(.3,.006,.14,-.33,.053,0)],m:[tur(.33),rad(.05,.215)],wk:1},
 arc:{b:[pr(hull(.16,.18,.9),.07),bx(.2,.1,.13,.22,.12,0),bx(.06,.03,.05,.47,.085,0),bx(.02,.14,.02,-.12,.135,0,0,.5),cz(.04,.1,-.3,.115,0),bx(.34,.008,.14,-.28,.074,0)],m:[rad(.24,.18)],wk:1},
 pb:{b:[pr(hull(.17,.35,.8),.06),bx(.26,.07,.12,-.02,.095,0),bx(.02,.1,.02,-.04,.18,0)],m:[tur(.3),rad(-.04,.235)],wk:1},
 cargo:{b:[pr(hull(.15,.14,.92),.06),bx(.12,.12,.13,-.38,.12,0),bx(.14,.035,.11,.22,.078,0),bx(.14,.035,.11,.05,.078,0),bx(.14,.035,.11,-.12,.078,0),bx(.015,.09,.015,-.3,.225,0)],m:[],wk:1},
 hull:{b:[pr(hull(.14,.25,.85),.05),bx(.14,.03,.08,-.1,.065,0)],m:[],wk:1},
 war:{b:[pr(hull(.125,.3,.7),.05),bx(.2,.05,.09,.1,.075,0),bx(.14,.04,.085,-.15,.07,0),bx(.025,.1,.025,.1,.15,0)],m:[tur(.33)],wk:1},
 aux:{b:[pr(hull(.15,.16,.9),.065),bx(.16,.1,.13,-.3,.115,0),bx(.02,.12,.02,.1,.125,0),bx(.02,.12,.02,-.05,.125,0),bx(.3,.01,.12,.2,.07,0)],m:[],wk:1},
 cvn:{b:[pr(hull(.14,.2,.85),.06),bx(1,.012,.2,0,.066,0),bx(.1,.07,.03,.05,.107,.075)],m:[rad(.05,.15)],wk:1},
 sub:{b:[cx(.04,.04,.7,0,-.045,0),sp(.04,.35,-.045,0,1.6),cx(.008,.04,.15,-.425,-.045,0),bx(.1,.05,.02,.08,0,0),bx(.03,.004,.11,.08,.005,0)],m:[],sub:1},
 p8:{b:[cx(.035,.045,.72,0,0,0),cx(.045,.008,.12,.42,0,0),cx(.008,.035,.16,-.44,.005,0),pr([.08,0,-.04,-.48,-.12,-.48,-.08,0,-.12,.48,-.04,.48],.008,-.012),pr([-.38,0,-.44,-.17,-.48,-.17,-.46,0,-.48,.17,-.44,.17],.006,.02),bx(.12,.12,.008,-.43,.07,0,0,-.4),cx(.02,.022,.1,0,-.035,.16),cx(.02,.022,.1,0,-.035,-.16)],m:[],air:1},
 mq4:{b:[cx(.02,.035,.75,0,0,0),sp(.05,.3,.015,0,1.5),pr([.03,0,0,-.65,-.05,-.65,-.06,0,-.05,.65,0,.65],.006,0),bx(.1,.11,.006,-.36,.05,.03,0,0,.6),bx(.1,.11,.006,-.36,.05,-.03,0,0,-.6),cx(.03,.03,.14,-.2,.045,0)],m:[],air:1},
 mq9:{b:[cx(.015,.03,.8,0,0,0),sp(.035,.36,.01,0,1.6),pr([.04,0,0,-.8,-.04,-.8,-.05,0,-.04,.8,0,.8],.006,0),bx(.08,.12,.006,-.38,.055,.035,0,0,.55),bx(.08,.12,.006,-.38,.055,-.035,0,0,-.55),bx(.07,.07,.006,-.38,-.04,0)],m:[{g:[bx(.006,.12,.012,0,0,0)],p:[-.41,0,0],ax:'x',k:'prop'}],air:1},
 fa18:{b:[cx(.03,.04,.62,-.02,0,0),cx(.04,.004,.22,.4,0,0),sp(.028,.2,.035,0,2.2),pr([.22,0,0,-.09,-.12,-.3,-.2,-.3,-.18,0,-.2,.3,-.12,.3,0,.09],.008,-.004),pr([-.3,0,-.4,-.17,-.46,-.17,-.42,0,-.46,.17,-.4,.17],.006,0),bx(.11,.11,.006,-.3,.06,.045,0,0,-.35),bx(.11,.11,.006,-.3,.06,-.045,0,0,.35),cx(.022,.022,.12,-.36,0,.03),cx(.022,.022,.12,-.36,0,-.03)],m:[],air:1,pair:1},
 helo:{b:[sp(.09,.08,0,0,1.9,1,.95),bx(.2,.09,.1,.05,-.005,0),cx(.012,.03,.42,-.28,.02,0),bx(.05,.1,.008,-.47,.06,0,0,-.3),bx(.04,.004,.12,-.44,.03,0),bx(.012,.05,.012,.1,-.07,.05),bx(.012,.05,.012,.1,-.07,-.05),sp(.03,.14,-.055,0),cy(.01,.01,.03,.02,.06,0)],m:[{g:[bx(.9,.004,.03,0,0,0),bx(.03,.004,.9,0,0,0)],p:[.02,.08,0],ax:'y',k:'rot'},{g:[bx(.012,.12,.004,0,0,0)],p:[-.47,.07,.012],ax:'z',k:'prop'}],air:1},
 trk:{b:[cx(.06,.06,.7,0,0,0),cx(.06,.005,.3,.5,0,0),bx(.15,.2,.01,-.3,0,0),bx(.15,.01,.2,-.3,0,0)],m:[]},
 dr:{b:[pr([.5,0,-.5,-.4,-.3,0,-.5,.4],.04,0)],m:[]},
 torp:{b:[cx(.08,.08,.8,0,0,0),sp(.08,.4,0,0)],m:[]},
 buoy:{b:[cy(.1,.1,1,0,.5,0),sp(.2,0,.1,0)],m:[]}}}
function v3Merge(gs){const P=[],E=[];let N=[];for(const g of gs){const n=g.index?g.toNonIndexed():g,pa=n.attributes.position.array,na=n.attributes.normal.array;for(let i=0;i<pa.length;i++){P.push(pa[i]);N.push(na[i])}const eg=new THREE.EdgesGeometry(g,28),ea=eg.attributes.position.array;for(let i=0;i<ea.length;i++)E.push(ea[i]);eg.dispose();if(n!==g)n.dispose();g.dispose()}
 const f=new THREE.BufferGeometry();f.setAttribute('position',new THREE.Float32BufferAttribute(P,3));f.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));const e=new THREE.BufferGeometry();e.setAttribute('position',new THREE.Float32BufferAttribute(E,3));return{f,e}}
function v3Geo(k){if(V3D.geo[k])return V3D.geo[k];V3D.parts=V3D.parts||v3Parts();const s=V3D.parts[k];if(!s)return null;const b=v3Merge(s.b),m=s.m.map(q=>Object.assign(v3Merge(q.g),{p:q.p,ax:q.ax,k:q.k}));return V3D.geo[k]={b,m,wk:s.wk,air:s.air,sub:s.sub,pair:s.pair}}
const V3VS='varying vec3 vP;varying vec3 vN;void main(){vP=position;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 V3FS='uniform vec3 c;uniform float t;uniform float a;varying vec3 vP;varying vec3 vN;void main(){float f=1.-abs(vN.z);float b=smoothstep(.42,.5,abs(fract(vP.y*7.-t*.4)-.5));gl_FragColor=vec4(c*(.4+.8*f+.7*b),a*(.2+.5*f+.3*b));\n#include <colorspace_fragment>\n}';
function v3Mat(col,a){const k=col+'|'+a;if(V3D.mats[k])return V3D.mats[k];return V3D.mats[k]=new THREE.ShaderMaterial({uniforms:{c:{value:new THREE.Color(col)},t:V3D.G.ut,a:{value:a}},vertexShader:V3VS,fragmentShader:V3FS,transparent:true,depthWrite:false,side:THREE.DoubleSide})}
function v3Line(col,op,dash){op=Math.round(op*20)/20;const k='L'+col+'|'+op+'|'+(dash||0);if(V3D.mats[k])return V3D.mats[k];return V3D.mats[k]=dash?new THREE.LineDashedMaterial({color:col,transparent:true,opacity:op,dashSize:dash,gapSize:dash,depthWrite:false}):new THREE.LineBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false})}
/* un objet 3D par élément affiché ; reconstruit quand ce que le joueur sait de lui change */
function v3Obj(k,col,dim){const s=v3Geo(k),g=new THREE.Group(),r={g,mv:[],k};if(k==='pin'||!s){const p=new THREE.BufferGeometry();p.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,1,0, -.18,1.18,0,0,1.36,0, 0,1.36,0,.18,1.18,0, .18,1.18,0,0,1,0, 0,1,0,-.18,1.18,0],3));g.add(new THREE.LineSegments(p,v3Line(col,.95)));r.own=[p];return r}
 const a=(s.sub?.45:1)*(dim?.55:1),add=(G,b)=>{G.add(new THREE.Mesh(b.f,v3Mat(col,a)));G.add(new THREE.LineSegments(b.e,v3Line(col,s.sub?.5:.95)))},one=new THREE.Group();add(one,s.b);
 s.m.forEach(m=>{const h=new THREE.Group();h.position.set(m.p[0],m.p[1],m.p[2]);add(h,m);one.add(h);r.mv.push({h,ax:m.ax,k:m.k})});g.add(one);
 if(s.pair){const w=new THREE.Group();add(w,s.b);w.position.set(-.5,0,.55);g.add(w)}
 if(s.wk){const p=new THREE.BufferGeometry();p.setAttribute('position',new THREE.Float32BufferAttribute([-.5,0,.04,-1.7,0,.42,-.5,0,-.04,-1.7,0,-.42,-.55,0,0,-1.5,0,0],3));r.wk=new THREE.LineSegments(p,v3Line('#EAF4FC',.35));r.wk.visible=false;g.add(r.wk);r.own=[p]}
 if(s.air){const p=new THREE.BufferGeometry();p.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,-1,0],3));r.stem=new THREE.Line(p,v3Line(col,.5));r.own=(r.own||[]).concat(p)}
 r.air=s.air;r.sub=s.sub;return r}
function v3Free(r){if(r.g.parent)r.g.parent.remove(r.g);if(r.stem&&r.stem.parent)r.stem.parent.remove(r.stem);(r.own||[]).forEach(p=>p.dispose())}
function v3dModel(it){const c=it.c,o=it.o;if(it.kd==='c')return null;/* un contact sous-marin n'a jamais de modèle : seule l'estimation est montrée */
 if(it.kd==='u'){const T=UT[o.type];if(T.land||T.off)return'pin';if(o.type==='helo')return'helo';if(T.sub)return'sub';const b=T.base||o.type;return{recon:'p8',drone:'mq4',armed:'mq9',fighter:'fa18',frigate:'ddg',patrol:'lcs',repair:'arc',ally:'pb'}[o.type]||(FZUS[o.type]==='porte_avions'?'cvn':b==='frigate'?'ddg':b==='patrol'?'lcs':'aux')}
 if(it.kd==='v'||it.kd==='h')return'cargo';if(c.classification==='detected')return'pin';if(c.classification==='classified')return'hull';return c.knownType==='fregate'?'war':'cargo'}
/* ----- scène ----- */
function v3dInit(){if(V3D.G)return true;if(V3D.fail||!hasGL())return false;try{const cvs=$('v3d'),rnd=new THREE.WebGLRenderer({canvas:cvs,antialias:true,alpha:false,powerPreference:'high-performance'}),sc=new THREE.Scene(),cm=new THREE.PerspectiveCamera(32,16/9,1,5000);rnd.setClearColor(0x030C15,1);
  const G=V3D.G={rnd,sc,cm,ut:{value:0},pool:{},pi:{},rel:null,dt:new Map(),v:new THREE.Vector3(),w:0,h:0};
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShaderMaterial({uniforms:{g:{value:10},t:G.ut,mask:{value:null},hm:{value:0},ctr:{value:new THREE.Vector2()},rad:{value:300}},/* opaque : la mer se dessine avant tous les objets translucides, quel que soit leur éloignement */transparent:false,depthWrite:true,
   vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
   fragmentShader:'precision highp float;uniform float g;uniform float t;uniform sampler2D mask;uniform float hm;uniform vec2 ctr;uniform float rad;varying vec3 vW;float ln(vec2 p,float s){vec2 q=abs(fract(p/s-.5)-.5)/fwidth(p/s);return 1.-min(min(q.x,q.y),1.);}void main(){if(hm>.5&&vW.x>0.&&vW.x<1440.&&vW.z>0.&&vW.z<900.){float m=texture2D(mask,vec2(vW.x/1440.,1.-vW.z/900.)).r;if(m>.5)discard;}float d=distance(vW.xz,ctr)/rad;float l=ln(vW.xz,g)*.5+ln(vW.xz,g*5.)*.5;float w=.5+.5*sin(vW.x*.9+vW.z*.6+t*.8)*sin(vW.z*1.1-t*.5);vec3 c=mix(vec3(.02,.106,.169),vec3(.157,.325,.42),l*.55*(1.-smoothstep(.55,1.,d)));c+=vec3(.012,.03,.04)*w;c=mix(c,vec3(.012,.047,.082),smoothstep(.6,1.05,d));gl_FragColor=vec4(c,1.);\n#include <colorspace_fragment>\n}'}));
  sea.material.extensions={derivatives:true};sea.rotation.x=-Math.PI/2;sc.add(sea);G.sea=sea;
  const cg=n=>{const p=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;p.push(Math.cos(a),0,Math.sin(a))}p.push(1,0,0);const b=new THREE.BufferGeometry();b.setAttribute('position',new THREE.Float32BufferAttribute(p,3));return b};G.circ=cg(144);
  G.ico=new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1,0));G.col=new THREE.EdgesGeometry(new THREE.CylinderGeometry(.55,.9,1,8,2,true));
  cvs.addEventListener('webglcontextlost',e=>{e.preventDefault();V3D.fail=true;if(V3D.on)v3dOff();V3D.k=0});return true}catch(_){V3D.fail=true;V3D.G=null;return false}}
function v3Relief(){const G=V3D.G;if(G.rel&&G.rel.th===thId)return;if(G.rel){if(G.rel.M){G.sc.remove(G.rel.M.mesh);G.rel.M.free()}G.rel=null;G.sea.material.uniforms.hm.value=0}if(typeof RELIEF==='undefined'||!RELIEF||!RELIEF[thId])return;const th=thId,rec=G.rel={th,M:null};
 reliefData(th,D=>{if(!D||V3D.G!==G||G.rel!==rec)return;try{const M=reliefMesh(D,th);M.mesh.rotation.x=-Math.PI/2;M.mesh.position.set(720,0,450);M.mesh.scale.z=V3D.vs;M.mesh.renderOrder=-2;G.sc.add(M.mesh);rec.M=M;rec.D=D;G.sea.material.uniforms.mask.value=M.mesh.material.uniforms.mask.value;G.sea.material.uniforms.hm.value=1}catch(_){}})}
/* caméra : calée sur le zoom de la carte, cible = unité suivie + décalage du joueur ; appelée dans la fenêtre d'interpolation */
function v3dCam(){if(!S||HOME||(!V3D.on&&V3D.k<=0))return;const v=vc(),dt=V3D.dtR,f=fzFactor(),rm=reduced();
 if(V3D.on){const a=V3D.anchor,mx=.42*Math.min(v.w*.7,v.h)/cam.z;if(a&&a.x!==undefined){V3D.uox=clamp(V3D.uox,-mx,mx);V3D.uoy=clamp(V3D.uoy,-mx,mx);const e=drag&&moved||rm?1:Math.min(1,dt*5);V3D.ox+=(V3D.uox-V3D.ox)*e;V3D.oy+=(V3D.uoy-V3D.oy)*e;cam.x=a.x+V3D.ox;cam.y=a.y+V3D.oy}}
 const kt=V3D.on?clamp((f-V3D.in)/(V3D.in*.25)):0,q=V3D.on?clamp((f-V3D.in*1.1)/(V3D.full-V3D.in*1.1)):0,tt=V3D.tiltMax*q*q*(3-2*q),e=rm?1:Math.min(1,dt*7);V3D.k+=(kt-V3D.k)*e;if(Math.abs(kt-V3D.k)<.012)V3D.k=kt;V3D.tilt+=(tt-V3D.tilt)*(rm?1:Math.min(1,dt*5));if(Math.abs(tt-V3D.tilt)<.002)V3D.tilt=tt;
 /* cadrage d'un engagement : recul borné au seuil d'entrée, annulé par un geste du joueur */
 let fzT=1,sx=0,sy=0;const F=V3D.frame;if(F&&(F.cancel||S.t>F.until||rm||!V3D.on))V3D.frame=null;else if(F){const A=F.a,B=F.b();if(B){const hw=v3dHalf(v),need=dist(A,B)/2*1.3+8,vis=Math.min(hw*.85,v.h*.38)/cam.z;fzT=clamp(vis/need,Math.min(1,minZ()*V3D.in/cam.z),1);sx=(A.x+B.x)/2-cam.x;sy=(A.y+B.y)/2-cam.y;const lim=Math.min(hw,v.h*.45)/(cam.z*fzT);sx=clamp(sx,-lim,lim);sy=clamp(sy,-lim,lim)}}
 const ef=rm?1:Math.min(1,dt*3);V3D.fz+=(fzT-V3D.fz)*ef;V3D.shx+=(sx-V3D.shx)*ef;V3D.shy+=(sy-V3D.shy)*ef}
/* demi-largeur libre autour du centre utile : le panneau de droite, s'il est ouvert, masque la carte */
function v3dHalf(v){let r=v.w;const p=$('right');if(p&&!p.hidden&&window.innerWidth>980){const b=p.getBoundingClientRect(),m=mapw.getBoundingClientRect();if(b.width)r=Math.min(r,b.left-m.left)}return Math.max(120,Math.min(v.cx-(v.cx*2-v.w),r-v.cx))}
function v3dProj(x,y,h){const G=V3D.G;if(!G)return null;const p=G.v.set(x,h||0,y).project(G.cm);return[(p.x+1)/2*G.w,(1-p.y)/2*G.h,p.z<1&&p.z>-1]}
function v3Pool(k,mk){const G=V3D.G,P=G.pool[k]=G.pool[k]||[],i=G.pi[k]=(G.pi[k]||0);let o=P[i];if(!o){o=mk();P.push(o);G.sc.add(o)}o.visible=true;G.pi[k]=i+1;return o}
function v3Ring(x,y,r,col,op,dash,h){const o=v3Pool('r'+(dash?1:0),()=>{const l=new THREE.Line(V3D.G.circ,v3Line(col,op,dash?.045:0));if(dash)l.computeLineDistances();return l});o.material=v3Line(col,op,dash?.045:0);o.position.set(x,h||.06,y);o.scale.set(r,1,r);return o}
function v3Seg(x0,h0,y0,x1,h1,y1,col,op){const o=v3Pool('s',()=>{const b=new THREE.BufferGeometry();b.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0],3));const l=new THREE.Line(b,v3Line(col,op));l.frustumCulled=false;return l});o.material=v3Line(col,op);const a=o.geometry.attributes.position;a.setXYZ(0,x0,h0,y0);a.setXYZ(1,x1,h1,y1);a.needsUpdate=true;return o}
function v3El(k,cls){let e=V3D.els.get(k);if(!e){e=document.createElement('div');e.className=cls;if(cls==='vk')e.innerHTML='<i></i><i></i><i></i><i></i>';$('v3dl').appendChild(e);V3D.els.set(k,e={e,tx:'',u:0})}e.u=V3D.n;if(e.e.hidden)e.e.hidden=false;return e}
function v3Txt(k,cls,sx,sy,txt,col,html){const e=v3El(k,cls);if(e.tx!==txt){e.tx=txt;if(html)e.e.innerHTML=txt;else e.e.textContent=txt}if(col&&e.c!==col){e.c=col;e.e.style.color=col}e.e.style.transform=`translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) translate(-50%,-50%)`;return e}
/* ----- effets : chacun rejoue une issue déjà décidée par le moteur, en temps simulé ----- */
function v3dClearFx(){const G=V3D.G;V3D.fxs.forEach(f=>(f.o||[]).forEach(o=>{if(G)G.sc.remove(o);if(o.geometry&&o.userData.own)o.geometry.dispose()}));V3D.fxs.length=0}
function v3Trail(col,n){const b=new THREE.BufferGeometry();b.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(n*3),3));b.setDrawRange(0,0);const l=new THREE.Line(b,v3Line(col,.85));l.frustumCulled=false;l.userData={own:1,n:0,max:n};return l}
function v3TrailAdd(l,x,h,y){const a=l.geometry.attributes.position,u=l.userData;if(u.n<u.max){a.setXYZ(u.n,x,h,y);u.n++}else{a.array.copyWithin(0,3);a.setXYZ(u.max-1,x,h,y)}a.needsUpdate=true;l.geometry.setDrawRange(0,u.n)}
function v3Fx(f){const G=V3D.G;f.t0=S.t;f.o=f.o||[];if(G)f.o.forEach(o=>G.sc.add(o));V3D.fxs.push(f);if(V3D.fxs.length>40){const d=V3D.fxs.shift();(d.o||[]).forEach(o=>{if(G)G.sc.remove(o)})}return f}
function v3Burst(x,h,y,col,T,lab){v3Fx({k:'burst',x,h,y,T:T||.8,col,lab,o:[new THREE.LineSegments(V3D.G.ico,v3Line(col,.9))]})}
function v3Wave(x,y,col,r,T){v3Fx({k:'wave',x,y,r:r||8,T:T||1.4,col,o:[]})}
function v3Lab(x,y,txt,col,T){v3Fx({k:'lab',x,y,T:T||TRKFX,lab:txt,col,o:[]})}
function v3dEngage(a,b,T){if(!V3D.on||reduced())return;V3D.frame={a,b,until:S.t+T,cancel:false}}/* le dernier engagement cadre la vue ; un geste du joueur l'annule pour cet engagement */
function v3dFx(k,d){if(!V3D.G||!S||S.over)return;const lite=reduced()||S.tmode==='turn',H=V3D.sc||1,near=(o,r)=>!!o&&o.x!==undefined&&Math.hypot(o.x-cam.x,o.y-cam.y)<(r||600);
 if(k==='icp'||k==='gun'){const u=d.u,m=d.m;if(!near(u,400))return;const dd=dist(u,m),gun=k==='gun'||dd<V3D.gun,T=gun?1.4:clamp(dd/V3D.fx,1,4),tg=m.tg,da=tg?Math.atan2(tg.y-m.y,tg.x-m.x):0,v=Math.min((m.v||20)*.3,tg&&tg.x!==undefined?.5*dist(m,tg)/T:9),n=m.n||'';
  if(lite){v3Lab(m.x,m.y,t(d.ok?'v3d.fx.int':'v3d.fx.miss',{a:n}),d.ok?V3D.col.friendly:V3D.col.unfriendly);return}
  const f=v3Fx({k:gun?'gun':'sam',T,u:{x:u.x,y:u.y},uo:u,ok:d.ok,n,gx:m.x,gy:m.y,dx:Math.cos(da)*v,dy:Math.sin(da)*v,real:d.ok?null:m,o:gun?[]:[v3Trail('#EAF4FC',70),v3Obj('trk',V3D.col.friendly).g]});
  if(d.ok){const gh=v3Obj('trk',TRKC.hostile);gh.g.userData.gh=1;f.gh=gh;V3D.G.sc.add(gh.g);f.o.push(gh.g)}
  v3dEngage(f.u,()=>({x:f.gx+f.dx*f.T,y:f.gy+f.dy*f.T}),T+1.2);return}
 if(k==='fire'){if(near(d.u,400)&&!lite)v3Wave(d.u.x,d.u.y,V3D.col.friendly,5,.7);const m=d.m,tg=d.tg;v3dEngage(d.u,()=>S.mis.includes(m)&&tg&&tg.x!==undefined?tg:null,dist(d.u,tg)/75+1.5);return}
 if(k==='trk'){const o=d.o;if(!near(o,500))return;if(d.st==='arr'){if(!lite){v3Burst(o.x,2,o.y,'#FF8080',.7);v3Wave(o.x,o.y,'#FF8080',7,1.2)}}else if(d.st==='lost'&&!lite)v3Wave(o.x,o.y,'#8FA3BC',4,.9);return}
 if(k==='hit'){const u=d.u;if(!near(u,400)||lite)return;v3Wave(u.x,u.y,V3D.col.hostile,7,1.3);v3Burst(u.x,1.5,u.y,V3D.col.hostile,d.lost?1.6:.7);return}
 if(k==='torp'){const T=d.T,u=d.u;if(!near(u,500))return;if(!lite)v3Fx({k:'tl',T:1.2,x0:u.x,y0:u.y,air:!!T.air,ax:T.tx,ay:T.ty,tr:T,o:[v3Trail('#EAF4FC',14)]});v3dEngage({x:u.x,y:u.y},()=>(S.torps||[]).includes(T)?{x:T.tx,y:T.ty}:null,T.dur+2);return}
 if(k==='torpEnd'){const T=d.T,col=d.out==='hit'?V3D.col.friendly:d.out==='wrong'?V3D.col.hostile:V3D.col.unfriendly;if(!near({x:T.tx,y:T.ty},600))return;v3Lab(T.tx,T.ty,t('v3d.fx.t.'+d.out,{a:T.pid}),col,6);{const pt={x:T.tx,y:T.ty},F=V3D.frame;if(F&&!F.cancel)v3dEngage(F.a,()=>pt,3)}if(lite)return;if(d.out==='hit'||d.out==='wrong'){v3Fx({k:'col',x:T.tx,y:T.ty,T:2.2,col:'#EAF4FC',o:[new THREE.LineSegments(V3D.G.col,v3Line('#EAF4FC',.8))]});v3Wave(T.tx,T.ty,'#EAF4FC',14,2.4)}else v3Wave(T.tx,T.ty,'#8FA3BC',5,1.2);return}
 if(k==='ping'){if(near(d.u,500)&&!lite)v3Fx({k:'ping',x:d.u.x,y:d.u.y,r:d.r,T:2.6,col:V3D.col.unfriendly,dip:d.u.type==='helo'?d.u:null,o:[]});return}
 if(k==='bping'){if(near(d.b,300)&&!lite)v3Fx({k:'ping',x:d.b.x,y:d.b.y,r:d.b.r||40,T:1.6,col:V3D.col.unfriendly,soft:1,o:[]})}}
function v3FxUpd(sc){const G=V3D.G,hT=V3D.alt.trk*sc,cur=V3D.fxs;V3D.fxs=[];/* un effet peut en créer d'autres (éclat, marque) pendant ce parcours */const keep=cur.filter(f=>{const p=(S.t-f.t0)/f.T,done=p>=(f.k==='sam'&&!f.ok?1.35:1)||p<0;let lx=f.x,ly=f.y,lh=2;
  if(f.k==='burst'){const o=f.o[0];o.position.set(f.x,f.h,f.y);o.scale.setScalar(sc*(4+26*p));o.rotation.y=p*2;o.material=v3Line(f.col,Math.max(0,.9*(1-p)))}
  else if(f.k==='wave'){for(let i=0;i<2;i++){const q=clamp(p*1.25-i*.25);if(q>0&&q<1)v3Ring(f.x,f.y,sc*4+f.r*q*(1+i*.3),f.col,.7*(1-q),0,.08)}}
  else if(f.k==='col'){const o=f.o[0],q=Math.sin(Math.min(1,p)*Math.PI);o.position.set(f.x,sc*26*q,f.y);o.scale.set(sc*14,sc*52*q+.01,sc*14);o.material=v3Line(f.col,.25+.6*q)}
  else if(f.k==='ping'){const q=clamp(p);v3Ring(f.x,f.y,Math.max(.5,f.r*q),f.col,(f.soft?.35:.8)*(1-q*q),0,.1);if(!f.soft&&q>.25)v3Ring(f.x,f.y,Math.max(.5,f.r*(q-.25)),f.col,.4*(1-q),0,.1);if(f.dip&&f.dip.x!==undefined)v3Seg(f.dip.x,V3D.alt.helo*sc,f.dip.y,f.dip.x,-2*sc,f.dip.y,'#EAF4FC',.8)}
  else if(f.k==='sam'){const T=f.T,tt=Math.min(p,1),gx=f.real&&S.mis.includes(f.real)?f.real.x:f.gx+f.dx*T*tt,gy=f.real&&S.mis.includes(f.real)?f.real.y:f.gy+f.dy*T*tt,up=clamp(p/.22),q=clamp((p-.12)/.88),e=q*q*(3-2*q),miss=f.ok?0:6*sc;
   let x=f.u.x+(gx-f.u.x)*e,y=f.u.y+(gy-f.u.y)*e,h=hT*(up*.9+.5*Math.sin(Math.PI*q)*(1-e))+hT*e*(f.ok?1:1.5)+(1-e)*up*hT*.4;if(p>1){const o=(p-1)*T*V3D.fx*.6;x+=(gx-f.u.x)/Math.max(1,Math.hypot(gx-f.u.x,gy-f.u.y))*o;y+=(gy-f.u.y)/Math.max(1,Math.hypot(gx-f.u.x,gy-f.u.y))*o;h+=miss+o*.3}
   v3TrailAdd(f.o[0],x,h,y);{const hd=f.o[1],px=f.lx===undefined?f.u.x:f.lx,py=f.ly===undefined?f.u.y:f.ly;hd.position.set(x,h,y);hd.scale.setScalar(sc*20);if(Math.hypot(x-px,y-py)>1e-4)hd.rotation.y=-Math.atan2(y-py,x-px);hd.visible=p<(f.ok?1:1.35);f.lx=x;f.ly=y}if(f.gh){f.gh.g.position.set(gx,hT,gy);f.gh.g.rotation.y=-Math.atan2(f.dy,f.dx);f.gh.g.scale.setScalar(sc*26)}lx=gx;ly=gy;lh=hT;
   if(p>=1&&!f.end){f.end=1;if(f.ok){v3Burst(gx,hT,gy,V3D.col.friendly,.9);if(f.gh)f.gh.g.visible=false}v3Lab(gx,gy,t(f.ok?'v3d.fx.int':'v3d.fx.miss',{a:f.n}),f.ok?V3D.col.friendly:V3D.col.unfriendly)}}
  else if(f.k==='gun'){const gx=f.real&&S.mis.includes(f.real)?f.real.x:f.gx+f.dx*f.T*Math.min(p,1),gy=f.real&&S.mis.includes(f.real)?f.real.y:f.gy+f.dy*f.T*Math.min(p,1),h0=3*sc,h1=(f.real||f.gh?hT:V3D.alt.dr*sc);
   if(p<.8)for(let i=0;i<12;i++){const q=(p*5+i/12)%1,a=Math.max(0,q-.12),w=(Math.random()-.5)*2*sc;v3Seg(f.u.x+(gx-f.u.x)*a,h0+(h1-h0)*a,f.u.y+(gy-f.u.y)*a+w,f.u.x+(gx-f.u.x)*q,h0+(h1-h0)*q,f.u.y+(gy-f.u.y)*q+w,'#FFE9A8',.9)}
   if(p<.8&&Math.random()<.6)v3Ring(f.u.x,f.u.y,sc*(3+Math.random()*3),'#FFE9A8',.5,0,h0);if(f.gh){f.gh.g.position.set(gx,h1,gy);f.gh.g.rotation.y=-Math.atan2(f.dy,f.dx);f.gh.g.scale.setScalar(sc*22);f.gh.g.visible=p<.8}
   if(p>=.8&&!f.end){f.end=1;if(f.ok){v3Burst(gx,h1,gy,V3D.col.friendly,.7);v3Wave(gx,gy,'#EAF4FC',5,1.1)}v3Lab(gx,gy,t(f.ok?'v3d.fx.int':'v3d.fx.miss',{a:f.n}),f.ok?V3D.col.friendly:V3D.col.unfriendly)}f.aim=[gx,gy]}
  else if(f.k==='tl'){const q=clamp(p),T=f.tr,ex=(S.torps||[]).includes(T)?T.x:f.ax,ey=(S.torps||[]).includes(T)?T.y:f.ay,h0=f.air?V3D.alt.helo*sc:5*sc,x=f.x0+(ex-f.x0)*q,y=f.y0+(ey-f.y0)*q,h=f.air?h0*(1-q*q):h0*(1-q)+Math.sin(q*Math.PI)*6*sc;v3TrailAdd(f.o[0],x,h,y);if(q>=1&&!f.end){f.end=1;v3Wave(x,y,'#EAF4FC',4,.9)}}
  if(f.lab&&!done){const s=v3dProj(lx,ly,lh);if(s&&s[2])v3Txt('fx'+f.t0+f.k+f.lab,'vx',s[0],s[1]-18,f.lab,f.col)}
  if(done){(f.o||[]).forEach(o=>{G.sc.remove(o);if(o.geometry&&o.userData.own)o.geometry.dispose()});if(f.gh)v3Free(f.gh);return false}return true});V3D.fxs=keep.concat(V3D.fxs)}
/* lignes d'engagement de la carte 2D (liste d'affichage, hors de l'état du jeu) */
function engLines(){if(!S||ENGL.S!==S)return[];const L=[];for(let i=ENGL.length-1;i>=0;i--){const q=ENGL[i],b=q.b();if(!b||S.t>q.until||q.a.x===undefined){ENGL.splice(i,1);continue}L.push({x0:q.a.x,y0:q.a.y,x1:b.x,y1:b.y,c:q.c,a:.55})}return L}
function engAdd(a,b,T,c){if(ENGL.S!==S){ENGL.length=0;ENGL.S=S}if(ENGL.length>24)ENGL.shift();ENGL.push({a,b,until:S.t+T,c})}
/* point d'entrée unique des événements d'affichage et de son. Appelé par le moteur après ses tirages ; ne modifie rien dans S. */
function fxEv(k,d){if(typeof window==='undefined'||!S||S.demoT!==undefined)return;try{audFx(k,d)}catch(_){}
 try{if(k==='fire'){const m=d.m,tg=d.tg;engAdd(d.u,()=>S.mis.includes(m)&&tg&&tg.x!==undefined?tg:null,60,TRKC.own)}else if(k==='icp'||k==='gun'){const p={x:d.m.x,y:d.m.y};engAdd(d.u,()=>p,1.6,'#FFE9A8')}else if(k==='torp'){const T=d.T,p={x:T.tx,y:T.ty};engAdd(d.u,()=>(S.torps||[]).includes(T)?p:null,T.dur+1,TRKC.own)}
  if(V3D.on||V3D.k>0)v3dFx(k,d)}catch(_){}}
/* ----- rendu d'une image ----- */
function v3dHide(){const c=$('v3d');if(c&&!c.hidden){c.hidden=true;$('v3dl').hidden=true;$('v3dfx').hidden=true;cv.style.opacity='';const z=$('fzl');if(z)z.style.opacity='';$('basemap').style.visibility='';if(V3D.fxs.length)v3dClearFx();V3D.hits.length=0}}
function v3dFrame(){const k=V3D.k;if(k<=0||HOME||!S||!v3dInit()){v3dHide();return}
 const G=V3D.G,v=vc(),t0=performance.now(),cvs=$('v3d'),L=$('v3dl'),rm=reduced(),n=++V3D.n;
 if(cvs.hidden){cvs.hidden=false;L.hidden=false}$('v3dfx').hidden=rm||k<1;cvs.style.opacity=k>=1?'':k.toFixed(3);cv.style.opacity=k>=1?'':(1-k).toFixed(3);{const z=$('fzl');if(z)z.style.opacity=k>=1?'':(1-k).toFixed(3)}L.style.opacity=k>=1?'':k.toFixed(3);$('basemap').style.visibility=k>=1?'hidden':'';
 {const lb=$('fzLvl');if(lb&&k>=1){lb.hidden=false;const fx=fzFactor().toFixed(1).replace('.',LANG==='fr'?',':'.');if(lb.dataset.lv!=='v3d'){lb.dataset.lv='v3d';lb.innerHTML=`<span>${t('v3d.lv')}</span><small>×${fx}</small><small class="zs" hidden></small>`;lb.setAttribute('aria-label',t('v3d.lv.aria'));lb.title=t('v3d.lv.aria')}else{const sm=lb.querySelector('small');if(sm&&sm.textContent!=='×'+fx)sm.textContent='×'+fx}}}
 const pr=Math.min(1.5,window.devicePixelRatio||1);if(G.w!==v.w||G.h!==v.h||G.pr!==pr){G.w=v.w;G.h=v.h;G.pr=pr;G.rnd.setPixelRatio(pr);G.rnd.setSize(v.w,v.h,false)}
 /* caméra */
 const zE=Math.max(cam.z*V3D.fz,Math.min(cam.z,minZ()*V3D.in)),cm=G.cm,fov=32*Math.PI/180,d=v.h/(2*zE*Math.tan(fov/2)),tilt=V3D.tilt,az=v3dAz(),tx=cam.x+V3D.shx,ty=cam.y+V3D.shy,sc=1/zE;V3D.sc=sc;
 const fmax=Math.max(V3D.in*1.5,ZMAX/minZ()),lp=46+114*clamp(Math.log(Math.max(1,cam.z/minZ()/V3D.in))/Math.log(fmax/V3D.in)),tn=clamp(tilt/V3D.tiltMax),aS=sc*(.25+.75*tn),A=V3D.anchor;
 let th=0;if(V3D.on&&A&&UT[A.type]&&UT[A.type].air&&!UT[A.type].land)th=(V3D.alt[A.type]||0)*aS*v3Air(A)*.8;G.th=(G.th||0)+(th-(G.th||0))*Math.min(1,V3D.dtR*4);
 cm.aspect=v.w/v.h;cm.near=Math.max(.5,d*.04);cm.far=d*9+400;cm.setViewOffset(v.w,v.h,v.w/2-v.cx,v.h/2-v.cy,v.w,v.h);cm.rotation.set(-(Math.PI/2-tilt),az,0,'YXZ');cm.position.set(0,0,d).applyQuaternion(cm.quaternion);cm.position.x+=tx;cm.position.y+=G.th;cm.position.z+=ty;
 if(G.rel&&G.rel.D){const g=Math.max(0,altAt(G.rel.D,cm.position.x,cm.position.z))*RZ*V3D.vs+1.5;if(cm.position.y<g)cm.position.y=g}cm.updateMatrixWorld();cm.updateProjectionMatrix();
 G.ut.value=rm?0:performance.now()/1000;G.pi={};
 /* décor */
 v3Relief();const sm=G.sea.material.uniforms,R=d*6+200;G.sea.position.set(tx,0,ty);G.sea.scale.set(R*2,R*2,1);sm.g.value=zE>28?1:zE>9?5:10;sm.ctr.value.set(tx,ty);sm.rad.value=R*.8;
 /* objets : mêmes éléments et même connaissance que la carte */
 const its=fzItems('detail'),seen=new Set(),Rm=Math.max(70,d*1.5),sel=S.sel;V3D.hits.length=0;
 for(const it of its){const o=it.o,mk=v3dModel(it),col=V3D.col[it.c.affiliation]||V3D.col.unknown,dd=Math.hypot(it.x-tx,it.y-ty);
  if(!mk){/* écho sous-marin : repère de l'estimation, jamais de coque */const s=v3dProj(it.x,it.y,0);if(s&&s[2]){v3Txt('L'+it.kd+o.id,'vl',s[0],s[1]-16,it.lab,col);V3D.hits.push({o,sx:s[0],sy:s[1],r:24})}continue}
  if(dd>Rm){const s=v3dProj(it.x,it.y,0);if(s&&s[2]&&s[0]>-20&&s[0]<v.w+20&&s[1]>-20&&s[1]<v.h+20){const e=v3El('M'+it.kd+o.id,'vm'+(it.kd==='u'?' u':''));e.e.style.transform=`translate(${s[0].toFixed(1)}px,${s[1].toFixed(1)}px) rotate(45deg)`;if(e.c!==col){e.c=col;e.e.style.color=col}V3D.hits.push({o,sx:s[0],sy:s[1],r:16})}continue}
  const dmg=it.kd==='u'&&o.hp!==undefined&&o.hp<=50,key=mk+'|'+(dmg?V3D.col.unfriendly:col)+'|'+(it.dim?1:0);let r=V3D.objs.get(o);if(!r||r.key!==key){if(r)v3Free(r);r=v3Obj(mk,dmg?V3D.col.unfriendly:col,it.dim);r.key=key;r.hd=o.hd!==undefined?o.hd:(r&&r.hd)||0;G.sc.add(r.g);if(r.stem)G.sc.add(r.stem);V3D.objs.set(o,r)}seen.add(o);
  /* cap : celui du moteur s'il existe, sinon celui du déplacement affiché */
  let hd=r.hd;if(o.hd!==undefined&&(o.sp===undefined||o.sp>.05))hd=o.hd;else if(r.px!==undefined){const mx=it.x-r.px,my=it.y-r.py;if(mx*mx+my*my>1e-5)hd=Math.atan2(my,mx)}const mv=r.px!==undefined?Math.hypot(it.x-r.px,it.y-r.py):0;r.px=it.x;r.py=it.y;let da=hd-r.hd;da=Math.atan2(Math.sin(da),Math.cos(da));r.hd+=da*(rm?1:Math.min(1,V3D.dtR*6));
  const rel=mk==='pin'?1:(it.kd==='u'?(FZUL[o.type]||.9):it.kd==='s'?.88:.95),len=mk==='pin'?34*sc:Math.max(30,lp*rel)*sc,air=r.air&&it.kd==='u',h=air?(V3D.alt[o.type]||90)*aS*v3Air(o):0;
  r.g.position.set(it.x,h,it.y);r.g.rotation.y=mk==='pin'?az:-r.hd;r.g.scale.set(len,len*(air||mk==='pin'?1:1.45),len);if(r.stem){r.stem.visible=h>len*.05;r.stem.position.set(it.x,h,it.y);r.stem.scale.set(1,h,1)}
  if(mk==='helo'&&h>0&&h<len*3&&((o.hold||0)>S.t||(o.sp!==undefined&&o.sp<1.5))&&!rm)v3Ring(it.x,it.y,len*(.8+.12*Math.sin(performance.now()/90)),'#EAF4FC',.25);/* souffle du rotor sur l'eau, en stationnaire */
  if(r.wk){const sp=o.sp!==undefined?o.sp:mv/Math.max(1e-3,STEP);r.wk.visible=sp>.4&&!r.sub;if(r.wk.visible)r.wk.scale.set(clamp(sp/9,.35,1.2),1,1)}
  const run=S.running&&!rm,tm=performance.now()/1000;r.mv.forEach(m=>{if(m.k==='rot'||m.k==='prop'){if(run&&(!air||h>0||o.type!=='helo'))m.h.rotation[m.ax]=tm*(m.k==='rot'?19:31)}else if(m.k==='rad'){if(run&&o.active!==false&&it.kd==='u')m.h.rotation.y=tm*1.6}else if(m.k==='tur'){const fx=V3D.fxs.find(q=>q.uo===o&&q.aim);m.h.rotation.y=fx?-(Math.atan2(fx.aim[1]-it.y,fx.aim[0]-it.x)-r.hd):0}});
  const s=v3dProj(it.x,it.y,h);if(s&&s[2]){const px=len*zE,on=sel===o;V3D.hits.push({o,sx:s[0],sy:s[1],r:Math.max(22,px*.55)});v3Txt('L'+it.kd+o.id,'vl',s[0],s[1]-px*.5-16,it.lab,col);
   if(on){const w=Math.max(44,px*1.25),e=v3El('K','vk');e.e.style.width=e.e.style.height=w.toFixed(0)+'px';e.e.style.transform=`translate(${(s[0]-w/2).toFixed(1)}px,${(s[1]-w/2).toFixed(1)}px)`;const cap=((Math.round(r.hd*180/Math.PI)+90)%360+360)%360;v3Txt('KT','vl',s[0],s[1]+w/2+14,it.kd==='u'?t('v3d.k',{a:o.id,b:String(cap).padStart(3,'0'),c:t(dmg?'v3d.st.dmg':'v3d.st.ok',{a:Math.max(0,Math.round(o.hp===undefined?100:o.hp))})}):t('v3d.k2',{a:it.lab,b:String(cap).padStart(3,'0')}),'#EAF4FC')}}}
 V3D.objs.forEach((r,o)=>{if(!seen.has(o)){v3Free(r);V3D.objs.delete(o)}});
 /* portées, à plat sur l'eau, lues par la même fonction que la carte */
 const raid=S.crises.some(c=>!c.closed&&(c.type==='raid'||c.type==='salvo'||c.type==='swarm'))||S.mis.some(m=>m.side==='r'),RL=[],OFF=[];
 if(A&&UT[A.type]&&S.units.includes(A))uRanges(A).forEach(q=>{if(q.tac||(q.raid&&!raid))return;v3Ring(A.x,A.y,q.r,q.c,q.k==='sen'?.5:.8,q.dash);RL.push([A,q])});
 if(LAY.sensor)S.units.forEach(u=>{if(u!==A&&u.x!==undefined&&Math.hypot(u.x-tx,u.y-ty)<Rm*2){const rr=rngOf(u,'sen');if(rr)v3Ring(u.x,u.y,rr,'#56D4FF',.22)}});
 S.ships.forEach(s=>{if(s.visible&&s.hact&&!s.stopped&&!s.gone){v3Ring(s.x,s.y,thrR(s),V3D.col.hostile,.45,1);RL.push([s,{k:'thr',r:thrR(s),c:V3D.col.hostile}])}});
 RL.forEach(([o,q],i)=>{let b=null,bd=1e9;for(let j=0;j<40;j++){const a=j/40*Math.PI*2,s=v3dProj(o.x+Math.cos(a)*q.r,o.y+Math.sin(a)*q.r,0);if(!s||!s[2]||s[0]<v.cx-v.w*.3||s[0]>v.w-70||s[1]<46||s[1]>v.h-60)continue;const e=Math.hypot(s[0]-v.cx,s[1]-v.h*.3)+((j*7+i*13)%5);if(e<bd){bd=e;b=s}}const tx3=t('v3d.r.'+(q.k==='sen'&&q.sil?'sil':q.k))+' · '+t('v.mi',{a:mi(q.r)});if(b)v3Txt('R'+i,'vr',b[0],b[1],tx3,q.c);else if(o===A)OFF.push(tx3)});
 /* zones de crise et estimation d'un contact sous-marin : jamais sa position vraie */
 for(const c of S.crises){if(c.closed||c.silent||!c.zone||hid(c))continue;const z=c.zone;if(Math.hypot(z.x-tx,z.y-ty)>z.r+Rm*2.5)continue;
  if(c.type==='sub'&&c.dt){v3Ring(z.x,z.y,z.r,V3D.col.unfriendly,.55,1);v3Ring(z.x,z.y,DT.fr,V3D.col.unfriendly,.9,1,.09);v3Seg(z.x-2,.09,z.y,z.x+2,.09,z.y,V3D.col.unfriendly,.9);v3Seg(z.x,.09,z.y-2,z.x,.09,z.y+2,V3D.col.unfriendly,.9);v3Cloud(c)}else v3Ring(z.x,z.y,z.r,'#FF8080',.5,1)}
 G.dt.forEach((q,c)=>{if(q.u!==n){G.sc.remove(q.m);q.m.geometry.dispose();q.tx.dispose();q.m.material.dispose();G.dt.delete(c)}});
 S.signals.forEach(z=>{if(z.lock||Math.hypot(z.x-tx,z.y-ty)>z.r+Rm*2.5)return;v3Ring(z.x,z.y,z.r,'#FFC14D',.5,1);if(!S.tuto)brgLines(z).forEach(b=>v3Seg(b.u.x,.1,b.u.y,b.u.x+Math.cos(b.a)*400,.1,b.u.y+Math.sin(b.a)*400,'#FFD78A',S.sel===z?.8:.4))});
 if(S.excl)v3Ring(S.excl.x,S.excl.y,S.excl.r||75,'#B79CFF',.6,1);
 /* bouées, projectiles connus du joueur, torpilles */
 S.buoys.forEach(b=>{if(Math.hypot(b.x-tx,b.y-ty)>Rm*2)return;v3Ring(b.x,b.y,b.r,b.act?V3D.col.unfriendly:'#7CF2C2',.35);v3Seg(b.x,0,b.y,b.x,10*sc,b.y,b.act?V3D.col.unfriendly:'#7CF2C2',.9)});
 const hT=V3D.alt.trk*aS,dart=(key,x,y,hd,h,col,size,lab)=>{const o=v3Pool('d'+col+key,()=>v3Obj(key,col).g);o.position.set(x,h,y);o.rotation.y=-hd;o.scale.setScalar(size*sc);if(h>size*sc*.2)v3Seg(x,h,y,x,0,y,col,.35);const s=v3dProj(x,y,h);if(lab&&s&&s[2])v3Txt('P'+lab,'vr',s[0],s[1]-14,lab,col)};
 S.mis.forEach(m=>{if(Math.hypot(m.x-tx,m.y-ty)>Rm*3)return;const tg=m.tg,hd=tg&&tg.x!==undefined?Math.atan2(tg.y-m.y,tg.x-m.x):0;dart('trk',m.x,m.y,hd,hT,m.side==='r'?TRKC.hostile:TRKC.own,26,m.n?String(m.n):'');if(m.side==='r'&&pkPen()>0)v3Ring(m.x,m.y,16*sc,TRKC.hostile,.7,1,hT);/* piste incertaine : même pénalité que sur la carte, arc tireté */if(tg&&tg.x!==undefined&&m.side!=='r')v3Seg(m.x,hT,m.y,tg.x,0,tg.y,TRKC.own,.25)});
 S.crises.forEach(c=>{if(c.closed||!c.tracks||(c.type!=='swarm'&&c.type!=='salvo'))return;c.tracks.forEach((q,i)=>{if(!q.det||Math.hypot(q.x-tx,q.y-ty)>Rm*3)return;const hd=c.prot&&c.prot.x!==undefined?Math.atan2(c.prot.y-q.y,c.prot.x-q.x):0;dart(c.salvo?'trk':'dr',q.x,q.y,hd,(c.salvo?V3D.alt.trk:V3D.alt.dr)*aS,!q.lab?TRKC.unknown:q.lab==='host'||c.salvo?TRKC.hostile:TRKC.neutral,c.salvo?26:20,q.n?String(q.n):'')})});
 (S.torps||[]).forEach(T=>{v3Ring(T.tx,T.ty,DT.fr,TRKC.own,.8,1,.1);dart('torp',T.x,T.y,Math.atan2(T.ty-T.y0,T.tx-T.x0),-3*sc,TRKC.own,22,'');v3Seg(T.x0,.05,T.y0,T.x,.05,T.y,'#EAF4FC',.4);const s=v3dProj(T.tx,T.ty,0);if(s&&s[2])v3Txt('T'+T.pid,'vr',s[0],s[1]+16,t('v3d.fx.t.run',{a:T.pid,b:Math.max(0,Math.ceil(T.end-S.t))}),TRKC.own)});
 (S.trkFx||[]).forEach((f,i)=>{if(f.st==='fly'||Math.hypot(f.x-tx,f.y-ty)>Rm*3)return;const s=v3dProj(f.x,f.y,0);v3Ring(f.x,f.y,3*sc+1,f.st==='int'?V3D.col.friendly:f.st==='arr'?TRKC.hostile:'#8FA3BC',.8,f.st==='lost'?1:0,.07);if(s&&s[2])v3Txt('F'+f.n+f.st+i,'vx',s[0],s[1]+14,t('v3d.fx.'+f.st,{a:f.n||''}),f.st==='int'?V3D.col.friendly:f.st==='arr'?TRKC.hostile:'#B7C8D6')});
 engLines().forEach(q=>v3Seg(q.x0,.12,q.y0,q.x1,.12,q.y1,q.c,.3));
 v3FxUpd(sc);
 /* cible d'un engagement restée hors cadre : repère en bord d'écran */
 {const F=V3D.frame,B=F&&!F.cancel&&F.b();if(B){const s=v3dProj(B.x,B.y,0),m=40;if(s&&(!s[2]||s[0]<m||s[0]>v.w-m||s[1]<m||s[1]>v.h-m)){let dx=s[0]-v.cx,dy=s[1]-v.cy;if(!s[2]){dx=-dx;dy=-dy}const kx=dx?((dx>0?v.w-m-v.cx:m+16-v.cx)/dx):1e9,ky=dy?((dy>0?v.h-m-v.cy:m+30-v.cy)/dy):1e9,kk=Math.min(Math.abs(kx),Math.abs(ky)),e=v3Txt('E','ve',v.cx+dx*kk,v.cy+dy*kk,'➤ '+t('v3d.edge',{a:mi(dist(F.a,B))}),V3D.col.unfriendly);e.e.dataset.edge='1'}}}
 /* pools : ce qui n'a pas servi dans cette image est masqué */
 for(const k in G.pool){const P=G.pool[k];for(let i=G.pi[k]||0;i<P.length;i++)P[i].visible=false}
 {const e=v3El('TAG','');if(!e.e.id){e.e.id='v3dTag'}const tx2=`<b>${t('v3d.tag')}</b> · ${t('v3d.tag.d')}`+(OFF.length?`<br>${t('v3d.off')} ${OFF.join(' · ')}`:'');/* portées dont l'arc sort de l'écran : rappelées ici */if(e.tx!==tx2){e.tx=tx2;e.e.innerHTML=tx2}}
 V3D.els.forEach((e,k2)=>{if(e.u===n)return;if(n-e.u>400){e.e.remove();V3D.els.delete(k2)}else if(!e.e.hidden)e.e.hidden=true});
 G.rnd.render(G.sc,cm);
 /* fluidité : sous 25 images par seconde pendant 3 s, proposer le retour à la carte, sans bloquer */
 const ms=performance.now()-t0;V3D.ms+=(ms-V3D.ms)*.1;const fps=1/Math.max(.001,V3D.dtR);V3D.fps+=(fps-V3D.fps)*.1;if(V3D.on&&k>=1&&fps<25&&!window.__noV3DSlow)V3D.slowT+=V3D.dtR;else V3D.slowT=Math.max(0,V3D.slowT-V3D.dtR*2);
 if(V3D.slowT>3&&!V3D.slowAsk&&!V3D.slowOff){V3D.slowAsk=true;const e=document.createElement('div');e.id='v3dSlow';e.setAttribute('role','status');e.innerHTML=`<span>${t('v3d.slow')}</span><button class="btn" data-a="v3d">${t('v3d.slow.b')}</button><button class="btn" data-a="v3dslowx">${t('v3d.slow.x')}</button>`;$('mapw').appendChild(e)}}
/* altitude d'affichage d'un aéronef : décollage, vol, retour ; sans effet sur les règles */
function v3Air(o){if(o.type==='helo'){let k=1;if(o.born!==undefined)k=clamp((S.t-o.born-(o.dep>o.born?o.dep-o.born-2:0))/3);if((o.rtb||o.recT)&&o.base){k=Math.min(k,clamp(dist(o,o.base)/8))}return Math.max(.04,k)}return usable(o)?1:.12}
/* nuage de probabilité d'un contact sous-marin : même grille et mêmes cases que la carte */
function v3Cloud(c){const G=V3D.G,D=c.dt,n=D.n;let q=G.dt.get(c);if(!q){const data=new Uint8Array(n*n*4),tx=new THREE.DataTexture(data,n,n,THREE.RGBAFormat);tx.magFilter=tx.minFilter=THREE.NearestFilter;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,0,1,1,0,1],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,1,1,1],2));g.setIndex([0,2,1,1,2,3]);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,side:THREE.DoubleSide}));m.frustumCulled=false;G.sc.add(m);G.dt.set(c,q={m,tx,data,at:-9})}
 q.u=V3D.n;q.m.position.set(D.x0,.05,D.y0);q.m.scale.set(n*D.g,1,n*D.g);if(S.t-q.at>.5||S.t<q.at){q.at=S.t;const N=n*n,mx=D.max||1e-6,d=q.data;d.fill(0);for(const k of D.reg){const v=(D.p[k]+D.p[k+N])/mx,i=k*4;d[i]=245;d[i+1]=191;d[i+2]=84;d[i+3]=Math.round(255*(.08+.3*Math.min(1,v)))}q.tx.needsUpdate=true}}
function v3dState(){const G=V3D.G;return{rings:G?['r0','r1'].flatMap(k=>(G.pool[k]||[]).filter(o=>o.visible).map(o=>[+o.position.x.toFixed(2),+o.position.z.toFixed(2),+o.scale.x.toFixed(2)])):[],darts:G?Object.keys(G.pool).filter(k=>k[0]==='d').reduce((n,k)=>n+G.pool[k].filter(o=>o.visible).length,0):0,clouds:G?G.dt.size:0,rel:!!(G&&G.rel&&G.rel.M),on:V3D.on,k:V3D.k,tilt:V3D.tilt,az:V3D.az,anchor:V3D.anchor?V3D.anchor.id:null,fz:V3D.fz,frame:!!V3D.frame&&!V3D.frame.cancel,fx:V3D.fxs.map(f=>f.k),objs:[...V3D.objs].map(([o,r])=>({id:o.id,k:r.k,key:r.key})),hits:V3D.hits.map(h=>({id:h.o.id,sx:h.sx,sy:h.sy,r:h.r})),ms:V3D.ms,fps:V3D.fps,was:V3D.was,els:[...V3D.els].filter(([k,e])=>!e.e.hidden).map(([k,e])=>[k,e.tx])}}
Object.assign(I18N.fr,{'lay.v3d':'Vue rapprochée 3D','v3d.btn':'Vue rapprochée 3D de l’unité sélectionnée','v3d.btn.off':'Revenir à la carte','v3d.tag':'Vue rapprochée','v3d.off':'Hors cadre :','v3d.lv':'3D','v3d.lv.aria':'Vue rapprochée 3D : ouvrir la légende','v3d.tag.d':'modèles hors échelle · distances exactes','v3d.noclick':'Revenez à la carte pour désigner un point.','v3d.none':'Sélectionnez une unité navale ou aérienne pour la vue rapprochée.','v3d.slow':'Affichage lent dans la vue rapprochée.','v3d.slow.b':'Revenir à la carte','v3d.slow.x':'Continuer',
 'v3d.leg':'Vue rapprochée 3D : au-delà du zoom détaillé, l’unité navale ou aérienne sélectionnée apparaît en modèle. Les modèles ne sont pas à l’échelle (un navire à l’échelle serait invisible) ; les distances et les portées restent exactes. Dans cette vue, le temps passe à ×¼ : les boutons de vitesse l’accélèrent. Les ordres se donnent depuis les panneaux.',
 'v3d.r.sen':'Capteur','v3d.r.sil':'Capteur, silence radar','v3d.r.son':'Écoute','v3d.r.act':'Sonar actif','v3d.r.fire':'Portée de tir','v3d.r.icp':'Interception','v3d.r.thr':'Menace','v3d.fx.int':'Piste {a} interceptée','v3d.fx.miss':'Piste {a} manquée','v3d.fx.arr':'Piste {a} arrivée','v3d.fx.lost':'Piste {a} perdue',
 'v3d.fx.t.hit':'{a} : contact neutralisé','v3d.fx.t.miss':'{a} : manquée, contact perdu','v3d.fx.t.none':'{a} : rien dans la zone','v3d.fx.t.wrong':'{a} : tir à tort','v3d.fx.t.run':'{a} · {b} s','v3d.edge':'cible à {a} milles','v3d.k':'{a} · cap {b}° · {c}','v3d.k2':'{a} · cap {b}°','v3d.st.ok':'état {a} %','v3d.st.dmg':'avarie, état {a} %',
 'spd.eff':'temps ×{a}','spd.eff.t':'Vitesse réellement appliquée, ralenti au zoom compris','l.x14':'Crise à échéance : vitesse ramenée à ×¼.'});
Object.assign(I18N.en,{'lay.v3d':'Close 3D view','v3d.btn':'Close 3D view of the selected unit','v3d.btn.off':'Back to the map','v3d.tag':'Close view','v3d.off':'Off screen:','v3d.lv':'3D','v3d.lv.aria':'Close 3D view: open the legend','v3d.tag.d':'models not to scale · distances exact','v3d.noclick':'Go back to the map to designate a point.','v3d.none':'Select a naval or air unit for the close view.','v3d.slow':'The close view is running slowly.','v3d.slow.b':'Back to the map','v3d.slow.x':'Keep going',
 'v3d.leg':'Close 3D view: beyond the detailed zoom, the selected naval or air unit appears as a model. Models are not to scale (a ship to scale would be invisible); distances and ranges stay exact. In this view, time runs at ×¼: the speed buttons accelerate it. Orders are given from the panels.',
 'v3d.r.sen':'Sensor','v3d.r.sil':'Sensor, radar silent','v3d.r.son':'Listening','v3d.r.act':'Active sonar','v3d.r.fire':'Weapon range','v3d.r.icp':'Interception','v3d.r.thr':'Threat','v3d.fx.int':'Track {a} intercepted','v3d.fx.miss':'Track {a} missed','v3d.fx.arr':'Track {a} hit','v3d.fx.lost':'Track {a} lost',
 'v3d.fx.t.hit':'{a}: contact neutralised','v3d.fx.t.miss':'{a}: missed, contact lost','v3d.fx.t.none':'{a}: nothing in the area','v3d.fx.t.wrong':'{a}: wrong target','v3d.fx.t.run':'{a} · {b} s','v3d.edge':'target at {a} miles','v3d.k':'{a} · heading {b}° · {c}','v3d.k2':'{a} · heading {b}°','v3d.st.ok':'state {a} %','v3d.st.dmg':'damaged, state {a} %',
 'spd.eff':'time ×{a}','spd.eff.t':'Speed actually applied, zoom slow-down included','l.x14':'Timed crisis: speed back to ×¼.'});
