// Captures du README, dans une langue. Usage : node tools/shots.js <racine du dépôt> <fr|en>
// Écrit docs/screenshots/<langue>/NN-nom.png à partir de proto/t.html (lancer d'abord python3 proto/build.py).
const { chromium } = require('playwright');
const R = process.argv[2] || __dirname + '/..', L = process.argv[3] || 'en', OUT = R + '/docs/screenshots/' + L + '/';
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
 const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }), errs = [];
 const mk = async o => { const c = await b.newContext({ reducedMotion: 'reduce', ...o }), p = await c.newPage(); await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message)); await p.addInitScript(l => { try { localStorage.setItem('seuil.lang', l); localStorage.setItem('seuil.snd', 'off') } catch (e) { } }, L); await p.goto('file://' + R + '/proto/t.html'); await p.waitForTimeout(4500); return p };
 const shot = (p, n) => p.screenshot({ path: OUT + n + '.png' });
 // Partie arrêtée, prête à montrer une crise. setup reçoit A et S.
 const go = async (p, sc, setup, o = {}) => { const r = await p.evaluate(([sc, setup, o]) => { const A = __S; A.closeMenu && A.closeMenu(); A.home(false); document.getElementById('over').hidden = true; A.newGame(o.seed || 21, { sc, deck: A.SC[sc].rec, contested: false, guided: !!o.guided, timer: 'easy' }); const S = A.s; S.running = false; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; for (let i = 0; i < 160; i++) { A.step(.1); S.running = false } A.applyCamX(); const out = new Function('A', 'S', setup)(A, S); A.draw && A.draw(); return out }, [sc, setup, o]); await p.waitForTimeout(1400); return r };
 // Crise avec une vraie vérification : on rejoue le tirage jusqu'à une preuve qui va dans le sens de la vérité choisie.
 const crisis = (type, truth, verify) => `for(let k=0;k<12;k++){S.tokens=4;const c=A.startCrisis('${type}');c.truth='${truth}';S.sel=c;const a=A.crisisActions(c).find(x=>x.id==='${verify}'&&x.ok);if(!a)return 'pas d action ${verify}';A.doAct(a);for(let i=0;i<300&&!(c.ev||[]).length;i++){A.step(.1)}S.running=false;if((c.ev||[]).some(e=>e.lab==='${truth}'))return 'ok';c.closed=true;S.crises=S.crises.filter(x=>x!==c)}return 'preuve contraire'`;
 const log = [];
 let p = await mk({ viewport: { width: 1440, height: 900 } });
 await shot(p, '01-home');
 await p.click('.hs-it[data-a=play]'); await p.waitForTimeout(600); await shot(p, '02-theatres');
 await p.locator('.card[data-a=theatre][data-v=natl]').first().click(); await p.waitForTimeout(400); await shot(p, '03-catalogue');
 await p.evaluate(() => __S.brief('la', false)); await p.waitForTimeout(500); await shot(p, '04-briefing');
 await p.evaluate(() => { __S.home(false); __S.screenQuick() }); await p.waitForTimeout(600); await shot(p, '05-quick-exercise');
 log.push(['cognitive', await go(p, 'la', crisis('desinfo', 'manip', 'osint'))]); await shot(p, '06-cognitive-warfare');
 log.push(['cyber', await go(p, 'la', crisis('cyber', 'etat', 'forensic'))]); await shot(p, '07-cyber-intrusion');
 log.push(['raid', await go(p, 'i15', "S.tokens=4;const c=A.startCrisis('raid');S.sel=c;for(let i=0;i<120;i++){A.step(.1)}S.running=false;if(c&&c.zone){A.cam.x=c.zone.x+40;A.cam.y=Math.max(260,c.zone.y+220);A.cam.z=1.5}return c?'ok':'pas de raid'")]); await shot(p, '08-direct-action');
 log.push(['alarm', await go(p, 'la', "const c=A.startCrisis('alarm');c.truth='fauxp';S.sel=c;return 'ok'", { guided: true })]); await shot(p, '09-false-alarm');
 await p.evaluate(() => __S.openMenu()); await p.waitForTimeout(500); await shot(p, '10-menu');
 await p.evaluate(() => __S.closeMenu()); await p.addScriptTag({ path: R + '/proto/bots.js' });
 log.push(['debrief', await p.evaluate(() => { for (const sd of [1234, 77, 501, 90, 12, 8]) { const g = playGame(sd, 'la', { contested: true, guided: false, timer: 'easy' }, mkBot({})); if (g.ok) return 'ok ' + sd } return 'échec' })]);
 await p.waitForTimeout(900); await shot(p, '11-debrief'); await p.close();
 p = await mk({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); await shot(p, '12-mobile-home');
 await go(p, 'la', "S.sel=null;", { guided: true }); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400); await shot(p, '13-mobile-game'); await p.close();
 console.log(L, JSON.stringify(log), 'erreurs', errs.slice(0, 5)); await b.close()
})();
