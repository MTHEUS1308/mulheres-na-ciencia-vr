# Validação da primeira entrega

## Executado em 22/10/2026

- Instalação npm dos três workspaces concluída; nenhuma biblioteca adicional de VR necessária. Node.js local 22.23.4, Vite 8.3.5 e versão do Three.js fixada no package-lock.
- `npm run build`: passou, quatro entradas HTML geradas (entrada principal e três sites). Sem erros ou avisos no build final.
- `npm test`: passou. Cobertura de permanência de 2 segundos, cancelamento ao desviar, ativação única enquanto o olhar permanece, troca de alvo e invariância da posição da câmera ao rotacionar.
- Chrome headless com WebGL por SwiftShader: laboratório carregou, raycast atingiu uma estação e abriu painel após a contagem; câmera em (0,0,0); StereoEffect ativou; ambas as páginas futuras abriram com seus três links.
- Emulação móvel horizontal 844 × 390: eventos sintéticos de orientação alteraram quaternion mantendo a posição central; recentralização respondeu; modo estéreo e cursor 3D ativos; sem overflow horizontal.
- Última execução de teste de navegador: nenhum erro capturado no console. O 404 de favicon encontrado na primeira execução foi corrigido com um SVG local.
- Capturas de tela inspecionadas em `/tmp/museum-desktop.png`, `/tmp/museum-stereo.png` e `/tmp/museum-mobile-stereo.png`. Software rendering/emulação não equivalem a uma GPU ou a sensores reais.
- O servidor anterior já ocupava a porta 5173. Foi mantido e recarregou as alterações do projeto. O teste de navegador foi executado contra esse servidor.
- Não houve exclusão intencional de arquivos. O build final usa `emptyOutDir: false`; artefatos antigos podem permanecer em `dist/` e devem ser considerados em uma futura limpeza aprovada.

## Falta validar em Android real

1. Abrir a URL de Marie no computador e conferir se a experiência visual está aprovada.
2. Conectar Android por USB com `adb reverse`, ou disponibilizar HTTPS com certificado confiável (README). Não esperar sensores em HTTP por IP local.
3. Testar Chrome Android em contexto seguro: permitir sensores, aguardar rastreamento e girar lentamente para cada parede, piso e teto.
4. Girar para horizontal antes de usar os óculos; verificar correção da orientação, visão esquerda/direita, alinhamento do cursor e recentralização. Testar nas duas orientações horizontais.
5. Olhar 2 segundos para cada uma das cinco estações. Desviar antes da conclusão deve cancelar. Olhar para fechar/interromper deve encerrar o painel e a animação.
6. Abrir o menu 3D; cancelar e confirmar a mudança de site. A página de destino futura informa que o laboratório ainda não existe. Não prometer manter fullscreen ao navegar.
7. Testar recusa de permissão, ausência de giroscópio, timeout e retomada após voltar de outra aba. Se não houver dados, o app encerra o estéreo e informa a alternativa por toque.
8. Testar saída pelo botão 3D e pelo botão de emergência. Conferir toque fora dos óculos.
9. Verificar legibilidade e conforto dentro de Cardboard/VR Box. O estéreo ainda não corrige distorção específica das lentes nem ajusta IPD.
10. Medir FPS e aquecimento por pelo menos cinco minutos em celular intermediário; comparar resoluções econômica/equilibrada. Meta futura de 60 FPS, ainda não aferida em hardware real.

## Aprovação e próximas etapas

Esta entrega para na estrutura dos três sites e no protótipo de Marie. Aguardar aprovação do diretor criativo e o retorno do teste físico antes de aprofundar o laboratório de Marie, desenvolver Hedy ou Katherine, adicionar modelos/texturas/áudio ou publicar.

## Preparação para teste físico, após a primeira entrega

