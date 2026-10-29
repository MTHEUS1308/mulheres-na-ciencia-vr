# Correção do loop de ampliação por gaze

## Diagnóstico observado

A instrumentação temporária de desenvolvimento registrou detecção da imagem, início do dwell, progresso completo, execução do callback, alteração de estado e visibilidade do modal. A reprodução usou timestamps reais de `requestAnimationFrame`, sem avançar artificialmente o relógio e sem chamar a ativação da imagem diretamente.

Em `artifacts/image-loop/before.json`, o callback foi executado duas vezes em aproximadamente 4,4 s para o mesmo UUID de imagem. Portanto não faltava callback nem havia recriação do alvo a cada frame. Na primeira ativação, o callback guardou `performance.now() = 8007,6`, mas o quadro corrente tinha timestamp `8007,0`. O intervalo de −0,6 ms foi limitado a zero, deixando a animação no progresso zero.

A implementação antiga escondia o hotspot original imediatamente, mas só tornava o alvo ampliado visível quando o progresso fosse maior que zero. No quadro seguinte não havia alvo sob a mira. A regra de fechar ao perder foco fechava a ampliação antes de ela aparecer, habilitando novamente o hotspot e reiniciando o dwell. A sequência se repetiu com intervalo de −0,7 ms na segunda ativação.

Os testes anteriores com timestamps adiantados artificialmente pulavam esse primeiro quadro de intervalo zero. Por isso não reproduziam a falha real.

## Correção

- Estado explícito: `idle → opening → open → closing → idle`. Uma abertura só é aceita em `idle`; o bloqueio continua durante o fechamento.
- A transição usa exclusivamente timestamps de frame. O callback não consulta outro relógio para iniciar a animação.
- O modal e seu alvo de captura existem durante todo o estado ativo, inclusive no primeiro quadro com progresso zero. A imagem original continua intacta por baixo.
- O modal permanece aberto independentemente da direção do olhar. O texto agora orienta a selecionar **Fechar imagem**.
- O hotspot original fica bloqueado enquanto o modal estiver ativo. Sua interação não acumula progresso nem dispara novamente.
- Os controles do painel por trás da imagem ficam bloqueados. Continuam disponíveis o fechamento da imagem e o fechamento completo do painel.
- Fechar a imagem reabilita o mesmo hotspot e mantém o mesmo cartão/textura/página, sem recriar o painel. Um novo dwell é necessário para ampliar outra vez.

## Arquivos de implementação

- `shared/ui/image-modal-state.js`: máquina de estados e relógio de animação.
- `shared/ui/image-viewer.js`: integração do estado, modal persistente, bloqueio, visibilidade e fechamento.
- `shared/ui/info-panel.js`: controle dos alvos permitidos e identificação do botão de fechar o painel.
- `shared/vr/gaze-controls.js`: bloqueio de alvos desabilitados e instrumentação de detecção/disparo.
- `shared/vr/gaze-debug.js`: logs temporários opt-in, exclusivamente em desenvolvimento.
- `shared/app.js`: filtro de raycast respeita o modal da imagem.

Os logs são silenciosos no uso normal e em produção. Para diagnóstico local, definir `window.__VR_GAZE_DEBUG__ = true`; os eventos ficam em `window.__VR_GAZE_TRACE__`. Desativar com `false`. Não se registram dados de sensores.

## Verificações

Os testes de estado cobrem o primeiro quadro de progresso zero, ativação única, persistência, bloqueio durante fechamento e liberação após fechar. O teste de dwell cobre um alvo bloqueado pelo próprio callback. O teste de renderização anterior foi atualizado para o novo contrato de permanência do modal, em vez do antigo fechamento ao desviar.

O teste funcional `tests/image-gaze-loop-review.mjs` percorre Marie Curie e Hedy Lamarr, usando tempo real de RAF e dwell. Confere abertura, permanência por vários segundos, desvio do olhar, bloqueio dos controles de trás, fechamento, restauração dos mesmos UUIDs, reabertura e fechamento completo. Também lê pixels da imagem renderizada em cada olho, comparando com a mesma imagem oculta, para verificar que o modal realmente aparece.

Os cenários, texturas, iluminação, mesas, arquivos dos sites, câmera, sensores, Cardboard e Vite/HTTPS foram comparados com os hashes de `.runtime/image-loop-baseline.json`, sem alterações. Giroscópio, conforto das lentes e desempenho térmico/FPS em um Android real continuam pendentes; emulação não equivale a validação física.

### Resultado final

`npm test` e `npm run build` passaram. Os quatro fluxos funcionais com RAF real passaram: Marie/eletrômetro (normal), Marie/anotações (estéreo), Hedy/transmissor (normal) e Hedy/patente (estéreo). Cada fluxo abriu uma vez, permaneceu aberto, retornou ao mesmo painel e reabriu somente após um novo dwell. Houve exatamente duas execuções do callback por fluxo, correspondentes às duas aberturas explícitas. Nenhuma repetição durante a permanência do modal.

A comparação de pixels com a imagem ocultada mostrou diferenças de 112 a 225 níveis de cor nos pontos amostrados, confirmando renderização efetiva; as duas imagens em estéreo foram conferidas nos dois olhos. Nenhum erro de console. Os resultados, logs completos e capturas estão em `artifacts/image-loop/after.json` e nos PNGs da mesma pasta. O diagnóstico anterior está em `before.json`.

Testes adicionados/ajustados: `tests/image-modal-state.test.js`, `tests/gaze.test.js`, `tests/image-gaze-loop-review.mjs`, `tests/panel-image-review.mjs`. Documentação: este relatório, `docs/panel-zoom-stage.md`, `docs/testing.md` e instruções atuais no `README.md`.
