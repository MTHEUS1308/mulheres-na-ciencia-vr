"""Download selected CC0 assets using Poly Haven's public API; no scraping."""
from pathlib import Path
import subprocess,json,hashlib,concurrent.futures
ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'.runtime/art-source';CACHE.mkdir(parents=True,exist_ok=True)
MODELS=['vintage_microscope','wooden_table_02','wooden_bookshelf_worn','vintage_oil_lamp','wooden_stool_01','book_encyclopedia_set_01','wine_bottles_01','brass_pot_01','stone_01']
TEXTURES=['old_wood_floor','worn_plaster_wall','grey_plaster_03','rusty_metal']
def download(url,path,md5=None):
 path.parent.mkdir(parents=True,exist_ok=True)
 if not path.exists():subprocess.run(['curl','-fsSL','--retry','2',url,'-o',str(path)],check=True)
 if md5 and hashlib.md5(path.read_bytes()).hexdigest()!=md5:raise ValueError('Checksum mismatch: '+str(path))
 return path
def manifest(asset):
 path=CACHE/(asset+'.json');download('https://api.polyhaven.com/files/'+asset,path)
 return json.loads(path.read_text())
def model(asset):
 data=manifest(asset);entry=data['gltf']['1k']['gltf'];dest=CACHE/'models'/asset
 download(entry['url'],dest/(asset+'.gltf'),entry['md5'])
 for name,file in entry['include'].items():download(file['url'],dest/name,file['md5'])
 print('MODEL',asset,flush=True)
 return {'id':asset,'type':'model','url':'https://polyhaven.com/a/'+asset,'license':'CC0-1.0','resolution':'1k'}
def texture(asset):
 data=manifest(asset);dest=CACHE/'textures'/asset
 for kind in ['diff','nor_gl','rough']:
  entry=data[{'diff':'Diffuse','rough':'Rough'}.get(kind,kind)]['2k']['jpg'];download(entry['url'],dest/(kind+'.jpg'),entry['md5'])
 print('TEXTURE',asset,flush=True)
 return {'id':asset,'type':'texture','url':'https://polyhaven.com/a/'+asset,'license':'CC0-1.0','resolution':'2k'}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 records=list(pool.map(model,MODELS))+list(pool.map(texture,TEXTURES))
(ROOT/'docs/visual-assets.json').write_text(json.dumps(records,indent=2)+'\n')
