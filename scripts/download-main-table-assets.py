from pathlib import Path
import json,subprocess,hashlib
ROOT=Path(__file__).resolve().parents[1];CACHE=ROOT/'.runtime/art-source'
def fetch(url,path,md5=None):
 path.parent.mkdir(parents=True,exist_ok=True)
 if not path.exists():subprocess.run(['curl','-fsSL','--retry','2',url,'-o',str(path)],check=True)
 if md5:assert hashlib.md5(path.read_bytes()).hexdigest()==md5,str(path)
for asset,res in [('painted_wooden_table','2k'),('small_wooden_table_01','2k'),('magnifying_glass_01','1k')]:
 manifest=CACHE/(asset+'.json');fetch('https://api.polyhaven.com/files/'+asset,manifest)
 file=json.loads(manifest.read_text())['gltf'][res]['gltf'];dest=CACHE/'models'/asset
 fetch(file['url'],dest/(asset+'.gltf'),file['md5'])
 for name,entry in file['include'].items():fetch(entry['url'],dest/name,entry['md5'])
 print(asset,res,flush=True)
# Historical illustration: catalogue supplies license, image identifier and attribution.
fetch('https://api.wellcomecollection.org/catalogue/v2/works/r4xh3dyy',CACHE/'wellcome-electrometer.json')
fetch('https://iiif.wellcomecollection.org/image/M0011486/full/1000,/0/default.jpg', CACHE/'wellcome-electrometer-original.jpg')
from PIL import Image
image=Image.open(CACHE/'wellcome-electrometer-original.jpg');image.thumbnail((450,1400));image.save(ROOT/'public/assets/marie-curie/media/curie-electrometer-wellcome.jpg',quality=90,optimize=True)
