"""Compose a licensed documentary photo and an original, labeled SVG diagram.
No image synthesis or invented sample photography. The source JPEG is retained.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math,json,hashlib
out=Path('public/assets/marie-curie/media'); source=Path('.runtime/curie-element-sources/pitchblende-museum-original.jpg')
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def f(size):return ImageFont.truetype(font,size)
canvas=Image.new('RGB',(1200,1500),'#17221f');d=ImageDraw.Draw(canvas)
d.rectangle((20,20,1180,1480),outline='#a28b5c',width=3)
d.text((65,62),'PECHBLENDA / URANINITA',font=f(48),fill='#e8d8b3')
im=Image.open(source).convert('RGB').crop((200,1000,3900,4800));im.thumbnail((1060,1080),Image.Resampling.LANCZOS);canvas.paste(im,((1200-im.width)//2,155))
d.text((65,1270),'Mineral com urânio · não é rádio puro',font=f(39),fill='#eadfc7')
d.text((65,1336),'Importante na história da descoberta do rádio',font=f(32),fill='#c1b59c')
d.text((65,1405),'Pacific Museum of Earth · CC BY-SA 2.0',font=f(28),fill='#b4a98d')
canvas.save(out/'pitchblende-museum.webp',quality=91,method=6)
# 210 nucleons: exactly 84 proton markers and 126 neutron markers, mixed by a permutation.
# This is a schematic nucleus, not an electron orbit or a specimen of metal.
circles=[]
for i in range(210):
 a=i*math.pi*(3-math.sqrt(5));r=238*math.sqrt((i+.5)/210);x=600+math.cos(a)*r;y=690+math.sin(a)*r*.90
 proton=(i*137)%210<84
 circles.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="14.2" fill="url(#{"proton" if proton else "neutron"})" stroke="#10221f" stroke-width="1.2"/>')
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
<defs><radialGradient id="paper"><stop stop-color="#253a38"/><stop offset="1" stop-color="#111f22"/></radialGradient><radialGradient id="proton" cx=".3" cy=".25"><stop stop-color="#eedbb1"/><stop offset="1" stop-color="#b78b49"/></radialGradient><radialGradient id="neutron" cx=".3" cy=".25"><stop stop-color="#a9cacf"/><stop offset="1" stop-color="#476d79"/></radialGradient><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#7b9898" stroke-opacity=".075"/></pattern></defs>
<rect width="1200" height="1500" fill="url(#paper)"/><rect width="1200" height="1500" fill="url(#grid)"/><rect x="20" y="20" width="1160" height="1460" fill="none" stroke="#a28b5c" stroke-width="3"/>
<g font-family="DejaVu Sans, sans-serif" fill="#e8d8b3"><text x="65" y="112" font-size="43" letter-spacing="3">POLÔNIO · ILUSTRAÇÃO CIENTÍFICA</text><text x="85" y="223" font-size="66">84</text><text x="600" y="348" text-anchor="middle" font-family="Georgia,serif" font-size="235">Po</text><text x="600" y="424" text-anchor="middle" fill="#afc5c5" font-size="37">Exemplo de isótopo: polônio-210</text>
<ellipse cx="600" cy="690" rx="285" ry="258" fill="none" stroke="#728d8b" stroke-width="2" stroke-dasharray="4 12"/>{''.join(circles)}
<text x="600" y="1025" text-anchor="middle" font-size="41">Núcleo: 84 prótons + 126 nêutrons</text><circle cx="280" cy="1102" r="14" fill="url(#proton)"/><text x="310" y="1115" font-size="34">Próton</text><circle cx="650" cy="1102" r="14" fill="url(#neutron)"/><text x="680" y="1115" font-size="34">Nêutron</text>
<path d="M100 1180H1100" stroke="#8b7955"/><text x="600" y="1250" text-anchor="middle" font-size="36">Modelo esquemático · sem escala</text><text x="600" y="1314" text-anchor="middle" fill="#afc5c5" font-size="33">Não é fotografia de uma amostra</text><text x="600" y="1420" text-anchor="middle" fill="#aeaa94" font-size="27">Arte autoral · dados: NIST / Royal Society of Chemistry</text></g></svg>'''
(out/'polonium-scientific.svg').write_text(svg)
manifest={
 'radium':{'file':'pitchblende-museum.webp','source':'https://commons.wikimedia.org/wiki/File:Uraninite_(Pitchblende)_(47975537437).jpg','original':'https://upload.wikimedia.org/wikipedia/commons/e/eb/Uraninite_%28Pitchblende%29_%2847975537437%29.jpg','author':'Pacific Museum of Earth','license':'CC BY-SA 2.0','license_url':'https://creativecommons.org/licenses/by-sa/2.0/','changes':'cropped, resized, framed with Portuguese identification and encoded as WebP; adapted image distributed under CC BY-SA 2.0','source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'identification':'Uraninite (pitchblende), specimen S-74-2183, Athabasca, Saskatchewan, Canada. Not pure radium and not an authenticated Curie sample.'},
 'polonium':{'file':'polonium-scientific.webp','source_svg':'polonium-scientific.svg','author':'Original educational diagram made for this project','license':'CC BY 4.0','license_url':'https://creativecommons.org/licenses/by/4.0/','references':['https://physics.nist.gov/PhysRefData/Handbook/Tables/poloniumtable1.htm','https://periodic-table.rsc.org/element/84/Polonium'],'identification':'Schematic Po-210 nucleus: 84 protons and 126 neutrons. Not a photograph, not a sample of polonium metal, no geometric or quantum scale implied.'}}
(out/'element-images-sources.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Prepared photograph and vector illustration')
