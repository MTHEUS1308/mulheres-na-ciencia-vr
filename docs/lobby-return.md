# Retorno acessível ao lobby

Componente compartilhado `shared/ui/lobby-return.js`, integrado em `shared/app.js`. Nenhum arquivo dos quatro ambientes, partículas, painéis, ampliação, configuração de qualidade ou duração dos portais foi alterado.

O botão usa ícone de casa desenhado em canvas, texto “Voltar ao Lobby”, base escura semitransparente e moldura azul luminosa separada. Dimensões visuais: 0,82 × 0,192 m; hotspot: 0,96 × 0,28 m. A posição relativa à direção horizontal é (0,35; −0,45; −2,35) m, a aproximadamente 2,42 m da câmera. Não acompanha a inclinação vertical: o visitante pode olhar um pouco para baixo para alcançá-lo.

Uma zona morta de 8° evita acompanhar pequenos movimentos de cabeça. Mudanças maiores são suavizadas exponencialmente (constante de 0,32 s). O movimento horizontal pausa enquanto a mira seleciona o botão. A identidade do alvo permanece estável; o gaze existente completa 1200 ms, reinicia ao desviar e aciona a navegação uma única vez.

Materiais transparentes com depthTest/depthWrite desativados e renderOrder 500/501 mantêm o botão visível sobre decoração, com a mira em 1000/1001 e o fade em 2000. O hotspot tem prioridade sobre alvos decorativos na mesma direção; seus elementos visuais não recebem raycasts. Durante painéis, imagens ampliadas, menu de qualidade, configurações ou transições, o botão e seu hotspot ficam desativados. Fechar o modal devolve o retorno à visita sem interferir na imagem. Uma trava de reentrada exige que a mira saia do hotspot antes de armar o gaze recém-disponível; isso evita aproveitar acidentalmente o olhar que fechou o painel.

O gerenciador existente faz fade-out, desativa/libera a sala, reativa o lobby e faz fade-in. Renderizador, câmera, controles, sensores e estado Cardboard são mantidos. O componente fica oculto no próprio lobby. Demais controles globais continuam nas posições anteriores.

Restauração anterior a esta alteração: `.runtime/restore-before-lobby-return-20261029.tar.gz` (contém o `shared/app.js` original).

## Verificações

- `npm test`: gaze, modal, duração dos portais, gerenciador e conteúdos existentes.
- `npm run build`: build de produção; aviso existente de tamanho do pacote Three.js.
- `node tests/lobby-return-review.mjs`: requer Vite na porta 5173 e Chrome com CDP na porta 9222. Verifica as três salas, quatro direções horizontais, zona morta, área ampliada, modal/imagem/fechamento, gaze real com interrupção e conclusão em 1200 ms, prioridade sobre obstáculo interativo mais próximo, renderização normal e nos dois olhos, retorno sem novo documento, um único canvas, qualidade Alta, câmera fixa e portais em 3000 ms. Relatório e capturas: `artifacts/lobby-return/`.

A automação usa orientação de câmera controlada pelo teste, sem validar giroscópio físico. Conforto, legibilidade nas lentes, sensores e desempenho precisam de avaliação em Android real com Cardboard.
