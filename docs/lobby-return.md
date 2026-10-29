# Placas fixas de retorno ao lobby

Componente compartilhado `shared/ui/lobby-return.js`, integrado em `shared/app.js`. A placa é filha da cena global, não da câmera. O gerenciador escolhe sua posição uma única vez em `onActive(id)` por `home.reset(id)`.

Posições permanentes (x, y, z), em metros:

| Sala | Posição | Piso |
| --- | --- | --- |
| Marie Curie | −0,95; −1,46; −1,30 | −1,65 |
| Hedy Lamarr | −0,95; −1,46; −1,20 | −1,65 |
| Katherine Johnson | −1,10; −1,43; −1,55 | deck: −1,625 |

As placas ficam à frente e à esquerda do visitante, na circulação anterior às mesas/pedestal da Terra. A superfície é inclinada uma única vez em direção ao ponto fixo (0,0,0), para facilitar leitura e raycasting. Não há cálculo de pose a partir da câmera, suavização, lerp ou atualização de posição/orientação por frame. Ao olhar para outra direção a placa fica para trás, permanecendo no mesmo lugar.

Design preservado: ícone de casa, texto “Voltar ao Lobby”, fundo escuro, moldura azul e animação da borda. Visual: 0,82 × 0,192 m; hotspot: 0,96 × 0,28 m. A câmera é usada apenas para o raycast. O update controla somente disponibilidade e a trava de reentrada após modais. O feedback anima somente o brilho.

Gaze: 1200 ms, uma ativação por seleção. Painéis/imagens/menu têm prioridade e desabilitam a placa temporariamente, sem mudar sua posição. O gerenciador existente mantém fade-out/in e retorno sem recarregamento, preservando câmera, renderizador, sensores e Cardboard. Portais do lobby continuam em 3000 ms; a placa fica desativada no lobby.

Restauração anterior: `.runtime/restore-before-floor-return.tar.gz`.

## Verificação

- `npm test` e `npm run build`.
- `node tests/lobby-return-review.mjs`: requer Vite 5173 e Chrome CDP 9222. Compara as matrizes da placa ao girar a câmera em quatro direções; verifica altura de todos os cantos e nove raios contra as malhas reais de cada sala para detectar obstáculos. Também testa painel → ampliação → fechamento, gaze interrompido, retorno único, normal/estéreo, preservação da sessão e dos 3000 ms nos portais. Relatório e capturas em `artifacts/lobby-return/`.

O teste automatizado usa orientação controlada, sem simular validação de sensores físicos. Conforto e desempenho em Android com lentes Cardboard continuam dependendo do teste no aparelho real.
