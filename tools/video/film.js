// Film de présentation FOGLINE (anglais, 1280 × 720, 30 images par seconde). node film.js still | full
const { chromium } = require('playwright'); const fs = require('fs'); const { execFileSync } = require('child_process');
const MODE = process.argv[2] || 'still', FPS = 30, W = 1280, H = 720, OUT = (process.env.OUT || __dirname + '/out'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: W, height: H } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.addInitScript(() => { try { localStorage.setItem('seuil.lang', 'en') } catch (_) { } });
  await p.goto('file://' + require('path').resolve(__dirname, '../../index.html') + ''); await p.waitForTimeout(2500);
  await p.addStyleTag({ content: '#vcap{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:99999;max-width:900px;padding:12px 22px;background:rgba(7,18,28,.92);border:1px solid #2A4559;border-left:4px solid #F2B544;color:#E7EEF5;font:600 22px/1.3 "Saira Semi Condensed","Arial Narrow",Arial,sans-serif;text-align:center;pointer-events:none}#vcap:empty{display:none}#vcard{position:fixed;inset:0;z-index:99998;background:#07121C;color:#E7EEF5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;font-family:"Saira Semi Condensed","Arial Narrow",Arial,sans-serif;text-align:center}#vcard h1{font-size:92px;letter-spacing:.18em;margin:0;font-weight:700}#vcard p{font-size:28px;margin:0;color:#B7C8D6;max-width:900px}#vcard small{font-size:19px;color:#F2B544;letter-spacing:.08em}' });
  await p.evaluate(() => { const c = document.createElement('div'); c.id = 'vcap'; document.body.appendChild(c); window.cap = t => { document.getElementById('vcap').textContent = t || '' }; window.card = h => { let k = document.getElementById('vcard'); if (!h) { if (k) k.remove(); return } if (!k) { k = document.createElement('div'); k.id = 'vcard'; document.body.appendChild(k) } k.innerHTML = h } });
  let scene = 0; const files = [];
  // une scène = une suite d'images JPEG, encodée aussitôt en un fichier
  async function shoot(name, secs, perFrame) {
    scene++; const dir = OUT + '/s' + scene; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
    if (MODE === 'still') { if (perFrame) for (let i = 0; i < Math.round(secs * FPS) - 1; i++)await perFrame(i, true); await p.waitForTimeout(250); await p.screenshot({ path: OUT + '/still-' + scene + '-' + name + '.jpg', type: 'jpeg', quality: 92 }); return }
    const n = Math.round(secs * FPS); for (let i = 0; i < n; i++) { if (perFrame) await perFrame(i, false); await p.screenshot({ path: dir + '/f' + String(i).padStart(5, '0') + '.jpg', type: 'jpeg', quality: 92 }) }
    const tmp = OUT + '/s' + scene + '.tmp.mp4', fin = OUT + '/s' + scene + '.mp4'; execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', dir + '/f%05d.jpg', '-vf', `fade=t=in:st=0:d=0.3,fade=t=out:st=${(secs - .3).toFixed(2)}:d=0.3,format=yuv420p`, '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', String(FPS), tmp]); fs.renameSync(tmp, fin); files.push(fin); fs.rmSync(dir, { recursive: true, force: true }); console.log('scène', scene, name, n, 'images');
  }
  const live = async ms => p.waitForTimeout(ms);
  // 1. titre
  await p.evaluate(() => { card('<h1>FOGLINE</h1><p>A serious game about deciding under uncertainty</p><small>FICTIONAL EXERCISE · REAL GEOGRAPHY · PROTOTYPE</small>') });
  await shoot('title', 3.5);
  // 2. accueil (globe en mouvement : temps réel)
  await p.evaluate(() => { card(null); __S.home(false); cap('You command a small force. You never see the truth, only what your sensors report.') });
  await shoot('home', 4.5, async () => live(20));
  // 3. missions
  await p.evaluate(() => { const b = document.querySelector('[data-a="play"]'); if (b) b.click(); cap('Nine missions across six real theatres. Every event is fictional.') }); await live(1200);
  await shoot('missions', 4);
  // 4. briefing
  await p.evaluate(() => { __S.brief('asw', false); cap('Example: “Deep-water hunt”. Escort a convoy while unknown contacts appear below the surface.') }); await live(1200);
  await shoot('brief', 4.5);
  // 5. partie : contact sous-marin
  await p.evaluate(() => { const A = __S; A.newGame(21, { sc: 'asw', deck: A.SC.asw.rec, contested: false, guided: false, timer: 'easy', novar: true }); const S = A.s; S.running = false; S.sched = {}; S.pendingK = []; S.sc = { ...S.sc, dyn: 0 }; document.getElementById('over').hidden = true; document.getElementById('over').innerHTML = ''; for (let i = 0; i < 100; i++)A.step(.1); A.redraw(); cap('The convoy sails. Your destroyer, submarine and patrol aircraft are on station.') }); await live(600);
  await shoot('map', 3.5, async () => live(15));
  await p.evaluate(() => { const A = __S, S = A.s; let c = null; for (let k = 0; k < 30 && !c; k++) { const x = A.startCrisis('sub'); if (x && x.truth === 'sousmarin') c = x; else if (x) x.closed = true } window.__c = c; A.cwTick(); const d = document.getElementById('cw'); if (d && d.open) d.appendChild(document.getElementById('vcap')); cap('A new crisis opens. Time stops while you read.') }); await live(900);
  await shoot('crisis', 4.5);
  await p.evaluate(() => { const A = __S, S = A.s, c = window.__c; document.body.appendChild(document.getElementById('vcap')); const x = document.querySelector('#cw [data-cw="x"]'); if (x) x.click(); S.running = false; S.sel = c; A.redraw(); cap('Where is it? The amber cloud is only what your own measurements allow.') }); await live(700);
  await p.evaluate(() => { const A = __S, c = window.__c; window.__cam0 = { x: A.cam.x, y: A.cam.y, z: A.cam.z }; window.__cam1 = { x: c.zone.x + 20, y: c.zone.y + 25, z: A.minZ() * 2.1 } });
  await shoot('cloud', 5, async (i) => { await p.evaluate(i => { const A = __S, a = window.__cam0, b = window.__cam1, u = Math.min(1, i / 60), e = u * u * (3 - 2 * u); A.cam.x = a.x + (b.x - a.x) * e; A.cam.y = a.y + (b.y - a.y) * e; A.cam.z = a.z + (b.z - a.z) * e; if (A.draw) A.draw() }, i); await live(10) });
  await p.evaluate(() => { const A = __S, S = A.s, c = window.__c, u = S.units.find(u => u.type === 'recon'); A.v50.ASWP.pat = 'tri'; A.v50.ASWP.mode = 'a'; A.buoyOrder(u, c.zone.x, c.zone.y); cap('You order the patrol aircraft to drop three active sonobuoys.') });
  await shoot('buoys', 5, async (i) => { await p.evaluate(i => { const A = __S; A.step(.1); if (i % 6 === 0) A.redraw(); else if (A.draw) A.draw() }, i) });
  await p.evaluate(() => cap('Every sensor that listens reshapes the estimate. Even silence removes water.'));
  await shoot('fix', 5, async (i) => { await p.evaluate(i => { const A = __S; if (i < 90 && !(A.dtReview(window.__c).ok && window.__c.cls)) A.step(.1); if (i % 6 === 0) A.redraw(); else if (A.draw) A.draw() }, i) });
  await p.evaluate(() => { const A = __S; A.redraw(); const r = document.querySelector('#rightC') || document.querySelector('#right'); const d = document.querySelector('#right .dtb'); if (d) d.scrollIntoView({ block: 'start' }); cap('What is it? Evidence classifies the contact. It stays “suspect”, not hostile.') });
  await shoot('what', 5);
  await p.evaluate(() => { const h = [...document.querySelectorAll('#right .dtb h3')].pop(); if (h) h.scrollIntoView({ block: 'start' }); cap('Engagement is offered only when position, identity and data age all hold.') });
  await shoot('action', 5);
  console.log(JSON.stringify(await p.evaluate(() => { const A = __S, c = window.__c; return { t: A.s.t, cov: c.cov, loc: c.located, cls: c.cls && c.cls.h, q: A.dtQ(c).p, rv: A.dtReview(c), aff: c.cls && A.dtAff(c), infra: A.infra() } })));
  // 6. fin
  await p.evaluate(() => { cap(''); card('<h1 style="font-size:64px">FOGLINE</h1><p>The game does not reward the shot.<br>It asks whether you knew enough to decide.</p><small>FICTIONAL EXERCISE · SCORES ARE GAME MODELS, NOT MEASUREMENTS</small><p style="font-size:20px">Prototype · github.com/otakuch/fogline</p>') });
  await shoot('end', 5);
  if (MODE === 'full') { fs.writeFileSync(OUT + '/list.txt', files.map(f => "file '" + f + "'").join('\n')); execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', OUT + '/list.txt', '-c', 'copy', OUT + '/fogline-presentation.tmp.mp4']); fs.renameSync(OUT + '/fogline-presentation.tmp.mp4', OUT + '/fogline-presentation-en.mp4'); console.log('fini') }
  await b.close();
})();
