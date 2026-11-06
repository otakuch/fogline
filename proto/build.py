import base64, json, os
d = os.path.dirname(os.path.abspath(__file__))
s = open(d + '/src.html', encoding='utf-8').read()
img = 'data:image/jpeg;base64,' + base64.b64encode(open(d + '/../maps/theatre.jpg', 'rb').read()).decode()
th = json.load(open(d + '/th/theatres.json', encoding='utf-8'))
for k, v in th.items():
    if k.startswith('__'): continue
    v['img'] = 'data:image/jpeg;base64,' + base64.b64encode(open(d + '/th/' + k + '.jpg', 'rb').read()).decode()
s = s.replace('__TH__', json.dumps(th, ensure_ascii=False)).replace('__WORLD__', 'data:image/jpeg;base64,' + base64.b64encode(open(d + '/th/world.jpg', 'rb').read()).decode())
s = s.replace('__MILSYMBOL__', open(d + '/milsymbol.js', encoding='utf-8').read())
s = s.replace('__VEC__', open(d + '/th/vec.json', encoding='utf-8').read())
s = s.replace('__MAPLIBRE__', open(d + '/vendor/maplibre-gl.js', encoding='utf-8').read().replace('</script', '<\\/script'))
s = s.replace('__THREE__', open(d + '/vendor/three.min.js', encoding='utf-8').read().replace('</script', '<\\/script'))
s = s.replace('__IMG__', img).replace('__MASK__', open(d + '/mask.rle').read()).replace('__DB__', open(d + '/scenarios.json', encoding='utf-8').read()).replace('__GEO__', open(d + '/geo.json').read())
open(d + '/seuil-prototype.html', 'w', encoding='utf-8').write(s)
print(len(s))
page = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<meta name="description" content="FOGLINE (SEUIL) is a real-time strategy serious game about deciding under uncertainty. Fictional exercise, prototype.">\n'
        + s.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', ''))
open(d + '/../index.html', 'w', encoding='utf-8').write(page)
open(d + '/t.html', 'w', encoding='utf-8').write('<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">' + s)
