#!/usr/bin/env python3
"""Pack sonore de FOGLINE (version 56).

Contrôle les 170 WAV d'origine (empreintes du catalogue), produit les dérivés MP3 servis par le jeu
dans assets/audio/web/ et écrit proto/audio-lib.json, la bibliothèque compacte intégrée à la page
(profils, textes FR/EN, identifiants des fichiers). Les WAV ne sont jamais modifiés.

Usage : python3 tools/audio/optimise.py [--check]   (ffmpeg requis, sauf avec --check)
"""
import hashlib, json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PACK = os.path.join(ROOT, 'assets', 'audio')
WEB = os.path.join(PACK, 'web')
jl = lambda n: json.load(open(os.path.join(PACK, n), encoding='utf-8'))
cat, lib, radio = jl('catalogue-audio-complet.json'), jl('bibliotheque-reponses.json'), jl('radio-phrases-fr-en.json')
check = '--check' in sys.argv
bad = 0
out = {'env': {}, 'sfx': {}, 'vo': {}}
for a in cat['assets']:
    src = os.path.join(PACK, a['file'])
    if not os.path.exists(src):
        print('MANQUANT', a['file']); bad += 1; continue
    if hashlib.sha256(open(src, 'rb').read()).hexdigest() != a['sha256']:
        print('EMPREINTE DIFFÉRENTE', a['file']); bad += 1
    f = a['file']
    if f.startswith('audio/environnement/'):
        kind, rel, br = 'env', 'env/' + a['id'] + '.mp3', ('112k' if a.get('loop') else '96k')
    elif f.startswith('audio/unites/sfx/'):
        kind, rel, br = 'sfx', 'sfx/' + a['id'] + '.mp3', '96k'
    else:
        kind, rel, br = 'vo', 'vo/en/' + os.path.basename(f)[:-4] + '.mp3', '64k'
    out[kind][a['id'] if kind != 'vo' else os.path.basename(f)[:-4]] = {'bus': a.get('bus'), 'd': round(a.get('durationSeconds', 0), 2), 'loop': bool(a.get('loop'))}
    dst = os.path.join(WEB, rel)
    if check or (os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src)):
        continue
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-c:a', 'libmp3lame', '-b:a', br, '-ar', '48000', dst], check=True)
print('fichiers du catalogue :', len(cat['assets']), '· défauts :', bad)
# bibliothèque compacte pour la page : ni empreintes ni chemins, seulement ce que le moteur de présentation lit
L = {'v': 1,
     'profiles': {p['id']: {'sel': p['selectionPhraseIds'], 'acc': p['acceptedPhraseIds'], 'ss': p['selectionSfx'], 'as': p['acceptedSfx']} for p in lib['profiles']},
     'ph': {p['id']: [p['text']['fr'], p['text']['en'], 1 if p['audio'].get('en') else 0, 1 if p['audio'].get('fr') else 0] for p in lib['phrases']},
     'ord': lib['orderPhraseIds'], 'st': lib['statusSfx'],
     'radio': {p['id']: [p['fr'], p['en']] for p in radio['phrases']},
     'env': {k: [v['bus'], v['d'], 1 if v['loop'] else 0] for k, v in out['env'].items()},
     'sfx': sorted(out['sfx']), 'vo': sorted(out['vo'])}
dst = os.path.join(ROOT, 'proto', 'audio-lib.json')
if not check:
    json.dump(L, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    tot = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(WEB) for f in fs)
    print('dérivés :', round(tot / 1e6, 2), 'Mo ·', dst, os.path.getsize(dst), 'octets')
sys.exit(1 if bad else 0)
