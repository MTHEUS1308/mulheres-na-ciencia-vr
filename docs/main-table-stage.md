# Etapa 3 · mesa principal e seus itens

Esta entrega limita a nova composição e as apresentações multimídia à bancada frontal. Os outros ambientes não foram desenvolvidos e as demais estações de Marie continuam acessíveis.

## Ponto de restauração

Antes de editar foi criado `.runtime/restore-before-main-table-20261023.tar.gz` (aproximadamente 81 MB), contendo código, assets públicos e as fontes locais de exportação da cena. O inventário e o SHA-256 estão em `.runtime/main-table-baseline.json`. Os certificados privados não entram nesse arquivo. Nenhuma restauração foi executada.

Para recuperar uma versão anterior, primeiro extraia em outro diretório e compare os arquivos; substituir a versão atual exige autorização. Não há comando automático que apague ou restaure arquivos.

## Bancada e peças

- A bancada única usa o modelo CC0 **Painted Wooden Table**, de Kirill Sannikov / Poly Haven, com texturas 2K de pintura envelhecida, madeira exposta, normal e rugosidade. Não é alegada como mesa original dos Curie.
- Tampo em torno de 1,13 m acima do piso, centro a 2,2 m do visitante e borda frontal a aproximadamente 1,7 m. A câmera permanece em (0,0,0).
- O eletrômetro é uma interpretação autoral inspirada na fotografia M0011486: base circular, aro de proteção, placas suspensas, masto, terminais e mostrador didático separado. Não foi usado um modelo externo fictício nem se afirma ser uma digitalização do original.
- As imperfeições do latão são mapas procedurais reais de cor, rugosidade e normal, preparados por `create-main-table-textures.py`. Sua limitação é não reproduzir o desgaste de um objeto histórico específico.
- As vidrarias são malhas de revolução contínuas com paredes, espessura e bordas arredondadas. As qualidades usam transparência e reflexos PBR; alta aumenta resolução e detalhamento do reflexo. A refração em tela fica desativada para evitar seu passe adicional de renderização em estéreo. Não se promete refração óptica completa nesta entrega. Desktop inicia em alta; dispositivos de toque começam em equilibrada.
- Microscópio, lamparina e lupa são modelos CC0 com escala física e orientação corrigida. A lamparina agora compõe a bancada frontal. O mineral continua identificado como representação, sem afirmar que seja polônio puro.
- A iluminação da nova composição foi recalculada offline, preservando o pipeline Cycles, UV1, normalização de irradiância e reflexão HDR da sala. Não foram adicionados pós-processamentos pesados.

## Interações e conteúdos

É possível selecionar diretamente eletrômetro, microscópio, vidro, amostra e anotações pelo olhar ou clique. Volumes de seleção simplificados facilitam a pontaria. As placas das outras estações permanecem funcionais.

O realce é uma pequena camada luminosa temporária, com confirmação suave. A permanência configurável, seu cancelamento ao desviar e os cursores existentes foram preservados.

Os itens da bancada usam cartões 3D com título, texto resumido, imagem/ilustração, créditos e navegação. A fotografia do eletrômetro é de **1950**, não de 1898. A imagem vem da Wellcome Collection sob CC BY 4.0 e foi redimensionada. Créditos completos em `/assets/marie-curie/media/credits.html` e no próprio cartão.

O diagrama de medição e o ponteiro ilustram uma leitura simulada; não há valores experimentais. O polônio possui cartão do elemento, emissões conceituais e referência fotográfica. Microscópio e vidrarias têm diagramas explicativos; anotações possuem páginas autorais e uma abertura ilustrativa suave.

Os textos grandes permanecem em uma textura estática. Somente uma textura de diagrama de 320 × 380 é atualizada em até 12 Hz, enquanto o cartão está aberto. As transições duram cerca de 200 ms. Fechar interrompe o conteúdo e retorna ao laboratório.

Os cartões novos ficam a 1,65 m, em pé na direção horizontal atual do olhar, com aproximadamente 1,15 × 0,86 m. Isso conserva a largura angular próxima de 38° e evita que o tampo ou os instrumentos cortem os botões. A câmera não é movida para abrir o painel. Os cartões continuam renderizados nos dois olhos.

## Proveniência

- [Painted Wooden Table](https://polyhaven.com/a/painted_wooden_table), Kirill Sannikov, CC0, texturas 2K.
- [Vintage Microscope](https://polyhaven.com/a/vintage_microscope), Luis José Fernández Rodríguez, CC0.
- [Vintage Oil Lamp](https://polyhaven.com/a/vintage_oil_lamp), Monsta3D, CC0.
- [Magnifying Glass 01](https://polyhaven.com/a/magnifying_glass_01), Nazar Borodavka, CC0.
- [Stone 01](https://polyhaven.com/a/stone_01), Dario Barresi e Rico Cilliers, CC0; modelo reduzido para uso móvel.
- [M0011486: Quandrant type electrometer constructed by Pierre Curie](https://wellcomecollection.org/works/r4xh3dyy), Wellcome Collection, registro de 1950, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Redimensionada para web. A fonte descreve o aparelho como construído por Pierre Curie e usado por Marie e Pierre.
- Conteúdo histórico: [Nobel Prize](https://www.nobelprize.org/prizes/uncategorized/marie-and-pierre-curie-and-the-discovery-of-polonium-and-radium/) e [ESPCI](https://www2.espci.fr/presentation/polonium_radium_en.htm).

As anotações, o mostrador, mapas de imperfeições e diagramas são criações educativas próprias; não são transcrições de documentos históricos. A representação de emissões é qualitativa e não ensina manipulação de substâncias.

## Reprodução

```bash
python3 scripts/download-main-table-assets.py
python3 scripts/create-main-table-textures.py
.runtime/blender-4.5.9-linux-x64/blender -b --threads 6 --python scripts/build-curie-scene.py
python3 scripts/optimize-curie-assets.py
npm run build
```

Os recursos da etapa anterior e os documentos autorais precisam estar no cache local conforme o pipeline existente. Blender, Pillow e as ferramentas de preparação não são dependências do navegador. O GLB final continua autocontido e usa texturas WebP.

## Teste físico pendente

As verificações automatizadas não validam giroscópio real, conforto, alinhamento de lentes ou FPS em Android. É necessário testar os novos cartões e o modo equilibrado em Cardboard real, além do custo da opção de alta qualidade no aparelho. Aguardar a avaliação do usuário antes de avançar.

## Verificações desta entrega

`npm test`, `npm run build` e `tests/main-table-review.mjs` passaram. Foram conferidos os oito alvos existentes, os cinco cartões da bancada, navegação de páginas, imagem histórica, animação do ponteiro, fechamento por permanência do olhar e renderização estéreo. Nenhum erro de JavaScript foi registrado. A câmera permaneceu em (0, 0, 0). Capturas em `artifacts/main-table/`; relatório em `validation.json`.

A revisão visual encontrou um halo excessivo provocado por um horário retroativo no teste da animação. O tempo do efeito agora é limitado a zero e o teste usa o relógio atual. As capturas repetidas mantiveram a iluminação estável durante e após os cartões. O vidro usa transparência e reflexos, sem refração óptica completa.
