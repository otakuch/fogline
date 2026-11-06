import fs from 'fs';
const SP=process.argv[2];
const m0=await import('module');const req0=m0.createRequire(SP+'/deps/x.js');const {geoOrthographic,geoPath,geoGraticule}=req0('d3-geo');
const topo=await import(SP+'/deps/node_modules/topojson-client/src/index.js');
const {createRequire}=await import('module');
const {chromium}=createRequire('/usr/lib/')('playwright');
const load=r=>JSON.parse(fs.readFileSync(`${SP}/deps/node_modules/world-atlas/countries-${r}.json`));
const pts={Norvege:[8.5,61.6],Suede:[15.5,62.6],Finlande:[26,63.2],Islande:[-18.6,64.9],RoyaumeUni:[-2.5,54.8],Irlande:[-8,53.3],Danemark:[9.5,56.1],Feroe:[-6.9,62.1],Groenland:[-40,71],MerNorvege:[1,68],MerNord:[3,57],Atlantique:[-22,58],Estonie:[25.5,58.8],Allemagne:[10.3,51.2],France:[2.5,46.8],Espagne:[-3.5,40],Russie:[40,62],Canada:[-95,58],Maroc:[-6,32],Italie:[12.5,43],Pologne:[19,52],Shetland:[-1.3,60.3],PC:[6.5,60.8],F1:[3.2,60.6],F2:[14.6,68.3],F3:[-1,64],F4:[-15,65.2],U1:[3,66.6],U2:[-6.5,67.8],H1:[9,72.6],S1:[0.8,61.6],S2:[2.6,60.3],S3:[4.1,62.3],S4:[-0.9,62.6],F5:[2.2,59.1]};
const views={
 globe:{w:1440,h:900,rot:[12,-42],s:430,res:'110m',c:[720,470]},
 theatre:{w:1440,h:900,rot:[-1,-64],s:2000,res:'50m',c:[700,450]},
 secteur:{w:1440,h:900,rot:[-1,-61.3],s:9000,res:'10m',c:[720,450]},
 debrief:{w:680,h:440,rot:[1,-65],s:1500,res:'50m',c:[340,220]},
};
const lines={theatre:{lPC_F1:['PC','F1'],lPC_F2:['PC','F2'],lPC_F3:['PC','F3'],lPC_F4:['PC','F4'],tU1:['H1','U1'],tU2:['H1','U2']},debrief:{tU1:['H1','U1'],tU2:['H1','U2']},secteur:{a:['S4','S1'],b:['S1','S2'],c:['S3','S1']}};
const out={};
const b=await chromium.launch();
for(const [k,v] of Object.entries(views)){
 const w=load(v.res);
 const near=new Set(['Norway','Sweden','United Kingdom','Faeroe Is.','Denmark','Ireland','Finland','Iceland','Germany','Netherlands']);const land=v.res==='10m'?{type:'FeatureCollection',features:topo.feature(w,w.objects.countries).features.filter(f=>near.has(f.properties.name))}:topo.feature(w,w.objects.land), borders=topo.mesh(w,w.objects.countries,(a,c)=>a!==c);
 const p=geoOrthographic().rotate(v.rot).scale(v.s).translate(v.c).clipAngle(90);
 const path=geoPath(p);
 const grat=geoGraticule().step(k==='globe'?[15,15]:k==='secteur'?[2,1]:[5,5])();
 const theatreBox={type:'Polygon',coordinates:[[[-22,54],[-22,75],[28,75],[28,54],[-22,54]].reverse()]};
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${v.w}" height="${v.h}" viewBox="0 0 ${v.w} ${v.h}">
 <defs><filter id="g" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${k==='globe'?5:7}"/></filter>
 <radialGradient id="bg" cx="50%" cy="50%" r="75%"><stop offset="0" stop-color="#0A1440"/><stop offset="1" stop-color="#040716"/></radialGradient></defs>
 <rect width="100%" height="100%" fill="${k==='globe'?'#03050F':'url(#bg)'}"/>
 ${k==='globe'?`<circle cx="${v.c[0]}" cy="${v.c[1]}" r="${v.s+14}" fill="#2F6BFF" opacity=".22" filter="url(#g)"/><circle cx="${v.c[0]}" cy="${v.c[1]}" r="${v.s}" fill="url(#bg)" stroke="#3E78FF" stroke-opacity=".7"/>`:''}
 <path d="${path(grat)}" fill="none" stroke="#3E63C8" stroke-opacity=".2" stroke-width="1"/>
 <path d="${path(land)}" fill="#3F7BFF" opacity=".55" filter="url(#g)"/>
 <path d="${path(land)}" fill="#0C1A4D"/>
 <path d="${path(borders)}" fill="none" stroke="#6E8FE6" stroke-opacity=".55" stroke-width="${k==='globe'?.7:1}"/>
 <path d="${path(land)}" fill="none" stroke="#8FB6FF" stroke-width="1.2"/></svg>`;
 const page=await b.newPage({viewport:{width:v.w,height:v.h},deviceScaleFactor:1.5});
 await page.setContent(`<!doctype html><body style="margin:0;background:#000">${svg}</body>`);
 await page.screenshot({path:`${SP}/maps/${k}.jpg`,type:'jpeg',quality:86});
 await page.close();
 const px={};for(const [n,c] of Object.entries(pts)){const xy=p(c);const vis=path({type:'Point',coordinates:c});if(xy&&vis&&xy[0]>=0&&xy[0]<=v.w&&xy[1]>=0&&xy[1]<=v.h)px[n]=xy.map(Math.round)}
 const ln={};for(const [n,[a,c]] of Object.entries(lines[k]||{})){ln[n]=path({type:'LineString',coordinates:[pts[a],pts[c]]}).replace(/(\.\d)\d+/g,'$1')}
 const box=k==='globe'?path(theatreBox).replace(/(\.\d)\d+/g,'$1'):null;
 out[k]={px,ln,box};
}
await b.close();
fs.writeFileSync(`${SP}/maps/coords.json`,JSON.stringify(out,null,0));
console.log(JSON.stringify(out));
