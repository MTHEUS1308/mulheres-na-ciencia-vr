"""Authored procedural material imperfections and educational dial; not scans."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter,ImageFont
import random,math
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'.runtime/art-source/main-table';OUT.mkdir(parents=True,exist_ok=True)
random.seed(1898);size=1024
noise=Image.new('L',(64,64));noise.putdata([random.randrange(20,235) for _ in range(64*64)]);noise=noise.resize((size,size),Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(9))
im=Image.merge('RGB',tuple(noise.point(lambda n,a=a,b=b:int(a+b*n/255)) for a,b in [(98,80),(67,66),(29,40)]));d=ImageDraw.Draw(im)
for i in range(900):
 x=random.randrange(size);y=random.randrange(size);length=random.randrange(2,35);d.line((x,y,x+length,y+random.randrange(-2,3)),fill=(143,112,58),width=1)
im.save(OUT/'brass-color.jpg',quality=92)
rough=noise.point(lambda n:int(80+110*n/255));rough.save(OUT/'brass-rough.jpg',quality=92)
height=Image.new('L',(1024,1024),128);d=ImageDraw.Draw(height)
for i in range(1600):
 y=random.randrange(1024);x=random.randrange(1024);d.line((x,y,x+random.randrange(3,55),y),fill=random.choice([112,143]),width=1)
height.save(OUT/'metal-height.png')
# A very slight glass smudge map; no green radioactive glow.
noise.point(lambda n:int(15+25*n/255)).save(OUT/'glass-rough.jpg',quality=90)
# Dial face has readable markings; moving needle is a separate runtime mesh.
font='/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
f=lambda n:ImageFont.truetype(font,n)
im=Image.new('RGB',(768,512),'#b6ab88');d=ImageDraw.Draw(im);d.rectangle((16,16,752,496),outline='#786443',width=5)
cx,cy=384,405;radius=286
for i in range(41):
 a=math.radians(205+i*3.25);r=radius-(28 if i%10==0 else 16 if i%5==0 else 9)
 d.line((cx+math.cos(a)*r,cy+math.sin(a)*r,cx+math.cos(a)*radius,cy+math.sin(a)*radius),fill='#332e23',width=3 if i%5==0 else 2)
 if i%10==0:d.text((cx+math.cos(a)*(radius-62)-13,cy+math.sin(a)*(radius-62)-10),str(i),font=f(27),fill='#342e24')
d.text((216,330),'LECTURE SIMULÉE',font=f(25),fill='#544832');d.text((260,445),'SANS ÉCHELLE',font=f(19),fill='#544832');im.save(OUT/'dial-face.jpg',quality=95)
# Encode an actual tangent-space normal image for glTF, not an unsupported shader node.
from PIL import ImageChops
nx=ImageChops.subtract(ImageChops.offset(height,-1,0),ImageChops.offset(height,1,0),1,128)
ny=ImageChops.subtract(ImageChops.offset(height,0,-1),ImageChops.offset(height,0,1),1,128)
Image.merge('RGB',(nx,ny,Image.new('L',height.size,255))).save(OUT/'metal-normal.png')
