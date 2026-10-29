# Monitores informativos globais

Todas as apresentações com mais de uma página agora usam `monitorStation`, nos três ambientes. Cada página original corresponde exatamente a um monitor. Uma página única continua usando o cartão existente. A seleção é automática pela quantidade de páginas; não exige editar os conteúdos de cada ambiente. O campo histórico `layout: 'monitors'` do polônio já não é necessário para ativar a apresentação.

`shared/ui/info-panel.js` não cria mais “Próxima” nem “Anterior”. O fechamento comum encerra o conjunto inteiro, libera seus recursos e remove os hotspots. Textos, imagens, fórmulas, créditos, referências e funções de animação são passados diretamente dos objetos de página originais, sem duplicação ou transformação do conteúdo.

## Composição compacta

`monitorLayout(count)` em `shared/ui/monitor-station.js` usa:

- Largura física preservada: 1,32 × 1,03 = 1,3596 m.
- Raio de observação: 1,70 m.
- Folga entre bordas vizinhas: 5% da largura = 0,06798 m.
- Passo angular calculado pela geometria das bordas tangentes: aproximadamente 45,7°, em vez dos 56° anteriores. A largura dos monitores não foi reduzida.

Para meia abertura u, a separação entre as bordas é `2r·sin(u) − largura·cos(u)`. O cálculo resolve essa expressão para a folga desejada. Isso produz uma distância uniforme entre bordas sem sobreposição, proporcional à largura, para qualquer quantidade de telas. Duas telas são simétricas à direção de abertura; em conjuntos ímpares, a primeira tela permanece central, como antes no polônio, e as demais ocupam as posições laterais.

O arco é definido uma única vez ao abrir, na direção horizontal atual. As telas permanecem estáveis ao movimentar a cabeça. Sua legibilidade não depende de colocar todo o conjunto no mesmo campo visual: os monitores laterais são observados com pequenos giros, mantendo imagens e fontes originais. A composição anterior específica do polônio está documentada historicamente em `polonium-monitors.md`; esta etapa substitui aquele espaçamento.

## Interações e desempenho

Os componentes existentes `multimediaCard` e `imageViewer` continuam responsáveis por imagens, diagramas e ampliação. Gaze de 1200 ms, modal persistente, seleção exclusiva enquanto a imagem está ampliada e fechamento individual/global foram mantidos. O texto dos cartões é estático; somente os diagramas existentes atualizam suas pequenas texturas a 12 Hz. São criados apenas os monitores das páginas da apresentação aberta, sem manter os conteúdos de todas as salas ativos.

Não foram alterados cenários, câmera, qualidade Alta, sensores, navegação contínua, botão fixo de retorno ou portais de 3000 ms.

## Testes

- `npm test`: sete conjuntos, incluindo `tests/monitor-layout.test.js`, que verifica folga exata de 5%, centralização, largura preservada e ausência de sobreposição para 2, 3 e 4 telas.
- `npm run build`: produção. Permanece o aviso existente sobre o pacote Three.js acima de 650 kB.
- `tests/global-monitors-review.mjs`: requer Vite 5173 e Chrome CDP 9222. Use `CDP_ORIGIN=http://[::1]:9222` se o navegador de teste estiver no IPv6. Percorre as apresentações únicas das três salas; compara quantidade e identidade das páginas; verifica imagens carregadas, estabilidade, ausência de controles de paginação, gaze nas imagens das apresentações múltiplas, renderização em ambos os olhos, exclusividade modal, fechamento, remoção dos hotspots e retorno ao lobby sem recarregar. Relatório/capturas: `artifacts/global-monitors/`.

Resultado da revisão: 27 apresentações únicas; seis conjuntos simultâneos, totalizando 14 monitores nessas apresentações; nenhuma falha de imagem ou erro no console.

Os scripts manuais antigos que selecionavam “Próxima” representam etapas históricas e foram substituídos por essa revisão global. A automação não valida sensores físicos, conforto nas lentes ou desempenho no Android real; esses pontos continuam dependendo de teste em aparelho.

Restauração dos componentes anteriores: `.runtime/restore-before-global-monitors.tar.gz`.
