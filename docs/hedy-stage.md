# Hedy Lamarr — central de comunicações

## Sequência de construção

Primeiro foram criados o recinto fechado, as três bancadas, o transmissor, os racks, o receptor e o instrumento CRT. Em seguida vieram mapa, navio, documentos, cabos, ferragens, luminárias, mostradores e as interações. `scripts/build-hedy-scene.py` registra essa ordem; os instrumentos são interpretações autorais de equipamentos dos anos 1940, não réplicas certificadas. Os documentos ilustrativos são gerados por `scripts/create-hedy-assets.py`.

A câmera está fixa em `(0, 0, 0)`, a 1,65 m do piso. Bancadas laterais a ±2,25 m; frente a z = −2,40 m. A sala mede 6,4 × 6,8 m, com objetos em todas as direções. A circulação não faz parte da experiência. A distância e o conforto final dependem da avaliação em Cardboard físico.

## Visual e desempenho

O GLB reúne a geometria estática em grupos por material. Madeira PBR licenciada, esmalte com albedo/roughness/normal, metal escovado, baquelite, vidro, papel e indicadores luminosos. Luz direta/indireta e sombras calculadas no Cycles em atlas UV1 de 2048². Reflexos vêm de um panorama HDR desta sala. Sem sombras dinâmicas ou pós-processamento. Um ponto fixo sem sombras complementa a resposta especular junto à luminária.

Os gabinetes têm bordas arredondadas, aros, dials circulares impressos, knobs escalonados com ranhuras, grelhas, parafusos, puxadores e cabos curvos. O navio tem casco formado por malha, conveses, ponte, chaminé, mastros, guarda-corpos e cabos. Indicadores são discretos e estáveis. Esta é uma reconstrução de museu estilizada, não um escaneamento de uma sala histórica.

## Interações e conteúdo

Sete alvos: transmissor, instrumentos de frequência, mapa, navio, patente, retrato e linha do tempo. Mapa e navio apresentam o mesmo contexto. Os painéis existentes são reutilizados, incluindo fechamento por olhar, camadas transparentes ordenadas, mira superior e ampliação das imagens em 1,8 s. A animação de canais destaca transmissor e receptor sincronizados em uma sequência educativa, sem parâmetros de aparelhos reais.

A patente é a folha original rasterizada do PDF de US 2,292,387, não uma figura gerada. O retrato e as demais seis figuras são interpretações por IA identificadas nos cartões/créditos. Não se afirma uso em combate durante a guerra nem invenção direta do Wi-Fi/Bluetooth.

Fontes: [patente](https://patents.google.com/patent/US2292387A/en), [National Inventors Hall of Fame](https://www.invent.org/inductees/hedy-lamarr), [Smithsonian, documentos da invenção](https://sova.si.edu/record/nmah.ac.1590). Créditos públicos em `/assets/hedy-lamarr/media/credits.html`.

## Integração e reprodução

A entrada existente `/sites/hedy-lamarr/` usa a mesma aplicação VR. Somente rótulos da introdução, módulo de cenário e créditos dependem da cientista. A lógica dos controles e o desenho dos painéis continuam compartilhados. Vite, configuração do Tunnel/HTTPS/USB, arquivos de Marie e página de Katherine são preservados. A mensagem de confirmação de navegação agora distingue ambientes disponíveis do ambiente futuro.

```bash
python3 scripts/create-hedy-assets.py
.runtime/blender-4.5.9-linux-x64/blender -b --threads 6 --python scripts/build-hedy-scene.py
python3 scripts/optimize-hedy-assets.py
npm run build
```

Requer caches dos recursos CC0 já presentes, imagem-fonte do atlas e folha da patente em `.runtime/hedy-source/`. A restauração anterior à etapa está em `.runtime/restore-before-hedy-20261023.tar.gz`. Hashes de preservação em `.runtime/hedy-baseline.json`.

Sensores, alinhamento e conforto das lentes, temperatura e FPS em Android não são validados por emulação ou eventos sintéticos. Aguardam aparelho e óculos reais.

## Validação desta entrega

- `npm test` e `npm run build` passaram.
- `tests/hedy-review.mjs`: carregamento do GLB, quatro direções da sala, sete alvos ativados pelo raycaster/dwell, navegação de páginas, animação da textura de canais, ampliação da patente e fechamento pelo olhar passaram. Nenhum erro capturado no console.
- Cardboard renderizado em desktop e em viewport móvel horizontal 844 × 390, com mira ativa e câmera em `(0, 0, 0)`, sem overflow da página. Capturas em `artifacts/hedy/` e relatório em `validation.json`.
- Navegação efetiva pelo menu de Hedy e sua confirmação levou a Marie. O cenário de Marie carregou e abriu seu painel de medição por permanência do olhar, mantendo a câmera central.
- Modelo final de aproximadamente 8,33 MB, com 26 texturas compactadas. Na vista estéreo medida, 26 chamadas de desenho e aproximadamente 64 mil triângulos por olho. Esses números não equivalem a medição de FPS em Android.
- Hashes dos arquivos de Marie, Katherine, Vite, câmera, orientação, Cardboard e componentes de painéis coincidem com a restauração anterior. O bloco da mira e o controle de gaze também foram comparados com a restauração, sem alterações. A extensão do canvas de diagramas só é ativada pelo novo tipo `frequency-hopping`.
- A última revisão visual corrigiu a placa lateral que interceptava a bancada e finalizou o visor circular do instrumento e a chaminé fosca do navio.

A aprovação visual e o teste físico de sensores, estabilidade, legibilidade e desempenho no smartphone/Cardboard continuam pendentes.
