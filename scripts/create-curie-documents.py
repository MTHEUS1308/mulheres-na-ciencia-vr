"""Original educational illustrations, not historical facsimiles."""
from PIL import Image,ImageDraw,ImageFont,ImageFilter
from pathlib import Path
import random,math
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'.runtime/art-source/documents';OUT.mkdir(parents=True,exist_ok=True)
random.seed(1898)
regular='/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf';italic='/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf'
# Fonts are only used while building these original textures, not shipped as font files.
def font(size):return ImageFont.truetype(italic if Path(italic).exists() else regular,size)
def parchment():
 im=Image.new('RGB',(768,1024));pix=im.load()
 for y in range(1024):
  for x in range(768):
   edge=max(abs(x-384)/384,abs(y-512)/512);noise=random.gauss(0,2.8);shade=17*edge**6
   pix[x,y]=(int(209-shade+noise),int(195-shade+noise),int(163-shade+noise))
 return im
im=parchment();d=ImageDraw.Draw(im)
d.text((65,65),'Cahier de recherches',font=font(39),fill='#4a4034');d.text((65,125),'Paris — 1898',font=font(25),fill='#5d5144')
lines=['Observations sur les rayonnements','Mesures comparatives','Échantillon · lecture · remarques','Une question, puis une mesure.','Comparer les résultats, vérifier, noter.']
for i in range(14):
 y=200+i*39;d.line([(60,y+33),(710,y+33)],fill='#b7aa8a',width=1);d.text((68+random.randrange(9),y),lines[i%len(lines)],font=font(19),fill='#6c5c43')
d.line([(110,935),(110,780),(650,780)],fill='#6b5943',width=3)
for j in range(6):d.line([(110+j*90,780),(110+j*90,790)],fill='#6b5943',width=2)
d.line([(120,920),(210,896),(290,891),(385,845),(485,825),(630,805)],fill='#65513b',width=3)
im.save(OUT/'research-notes.jpg',quality=94)
for year,discipline in [(1903,'PHYSIQUE'),(1911,'CHIMIE')]:
 im=parchment();d=ImageDraw.Draw(im);d.rectangle((35,35,733,989),outline='#8a744d',width=3);d.rectangle((49,49,719,975),outline='#ad976c',width=1)
 d.text((155,150),'PRIX NOBEL',font=font(48),fill='#635132');d.text((275,250),str(year),font=font(74),fill='#765c36');d.text((235,380),discipline,font=font(34),fill='#66573d')
 d.text((150,515),'Marie Skłodowska Curie',font=font(30),fill='#685b43')
 for i in range(6):d.line([(150,620+i*30),(600-(i%2)*60,620+i*30)],fill='#9a8a65',width=2)
 d.ellipse((300,825,450,975),outline='#a48a4e',width=6);d.ellipse((315,840,435,960),outline='#a48a4e',width=2)
 d.text((100,75),'REPRÉSENTATION ÉDUCATIVE',font=font(18),fill='#8e7d58')
 im.save(OUT/f'nobel-{year}.jpg',quality=94)
# Original chalkboard drawing: qualitative apparatus diagram, no modern atomic model.
im=Image.new('RGB',(1200,800));pix=im.load()
for y in range(800):
 for x in range(1200):
  noise=random.gauss(0,2.2);v=int(30+noise+3*math.sin(x/130)*math.sin(y/80));pix[x,y]=(v-3,v+1,v)
d=ImageDraw.Draw(im);chalk='#bdb9a2'
d.text((65,52),'ÉTUDE DES RAYONNEMENTS',font=font(46),fill=chalk)
d.text((70,120),'Paris · notes de recherche · 1898',font=font(26),fill='#8e9385')
d.line([(100,250),(430,250),(430,540),(100,540),(100,250)],fill=chalk,width=3)
d.line([(150,340),(380,340)],fill=chalk,width=4);d.line([(150,470),(380,470)],fill=chalk,width=4)
d.line([(265,340),(265,210),(600,210),(600,405)],fill=chalk,width=3);d.ellipse((550,405,650,505),outline=chalk,width=3);d.line([(600,455),(625,425)],fill=chalk,width=3)
d.line([(265,470),(265,595),(600,595),(600,505)],fill=chalk,width=3)
d.text((720,245),'Comparer',font=font(38),fill=chalk);d.text((720,320),'Observer',font=font(38),fill=chalk);d.text((720,395),'Vérifier',font=font(38),fill=chalk)
d.text((65,688),'Illustration éducative — non issue d’un document original',font=font(22),fill='#7f887c')
im.save(OUT/'chalkboard.jpg',quality=94)
im=parchment().resize((512,512));d=ImageDraw.Draw(im);d.rectangle((25,25,487,487),outline='#81704d',width=3);d.text((45,100),'ÉCHANTILLON',font=font(38),fill='#594f39');d.text((125,210),'ÉTUDE',font=font(44),fill='#594f39');d.text((175,335),'1898',font=font(42),fill='#594f39');im.save(OUT/'reagent-label.jpg',quality=92)