- Ambientes históricos preservados. Adicionada página independente `/dev-tools/`, helper USB e preparação de HTTPS local.
- Nenhum Android conectado na consulta `adb devices -l`; encaminhamento USB e sensores reais não puderam ser validados.
- HTTP local respondeu 200. HTTPS respondeu 200 usando `curl --cacert`, verificando a cadeia e o IP sem desativar TLS. Certificado emitido por CA local exclusiva por 30 dias.
- Acesso direto à chave privada pelo servidor: bloqueado (403). Certificado público exposto somente por rota de desenvolvimento explícita. Nenhuma confiança instalada automaticamente.
- O teste anterior com eventos simulados permanece um teste de implementação; não conta como validação dos sensores. Aguardando o usuário testar o aparelho e os óculos.

## Revisão visual de Marie Curie · 23/10/2026

- Substituído o blockout por GLB PBR com modelos CC0 e composição autoral; bake real de irradiância em UV1 calculado no Cycles, com fator de normalização nos metadados. Reflexos vêm de HDR da própria sala.
- Build Vite e testes unitários passaram após a revisão.
- Chrome/WebGL por SwiftShader: carregamento GLB/WebP/HDR e lightmaps sem exceções; cinco estações ativadas pelo raycast/permanência. Câmera permaneceu em (0,0,0).
- Escala conferida: painel de 1,25 m a 1,9 m; itens do menu com largura máxima de 0,95 m. Foram inspecionadas capturas frontal, janelas, instrumentos, arquivo, painel, menu e estéreo.
- Capturas da revisão em `/tmp/curie-review/`; teste em `tests/visual-review.mjs`. Aproximadamente 123 mil triângulos na vista frontal e 41 chamadas de desenho no teste em tela única; isso não é uma medição de FPS em celular.
- Eventos sintéticos no teste automatizado verificam apenas regressão matemática dos controles. Não validam sensores reais. Ainda é necessário verificar conforto, legibilidade e desempenho com Android/Cardboard físico.
- Outros laboratórios não foram desenvolvidos. O Git continua indisponível como repositório válido neste ambiente, sem commits.

## Mesas próximas e atmosfera · 23/10/2026

- `npm test` e `npm run build` passaram. `tests/atmosphere-review.mjs` ativou as oito estações por permanência do olhar, conferiu as imagens das oito apresentações, navegação de páginas, animação do ponteiro e fechamento pelo olhar. Nenhum erro de console registrado.
- Câmera em `(0, 0, 0)` em tela única e estéreo. Capturas frontais, laterais, janelas e painéis em `artifacts/atmosphere/`; relatório `validation.json`. Revisão visual confirmou janelas azuladas sem branco estourado, iluminação mais escura, destaques localizados nos metais e ilustrações legíveis nos dois olhos.
- GLB final aproximadamente 18,74 MB. Na vista frontal testada: 33 chamadas de desenho e aproximadamente 101 mil triângulos. Estes números não medem FPS no Android.
- Câmera fixa, orientação e Cardboard comparados por hash com a versão anterior, sem alterações. Páginas de Hedy e Katherine comparadas com a cópia de restauração, sem alterações.
- Servidores HTTP e HTTPS locais responderam 200; HTTPS conferido com a CA local. Nenhuma instalação automática de confiança no aparelho.
- Sensores, conforto, luminosidade real no visor e desempenho no celular continuam pendentes de teste físico do usuário.
- Regressão final em `tests/browser-smoke.mjs`: oito estações ativadas, painel com largura de aproximadamente 1,15 m a 1,65 m, Cardboard ativo, links das páginas futuras presentes e tela móvel sem overflow. Os eventos de orientação deste teste são sintéticos e verificam somente a implementação; não validam o giroscópio físico. Console sem erros.
- A prévia foi aberta pelo navegador padrão com `xdg-open http://localhost:5173/sites/marie-curie/`.

## Etapa 4 · painéis e ampliação

Build e testes unitários passaram. O teste específico percorreu os oito painéis, suas 13 páginas e seis regiões por página (78 regiões), com comparação de pixels contra a imagem sem a camada animada: nenhuma diferença nas regiões amostradas e nenhum erro no console. Foram testados dwell de 1,8 s, ampliação com progresso intermediário, retorno pelo olhar/botão e fechamento. A reprodução anterior comprovou escrita indevida de profundidade pelo plano transparente da animação, não um evento de hover alterando a opacidade.

