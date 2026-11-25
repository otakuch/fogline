// Contrôle des cinq catalogues (cas D01) : JSON valides, identifiants uniques, références de capacités,
// d'événements et de gestionnaires présentes. Il ne prouve rien sur le moteur : les catalogues n'y sont pas branchés.
const fs = require('fs'), path = require('path'), dir = path.join(__dirname, '..', '..', 'data', 'bases');
const co = JSON.parse(fs.readFileSync(path.join(dir, 'db_coordination.json'), 'utf8'));
const files = co.catalogueFiles.map(f => f.file), ids = new Map(), err = [];
const caps = new Set(co.capabilities.map(x => x.id)), evs = new Set(co.events.map(x => x.id)), hs = new Set(co.handlers.map(x => x.id)), mech = new Set();
const add = (id, where) => { if (ids.has(id)) err.push(`doublon ${id} (${where}, ${ids.get(id)})`); else ids.set(id, where); };
[...co.capabilities, ...co.events, ...co.handlers, ...co.crossDomainRules].forEach(x => add(x.id, 'coordination'));
const cats = files.map(f => { const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); d.unitDefinitions.forEach(u => { add(u.id, f); (u.capabilities || []).forEach(c => { if (!caps.has(c)) err.push(`${u.id} : capacité absente ${c}`); }); (u.configurations || []).forEach(g => (g.capabilities || []).forEach(c => { if (!caps.has(c)) err.push(`${u.id} : capacité de configuration absente ${c}`); })); });
  d.mechanicDefinitions.forEach(m => { add(m.id, f); mech.add(m.id); if (!hs.has(m.handlerId)) err.push(`${m.id} : gestionnaire absent ${m.handlerId}`); (m.requiresCapabilities || []).forEach(c => { if (!caps.has(c)) err.push(`${m.id} : capacité absente ${c}`); }); (m.emits || []).forEach(e => { if (!evs.has(e)) err.push(`${m.id} : événement absent ${e}`); }); }); return { f, units: d.unitDefinitions.length, mech: d.mechanicDefinitions.length, integrated: d.runtimeIntegrated }; });
co.crossDomainRules.forEach(r => { (r.mechanics || []).forEach(m => { if (!mech.has(m)) err.push(`${r.id} : mécanique absente ${m}`); }); (r.events || []).forEach(e => { if (!evs.has(e)) err.push(`${r.id} : événement absent ${e}`); }); });
cats.forEach(c => console.log(c.f.padEnd(20), c.units, 'types ·', c.mech, 'mécaniques · branché au moteur :', c.integrated));
console.log(ids.size, 'identifiants ·', err.length, 'erreur(s)'); err.slice(0, 20).forEach(e => console.log('  ', e)); process.exit(err.length ? 1 : 0);
