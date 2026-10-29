const element=id=>document.getElementById(id);
const status=text=>{element('status').textContent=text;};
element('secure').textContent=window.isSecureContext?'Sim':'Não — sensores podem ser bloqueados';
element('origin').textContent=location.origin;
let active=false, orientationAllowed=false, count=0, motion=0, synthetic=0, last=0, started=0;
const finite=values=>values.every(Number.isFinite);
const format=value=>Number.isFinite(value)?value.toFixed(1):'indisponível';
window.addEventListener('deviceorientation',event=>{
  if(!active)return;
  if(!event.isTrusted){synthetic++;return;}
  if(!finite([event.alpha,event.beta,event.gamma]))return;
  count++;last=performance.now();
  element('angles').textContent=[event.alpha,event.beta,event.gamma].map(format).join(' / ');
});
window.addEventListener('devicemotion',event=>{
  if(!active)return;
  if(!event.isTrusted){synthetic++;return;}
  motion++;
  element('rates').textContent=event.rotationRate?[event.rotationRate.alpha,event.rotationRate.beta,event.rotationRate.gamma].map(format).join(' / '):'Indisponível';
});
element('start').onclick=async()=>{
  if(!isSecureContext){status('Use USB com localhost ou HTTPS confiável. Não ignore avisos de certificado.');return;}
  if(!window.DeviceOrientationEvent){status('API de orientação indisponível neste navegador.');return;}
  element('start').disabled=true;active=false;count=motion=synthetic=last=0;
  const request=constructor=>typeof constructor?.requestPermission==='function'?constructor.requestPermission():Promise.resolve('granted');
  try{
    // Ambas as solicitações são iniciadas no mesmo gesto explícito do usuário.
    const requests=[request(window.DeviceOrientationEvent),request(window.DeviceMotionEvent)];
    const results=await Promise.allSettled(requests);
    orientationAllowed=results[0].status==='fulfilled'&&results[0].value==='granted';
    element('permission').textContent=orientationAllowed?'API liberada; aguardando dados reais':'Negada ou indisponível';
    if(!orientationAllowed){status('Permissão não concedida. Confira “Sensores de movimento” nas configurações do site e tente novamente.');return;}
    active=true;started=performance.now();status('Aguardando dados do aparelho. Mova o celular suavemente.');
  }catch(error){status(`Não foi possível solicitar sensores: ${error.message}`);}
  finally{element('start').disabled=false;}
};
element('stop').onclick=()=>{active=false;status('Teste parado. Nenhuma validação física foi registrada automaticamente.');};
setInterval(()=>{
  element('count').textContent=count;element('motion').textContent=motion;element('synthetic').textContent=synthetic;
  element('screen').textContent=`${screen.orientation?.type??'indisponível'} / ${screen.orientation?.angle??window.orientation??0}°`;
  element('age').textContent=last?`${((performance.now()-last)/1000).toFixed(1)} s atrás`:'Aguardando';
  if(!active)return;
  if(!last&&performance.now()-started>5000)status('Nenhum dado de orientação após 5 segundos. Confira permissões, contexto seguro e sensores do aparelho.');
  else if(last&&performance.now()-last>2000)status('Os dados pararam de chegar. Mantenha a página aberta e confira as permissões.');
  else if(last)status('Recebendo eventos do navegador. Confira fisicamente se os números e a visão acompanham seus movimentos.');
},250);
