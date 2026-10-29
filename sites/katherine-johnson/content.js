const atlas='/assets/katherine-johnson/media/illustrations.webp';
const photo='/assets/katherine-johnson/media/katherine-nasa.webp';
const art=tile=>({image:atlas,imageTile:tile,credit:'Ilustração educativa gerada por IA · não é documento de arquivo'});
const archive={image:photo,credit:'Fotografia histórica · NASA / Langley Research Center'};
// Geometry in this diagram uses the same normalized circular two-body model as the 3D orbit.
export function drawOrbit(c,t){
 c.fillStyle='#061a2ded';c.fillRect(0,290,320,90);c.strokeStyle='#79d9ef';c.lineWidth=2;c.beginPath();c.ellipse(160,330,96,28,0,0,Math.PI*2);c.stroke();
 const a=t*.5;c.fillStyle='#e6b76c';c.beginPath();c.arc(160+96*Math.cos(a),330+28*Math.sin(a),5,0,Math.PI*2);c.fill();c.fillStyle='#e2eff5';c.font='16px system-ui';c.textAlign='center';c.fillText('Posição prevista ao longo do tempo',160,373);
}
export function drawVariables(c,t){
 c.fillStyle='#061a2ded';c.fillRect(0,285,320,95);const r=1.2+.3*Math.sin(t*.45),a=t*.5;c.strokeStyle='#80d9ef';c.beginPath();c.ellipse(160,325,r*65,r*20,0,0,Math.PI*2);c.stroke();c.fillStyle='#e6b76c';c.beginPath();c.arc(160+r*65*Math.cos(a),325+r*20*Math.sin(a),5,0,Math.PI*2);c.fill();c.fillStyle='#dfedf5';c.font='16px system-ui';c.textAlign='center';c.fillText(`r=${r.toFixed(2)}  v=${Math.sqrt(1/r).toFixed(2)}  (μ=1)`,160,373);
}
export function drawReturn(c,t){
 c.fillStyle='#061a2ded';c.fillRect(0,285,320,95);c.fillStyle='#24698e';c.beginPath();c.arc(230,350,28,0,Math.PI*2);c.fill();c.strokeStyle='#e6b76c';c.beginPath();c.moveTo(35,310);c.quadraticCurveTo(155,292,205,337);c.stroke();const u=(t*.13)%1,x=(1-u)*(1-u)*35+2*(1-u)*u*155+u*u*205,y=(1-u)*(1-u)*310+2*(1-u)*u*292+u*u*337;c.fillStyle='#ddf7ff';c.beginPath();c.arc(x,y,4,0,Math.PI*2);c.fill();c.fillStyle='#deedf6';c.font='16px system-ui';c.textAlign='center';c.fillText('Retorno · diagrama qualitativo',160,378);
}
const animated={diagram:'katherine-orbit',renderDiagram:drawOrbit};
export const presentations={
 earth:{pages:[{title:'Equações que levam ao espaço',eyebrow:'TERRA · VELOCIDADE E GRAVIDADE',...art(0),...animated,text:'A gravidade curva a trajetória. Com velocidade lateral adequada, uma cápsula em órbita continua caindo ao redor da Terra.',note:'A órbita desta exposição é circular e ideal: dois corpos, sem atmosfera. Tamanhos, distâncias e tempo estão reduzidos para ensinar.'}]},
 orbit:{pages:[{title:'Onde estará a cápsula?',eyebrow:'POSIÇÃO · TEMPO · TRAJETÓRIA',...art(0),...animated,text:'Conhecer posição e velocidade permite prever o percurso. Na órbita circular ideal, a velocidade tem módulo constante e direção variável.',note:'A seta indica a direção tangente. Para retornar, é preciso alterar a trajetória; a descida ilustrada não é um cálculo de reentrada real.'},{title:'Conferir antes de voar',eyebrow:'JOHN GLENN · 1962',...art(4),text:'Antes do voo orbital de John Glenn em 1962, Katherine Johnson verificou os cálculos de trajetória produzidos pelos computadores eletrônicos.',note:'A verificação ajudava a conferir previsões de voo. A simulação 3D é didática e não reproduz a trajetória exata da missão.'}]},
 rocket:{pages:[{title:'Mercury: caminho até a órbita',eyebrow:'FOGUETE · DEMONSTRAÇÃO',...art(1),text:'Um foguete acelera a cápsula até condições de voo planejadas. Aqui, o modelo se inspira no Mercury-Atlas e mostra uma subida simplificada.',note:'Feche este painel e olhe para “Lançar demonstração” no pedestal. Katherine trabalhou nos cálculos, não na construção física do veículo.'}]},
 capsule:{pages:[{title:'Uma missão, muitas verificações',eyebrow:'MERCURY · JOHN GLENN · 1962',...art(3),...animated,text:'Em 1962, Glenn tornou-se o primeiro norte-americano a orbitar a Terra. Katherine conferiu os cálculos para seu voo.',note:'Modelo educativo inspirado na cápsula Mercury: escudo térmico, corpo cônico e antenas. Não é uma réplica de engenharia.'}]},
 speed:{pages:[{title:'Velocidade e raio',eyebrow:'v = √(μ/r) · μ = GM',...art(2),diagram:'variables',renderDiagram:drawVariables,text:'Para uma órbita circular ideal em torno do mesmo corpo, um raio maior corresponde a uma velocidade orbital menor.',note:'r é a distância ao centro do planeta. G é a constante gravitacional; M, a massa central. A fórmula não vale para qualquer trajetória.'}]},
 gravity:{pages:[{title:'Aceleração para o centro',eyebrow:'|a| = μ/r²',...art(2),...animated,text:'A gravidade muda a direção da velocidade. Numa órbita circular ideal, a cápsula mantém a rapidez enquanto sua trajetória se curva.',note:'Esta expressão dá o módulo da aceleração gravitacional. Dobrar a distância ao centro reduz esse módulo a um quarto.'}]},
 coordinates:{pages:[{title:'Descrever a posição',eyebrow:'x = r cos θ · y = r sen θ',...art(2),...animated,text:'Duas coordenadas localizam a cápsula no plano da órbita. Em uma órbita circular uniforme, o ângulo cresce como θ = ωt.',note:'Usamos ω = √(μ/r³). As unidades do modelo são normalizadas: não representam quilômetros nem segundos de uma missão.'}]},
 return:{pages:[{title:'Órbita e volta à Terra',eyebrow:'T = 2π √(r³/μ)',...art(3),diagram:'return',renderDiagram:drawReturn,text:'O período T é o tempo de uma volta circular ideal. Uma manobra de retorno muda a órbita para encontrar a atmosfera.',note:'Reentrada também depende de resistência do ar, aquecimento e limites do veículo. A imagem ilustra o tema e não calcula uma reentrada segura.'}]},
 biography:{pages:[{title:'Katherine Johnson',eyebrow:'1918–2020 · MATEMÁTICA',...archive,text:'Formada em matemática e francês, Katherine Johnson levou seu talento para a pesquisa aeronáutica e espacial.',note:'Entrou no laboratório de Langley em 1953, quando a instituição ainda era a NACA, antecessora da NASA.'}]},
 nasa:{pages:[{title:'Da NACA à NASA',eyebrow:'LANGLEY · CÁLCULOS DE VOO',...archive,text:'Em Langley, começou no grupo West Area Computing, segregado racialmente e liderado por Dorothy Vaughan.',note:'Seu trabalho incluiu análises de voo e trajetórias para o programa espacial. Fonte histórica: biografia da NASA.'}]},
 glenn:{pages:[{title:'Conferir os números',eyebrow:'VOO ORBITAL · 1962',...art(0),text:'John Glenn pediu que Katherine Johnson conferisse os cálculos eletrônicos de sua missão orbital de 1962.',note:'A matemática, as equipes de engenharia e os procedimentos de verificação trabalhavam juntos. Não atribuímos a ela a fabricação dos veículos.'}]},
 mathematics:{pages:[{title:'Geometria para explorar',eyebrow:'PESQUISA · TRAJETÓRIAS',...art(4),text:'Em 1960, Johnson e Ted Skopinski publicaram um relatório sobre o posicionamento de um veículo em uma trajetória orbital.',note:'As equações desta exposição são exemplos escolares de mecânica orbital. Não são uma transcrição das folhas de cálculo de Katherine.'}]},
 legacy:{pages:[{title:'Um legado que abre caminhos',eyebrow:'RECONHECIMENTO · PERTENCIMENTO',...archive,text:'Mulher negra em instituições segregadas, enfrentou barreiras raciais e de gênero. Recebeu a Medalha Presidencial da Liberdade em 2015.',note:'Sua história inspira estudantes a ocupar espaços na ciência. Fotografia de arquivo da NASA, sem frases inventadas.'}]},
};
export const historySpecs=[
 {id:'biography',title:'01 · KATHERINE JOHNSON',subtitle:'Quem foi · formação e trajetória',tile:null,position:[-2.4,.30,3.2]},
 {id:'nasa',title:'02 · NACA → NASA',subtitle:'Langley · cálculos de voo',tile:4,position:[-1.28,.30,3.8]},
 {id:'glenn',title:'03 · JOHN GLENN · 1962',subtitle:'A verificação dos cálculos',tile:0,position:[0,.30,4.0]},
 {id:'mathematics',title:'04 · MATEMÁTICA',subtitle:'Geometria e exploração espacial',tile:2,position:[1.28,.30,3.8]},
 {id:'legacy',title:'05 · LEGADO',subtitle:'Ciência · barreiras · reconhecimento',tile:5,position:[2.4,.30,3.2]},
];
export {atlas,photo};
