# Katherine Johnson · Universo dos Cálculos

Entrada: `/sites/katherine-johnson/`. Exposição aberta, sem paredes e sem deslocamento da câmera. Frente: Terra com mapas de cor/normais/nuvens, atmosfera, grade de coordenadas e órbita; esquerda: quatro painéis matemáticos; direita: Mercury-Atlas e cápsula; atrás: cinco painéis de história; acima: Lua, Marte, Júpiter, Saturno com anéis, Netuno e satélite. Estrelas 3D e nebulosas discretas. Todos os conteúdos podem ser abertos olhando por 2 s. Imagens ampliam por 1,8 s e permanecem até “Fechar imagem”.

## Etapas e implementação

1. `space.js`: plataforma, materiais metálicos discretos, anéis, estrelas em uma chamada e nebulosas leves. Verificação inicial stage-1 sem erros, câmera na origem.
2. `planets.js`: esferas texturizadas, atmosfera Fresnel, rotação lenta. Stage-2 verificou rotação e câmera fixa.
3. `spacecraft.js`, `orbit.js`: modelos Mercury inspirados, geometrias agrupadas por material, cápsula orbital, satélite, exaustão moderada e lançamento com retorno à base. Stage-3 verificou movimento orbital e quatro direções.
4. `holograms.js`: equações legíveis e marcadores em geometria 3D. Stage-4 sem erros. Distribuição final 2×2 à esquerda.
5. `content.js`, `history.js`: cinco temas históricos, fotografia de arquivo e atlas de ilustrações. Layout histórico verificado junto com a integração final; uma tentativa intermediária de teste foi interrompida pelo recarregamento durante a edição, não foi contada como aprovação.
6. `interactions.js`: 13 alvos educativos, botão separado de lançamento e componentes de painel/zoom compartilhados existentes. `shared/ui/multimedia-card.js` recebe apenas uma extensão opcional para desenhar os diagramas de Katherine; o desenho dos outros ambientes continua igual.
7. Qualidade econômica/equilibrada/alta: 650/1.050/1.500 estrelas, nuvens e atmosfera desligadas na econômica, exaustão com 12 ou 36 pontos. Sem sombras dinâmicas nem pós-processamento; mapas locais WebP. Testes finais nos scripts abaixo.

## Matemática e história

Órbita circular ideal de dois corpos, μ normalizado a 1, raio 1,35 e tempo visual reduzido. Posição x=r cosθ, y=r senθ; ω=√(μ/r³), v=√(μ/r), T=2π√(r³/μ). O vetor azul é tangente. O retorno ilustrado é qualitativo; lançamento demonstra subida e reset, sem pretender reproduzir uma missão. Modelos/planetas não estão na mesma escala. Não atribuímos a construção física dos veículos a Katherine.

Fontes e licenças em [`credits.html`](../public/assets/katherine-johnson/media/credits.html) e [`asset-sources.json`](../public/assets/katherine-johnson/asset-sources.json). Texturas Solar System Scope / INOVE CC BY 4.0; fotografia NASA; atlas educativo gerado por IA. Fontes históricas: [biografia NASA](https://www.nasa.gov/people-of-nasa/katherine-g-johnson/), [fotografia Langley](https://www.nasa.gov/image-article/katherine-johnson-nasa-langley-research-center/).

## Validação reproduzível

Vite em 5173, Chrome com CDP em 9222 e Node 22+:

```sh
npm test
npm run build
node tests/katherine-stage-review.mjs 7
node tests/katherine-review.mjs
node tests/katherine-gaze-review.mjs
```

Os testes de gaze usam tempos reais de requestAnimationFrame para ampliar, desviar o olhar, fechar, reabrir e fechar o painel. Comparam pixels da imagem visível/oculta em cada olho para confirmar renderização, e contam callbacks para detectar o antigo loop. Incluem regressão de Marie e Hedy. Não simulam sensores como prova de hardware.

`katherine-review.mjs` mira os 13 alvos via raycasting, verifica abertura/fechamento, ativa o lançamento por dwell, verifica subida/reset e bloqueio de repetição sem sair do alvo, rotação planetária, deslocamento orbital, câmera fixa, três níveis de qualidade e quatro direções. Compara hashes da cópia anterior dos cenários/assets Marie/Hedy, módulos VR, modal de imagem, painel e Vite. Relatórios e imagens: `artifacts/katherine/`.

Backup anterior: `.runtime/restore-before-katherine-20261023.tar.gz`. Nenhum arquivo anterior foi apagado. Vite preserva `dist` durante o build conforme configuração existente.

## Teste no Android ainda necessário

Use a mesma conexão USB/HTTPS descrita em [android-validation.md](android-validation.md), acrescentando `/sites/katherine-johnson/` à origem. Entrar → ativar sensores → verificar rotação real → Cardboard em paisagem → olhar para Terra ou painéis → ampliar figura → fechar imagem → fechar painel. Testar também “Lançar demonstração” à direita e a navegação entre cientistas.

Confirmar no aparelho real: giroscópio físico, permissões HTTPS, conforto de profundidade/leitura com suas lentes, alinhamento dos olhos, estabilidade de quadros, aquecimento e duração da sessão. O estéreo renderizado no navegador não valida esses fatores. O sistema existente não possui correção óptica específica de lentes.

## Resultado da sessão de 23/10/2026

- `npm test`: três arquivos de testes aprovados (gaze, estado persistente do modal, órbita/lançamento).
- `npm run build`: aprovado, 45 módulos; chunk Three.js ~640 kB sem compressão/~162 kB gzip, sem avisos de tamanho.
- `katherine-review.mjs`: 13 alvos abertos/fechados, lançamento por gaze sem repetição, planetas/órbita em movimento, câmera na origem, 15 combinações de vista/qualidade, 40 hashes preservados, sem erros de console.
- `katherine-gaze-review.mjs`: duas apresentações de Katherine (normal e estéreo), uma de Marie e uma de Hedy; ampliação e reabertura por RAF real, permanência fora da mira, fechamento, identidade dos objetos estável, pixels comprovados nos dois olhos. Sem erros. Não usa eventos simulados de sensores para afirmar compatibilidade física.
- `katherine-controls-review.mjs`: controles vinculados de mouse/teclado, volta completa sem translação, cursor desenhado uma vez por olho e por último, close recebe raycast, confirmação de navegação disponível; sem erros.
- Prévia de produção na porta 4173 e desenvolvimento na 5173. Na sessão, IP da rede: `192.168.1.106`. Para sensores no celular, usar HTTPS/USB já configurados; HTTP de LAN é apenas para toque/visualização.
