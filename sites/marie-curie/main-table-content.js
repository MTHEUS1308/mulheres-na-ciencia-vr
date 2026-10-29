const photo = '/assets/marie-curie/media/curie-electrometer-wellcome.jpg';
const credit = 'M0011486 · Wellcome Collection · CC BY 4.0 · foto de 1950';
const atlas='/assets/marie-curie/media/science-illustrations-atlas.webp';
const poloniumImage={image:'/assets/marie-curie/media/polonium-scientific.webp',credit:'Ilustração científica autoral · Po-210 · não é fotografia · dados: NIST / RSC'};
const radiumImage={image:'/assets/marie-curie/media/pitchblende-museum.webp',credit:'Pechblenda: mineral com urânio, não rádio puro · Pacific Museum of Earth · CC BY-SA 2.0'};
const illustration=tile=>({image:atlas,imageTile:tile,credit:'Ilustração educativa gerada por IA · interpretação histórica'});
export const mainTablePresentations = {
  meter: { pages: [
    { title:'Medir o invisível', eyebrow:'INSTRUMENTOS · CONTEXTO HISTÓRICO', ...illustration(0), diagram:'measurement',
      text:'Os Curie investigaram a radiação por seus efeitos elétricos no ar. O eletrômetro permitia observar sinais muito pequenos.',
      note:'Ilustração inspirada em instrumentos de época. Consulte a fotografia de referência na última página.' },
    { title:'Da observação ao registro', eyebrow:'SIMULAÇÃO EDUCATIVA', diagram:'measurement', ...illustration(0),
      text:'O ponteiro da mesa e este diagrama ilustram uma leitura variável. A animação não representa valores experimentais.',
      note:'Observe, compare, registre. Sem escala temporal ou quantitativa.' },
    { title:'O instrumento de referência', eyebrow:'ACERVO HISTÓRICO', image:photo, credit, text:'Este aparelho foi construído por Pierre Curie e usado nas pesquisas do casal. A fotografia foi registrada em 1950.', note:'A fotografia é uma referência documental; o modelo 3D e a ilustração são interpretações.' },
  ]},
  polonium: { pages: [
    { title:'Polônio · 1898', eyebrow:'UMA NOVA DESCOBERTA', diagram:'polonium', ...poloniumImage,
      text:'Marie e Pierre Curie anunciaram o polônio em 1898. O nome homenageia a Polônia, país de origem de Marie.',
      note:'A rocha da mesa é uma representação mineral. Não representa polônio puro.' },
    { title:'Uma propriedade da matéria', eyebrow:'SIMULAÇÃO EDUCATIVA', diagram:'radiation', ...poloniumImage,
      text:'A radioatividade está ligada a transformações de núcleos instáveis. Os pontos ilustram emissões, sem reproduzir sua escala real.',
      note:'Radioatividade não é um brilho verde constante. Diagrama conceitual, não procedimento experimental.' },
    { title:'Instrumentos e investigação', eyebrow:'REFERÊNCIA HISTÓRICA', image:photo, credit,
      text:'Comparar sinais elétricos foi parte da investigação dos Curie. Esta fotografia registra um instrumento construído por Pierre Curie.',
      note:'A fotografia é de 1950, posterior às descobertas. O modelo 3D continua sendo uma interpretação.' },
  ]},
  microscope: { pages: [
    { title:'Observar em detalhe', eyebrow:'MICROSCÓPIO DE ÉPOCA', diagram:'microscope', ...illustration(1),
      text:'Lentes e ajustes de foco permitem observar estruturas pequenas. Este modelo de latão ajuda a compor o ambiente de pesquisa.',
      note:'Instrumento de observação; não é apresentado como o aparelho que demonstrou a descoberta do polônio.' },
  ]},
  glassware: { pages: [
    { title:'Vidraria de laboratório', eyebrow:'MATERIAIS E OBSERVAÇÃO', diagram:'glassware', ...illustration(2),
      text:'Formas, paredes finas e bocas diferentes distinguem os recipientes de laboratório. Os modelos apresentam bordas arredondadas e espessura de vidro.',
      note:'Representação visual educativa. Nenhuma instrução de manipulação de substâncias.' },
  ]},
  notes: { pages: [
    { title:'O trabalho de registrar', eyebrow:'ANOTAÇÕES DE PESQUISA', ...illustration(3), diagram:'notebook',
      text:'Registrar observações e comparar resultados ajuda a transformar perguntas em evidências. As folhas da mesa ilustram esse trabalho.',
      note:'Conteúdo criado para a experiência; não transcreve cadernos históricos.' },
    { title:'Comparar, verificar, anotar', eyebrow:'REPRESENTAÇÃO EDUCATIVA', diagram:'notebook', ...illustration(3),
      text:'Uma sequência de registros permite revisar interpretações e reconhecer diferenças entre observações.',
      note:'O traço animado representa o registro de uma observação.' },
  ]},
};

export const sidePresentations={
 radium:{pages:[{title:'Rádio · 1898',eyebrow:'NOVOS ELEMENTOS',...radiumImage,diagram:'radiation',text:'Marie e Pierre Curie e Gustave Bémont anunciaram a descoberta do rádio em 1898.',note:'A rocha é ilustrativa. As partículas coloridas são um recurso explicativo, não um brilho visível do mineral.'}]},
 notebook:{pages:[{title:'A ciência dos registros',eyebrow:'MEDIR · COMPARAR · REGISTRAR',...illustration(3),diagram:'notebook',text:'Os cadernos permitem comparar observações e revisar ideias ao longo do tempo.',note:'Imagem educativa. Não reproduz um caderno original de Marie Curie.'}]},
 awards:{pages:[{title:'Dois Prêmios Nobel',eyebrow:'RECONHECIMENTO CIENTÍFICO',...illustration(5),diagram:'awards',text:'Em 1903, Marie recebeu o Nobel de Física com Pierre Curie e Henri Becquerel. Em 1911, recebeu o Nobel de Química.',note:'Medalhas ilustrativas. As distinções reconheceram suas pesquisas sobre radiação e os elementos polônio e rádio.'}]},
};
