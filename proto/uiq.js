// Teste chaque crise de profondeur dans chaque théâtre et langue : actions, résolution, textes.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + __dirname + '/t.html');
 const r = await p.evaluate(() => { const A = __S, out = []; for (const lang of ['fr','en']) { A.setLang(lang);
  for (const sc of ['f1','g6','e6','a6','m6','c1']) for (const ty of ['mine','evac','seabed','mirror','alarm']) { A.newGame(11, {sc, deck:A.SC[sc].rec, contested:false}); const S=A.s; S.running=false; S.tokens=9; const n=S.crises.length; A.startCrisis(ty,ty==='evac'?'PORT':undefined); const c=S.crises[n]; if(!c){out.push(ty+' absent');continue} const L=A.crisisActions(c).filter(x=>x.kind!=='collect'); out.push([lang,sc,ty,c.title,c.truth,L.map(x=>(x.ok?'':'✗')+x.id+':'+x.label+(x.ok?'':' ('+x.why+')')).join(' / ')].join(' | ')); const q=L.find(x=>x.ok); if(q){A.doAct(q);for(let i=0;i<1600&&!c.closed&&!S.over;i++){A.step(.1);S.running=false} out.push('   -> '+(c.closed?'close, issue '+c.out:'NON CLOSE'))} } }
  return {out,missing:A.missing()} });
 console.log(r.out.filter((x,i)=>/NON|absent/.test(x)||i<16||x.startsWith('en | m6')).join('\n')); console.log('lignes',r.out.length,'missing', r.missing, 'errs', errs); await b.close() })();
