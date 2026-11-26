import os
#!/usr/bin/env python3
"""Assemble la page jouable à partir de src.html et des données.
Écrit ../index.html (GitHub Pages), seuil-prototype.html (publication) et t.html (tests)."""
import base64, os, json
d = os.path.dirname(os.path.abspath(__file__))
rd = lambda p, m='r': open(os.path.join(d, p), m, **({} if 'b' in m else {'encoding': 'utf-8'})).read()
# three.js r159 (script classique) affiche à chaque chargement un avertissement de dépréciation : ce format disparaît à partir de r160.
# La page tient en un seul fichier et démarre le globe dès l'accueil : un module ES inséré dans la page s'exécuterait trop tard.
# On garde donc r159 et on retire seulement cette instruction à l'assemblage ; le fichier de vendor/ reste celui d'origine.
THREE_WARN = "console.warn('Scripts \"build/three.js\" and \"build/three.min.js\" are deprecated with r150+, and will be removed with r160. Please use ES Modules or alternatives: https://threejs.org/docs/index.html#manual/en/introduction/Installation'),"
def three_quiet(src):
    assert src.count(THREE_WARN) == 1, "avertissement de three.js introuvable : la version de vendor/three.min.js a changé"
    return src.replace(THREE_WARN, 'void 0,')  # la suite est une expression : « void 0, » garde la syntaxe valide
b64 = lambda p: 'data:image/jpeg;base64,' + base64.b64encode(rd(p, 'rb')).decode()
s = rd('src.html')
th = rd('th/theatres.json')
for k in json.loads(th):
    if os.path.exists(os.path.join(d, f'th/{k}.jpg')): th = th.replace(f'__THIMG_{k}__', b64(f'th/{k}.jpg'))
# v56 : modules de la page (son, vue rapprochée 3D), insérés tels quels dans le script principal
R = [('/*__AUDJS__*/', rd('audio.js').replace('__AUDLIB__', rd('audio-lib.json'))), ('/*__V3DJS__*/', rd('vue3d.js')), ('__NAVALJS__', rd('naval-alloc.js')), ('__NAVAL__', rd('naval-catalogue.json')), ('__MILSYMBOL__', rd('milsymbol.js')),
     ('__MAPLIBRE__', rd('vendor/maplibre-gl.js').replace('</script', '<\\/script')),
     ('__THREE__', three_quiet(rd('vendor/three.min.js')).replace('</script', '<\\/script')),
     ('__IMG__', b64('../maps/theatre.jpg')), ('__MASK__', rd('mask.rle')), ('__GEO__', rd('geo.json')),
     ('__TH__', th), ('__WORLD__', b64('th/world.jpg')), ('__DB__', rd('scenarios.json')),
     ('__VEC__', rd('th/vec.json')), ('__HICOAST__', rd('th/hicoast.json') if os.path.exists('th/hicoast.json') else 'null'), ('__SND__', rd('son-pack.json')),
     ('__RELIEF__', json.dumps({k: 'data:image/png;base64,' + base64.b64encode(rd(f'th/relief_{k}.png', 'rb')).decode() for k in json.loads(rd('th/views.json')) if os.path.exists(os.path.join(d, f'th/relief_{k}.png'))}))]
for k, v in R:
    assert s.count(k) == 1, k
for k, v in R:
    s = s.replace(k, v, 1)
open(os.path.join(d, 'seuil-prototype.html'), 'w', encoding='utf-8').write(s)
open(os.path.join(d, 't.html'), 'w', encoding='utf-8').write('<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><script>/* page de test : la fenêtre de crise (v51) est coupée par défaut, uiv51.js la rallume ; les contacts sous-marins gardent leur zone de départ, que le jeu ne trace plus (v55) : uiv55.js et playGame la retirent */window.__noCW=1;window.__subZone=1;/* v56 : la vue rapprochée 3D est coupée pour les anciens tests, uiv56.js la rallume */window.__noV3D=1</script>' + s)
open(os.path.join(d, '../index.html'), 'w', encoding='utf-8').write('<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">' + s)
print(len(s))

# contrôle : clés de traduction en double (la dernière écrase la première sans prévenir)
import re as _re, collections as _co


_s=open('src.html',encoding='utf-8').read();_i=_s.find('const I18N=');_j=_s.find('\nlet LANG');_b=_s[_i:_j];_f=_b.find('fr:{');_e=_b.find('en:{',_f)
for _n,_seg in (('fr',_b[_f:_e]),('en',_b[_e:])):
    _d=[k for k,v in _co.Counter(_re.findall(r"(?<=[{,\n])\s*'([a-zA-Z0-9_.!-]+)':",_seg)).items() if v>1]
    if _d: print('ATTENTION clés en double', _n, _d)
