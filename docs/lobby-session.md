# Lobby central e visita VR contínua

Entrada principal: `/`. Rotas diretas preservadas: `/sites/marie-curie/`, `/sites/hedy-lamarr/`, `/sites/katherine-johnson/`. O lobby é um quarto cenário 3D, com plataforma circular, estrelas, portais com identidades diferentes e pequenos emblemas tridimensionais: química/vidrarias, ondas e órbitas.

## Uso

O cenário abre imediatamente, sem botão “Entrar no ambiente”. No computador, arraste ou use as setas para orientar a câmera. Olhe por **3 segundos** para a imagem, título ou botão de um portal. Nos laboratórios, use **⌂ Voltar ao lobby**, posicionado perto da direção de entrada. Feche os painéis primeiro: eles bloqueiam os controles do ambiente para evitar ativações através das janelas.

No Android, abra a origem HTTPS/USB já configurada, gire para paisagem e toque uma vez em **Ativar VR Cardboard**. Essa ação solicita os sensores e tenta tela cheia no gesto inicial. Durante as transições a aplicação não chama novamente essas APIs, não desativa o rastreamento e não recria câmera, renderizador ou StereoEffect. A mesma mira e o mesmo painel são reutilizados.

Os portais usam `PORTAL_GAZE_DURATION = 3000`; painéis, imagens, fechamento, retorno e demais botões usam `DEFAULT_GAZE_DURATION = 1200`, definidos em `shared/vr/config.js`. O alias `GAZE_DURATION_MS` mantém compatibilidade com os componentes existentes. O estado persistente do modal de imagem foi mantido. As imagens permanecem abertas ao desviar o olhar e voltam por **Fechar imagem**.

A qualidade padrão é **Alta** em todos os dispositivos. Pode ser reduzida manualmente nas configurações ou, sem retirar os óculos, pelo botão 3D **Qualidade / VR**. A escolha vale para a sessão inteira e é aplicada também ao entrar em outro ambiente. Não há redução automática nem mudança súbita de perfil.

## Arquitetura

- `shared/app.js`: uma sessão global, um canvas WebGL, um renderer, uma câmera fixa, um controlador de orientação, um StereoEffect, um gaze e um infoPanel. Um único loop atualiza apenas o cenário ativo.
- `shared/scenes/scene-manager.js`: recebe as fábricas existentes `laboratory(...)`, carrega cada uma em uma `THREE.Scene` isolada e anexa somente a cena ativa ao mundo global. Transfere background, environment, intensidades e fog para preservar o aspecto original. Os três módulos de laboratório e seus assets não foram reescritos.
- A transição bloqueia gaze, fecha/libera painéis, escurece em 320 ms, desativa a cena antiga, carrega a próxima sob uma cortina 3D preta e revela em 380 ms. Uma breve retenção preta permite o primeiro upload de recursos. O rótulo de carregamento também é estereoscópico. Não há movimento ou recentralização automática da câmera.
- Só o lobby, leve, fica em cache. Ao sair de um laboratório, geometrias, materiais, mapas, bitmaps e render targets PMREM de sua cena são liberados. Interações antigas são removidas do array de raycasting; callbacks e animações de cenários inativos não são executados.
- `resources.js` deduplica recursos compartilhados dentro da cena e libera cada um uma única vez. A câmera, o cursor e os elementos globais não pertencem às cenas descartáveis.
- O cache do navegador pode reutilizar arquivos baixados, mas os laboratórios são reconstituídos pela fábrica na próxima visita para limitar memória gráfica. A cortina permanece preta durante carregamentos mais longos.
- URLs são atualizadas com History API. O navegador Voltar/Avançar usa `popstate` para trocar cenas. A função legada `navigation-menu.navigate` também delega ao gerenciador. Não há navegação de documento dentro do passeio.
- Falhas de carregamento descartam a cena parcial e tentam recuperar o lobby na mesma sessão. Chamadas concorrentes durante uma transição são bloqueadas.

## Preservação e restauração

Backup anterior à refatoração: `.runtime/restore-before-lobby-20261023-155259.tar.gz`. Hashes em `.runtime/lobby-baseline.json` incluem os 60 arquivos dos cenários/assets aprovados, configuração Vite, câmera, sensores e máquina de estados da ampliação. Nenhum arquivo anterior foi apagado.

A configuração Vite, os certificados e o acesso USB/Cloudflare não precisaram ser alterados. A nova entrada raiz utiliza o build multipágina existente. O diretório `dist` continua sendo preservado conforme a configuração anterior.

## Testes

```sh
npm test
npm run build
node tests/lobby-progress-review.mjs --all
node tests/lobby-session-review.mjs
```

Os scripts de navegador usam Vite em 5173 e Chrome/CDP em 9222. `VR_ORIGIN=http://localhost:4173` permite testar a sessão contra a prévia do build. Artefatos e relatórios ficam em `artifacts/lobby/`.

O teste progressivo verifica a sequência completa mantendo identidade das instâncias, origem do documento, estéreo, câmera na origem e um canvas. O teste de sessão realiza a primeira sequência por gaze real, com frames reais, abre/amplia/fecha uma apresentação em cada laboratório, compara pixels nos dois olhos, verifica cursor, tela cheia e ausência de novas solicitações de sensores. Repete viagens para procurar acúmulo de memória, testa a qualidade pelo olhar, as rotas antigas e os hashes de preservação.

