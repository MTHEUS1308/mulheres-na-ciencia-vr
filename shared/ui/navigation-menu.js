export const sites = [
  { id:'hedy-lamarr', name:'Hedy Lamarr', title:'O Laboratório das Frequências', era:'Década de 1940', color:'#b88051' },
  { id:'marie-curie', name:'Marie Curie', title:'O Laboratório da Radioatividade', era:'1898 · Paris', color:'#c1ac80' },
  { id:'katherine-johnson', name:'Katherine Johnson', title:'A Matemática que Levou o Homem ao Espaço', era:'Década de 1960', color:'#92adbe' },
];
export const siteUrl = id => id==='lobby'?'/':`/sites/${id}/`;
// Compatibility entry for callers: internal scene navigation, never a reload.
export function navigate(id) {
  return globalThis.museum?.manager.navigate(id) ?? Promise.resolve(false);
}
