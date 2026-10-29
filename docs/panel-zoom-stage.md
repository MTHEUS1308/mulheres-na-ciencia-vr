# Etapa 4 — painéis maiores, imagens estáveis e ampliação pelo olhar

**Atualização posterior:** a ampliação agora permanece aberta ao desviar o olhar e fecha pelo botão “Fechar imagem”. A correção do loop e os testes com RAF real estão em [image-gaze-loop.md](image-gaze-loop.md). O comportamento abaixo registra a etapa anterior.

## Causa reproduzida

Antes da alteração, a mira sobre a imagem não atingia nenhum alvo (`gaze.hit() === null`). Tanto o cartão como a animação continuavam visíveis, com opacidade 1. Não existem handlers de `mouseenter`/`mouseleave` nem efeito de hover que altere as imagens.

O plano transparente da animação usava `depthWrite: true`. Ao olhar para a imagem, a ordenação por distância dos centros colocava esse plano antes do cartão. Mesmo seus pixels transparentes gravavam profundidade, impedindo o desenho da imagem atrás deles. A captura `artifacts/panel-zoom/before-image-gaze.png` reproduz o retângulo vazado. No mesmo enquadramento, desligar apenas a escrita de profundidade do plano restaurou a imagem (`diagnostic-depthwrite-off.png`), confirmando o conflito. Essa alteração isolada era diagnóstica: também foi necessário ordenar as camadas para preservar a animação.

## Correção

Cartão e animações não escrevem profundidade e têm ordem explícita de desenho: base, animação, borda, fundo da ampliação, imagem ampliada e controles. Mantêm o teste de profundidade contra o cenário. As figuras e camadas decorativas não fazem raycast. Os únicos alvos novos são proxies independentes, sem escrita de cor/profundidade, para a imagem e seus controles.

O realce usa uma borda separada. Não modifica a opacidade, a textura ou a visibilidade da imagem base. A textura científica pequena continua animada em até 12 Hz. As transições de abertura/fechamento permanecem, mas são independentes da seleção sobre a imagem.

## Escala

As dimensões dos cartões multimídia aumentaram 35%: de aproximadamente 1,146 × 0,860 m para 1,548 × 1,161 m. A distância horizontal permanece em 1,65 m. Textos, títulos, figuras e botões acompanham a mesma escala. O cartão fica acima do tampo e dentro da área livre central; sua pose é calculada uma vez ao abrir, sem mover a câmera nem seguir a cabeça.

## Ampliação

Olhar para a figura por 1,8 s inicia uma transição de aproximadamente 320 ms. A imagem aparece maior dentro dos limites do cartão, mantendo a proporção, sem recorte e sem se aproximar do rosto. O fundo do cartão é escurecido levemente; a ilustração original continua intacta por baixo.

A área de visualização mantém a ampliação enquanto a mira estiver dentro de sua moldura. Desviar dessa área retorna ao estado normal. O botão “Voltar à imagem” também retorna; “Fechar / voltar” encerra todo o painel e reseta a ampliação. A área ampliada não dispara ciclos repetidos de seleção. Navegar para outra página descarta os alvos e recursos anteriores. O tempo de 1,8 s é específico das imagens; o ajuste existente dos demais controles permanece disponível.

O atlas WebP original é reutilizado na visualização ampliada, em vez de ampliar uma captura do cartão. A fotografia de acervo mantém sua proporção vertical e seus créditos. Nenhuma ilustração foi regenerada nesta etapa.

## Preservação

Restauração: `.runtime/restore-before-panel-zoom-20261023.tar.gz`. Hashes de comparação em `.runtime/panel-zoom-baseline.json` registram cenário, irradiância, reflexos, script de iluminação/mesas, módulos de câmera/sensores/Cardboard e páginas de Hedy/Katherine. Esses arquivos permanecem idênticos. Não houve exclusão de arquivos. O sistema de gaze ganhou apenas tempo por alvo e retenção passiva de foco; os testes existentes de permanência e cancelamento continuam relevantes.

## Teste físico

As verificações de navegador usam WebGL por software e emulação de tela. Giroscópio, alinhamento das lentes, distorção/IPD, legibilidade real, luminosidade percebida, FPS e conforto prolongado devem ser testados pelo usuário no Android/Cardboard. Eventos sintéticos não validam os sensores.

## Resultado das verificações

- `npm test`: três testes passaram, incluindo cancelamento/reinício de dwell e tempo específico de 1,8 s com retenção passiva.
- `npm run build`: passou.
- `tests/panel-image-review.mjs`: oito apresentações, 13 páginas, 78 regiões. Para cada região, a leitura de pixels da imagem foi comparada com a mesma renderização sem a camada de animação; diferença máxima zero nas regiões fora da faixa animada. A mira atingiu o hotspot, a imagem base permaneceu com opacidade 1 e não entrou na lista de alvos. Ampliação, progresso intermediário, retorno pelo botão, retorno ao desviar e fechamento passaram. Console sem erros.
- `tests/panel-stereo-review.mjs`: viewports 1440 × 900 e 844 × 390. Interceptadas as duas câmeras reais usadas pelo StereoEffect para conferir projeção dos cantos e ler pixels de cada olho. Cartão e imagem ampliada couberam nos dois frustums; pixels permaneceram estáveis nos dois olhos. Fechamento com a imagem ampliada também passou. A câmera central permaneceu em `(0, 0, 0)`.
- Capturas normais e ampliadas de computador/celular, antes/depois do defeito, e relatórios JSON em `artifacts/panel-zoom/`. A prévia foi aberta no navegador padrão em `http://localhost:5173/sites/marie-curie/`.
