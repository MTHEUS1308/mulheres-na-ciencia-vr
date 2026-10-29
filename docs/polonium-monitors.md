# Central de monitores do polônio

Somente `mainTablePresentations.polonium` em Marie Curie opta por `layout: 'monitors'`. As três páginas científicas originais foram preservadas byte a byte; não houve alteração de títulos, parágrafos, notas, imagens, créditos ou diagramas. Não há nova informação científica nem cópias adicionais das páginas.

`shared/ui/monitor-station.js` reutiliza `multimediaCard` e `imageViewer` em três grupos independentes. Página 1 no centro; página 2 à esquerda; página 3 à direita. Raio de 1,44 m, ângulos de 0/−56/+56°, escala 1,03. O tamanho angular de leitura permanece próximo ao painel anterior. O conjunto ocupa a área livre central antes das mesas; cada monitor fica voltado para o centro desse arco, com separação angular entre suas bordas.

A direção inicial é definida uma única vez ao abrir o conteúdo, apenas com a orientação horizontal. Não acompanha movimentos posteriores da cabeça. Os monitores laterais devem ser observados girando a cabeça: não se pretende encaixar as três telas inteiras ao mesmo tempo em cada olho.

A aparência vem dos cartões existentes: fundo escuro, bordas douradas, fonte Georgia, imagem e animação científica. “Próxima” e “Anterior” não são criados nessa apresentação. Um único “Fechar / voltar” abaixo do monitor central fecha todos.

Cada imagem tem seu próprio hotspot e modal, com gaze de 1200 ms e fechamento pelo olhar. Enquanto uma imagem está ampliada, somente seus controles e o fechamento global são selecionáveis; os outros monitores permanecem visíveis. A mira conserva sua ordem de renderização acima das telas. Ao fechar ou trocar de sala, cartões, animações, texturas e alvos são descartados; alvos invisíveis não permanecem no raycasting.

O modo anterior continua sendo o padrão para todas as outras apresentações. Hedy, Katherine, lobby, câmera, sensores, partículas, mobiliário, iluminação e tempos de interação não foram modificados.

## Validação

- `npm test`: seis conjuntos existentes.
- `npm run build`: produção; mantém o aviso existente do pacote Three.js acima de 650 kB.
- `node tests/polonium-monitors-review.mjs`: com Vite 5173 e Chrome CDP 9222. Confere três telas e imagens carregadas; ausência de “Próxima”; poses invariantes em quatro direções da cabeça; ampliação das três imagens com RAF/gaze real; persistência sem loop ao desviar; exclusividade modal; fechamento global; limpeza de alvos; reabertura e descarte ao sair; renderização em ambos os olhos e preservação da sessão VR e portais de 3000 ms. Capturas e relatório em `artifacts/polonium-monitors/`.
- Comparação com o arquivo anterior: a única alteração no conteúdo é o campo de layout do polônio.
- Conferência adicional do eletrômetro: suas três páginas e avanço sequencial continuam funcionando, sem monitores simultâneos.

A automação não valida sensores, conforto nas lentes ou desempenho no aparelho Android real. A avaliação física no Cardboard continua necessária.

Restauração: `.runtime/restore-before-polonium-monitors.tar.gz` guarda os arquivos existentes antes da alteração.
