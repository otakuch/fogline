// Parcours joué pas à pas avec de vrais clics, pour lire chaque écran avant de décider.
// Usage : node pt34.js <scénario> <simple|full> <fr|en> <largeur> <fichier d'étapes JSON> [dossier de captures]
// Étapes : ["click", sélecteur] · ["text", libellé] · ["map", x, y] (coordonnées du jeu) · ["unit", id] · ["run", secondes] · ["shot", nom] · ["dump"] · ["key", touche]
const { chromium } = require('playwright'), fs = require('fs');
(async () => {
  const [sc, lvl, lang, w, file, dir] = process.argv.slice(2), steps = JSON.parse(fs.readFileSync(file, 'utf8')), D = dir || '/tmp', W = +w || 1440, mob = W < 700;
  const b = await chromium.launch(), p = await (await b.newContext({ viewport: { width: W, height: mob ? 844 : 900 }, isMobile: mob, hasTouch: mob })).newPage(), errs = [];
  await p.route(/fonts\.g/, r => r.abort()); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(500);
  await p.evaluate(([l, sc, simple]) => { const A = __S; A.setLang(l); A.brief(sc, simple); }, [lang, sc, lvl !== 'full']); await p.waitForTimeout(300);
  const hold = () => p.evaluate(() => { const S = __S.s; if (S) S.running = false; });
  const dump = async tag => { const o = await p.evaluate(() => { const S = __S.s, tx = id => { const e = document.getElementById(id); return e && !e.hidden && getComputedStyle(e).display !== 'none' ? e.innerText.replace(/\n{2,}/g, '\n').trim() : ''; }; return { over: document.getElementById('over').hidden ? '' : tx('over'), hud: tx('hud').replace(/\n/g, ' | '), left: tx('leftC'), right: tx('rightC'), clock: tx('dclock'), task: tx('task'), hint: tx('hint'), log: S && S.log ? S.log.slice(0, 6).map(l => l.m || l).join(' / ') : '', t: S ? Math.round(S.t) : 0, miss: __S.missing() }; }); console.log('\n===== ' + tag + ' · t=' + o.t + ' s'); for (const k of ['over', 'hud', 'clock', 'task', 'left', 'right', 'hint', 'log']) if (o[k]) console.log('[' + k + '] ' + o[k].slice(0, k === 'over' ? 2200 : k === 'left' ? (process.env.LEFT ? 1500 : 260) : 1500).replace(/\n/g, ' ¦ ')); if (o.miss.length) console.log('[TEXTES MANQUANTS] ' + o.miss); };
  let n = 0;
  for (const s of steps) {
    n++; try {
      if (s[0] === 'click') await p.click(s[1], { timeout: 4000 });
      else if (s[0] === 'text') await p.locator('button:visible, summary:visible', { hasText: s[1] }).first().click({ timeout: 4000 });
      else if (s[0] === 'unit') { if (mob) await p.click('#mnav [data-v=forces]'); await p.click('[data-a=ltab][data-v=forces]'); await p.click(`[data-a=selU][data-v="${s[1]}"]`, { timeout: 4000 }); }
      else if (s[0] === 'map') { const q = await p.evaluate(([x, y]) => { const r = document.getElementById('c').getBoundingClientRect(), [sx, sy] = __S.toScr(x, y); return [r.left + sx, r.top + sy, document.elementFromPoint(r.left + sx, r.top + sy).id]; }, [s[1], s[2]]); if (q[2] !== 'c') console.log('!! clic carte masqué par #' + q[2] + ' à ' + s[1] + ',' + s[2]); await p.mouse.click(q[0], q[1]); }
      else if (s[0] === 'run') await p.evaluate(sec => { const A = __S; for (let i = 0; i < sec * 10 && !A.s.over; i++) A.step(.1); }, s[1]);
      else if (s[0] === 'key') await p.keyboard.press(s[1]);
      else if (s[0] === 'start') await p.evaluate(([seed, sc, simple]) => { const A = __S; performance.now = () => 0; A.home(false); document.getElementById('over').hidden = true; A.newGame(seed, { sc, deck: A.SC[sc].rec, contested: true, guided: simple, timer: 'easy' }); A.s.running = false; A.applyCamX(); }, [s[1], sc, lvl !== 'full']);
      else if (s[0] === 'eval') console.log('[eval] ' + JSON.stringify(await p.evaluate(s[1])));
      else if (s[0] === 'shot') { await p.waitForTimeout(250); await p.screenshot({ path: D + '/' + s[1] + '.png' }); }
      else if (s[0] === 'dump') { await p.waitForTimeout(200); await dump('étape ' + n + (s[1] ? ' · ' + s[1] : '')); }
      await p.waitForTimeout(120); await hold();
    } catch (e) { console.log('!! étape ' + n + ' ' + JSON.stringify(s) + ' : ' + String(e.message).split('\n')[0]); await dump('après échec'); break; }
  }
  console.log('\nerreurs page', errs.slice(0, 3)); await b.close();
})();
