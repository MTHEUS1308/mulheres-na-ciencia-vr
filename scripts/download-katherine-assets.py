"""Download attributed planetary maps and NASA photography; preserve source files."""
from pathlib import Path
from urllib.request import Request,urlopen
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
import json,hashlib,re
R=Path(__file__).resolve().parents[1];S=R/'.runtime/katherine-source';O=R/'public/assets/katherine-johnson';S.mkdir(parents=True,exist_ok=True);(O/'textures').mkdir(parents=True,exist_ok=True);(O/'media').mkdir(exist_ok=True)
base='https://www.solarsystemscope.com/textures/download/'
files=['2k_earth_daymap.jpg','2k_earth_normal_map.tif','2k_earth_clouds.jpg','2k_moon.jpg','2k_mars.jpg','2k_jupiter.jpg','2k_saturn.jpg','2k_saturn_ring_alpha.png','2k_neptune.jpg']
def download(url,path):
 if path.exists():return
 with urlopen(Request(url,headers={'User-Agent':'SNCT2026EducationalMuseum/1.0'}),timeout=40)as r:path.write_bytes(r.read())
def planet(name):
 path=S/name
 try:download(base+name,path)
 except Exception:
  if name=='2k_earth_normal_map.tif':return None
  raise
 im=Image.open(path);im.thumbnail((2048,1024)if 'earth'in name else(1024,1024));target=O/'textures'/(name.split('.')[0]+'.webp');im.save(target,format='WEBP',quality=92,method=6)
 return {'source':base+name,'file':str(target.relative_to(R)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'credit':'Solar System Scope / INOVE','license':'CC BY 4.0','changes':'resized and encoded as WebP'}
with ThreadPoolExecutor(max_workers=4)as pool:records=list(pool.map(planet,files))
page='https://www.nasa.gov/image-article/katherine-johnson-nasa-langley-research-center/'
html=urlopen(Request(page,headers={'User-Agent':'Mozilla/5.0'}),timeout=40).read().decode()
match=re.search(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"',html)
if not match:raise ValueError('NASA image metadata not found')
url=match.group(1).replace('&amp;','&');download(url,S/'katherine-nasa-source.jpg');im=Image.open(S/'katherine-nasa-source.jpg');im.thumbnail((1400,1100));im.save(O/'media/katherine-nasa.webp',quality=93,method=6)
records.append({'source':page,'imageUrl':url,'file':'public/assets/katherine-johnson/media/katherine-nasa.webp','credit':'NASA','changes':'resized and encoded as WebP'})
(O/'asset-sources.json').write_text(json.dumps([x for x in records if x],indent=2));print('Planetary maps and NASA photograph ready.')
