# Mulheres na Ciência · Museu VR

Uma exposição VR integrada com lobby central e três ambientes completos: Marie Curie, Hedy Lamarr e Katherine Johnson. A navegação troca cenas sem recarregar a página, preservando câmera, sensores e Cardboard. Os cenários históricos são reconstruções artísticas educativas; o Universo dos Cálculos é uma exposição espacial futurista.

## Executar

Node.js 22.12+ (neste ambiente há um runtime local):

```bash
export PATH="$PWD/.runtime/node-v22.23.4-linux-x64/bin:$PATH"
npm install
npm run dev -- --port 5173
```

- Marie Curie: http://localhost:5173/sites/marie-curie/
- Hedy Lamarr: http://localhost:5173/sites/hedy-lamarr/
- Katherine Johnson: http://localhost:5173/sites/katherine-johnson/
- Entrada principal: http://localhost:5173/

Os scripts `dev:marie`, `dev:hedy` e `dev:katherine` iniciam o Vite e abrem a entrada correspondente. Os workspaces têm seus próprios `package.json` e arquivos de entrada; o servidor e o build agregados são compartilhados.

## Usar

1. Abra o lobby. Arraste com mouse/dedo ou use as setas com o canvas em foco.
2. Olhe por **3 segundos** para um portal. Painéis, imagens, botões e retorno ao lobby continuam em **1,2 segundo**. A ação dispara uma vez; desviar antes do fim cancela a contagem.
3. A qualidade inicia em **Alta**. Para reduzir, use Configurações ou **Qualidade / VR** dentro dos óculos.
4. No Android, use contexto seguro, gire para paisagem e toque uma vez em **Ativar VR Cardboard**. Autorize os sensores quando solicitado e verifique o rastreamento real antes de colocar o celular nos óculos.
5. Entre nos ambientes e retorne usando **⌂ Voltar ao lobby**, sem novas telas de entrada. Feche os painéis antes de voltar. Imagens ampliadas permanecem abertas até **Fechar imagem**.
6. As trocas preservam a sessão VR; a tela escurece durante o carregamento. **Recentralizar** e **Sair dos óculos** continuam disponíveis pelo olhar.

A posição central é sempre `(0, 0, 0)`. Apenas a orientação muda. A separação dos olhos (64 mm) é um deslocamento óptico fixo, não movimentação do visitante.

## Celular, sensores e HTTPS

`http://192.168.x.x:5173` na mesma rede permite testar a interface, toque e sala, mas **não é um contexto seguro para os sensores**.

Opção local via USB em Android com depuração USB autorizada e Android Platform Tools instaladas no computador:

```bash
adb reverse tcp:5173 tcp:5173
```

Abra `http://localhost:5173/sites/marie-curie/` **no celular conectado por USB**. Navegadores compatíveis consideram localhost um contexto confiável. Não funciona sem o encaminhamento USB ativo.

Para testar por USB, o encaminhamento também pode ser preparado com `bash scripts/android-usb.sh`.

O HTTPS de desenvolvimento foi preparado com CA local em `.runtime/https/`, sem instalação automática de confiança. Execute `npm run setup:https -- IP-DO-COMPUTADOR` para gerar/verificar e `npm run dev:https` para servir na porta 5174. No Android será necessário confiar explicitamente no certificado público dessa CA; não ignore erros de TLS.

A página `/dev-tools/` ajuda a conferir contexto seguro, permissões, eventos reais de orientação e velocidade angular disponível. Eventos sintéticos são ignorados. Os sensores continuam **pendentes do teste no aparelho real**.

Veja o [roteiro de validação no Android](docs/android-validation.md) para instruções completas, endereços da sessão, instalação/remoção da CA e teste Cardboard.

## Verificar e compilar

```bash
npm test
npm run build
npm run preview
```

O build multipágina vai para `dist/`, preservando arquivos anteriores (`emptyOutDir: false`) para não executar limpeza automática sem aprovação. Para publicar, envie os arquivos do build atual a uma hospedagem estática com HTTPS; preserve `sites/` e `assets/`. Cada entrada pode ser acessada diretamente. Os caminhos absolutos supõem publicação na raiz de um domínio. Uma implantação isolada pode compartilhar o mesmo pacote de assets, configurando os links entre sites para os respectivos domínios.

O teste de navegador `tests/browser-smoke.mjs` usa Chrome via CDP em `localhost:9222` e Vite em `localhost:5173`. É executado separadamente dos testes unitários. Capturas ficam em `artifacts/lobby/`.

## Organização e limites

- `sites/`: lobby e três ambientes, com pontos de entrada diretos preservados.
- `shared/vr/`: câmera, sensores, gaze e renderização estéreo.
- `shared/ui/`: painéis 3D, ampliação persistente e controles de navegação.
- `shared/scenes/`: ciclo de vida dos cenários e descarte de recursos.
- `shared/styles/`: interface comum com identidade por cientista.
- `public/assets/`: modelos, texturas, ilustrações e créditos dos ambientes.
- `docs/`: arquitetura, fontes históricas e registro de testes.
- `legacy/`: cópia da primeira sala, preservada sem exclusão. Os antigos arquivos de `src/` também foram mantidos e não são mais os pontos de entrada.

