"""Original deterministic build textures and educational documents for Hedy's room."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageOps,ImageChops
import random,math
R=Path(__file__).resolve().parents[1];S=R/'.runtime/hedy-source';O=R/'public/assets/hedy-lamarr/media';S.mkdir(parents=True,exist_ok=True);O.mkdir(parents=True,exist_ok=True)
random.seed(1942)
def font(n,bold=False):return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans'+('-Bold'if bold else'')+'.ttf',n)
def text(d,xy,s,n=20,color='#d6cfad',anchor='mm'):d.text(xy,s,font=font(n),fill=color,anchor=anchor)
def save(im,name):im.save(S/(name+'.jpg'),quality=94)
# Crackled enamel, roughness and tangent-space micro-normal are proper PBR inputs.
noise=Image.effect_noise((1024,1024),18).convert('L');paint=ImageOps.colorize(noise,'#172522','#53675a');d=ImageDraw.Draw(paint)
for i in range(500):
 x=random.randrange(1024);y=random.randrange(1024);d.line((x,y,x+random.randrange(1,16),y+random.randrange(-2,3)),fill='#718073',width=1)
save(paint,'enamel-color');save(ImageOps.colorize(noise,'#858585','#e2e2e2').convert('L'),'enamel-rough');normal=Image.merge('RGB',(Image.blend(Image.new('L',noise.size,128),noise,.08),Image.blend(Image.new('L',noise.size,128),ImageOps.mirror(noise),.08),Image.new('L',noise.size,254)));normal.save(S/'enamel-normal.png')
# Brushed steel for bezels / industrial fittings.
metal=Image.new('RGB',(512,512),'#777e7a');d=ImageDraw.Draw(metal)
for y in range(512):
 c=random.randrange(80,132);d.line((0,y,512,y),fill=(c,c+3,c+2))
save(metal,'steel');
for kind in ['transmitter','receiver']:
 im=Image.new('RGB',(1024,512),'#26342f');d=ImageDraw.Draw(im)
 d.rounded_rectangle((10,10,1014,502),18,outline='#8e9781',width=3)
 text(d,(512,48),'CENTRAL RADIO  /  '+kind.upper(),32);text(d,(512,88),'COMMUNICATIONS RESEARCH  ·  1942',17)
 for x in [90,934]:
  for y in [40,472]:d.ellipse((x-7,y-7,x+7,y+7),fill='#8e9386');d.line((x-4,y,x+4,y),fill='#1c2423',width=2)
 for x,name in [(100,'INPUT'),(295,'TUNING'),(520,'RANGE'),(745,'LEVEL'),(920,'POWER')]:
  text(d,(x,425),name,19)
  d.arc((x-56,286,x+56,398),195,345,fill='#d7d0ae',width=2)
  for a in range(200,345,18):
   xx=x+math.cos(math.radians(a))*60;yy=345+math.sin(math.radians(a))*60;d.line((xx,yy,xx,yy-5),fill='#d7d0ae')
 for x in range(120,920,22):d.line((x,120,x,132),fill='#aaa88f',width=2)
 text(d,(512,165),'A     B     C     D     E     F',31)
 text(d,(512,224),'SYNCHRONIZED  ·  RESEARCH STATION',15)
 save(im,kind+'-face')
# Gauge with printed graduation and static needle; final models supply bezel and glass.
im=Image.new('RGB',(512,512),'#bca97d');d=ImageDraw.Draw(im);d.ellipse((12,12,500,500),fill='#d5c69b',outline='#5e594a',width=7)
for i in range(41):
 a=math.pi*(1.12+i*.76/40);r=190;length=22 if i%5==0 else 11
 d.line((256+math.cos(a)*r,280+math.sin(a)*r,256+math.cos(a)*(r-length),280+math.sin(a)*(r-length)),fill='#323b35',width=3)
 if i%10==0:text(d,(256+math.cos(a)*142,280+math.sin(a)*142),str(i//10),21,'#27332e')
d.line((256,280,335,140),fill='#8b342e',width=6);d.ellipse((245,269,267,291),fill='#393d31');text(d,(256,345),'SIGNAL',28,'#26352e');text(d,(256,382),'INDICATION ONLY',15,'#26352e');save(im,'gauge')
im=Image.new('RGB',(512,512),'#102522');d=ImageDraw.Draw(im)
for i in range(25,500,42):d.line((i,20,i,492),fill='#2d4539');d.line((20,i,492,i),fill='#2d4539')
pts=[(x,256+math.sin(x*.045)*54+math.sin(x*.015)*16)for x in range(25,488)];d.line(pts,fill='#91b879',width=4);save(im,'crt')
im=Image.new('RGB',(512,512),'#d4c7a0');d=ImageDraw.Draw(im)
for i in range(60):
 a=i/60*math.tau-math.pi/2;r=218;d.line((256+math.cos(a)*r,256+math.sin(a)*r,256+math.cos(a)*(r-(17 if i%5==0 else 7)),256+math.sin(a)*(r-(17 if i%5==0 else 7))),fill='#1d2a2a',width=3)
for i in range(1,13):a=i/12*math.tau-math.pi/2;text(d,(256+math.cos(a)*177,256+math.sin(a)*177),str(i),32,'#1d2a2a')
d.line((256,256,190,180),fill='#263532',width=8);d.line((256,256,370,233),fill='#263532',width=5);d.ellipse((247,247,265,265),fill='#263532');save(im,'clock')
# Original stylized chart: no claim that routes or coastlines represent a military record.
im=Image.new('RGB',(1400,1000),'#c8b88d');d=ImageDraw.Draw(im)
for x in range(70,1350,80):d.line((x,60,x,940),fill='#a59d7a')
for y in range(60,950,80):d.line((70,y,1340,y),fill='#a59d7a')
for poly in [[(70,120),(340,80),(420,220),(290,360),(330,520),(140,590),(70,490)],[(1340,160),(1080,100),(960,270),(1110,400),(1020,550),(1180,690),(1340,700)],[(330,720),(460,680),(510,840),(400,940),(260,890)]]:d.polygon(poly,fill='#8d9675',outline='#536858',width=4)
for x,y in [(450,300),(680,420),(900,610)]:
 d.polygon([(x-22,y),(x+24,y),(x+10,y+12),(x-15,y+12)],fill='#394b48');d.line((x,y,x,y-18),fill='#394b48',width=3)
for i in range(70):
 t=i/70;x=390+t*590;y=250+350*t+math.sin(t*7)*60
 if i%2==0:d.ellipse((x-3,y-3,x+3,y+3),fill='#814c38')
d.ellipse((1060,720,1240,900),outline='#556454',width=3)
for a in range(0,360,45):r=80 if a%90==0 else 40;ang=math.radians(a);d.line((1150,810,1150+math.cos(ang)*r,810+math.sin(ang)*r),fill='#556454',width=3)
text(d,(700,50),'MARITIME COMMUNICATIONS',35,'#344c45');text(d,(700,955),'EDUCATIONAL CHART  ·  NOT AN OPERATIONAL DOCUMENT',20,'#344c45');save(im,'naval-chart');im.save(O/'naval-chart.webp',quality=90)
im=Image.new('RGB',(1000,700),'#d3c49d');d=ImageDraw.Draw(im);text(d,(500,65),'LAMARR  /  ANTHEIL',42,'#314039');text(d,(500,120),'A COLLABORATION ACROSS SCIENCE AND MUSIC',20,'#314039')
for x,year,label in [(180,'1941','APPLICATION'),(500,'1942','PATENT'),(820,'2014','RECOGNITION')]:
 d.ellipse((x-17,325,x+17,359),fill='#9b7545');text(d,(x,270),year,40,'#314039');text(d,(x,420),label,22,'#314039')
d.line((180,342,820,342),fill='#786946',width=4);text(d,(500,590),'FREQUENCY HOPPING  ·  A HISTORICAL CONTRIBUTION',23,'#314039');save(im,'timeline');im.save(O/'timeline.webp',quality=90)
Image.open(S/'illustrations-original.png').save(O/'illustrations.webp',quality=88,method=6)
Image.open(S/'patent-sheet-1.png').save(O/'patent-1942.webp',quality=93,method=6)
print('Hedy textures, documents and panel atlas ready.')
