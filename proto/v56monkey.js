// Version 56 : gestes au hasard avec la vue rapprochée allumée (zoom, clics, glisser, touches, vitesses, bouton 3D, réglages du son).
// Critères : aucune erreur de page, aucun texte manquant, le temps de jeu avance, la vue s'ouvre et se referme. Usage : node v56monkey.js [actions par mission]
const { chromium } = require('playwright');
(async () => {
  const N = +(process.argv[2] || 350), b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); let fails = 0, tot = 0;
  for (const [sc, lang, simple] of [['asw', 'fr', false], ['l12', 'en', false], ['hc', 'fr', true]]) {
    const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => { try { localStorage.setItem('seuil.lang', l) } catch (_) { } }, lang); await p.route(/fonts\.g/, r => r.abort());
    await p.goto('file://' + __dirname + '/t.html'); await p.waitForTimeout(600); await p.evaluate(() => { window.__noV3D = 0; window.__NOCONF = 1 });
    await p.evaluate(([id, s]) => { __S.brief(id, s) }, [sc, simple]); await p.waitForTimeout(250); await p.click('[data-a=begin]'); await p.waitForTimeout(300); const ack = await p.$('[data-a=ack]'); if (ack) await ack.click(); await p.waitForTimeout(300);
    let seed = 12345 + sc.length * 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff, ri = n => Math.floor(rnd() * n);
    let ins = 0, outs = 0, was = false, t0 = await p.evaluate(() => __S.s.t), maxK = 0;
    for (let i = 0; i < N; i++) {
      const a = ri(16), x = 380 + ri(680), y = 130 + ri(700);
      try {
        if (a < 3) { await p.mouse.move(x, y); await p.mouse.wheel(0, rnd() < .62 ? -240 : 240) }
        else if (a < 5) await p.mouse.click(x, y)
        else if (a === 5) { await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + ri(160) - 80, y + ri(120) - 60, { steps: 3 }); await p.mouse.up() }
        else if (a === 6) await p.keyboard.press(['Escape', 'c', 'ArrowLeft', 'ArrowUp', 'n', 'n', '1', '2', '4', 'v', 't', 'Home', 'Space'][ri(13)])
        else if (a === 7) { const k = ['sp025', 'sp05', 'sp1', 'sp2', 'sp4', 'sp8', 'spff', 'sp0'][ri(8)]; await p.evaluate(k => { const e = document.getElementById(k); if (e && !e.hidden && e.offsetParent) e.click() }, k) }
        else if (a === 8) await p.evaluate(() => { const e = document.getElementById('v3dBtn'); if (e && !e.hidden) e.click() })
        else if (a === 9) await p.evaluate(() => { const A = __S, S = A.s, L = S.units.filter(u => A.v3dElig(u)); if (L.length) { const u = L[Math.floor(Math.random() * L.length)]; S.sel = u; A.audSel(); A.cam.x = u.x; A.cam.y = u.y; A.redraw() } })
        else if (a === 10) await p.evaluate(() => { const L = [...document.querySelectorAll('#rightC [data-a=act]:not([disabled]),#rightC [data-a=uact]:not([disabled]),#left [data-a=selU],#left [data-a=selK]')]; if (L.length) L[Math.floor(Math.random() * L.length)].click() })
        else if (a === 11) await p.evaluate(() => { const A = __S, S = A.s; if (!S.over && !S.running && !document.getElementById('over').hidden === false) S.running = true; const o = document.getElementById('over'); if (!o.hidden) { const b = o.querySelector('[data-a=mclose],[data-a=legclose],[data-a=r3close],[data-a=ack]'); if (b) b.click() } })
        else if (a === 12) { await p.keyboard.down('Shift'); await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + 90, y, { steps: 2 }); await p.mouse.up(); await p.keyboard.up('Shift') }
        else if (a === 13) await p.mouse.click(x, y, { button: 'right' })
        else await p.waitForTimeout(120 + ri(250));
      } catch (e) { errs.push('geste ' + a + ' : ' + String(e.message).slice(0, 120)) }
      if (i % 5 === 0) { const q = await p.evaluate(() => ({ on: __S.V3D.on, k: __S.V3D.k, over: __S.s.over })); if (q.on && !was) ins++; if (!q.on && was) outs++; was = q.on; maxK = Math.max(maxK, q.k); if (q.over) break }
      tot++;
    }
    const r = await p.evaluate(() => { const A = __S, S = A.s; const o = document.getElementById('over'); if (!o.hidden && !S.over) { o.hidden = true; o.innerHTML = '' } S.running = true; S.speed = 4; return { t: S.t, miss: A.missing() } }); await p.waitForTimeout(2500);
    const r2 = await p.evaluate(() => ({ t: __S.s.t, over: __S.s.over, acc: __S.s.speed }));
    const ok = !errs.length && !r.miss.length && (r2.over || r2.t > r.t) && ins > 0 && outs > 0;
    if (!ok) fails++; console.log(`${ok ? 'ok   ' : 'ÉCHEC'} ${sc} ${lang}${simple ? ' simple' : ''} : entrées dans la vue ${ins}, sorties ${outs}, fondu max ${maxK.toFixed(2)}, temps de jeu ${Math.round(t0)} → ${Math.round(r2.t)} s${r2.over ? ' (partie finie)' : ''}, textes manquants ${r.miss.length}, erreurs ${JSON.stringify(errs.slice(0, 3))}`);
    await p.close();
  }
  console.log(fails ? `ÉCHEC : ${fails} mission(s)` : `v56monkey : ${tot} gestes au hasard, aucun blocage, aucune erreur, aucun texte manquant`); await b.close(); process.exit(fails ? 1 : 0);
})();
