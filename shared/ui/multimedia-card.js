import { GAZE_TIME_LABEL } from '../vr/config.js';
import * as THREE from 'three';

const imageCache=new Map();
function loadImage(url) {
  if(!imageCache.has(url))imageCache.set(url,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(`Imagem indisponível: ${url}`));image.src=url;}));
  return imageCache.get(url);
}
function wrap(ctx,text,x,y,width,lineHeight){
  const words=text.split(/\s+/);let line='';
  for(const word of words){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>width&&line){ctx.fillText(line,x,y);y+=lineHeight;line=word;}else line=next;}
  if(line){ctx.fillText(line,x,y);y+=lineHeight;}return y;
}
export function multimediaCard(page) {
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=768;
  const ctx=canvas.getContext('2d');
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const face=new THREE.Mesh(new THREE.PlaneGeometry(1.32,.99),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
  face.position.y=.10;face.renderOrder=300;face.userData.uiRole='card-face';face.raycast=()=>{};
  let alive=true, image=null;
  function draw(){
    ctx.fillStyle='#24251f';ctx.fillRect(0,0,1024,768);ctx.strokeStyle='#8a7955';ctx.lineWidth=2;ctx.strokeRect(9,9,1006,750);
    ctx.textAlign='left';ctx.fillStyle='#b9a880';ctx.font='21px system-ui';ctx.fillText(page.eyebrow,48,57);ctx.textAlign='right';ctx.fillText(page.pageLabel??'',970,57);ctx.textAlign='left';
    ctx.fillStyle='#f1e6ce';ctx.font='42px Georgia';ctx.fillText(page.title,48,114,930);
    ctx.fillStyle='#1a1e1b';ctx.fillRect(48,153,356,420);
    if(image){
      const tile=page.imageTile;
      const sw=tile===undefined?image.width:image.width/3,sh=tile===undefined?image.height:image.height/2;
      const sx=tile===undefined?0:(tile%3)*sw,sy=tile===undefined?0:Math.floor(tile/3)*sh;
      const scale=Math.min(356/sw,420/sh),w=sw*scale,h=sh*scale;
      ctx.drawImage(image,sx,sy,sw,sh,48+(356-w)/2,153+(420-h)/2,w,h);
    }
    else if(page.image){ctx.fillStyle='#c9b58b';ctx.font='23px system-ui';ctx.fillText('Carregando imagem…',68,363);}
    ctx.fillStyle='#eee4ce';ctx.font='32px Georgia';const end=wrap(ctx,page.text,438,185,530,43);
    ctx.fillStyle='#baad94';ctx.font='25px system-ui';wrap(ctx,(page.note??'').replace(/1,8 s/g,GAZE_TIME_LABEL),438,Math.max(end+28,390),530,34);
    if(page.image){ctx.fillStyle='#c8b889';ctx.font='20px system-ui';ctx.fillText(`Olhe por ${GAZE_TIME_LABEL} para ampliar`,48,605);}
    ctx.fillStyle='#b9ab8f';ctx.font='20px system-ui';wrap(ctx,page.credit??'Ilustração e animação educativas · sem escala experimental',48,638,925,27);
    texture.needsUpdate=true;
  }
  draw();
  const ready=page.image?loadImage(page.image).then(value=>{if(alive){image=value;draw();}return true;}).catch(error=>{if(alive){page={...page,image:null,credit:'Imagem indisponível. O texto continua acessível.'};draw();}return false;}):Promise.resolve(true);
  // Only the small diagram texture changes (12 Hz). The large text card stays static.
  let diagram=null,diagramTexture=null,small=null,smallCtx=null,last=-1;
  if(page.diagram){small=document.createElement('canvas');small.width=320;small.height=380;smallCtx=small.getContext('2d');diagramTexture=new THREE.CanvasTexture(small);diagramTexture.colorSpace=THREE.SRGBColorSpace;diagram=new THREE.Mesh(new THREE.PlaneGeometry(.42,.50),new THREE.MeshBasicMaterial({map:diagramTexture,transparent:true,depthWrite:false}));diagram.position.set(-.366,.143,.003);diagram.renderOrder=301;diagram.userData.uiRole='card-animation';diagram.raycast=()=>{};}
  function update(time){
    if(!diagram||Math.floor(time/83)===last)return;last=Math.floor(time/83);
    const c=smallCtx,t=time/1000;c.clearRect(0,0,320,380);c.strokeStyle='#c6ac70';c.fillStyle='#c6ac70';c.lineWidth=3;c.font='20px Georgia';c.textAlign='center';
    if(typeof page.renderDiagram==='function'){page.renderDiagram(c,t);diagramTexture.needsUpdate=true;return;}
    if(page.diagram==='frequency-hopping'){
      const sequence=[0,3,1,5,2,4],step=Math.floor(t/1.2)%sequence.length,channel=sequence[step];
      c.fillStyle='#d9ccac';c.font='22px Georgia';c.fillText('Mesma sequência',160,31);
      c.font='18px system-ui';c.fillText('TRANSMISSOR',160,67);c.fillText('RECEPTOR',160,233);
      for(const y of [87,251])for(let i=0;i<6;i++){
        c.fillStyle=i===channel?'#dbaf69':'#243c40';c.fillRect(14+i*49,y,43,55);
        c.fillStyle=i===channel?'#182725':'#9dc2bf';c.font='24px Georgia';c.fillText(String.fromCharCode(65+i),35+i*49,y+36);
      }
      const x=35+channel*49;c.strokeStyle='#76c7c9';c.lineWidth=3;c.beginPath();c.moveTo(x,149);c.lineTo(x,244);c.stroke();
      c.fillStyle='#102226';c.fillRect(83,171,154,30);c.fillStyle='#d9ccac';c.font='20px Georgia';c.fillText('Canal '+String.fromCharCode(65+channel),160,193);
      c.font='17px system-ui';c.fillStyle='#a6c2bc';c.fillText('Os dois mudam juntos',160,340);c.fillText('Simulação sem escala real',160,369);
      diagramTexture.needsUpdate=true;return;
    }
    if(page.image){
      // A restrained animated explanatory strip preserves the painted illustration.
      const labels={measurement:'Leitura simulada',polonium:'Po · 84 · 1898',radiation:'Emissões conceituais',microscope:'Lentes e foco',glassware:'Reflexos no vidro',notebook:'Observar e registrar',awards:'Física 1903 · Química 1911'};
      c.fillStyle='rgba(10,18,22,.90)';c.fillRect(0,305,320,75);
      c.fillStyle='#e7d3a0';c.font='19px Georgia';c.fillText(labels[page.diagram]??'',160,364);
      c.strokeStyle='#4c8b99';c.lineWidth=2;c.beginPath();c.moveTo(26,329);c.lineTo(294,329);c.stroke();
      if(page.diagram==='radiation'){
        for(let i=0;i<6;i++){const phase=(t*.18+i/6)%1;c.globalAlpha=1-phase;c.fillStyle=i%2?'#dbac63':'#68c6d3';c.beginPath();c.arc(40+phase*240,329,3+phase,0,Math.PI*2);c.fill();}c.globalAlpha=1;
      }else if(page.diagram==='polonium'||page.diagram==='awards'){
        c.fillStyle='#dfb56e';for(let i=0;i<3;i++){c.globalAlpha=.45+.35*Math.sin(t*1.2+i);c.beginPath();c.arc(125+i*35,329,4,0,Math.PI*2);c.fill();}c.globalAlpha=1;
      }else if(page.diagram==='measurement'){
        c.strokeStyle='#dfb56e';c.beginPath();c.arc(160,338,25,Math.PI,2*Math.PI);c.stroke();
        const a=-Math.PI/2+Math.sin(t*.9)*.6;c.strokeStyle='#77c5cc';c.beginPath();c.moveTo(160,338);c.lineTo(160+Math.cos(a)*22,338+Math.sin(a)*22);c.stroke();
      }else if(page.diagram==='notebook'){
        c.strokeStyle='#77c5cc';c.beginPath();const count=80*((t*.14)%1);for(let i=0;i<count;i++){const x=40+i*3,y=331-Math.sin(i*.13)*5-i*.08;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
      }else if(page.diagram==='microscope'){
        c.strokeStyle='#77c5cc';for(const x of [140,180]){c.beginPath();c.ellipse(x,329,6,15,0,0,Math.PI*2);c.stroke();}
        const dx=Math.sin(t)*8;c.strokeStyle='#dfb56e';c.beginPath();c.moveTo(100,318);c.lineTo(140,321);c.lineTo(180,329);c.lineTo(220+dx,329);c.stroke();
      }else{
        // A narrow traveling glint explains glass reflections without a flashing field.
        const x=160+Math.sin(t*.7)*95;c.strokeStyle='#77c5cc';c.beginPath();c.moveTo(x,316);c.lineTo(x+6,339);c.stroke();
      }
      diagramTexture.needsUpdate=true;return;
    }
    const line=(x,y,a,b)=>{c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
    if(page.diagram==='measurement'){
      c.strokeRect(55,110,210,150);line(75,140,245,140);line(75,230,245,230);
      for(let i=0;i<8;i++){const y=150+(t*20+i*13)%70;c.beginPath();c.arc(90+i*21,y,2.5,0,Math.PI*2);c.fill();}
      c.beginPath();c.arc(160,55,38,Math.PI,Math.PI*2);c.stroke();const a=-Math.PI*.5+Math.sin(t*1.5)*.5;line(160,55,160+Math.cos(a)*30,55+Math.sin(a)*30);c.fillText('Leitura simulada',160,330);
    }else if(page.diagram==='polonium'){
      c.strokeRect(37,70,246,240);c.font='30px Georgia';c.fillText('84',75,116);c.font='100px Georgia';c.fillText('Po',160,228);c.font='28px Georgia';c.fillText('Polônio',160,278);c.font='23px Georgia';c.fillText('Anunciado em 1898',160,345);
    }else if(page.diagram==='radiation'){
      c.beginPath();c.arc(160,190,37,0,Math.PI*2);c.stroke();
      for(let i=0;i<10;i++){const a=i*Math.PI/5,r=47+((t*.20+i*.1)%1)*100;c.globalAlpha=1-(r-47)/130;c.beginPath();c.arc(160+Math.cos(a)*r,190+Math.sin(a)*r,3,0,Math.PI*2);c.fill();}c.globalAlpha=1;c.fillText('Emissões ilustradas',160,345);
    }else if(page.diagram==='microscope'){
      line(110,80,190,130);line(190,130,175,190);line(210,130,250,245);line(250,245,200,300);line(80,300,245,300);line(105,218,205,218);c.beginPath();c.arc(208,168,16,0,Math.PI*2);c.stroke();c.fillText('Lentes · foco · observação',160,355);
    }else if(page.diagram==='glassware'){
      c.beginPath();c.moveTo(135,70);c.lineTo(135,150);c.lineTo(65,280);c.quadraticCurveTo(160,310,255,280);c.lineTo(185,150);c.lineTo(185,70);c.stroke();line(130,70,190,70);line(139,77,139,152);line(181,77,181,152);c.font='20px Georgia';c.fillText('Parede fina · borda arredondada',160,350);
    }else if(page.diagram==='notebook'){
      c.strokeRect(45,95,230,190);line(160,95,160,285);
      const x=160+Math.cos(t*.7)*95;line(160,95,x,105);line(x,105,x,270);line(x,270,160,285);
      for(let i=0;i<6;i++){line(65,130+i*22,140,130+i*22);line(180,130+i*22,255,130+i*22);}c.fillText('Registros e comparação',160,345);
    }
    diagramTexture.needsUpdate=true;
  }
  return {face,diagram,ready,update,get imageAsset(){return image?{image,tile:page.imageTile}:null;},dispose(){alive=false;for(const mesh of [face,diagram])if(mesh){mesh.geometry.dispose();mesh.material.map?.dispose();mesh.material.dispose();}}};
}
