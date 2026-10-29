"""Pack WebP PBR textures into a standards-compliant GLB; preserve originals.
Requires Pillow (build-time only), not a runtime/browser dependency.
"""
from pathlib import Path
from PIL import Image
from io import BytesIO
import json,struct,shutil
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'public/assets/hedy-lamarr'
source=ROOT/'.runtime/hedy-pbr-unoptimized.glb'
if not source.exists():
 source=OUT/'laboratory.glb'
 if not source.exists():raise FileNotFoundError('Run the Blender scene build first')
 backup=ROOT/'.runtime/hedy-pbr-unoptimized.glb';shutil.copy2(source,backup);source=backup
raw=source.read_bytes();magic,version,length=struct.unpack_from('<III',raw);assert magic==0x46546c67 and version==2
json_size,json_type=struct.unpack_from('<II',raw,12);doc=json.loads(raw[20:20+json_size]);offset=20+json_size;size,kind=struct.unpack_from('<II',raw,offset);binary=raw[offset+8:offset+8+size]
image_views={image['bufferView']:image for image in doc.get('images',[]) if 'bufferView' in image}
result=bytearray();original_images=0;compressed_images=0
for index,view in enumerate(doc['bufferViews']):
 data=binary[view.get('byteOffset',0):view.get('byteOffset',0)+view['byteLength']]
 if index in image_views:
  original_images+=len(data)
  image=Image.open(BytesIO(data));image.thumbnail((2048,2048));output=BytesIO();image.save(output,format='WEBP',quality=88,method=6);data=output.getvalue();compressed_images+=len(data);image_views[index]['mimeType']='image/webp'
 view['byteOffset']=len(result);view['byteLength']=len(data);result.extend(data)
 result.extend(b'\0'*(-len(result)%4))
for texture in doc.get('textures',[]):
 if 'source' in texture:texture.setdefault('extensions',{})['EXT_texture_webp']={'source':texture.pop('source')}
for key in ['extensionsUsed','extensionsRequired']:
 doc[key]=list(dict.fromkeys(doc.get(key,[])+['EXT_texture_webp']))
doc['buffers'][0]['byteLength']=len(result)
encoded=json.dumps(doc,separators=(',',':')).encode();encoded+=b' '*(-len(encoded)%4)
output=struct.pack('<III',0x46546c67,2,12+8+len(encoded)+8+len(result))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(result),0x004e4942)+result
(OUT/'laboratory.glb').write_bytes(output)
Image.open(OUT/'irradiance.png').save(OUT/'irradiance.webp',format='WEBP',lossless=True,method=6)
print(json.dumps({'glbMB':round(len(output)/1e6,2),'texturesMB':round(compressed_images/1e6,2),'originalTexturesMB':round(original_images/1e6,2),'images':len(image_views)},indent=2))