Esta versão usa Three.js, sem A-Frame e sem sessão WebXR nativa. O fallback Cardboard usa `StereoEffect`, sensores e raycasting. Usa modelos GLB com texturas PBR WebP e iluminação em UV1. Não tem correção óptica específica de lentes, calibração de IPD ou narração. Suporte nativo a WebXR e aprimoramento artístico ficam para etapas aprovadas depois da validação do protótipo. Não há garantia de 60 FPS antes de testes no hardware real. Veja o [pipeline da revisão visual de Marie](docs/visual-reconstruction.md).

O Git não está configurado como repositório válido neste ambiente; não foram criados commits.

## Mesa principal · etapa 3

A bancada frontal foi aproximada e seus objetos podem ser selecionados diretamente pelo olhar. Eletrômetro, amostra, microscópio, vidrarias e anotações possuem apresentações 3D com páginas, imagem ou diagrama. Desktop começa na qualidade alta com vidro detalhado; no Android o padrão é equilibrado. Os demais painéis existentes continuam disponíveis.

Veja [detalhes, ponto de restauração e fontes desta etapa](docs/main-table-stage.md). O teste visual automatizado está em `tests/main-table-review.mjs`; capturas são gravadas em `artifacts/main-table/`. A avaliação no aparelho real continua pendente.

### Revisão de proximidade e atmosfera

Mesas laterais a ±2,25 m, janelas frias com brilho reduzido, bake recalculado e oito apresentações ilustradas coloridas. Detalhes, procedência das figuras e limitações em [docs/atmosphere-stage.md](docs/atmosphere-stage.md). Capturas em `artifacts/atmosphere/`. A câmera e os módulos de sensores/Cardboard foram preservados. A validação em Android real continua pendente.

### Etapa 4 · painéis e ampliação

Os painéis de Marie estão 35% maiores, mantendo 1,65 m de distância. Olhe por 1,8 s para uma figura para ampliá-la; a imagem permanece aberta ao desviar o olhar. Use “Fechar imagem” para retornar ao painel. O conflito de profundidade entre o cartão e sua animação transparente foi reproduzido e corrigido. Veja [docs/panel-zoom-stage.md](docs/panel-zoom-stage.md). Testes de renderização em `tests/panel-image-review.mjs` e `tests/panel-stereo-review.mjs`; capturas em `artifacts/panel-zoom/`. O teste físico no Android continua necessário.

### Hedy Lamarr · segundo ambiente

Disponível em `/sites/hedy-lamarr/`: central de comunicações inspirada nos anos 1940, com transmissor, receptor, instrumento CRT, racks, mapa naval, navio e documentos. Sete alvos de gaze abrem conteúdos educativos; a animação demonstra transmissor/receptor sincronizados e a folha da patente amplia pelo olhar. A sala e os equipamentos foram construídos antes dos detalhes/interações. Consulte [docs/hedy-stage.md](docs/hedy-stage.md) e [docs/hedy-assets.json](docs/hedy-assets.json). Os controles VR continuam compartilhados com Marie, cujo cenário foi preservado.

### Katherine Johnson · Universo dos Cálculos

Disponível em `/sites/katherine-johnson/`: observatório circular aberto em um universo 3D, Terra texturizada, planetas, cápsula em órbita, foguete com demonstração de lançamento, quatro painéis matemáticos e cinco temas históricos. Treze alvos abrem apresentações com imagens ampliáveis pelo olhar. Câmera, gaze, sensores e Cardboard reutilizam os módulos existentes. Fontes, etapas, testes e limitações em [docs/katherine-stage.md](docs/katherine-stage.md). A validação física no Android permanece pendente.

### Lobby central · sessão contínua em VR

A raiz `/` agora abre um lobby 3D com portais para os três ambientes. A seleção e o retorno ao lobby trocam cenas internamente, mantendo o mesmo renderizador, câmera, sensores e Cardboard; as rotas diretas continuam disponíveis. A visita inicia com qualidade **Alta** e gaze de **1,2 s** nas interações comuns e **3 s** nos portais. Use **Qualidade / VR** para reduzir o perfil pelo olhar dentro dos óculos. Veja [arquitetura, restauração, testes e limites no Android](docs/lobby-session.md).

### Marie Curie · partículas e imagens científicas

Partículas verdes tridimensionais animadas por GPU, com concentração nos experimentos e atualização interrompida ao sair da sala. Rádio usa fotografia identificada de pechblenda; polônio usa ilustração científica identificada do Po-210. As imagens ampliam pelo olhar em 1,2 s. Procedência, preservação e testes em [docs/curie-particles-elements.md](docs/curie-particles-elements.md).
