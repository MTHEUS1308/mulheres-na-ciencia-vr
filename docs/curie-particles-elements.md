# Marie Curie: partículas e imagens dos elementos

Efeito artístico de radioatividade, não uma representação de radiação visível. O laboratório existente e seus dois pontos de luz foram preservados.

## Partículas

`sites/marie-curie/radioactivity-particles.js` usa um THREE.Points com BufferGeometry, animação de deriva/pulsação no shader, 12 rastros curtos em um LineSegments e dois pequenos halos transparentes. São quatro chamadas de desenho por olho, sem pós-processamento ou novas luzes. As posições são tridimensionais, concentradas nos experimentos e distribuídas pela sala, fora da região imediata da câmera.

Os perfis usam 48, 88 e 128 partículas. Os materiais não escrevem profundidade; respeitam os objetos e ficam abaixo dos painéis. Nenhum componente entra nos alvos de gaze, e seu raycast é desativado. Ao sair de Marie, o gerenciador remove a cena, libera os recursos e chama `stop()`. Nenhuma atualização continua no lobby.

## Imagens e procedência

- Rádio: fotografia de uraninita/pechblenda do Pacific Museum of Earth, espécime S-74-2183, Athabasca, Canadá. **Mineral com urânio, não rádio puro.** A identificação aparece na própria figura e no crédito. [Original e licença CC BY-SA 2.0](https://commons.wikimedia.org/wiki/File:Uraninite_(Pitchblende)_(47975537437).jpg). Recorte e moldura preservam as cores da fotografia.
- Polônio: ilustração científica autoral explicitamente identificada, não fotografia de amostra. Diagrama esquemático sem escala do Po-210, com 84 prótons e 126 nêutrons. Dados: [NIST](https://physics.nist.gov/PhysRefData/Handbook/Tables/poloniumtable1.htm) e [RSC](https://periodic-table.rsc.org/element/84/Polonium). SVG fonte disponível junto ao WebP.

Ambos os WebP têm 1200 × 1500 pixels, cerca de 181 e 113 KiB. Metadados, licenças e alterações estão em `public/assets/marie-curie/media/element-images-sources.json` e `credits.html`. O script `scripts/prepare-curie-element-images.py` prepara fotografia, SVG e manifesto; o WebP do diagrama é uma rasterização desse SVG em canvas, convertida com Pillow. Os arquivos finais são servidos localmente, sem depender dos sites das fontes durante a visita.

Títulos, textos, notas e diagramas dos 13 painéis foram comparados com o ponto de restauração e preservados. Apenas as figuras de duas páginas de polônio e da página de rádio mudaram. A página histórica dos instrumentos permaneceu intacta. O componente compartilhado de ampliação não foi alterado: seleção em 1200 ms, modal persistente, retorno por gaze. Portais permanecem em 3000 ms.

## Verificação e restauração

Ponto anterior: `.runtime/restore-before-curie-particles-20261023-170206.tar.gz`.

- `npm test`: testes de conteúdo/procedência, gaze, modal, portais e gerenciador.
- `npm run build`: produção; mantém o aviso existente de tamanho do bundle Three.js.
- `node tests/curie-particles-review.mjs`: navegador local com CDP na porta 9222. Ampliação/fechamento das três páginas, persistência sem reativação, pixels nos dois olhos, mira sobre imagem, animação, perfis, parada ao sair e três visitas com memória GPU estável. Relatório e capturas em `artifacts/curie-particles/`.
- SHA-256 comparado com a base: os outros ambientes, módulos compartilhados, modelos, iluminação, configurações e demais conteúdos permanecem idênticos.

O túnel ativo durante a revisão foi `https://prix-tiles-slides-comprehensive.trycloudflare.com`; o endereço antigo deixou de resolver. Túneis rápidos podem mudar ao reiniciar. As imagens foram verificadas por HTTPS com HTTP 200 e hashes iguais aos locais; a revisão em navegador móvel emulado também verifica decodificação e leitura em canvas. Isso **não valida um Android físico**, desempenho no aparelho, sensores ou conforto nas lentes Cardboard. Esses testes continuam dependendo do visitante.
