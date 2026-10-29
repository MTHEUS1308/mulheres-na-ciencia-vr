const atlas='/assets/hedy-lamarr/media/illustrations.webp';
const art=tile=>({image:atlas,imageTile:tile,credit:'Ilustração educativa · interpretação histórica gerada por IA'});
const presentations={
 invention:{pages:[
  {title:'Uma ideia em sintonia',eyebrow:'HEDY LAMARR + GEORGE ANTHEIL',...art(0),text:'Lamarr e Antheil propuseram um sistema em que transmissor e receptor mudam de frequência de forma sincronizada.',note:'Patente concedida em 11 de agosto de 1942. O rádio desta sala é uma interpretação de equipamentos de época.'},
  {title:'Ciência e música',eyebrow:'UMA COLABORAÇÃO INCOMUM',...art(4),text:'A proposta explorava registros sincronizados, inspirados em rolos de pianola, para coordenar as mudanças nos dois aparelhos.',note:'Ilustração da colaboração. A central não reproduz um local de trabalho comprovado dos inventores.'},
 ]},
 hopping:{pages:[
  {title:'Por que mudar de canal?',eyebrow:'O PROBLEMA DAS INTERFERÊNCIAS',...art(1),text:'Sinais que ocupam o mesmo canal podem interferir entre si. A proposta era dificultar que uma interferência acompanhasse a comunicação.',note:'Uma representação qualitativa. Não é uma garantia de comunicação imune a bloqueios.'},
  {title:'Juntos, a cada salto',eyebrow:'ANIMAÇÃO CONCEITUAL',diagram:'frequency-hopping',text:'Observe o transmissor e o receptor: os dois destacam o mesmo canal a cada passo. A sincronia é a ideia central.',note:'Seis canais e tempo lento apenas para ensinar. Não reproduz parâmetros de rádio nem o mecanismo completo da patente.'},
 ]},
 naval:{pages:[
  {title:'Comunicação em tempos de guerra',eyebrow:'CONTEXTO · SEGUNDA GUERRA MUNDIAL',...art(3),text:'A preocupação com a interferência nas comunicações por rádio motivou Lamarr a investigar uma comunicação mais resistente a bloqueios.',note:'A patente foi proposta nesse contexto. Não apresentamos o sistema como usado em combate durante a guerra. O mapa e o navio são educativos.'},
 ]},
 patent:{pages:[
  {title:'Patente nº 2.292.387',eyebrow:'DOCUMENTO · 11 DE AGOSTO DE 1942',image:'/assets/hedy-lamarr/media/patent-1942.webp',credit:'US 2,292,387 · folha 1 · fonte: Google Patents / US Patent Office',text:'O documento “Secret Communication System” registra a colaboração de Hedy Kiesler Markey, nome legal de Lamarr na época, e George Antheil.',note:'Olhe para a folha por 1,8 s para ampliá-la. Pedido apresentado em 10 de junho de 1941.'},
 ]},
 biography:{pages:[
  {title:'Atriz. Inventora. Curiosa.',eyebrow:'QUEM FOI HEDY LAMARR?',...art(2),text:'Nascida em Viena em 1914, Hedy Lamarr tornou-se atriz em Hollywood e também se dedicou a ideias e invenções.',note:'Seu interesse por tecnologia levou à colaboração com o compositor George Antheil. Este retrato é uma ilustração, não uma fotografia histórica.'},
 ]},
 legacy:{pages:[
  {title:'Um lugar na história das conexões',eyebrow:'LEGADO DAS COMUNICAÇÕES',...art(5),text:'A contribuição de Lamarr e Antheil faz parte da história das comunicações por espalhamento espectral e da busca por sinais mais resistentes a interferências.',note:'Lamarr não inventou diretamente o Wi-Fi ou o Bluetooth. Em 2014, os dois foram incluídos no National Inventors Hall of Fame.'},
 ]},
};
export const exhibits=[
 {id:'invention',kind:'radio',short:'01 · A invenção',position:[0,-.12,-2.0],size:[1.78,.85,.65],presentation:presentations.invention},
 {id:'hopping',kind:'signal',short:'02 · Em sincronia',position:[-2.12,-.24,-.05],size:[.62,.8,1.65],presentation:presentations.hopping},
 {id:'naval-map',kind:'map',short:'03 · O contexto',position:[3.02,.42,.15],size:[.10,1.44,2.05],presentation:presentations.naval},
 {id:'ship',kind:'ship',short:'Navio · contexto',position:[2.25,-.30,.50],size:[.43,.60,1.30],presentation:presentations.naval},
 {id:'patent',kind:'document',short:'04 · A patente',position:[0,.34,3.20],size:[1.0,1.40,.14],presentation:presentations.patent},
 {id:'biography',kind:'portrait',short:'05 · Hedy Lamarr',position:[1.31,.34,3.20],size:[1.0,1.18,.14],presentation:presentations.biography},
 {id:'legacy',kind:'timeline',short:'06 · O legado',position:[-1.31,.34,3.20],size:[1.0,1.18,.14],presentation:presentations.legacy},
];