Testes unitários cobrem descarte deduplicado, liberação de render targets, cache exclusivo do lobby, atualização apenas da cena ativa, recuperação de erro, bloqueio concorrente e duração padrão. A máquina de estados da imagem e o modelo orbital continuam cobertos.

## Limitações a validar no Android real

O navegador exige contexto seguro para orientação no celular. HTTPS/USB seguem as instruções de [android-validation.md](android-validation.md). Não é possível prometer ativação automática dos sensores/tela cheia sem um gesto aceito pelo navegador. Um diálogo de permissão, o botão Voltar do sistema, a perda de foco, bloqueio da tela ou mudanças do sistema podem encerrar a tela cheia. Se o navegador a encerrar, pode exigir outro toque para recuperá-la; a navegação interna não tenta contornar essa regra.

Os testes desktop comprovam a continuidade das instâncias e da renderização estéreo, não o giroscópio físico. Ainda verificar no Android: autorização inicial, rastreamento real durante as seis transições, orientação paisagem, lentes/IPD, leitura/alcance dos botões, fluidez, aquecimento e uso de memória em sessão prolongada. O Cardboard existente não possui correção óptica específica de lentes. Contagens estáveis de recursos em Chrome de teste não garantem FPS no aparelho.

### Resultados registrados

A sequência progressiva e a sessão com gaze passaram sem erros de console. O teste completo confirmou seis transições por gaze, mais doze em visitas repetidas, mantendo tela cheia, estéreo, documento e instâncias globais. Nos nove retornos ao lobby, a contagem permaneceu em 59 geometrias e 22 texturas; os programas estabilizaram em 17 após o aquecimento. Os 60 hashes do ponto anterior conferiram. As três rotas diretas abriram sem intro, em Alta e com gaze de 1,2 s. Configurações de qualidade foram acionadas pelo olhar.

`npm test`: quatro arquivos de testes aprovados. `npm run build`: aprovado, 49 módulos. O bundle compartilhado Three.js ficou em ~668 kB (~170 kB gzip), acima do limite de aviso já existente de 650 kB; o limite não foi aumentado para ocultar o aviso. Os cenários são importados sob demanda. Desempenho em hardware real permanece pendente.

A prévia de produção em `http://localhost:4173/` também passou pela sequência completa e pelos comandos Voltar/Avançar do navegador, preservando documento, renderizador e estéreo. Captura: `artifacts/lobby/production.png`; relatório: `artifacts/lobby/production.json`. A prévia foi aberta com `xdg-open`. O desenvolvimento permanece em `http://localhost:5173/`.

## Revisão visual e tempo exclusivo dos portais

Os três portais agora ocupam um arco de aproximadamente 117° (−58,4°, 0°, +58,4°), com cerca de 4 m entre centros vizinhos, mantendo o raio de 4,12 m e a câmera na origem. A plataforma não foi deslocada.

`portal-effects.js` adiciona uma aura e brilho de piso sem luzes extras, partículas em uma chamada por portal e decoração 3D sem raycasting. Marie: energia verde artística, anéis e átomos. Hedy: frentes de onda em expansão, circuitos com marcadores móveis e antena. Katherine: Lua e Saturno texturizados, planeta azul, anéis, órbitas, estrelas e nebulosa discreta. Não há pós-processamento nem sombras novas. O número de partículas responde ao perfil de qualidade; os mapas da Lua/Saturno e as figuras já existiam no projeto.

A reação ao olhar usa amortecimento exponencial, inclusive ao sair da área, e acompanha o progresso real. A radioatividade é uma metáfora visual do portal, não uma afirmação de que radiação produz brilho verde. Os efeitos são visuais, com `raycast` desativado, separados dos alvos interativos.

A configuração distingue `PORTAL_GAZE_DURATION = 3000` e `DEFAULT_GAZE_DURATION = 1200`. As quatro áreas acionáveis de cada portal recebem 3.000 ms: imagem, título, subtítulo e botão Explorar. Nenhum outro alvo recebe essa duração. O mesmo controle de gaze calcula o círculo com `(tempoAtual - início) / duraçãoDoAlvo`, zera ao sair e dispara uma única vez. Não foi criado outro temporizador.

`tests/portal-duration.test.js` cobre os três portais em 1.200/1.500/2.999/3.000 ms, cancelamento e reativação após reinício, além das interações comuns em 1.200 ms. O teste de sessão foi ampliado para comparar progresso exibido/calculado e retorno suave dos efeitos ao desviar, antes de selecionar cada portal e testar os painéis/imagens existentes.

Restauração desta revisão: `.runtime/restore-before-portal-effects-20261023-162654.tar.gz`.

Validação da revisão: os três portais apresentaram progresso idêntico ao cálculo por tempo e ao círculo CSS (exemplo Hedy: 1.200 ms → 40%, ainda sem navegar). Ao desviar, o progresso zerou e o foco dos efeitos caiu suavemente de ~0,54 para ~0,002. A seleção posterior executou a navegação uma vez após os 3.000 ms. Os painéis, imagens e retorno continuaram com 1.200 ms. A sessão de teste manteve um contexto WebGL, o documento, tela cheia e estéreo. Após o aquecimento do lobby ampliado: 95 geometrias, 25 texturas e 22 programas, estáveis em mais seis viagens de ida e volta. Nenhum erro de console; 60 hashes de preservação conferidos. Cinco arquivos de testes unitários aprovados. O build conserva o aviso já documentado de tamanho do chunk Three.js, sem erro de compilação.