O teste estéreo conferiu cantos e pixels separadamente nas duas câmeras reais do StereoEffect, em 1440 × 900 e 844 × 390. Painel e imagem ampliada dentro do enquadramento, pixels estáveis e fechamento funcionando. Relatórios e capturas em `artifacts/panel-zoom/`. Detalhes em `docs/panel-zoom-stage.md`. Cenário, iluminação, mesas, câmera, sensores, Cardboard e sites futuros comparados por hash, sem alterações. Conforto, legibilidade nas lentes, sensores e desempenho real em Android ainda aguardam teste físico.

## Segundo ambiente · Hedy Lamarr

`npm test` e `npm run build` passaram. `tests/hedy-review.mjs` percorreu a sala nas quatro direções, acionou os sete alvos e fechou todos os painéis pelo olhar, conferiu animação de canais, ampliação da patente, renderização estéreo e tela móvel horizontal sem overflow. Câmera fixa em `(0, 0, 0)`. Console sem erros. A navegação pelo menu levou a Marie, cujo cenário e painel de medição funcionaram. Capturas e relatório em `artifacts/hedy/`.

Os arquivos do ambiente de Marie e da página de Katherine, os módulos de câmera/sensores/Cardboard, painéis e a configuração Vite foram comparados por hash com o estado anterior. A mira e o controle de gaze também foram comparados com a restauração. Nenhuma alteração nesses componentes. A nova animação é um tipo adicional no canvas compartilhado, sem alterar os diagramas de Marie. Sensores, conforto nas lentes e desempenho térmico/FPS dependem de Android e óculos reais.

## Loop de gaze nas imagens · correção compartilhada

O loop foi reproduzido com RAF real e logs: callback executado, intervalo de animação negativo limitado a zero, modal invisível no primeiro quadro e fechamento automático ao perder o alvo no seguinte. Diagnóstico em `artifacts/image-loop/before.json`.

Após a máquina de estados e o bloqueio modal: `npm test`, `npm run build` e `tests/image-gaze-loop-review.mjs` passaram. Quatro fluxos em Marie/Hedy, normal/estéreo, com relógio real, demonstraram ativação única, permanência ao desviar, fechamento pelo gaze, restauração do mesmo cartão/hotspot, reabertura explícita e imagem efetivamente renderizada em cada olho. Sem erros no console. Relatório e logs em `artifacts/image-loop/after.json`; explicação em `docs/image-gaze-loop.md`.

A ampliação agora fecha explicitamente por **Fechar imagem**, substituindo o antigo retorno ao desviar. Cenários, câmera, sensores, Cardboard e Vite/HTTPS preservados por comparação de hashes. O comportamento em aparelho e lentes reais continua pendente de validação física.

## Lobby central · sessão contínua

Os testes atuais são `tests/browser-smoke.mjs` (carregamento dos quatro cenários na mesma sessão) e `tests/lobby-session-review.mjs` (sequência completa pelo olhar, zoom, fechamento, estéreo/tela cheia e repetição). Scripts de revisão das etapas anteriores permanecem como registros, mas podem pressupor a antiga tela de entrada; não representam o fluxo atual.

Na sessão de 23/10/2026, o teste completo executou seis transições por gaze e mais doze em ciclos repetidos. Um canvas e um contexto WebGL, mesmo documento/câmera/renderizador/controles, estéreo e tela cheia ativos, duração de 1.200 ms e perfil Alta. Uma imagem de cada laboratório abriu e fechou por gaze com RAF real; diferença de pixels da imagem por olho: Marie 173/174, Hedy 176/172, Katherine 204/203. Nenhum evento sintético de sensores foi usado.

Após cada retorno: 59 geometrias e 22 texturas; programas gráficos estabilizados em 17 depois do aquecimento. Rotas diretas dos três laboratórios funcionaram sem intro, em Alta e com gaze de 1,2 s. Os 60 hashes de preservação conferiram. Sem erros de console. Perfil Econômica e retorno a Alta também foram selecionados exclusivamente pelo olhar.

Resultados completos em `artifacts/lobby/session/report.json`. Sensores físicos, lentes, FPS, calor e uso prolongado de memória dependem do teste no Android real.
