// Exercice rapide, doctrine (esquive, retour des chasseurs), allocation des tirs, journal, avance rapide, portée et relèvement. Usage : node uiqx.js
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), errs = [], out = {};
 for (const [w, h, lang] of [[1440, 900, 'fr'], [390, 844, 'en']]) { const o = out[lang + w] = {}; const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })).newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.g/, r => r.abort());
  await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(600); await p.evaluate(l => { __S.setLang(l); __S.home(true) }, lang); await p.waitForTimeout(200);
  await p.evaluate(() => __S.screenQuick()); await p.waitForTimeout(100);
  for (const v of ['wx:storm', 'tod:night', 'beh:agg', 'lvl:exp', 'force:heavy', 'fam:combat']) await p.click(`[data-a=qx][data-v="${v}"]`);
  o.n = await p.evaluate(() => __S.qxList().length); o.hsQx = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  if (w < 500) await p.screenshot({ path: __dirname + '/../../../work/qx390.png' });
  await p.click('[data-a=qxgo]'); await p.waitForTimeout(100); o.briefQx = await p.locator('#over .warn').first().textContent();
  await p.click('[data-a=expg][data-v="0"]'); await p.click('[data-a=begin]'); await p.waitForTimeout(300); await p.evaluate(() => { document.getElementById('over').hidden = true; __S.s.running = false });
  o.qx = await p.evaluate(() => { const S = __S.s, u = S.units.find(x => x.type === 'fighter' || x.type === 'recon') || S.units[0]; return { qx: !!S.qx, wx: +__S.wxF(u).toFixed(2), deck: S.units.length, rec: __S.SC[S.sc.id].rec.length } });
  // doctrine
  await p.click('[data-a=ltab][data-v=forces]').catch(() => { }); await p.waitForTimeout(100);
  o.docBtns = await p.locator('[data-a=evade],[data-a=wstate]').count();
  if (o.docBtns) { await p.click('details[data-d=cons]>summary'); await p.click('[data-a=evade][data-v="0"]'); await p.click('[data-a=wstate][data-v=winch]') }
  o.doctrine = await p.evaluate(() => [__S.s.evade, __S.s.wstate]);
  // allocation : un raid, un raider visible et localisé
  o.alloc = await p.evaluate(() => { const A = __S, S = A.s; S.evade = true; const c = A.startCrisis('raid'); if (!c || !c.raiders) return 'noraid'; const r = c.raiders[0]; const u = S.units.find(x => A.UT[x.type].ssm && A.UT[x.type].naval) || S.units.find(x => A.UT[x.type].ssm); r.visible = true; r.seen = true; r.located = true; r.hact = true; r.x = u.x + 60; r.y = u.y; S.sel = r; const L = A.shipActions(r).filter(a => a.kind === 'alloc'); return { n: L.length, ok: L.filter(a => a.ok).length, why: L.filter(a => !a.ok).map(a => a.why).slice(0, 3), pk: Math.round(A.pkOf(r) * 100) } });
  await p.evaluate(() => { __S.s.running = false; }); await p.waitForTimeout(500);
  o.allocUi = await p.locator('#right .alr').count();
  const fs = await p.locator('#right .alr [data-v^="fs:"]:not([disabled])').first(); if (await fs.count()) { const t0 = await p.evaluate(() => [__S.s.tokens, __S.mis.length]); await fs.click(); o.salve = await p.evaluate(t0 => [t0[0] - __S.s.tokens, __S.mis.length - t0[1]], t0) }
  // esquive : salve rouge sur une unité navale
  o.esquive = await p.evaluate(() => { const A = __S, S = A.s, u = S.units.find(x => A.UT[x.type].naval); if (!u) return 'nonaval'; S.mis.push({ x: u.x + 70, y: u.y, tg: u, v: 48, side: 'r', pk: .7 }); A.step(.1); const m = S.mis.find(m => m.tg === u); return { evd: !!(m && m.evd), pk: m ? +m.pk.toFixed(2) : null, until: u.evadeUntil > S.t } });
  // tir jusqu'au rapport
  o.rapport = await p.evaluate(() => { const A = __S, S = A.s, r = S.sel, u = S.units.find(x => A.UT[x.type].ssm && x.ssm > 0); if (u && r) { u.fireT = 0; A.fireAt(u, r) } for (let i = 0; i < 80; i++) A.step(.1); return S.log.filter(l => l.cat === 'cbt').filter(l => /chance|estimated/.test(l.m)).map(l => l.m).slice(0, 2) });
  await p.evaluate(() => { const b = document.querySelector('[data-a=ltab][data-v=track]'); if (b) b.click() }); await p.waitForTimeout(100);
  o.logf = await p.locator('[data-a=logf]').count(); if (o.logf) { await p.click('[data-a=logf][data-v=cbt]'); await p.waitForTimeout(100); o.logCbt = await p.locator('.log > div').count() }
  // avance rapide
  await p.click('#spff'); o.ff = await p.evaluate(() => [__S.s.ff, __S.s.speed]); await p.evaluate(() => { __S.s.log.length; }); await p.evaluate(() => { const S = __S.s; S.running = false }); await p.evaluate(() => __S.startCrisis('cyber')); o.ffStop = await p.evaluate(() => [__S.s.ff, __S.s.speed]);
  // portée et relèvement
  if (w > 500) { await p.evaluate(() => { const S = __S.s; S.sel = S.units.find(x => __S.UT[x.type].ssm) || S.units[0] }); const c = await p.evaluate(() => { const r = document.getElementById('c').getBoundingClientRect(); return [r.left + r.width * .55, r.top + r.height * .45] }); await p.mouse.move(c[0], c[1]); await p.waitForTimeout(300); o.hov = await p.evaluate(() => !!__S.HOV); await p.screenshot({ path: __dirname + '/../../../work/hov.png' }) }
  o.hsJeu = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1); o.manque = await p.evaluate(() => __S.missing()); await p.context().close() }
 console.log(JSON.stringify(out, null, 0)); console.log('errs', errs.slice(0, 5)); await b.close() })();
