# Marie Curie · revisão visual

## O que foi substituído

A sala anterior era um blockout de caixas, materiais Lambert uniformes e frascos feitos de esferas/cilindros. A revisão carrega um GLB real, com modelos CC0, materiais PBR, mapas fotográficos e uma composição preparada offline no Blender. A cena anterior foi preservada em `legacy/curie-blockout.js`.

Foram usados microscópio de latão, bancada de madeira, banquetas torneadas, estante, volumes encadernados, lamparina, recipientes e rochas. O instrumento de medição, as vidrarias e os documentos educativos são objetos autorais. Os papéis têm conteúdo ilustrado próprio; não são fac-símiles nem instruções experimentais. A indicação de reconstrução artística continua na abertura.

O ambiente tem aberturas reais nas paredes para as janelas, caixilhos profundos, reboco com normal/roughness, vigas e rodapés. Duas bancadas de proporções domésticas substituem a mesa única excessivamente alongada. Os instrumentos principais ficam mais próximos da posição central. Documentos, livros e objetos não estão organizados como uma fileira perfeitamente regular de elementos idênticos.

## Iluminação pré-calculada real

Blender 4.5.9 LTS / Cycles. Foi calculada a resposta difusa branca à luz direta e indireta (24 amostras), em UVs secundárias não sobrepostas, num atlas de 2048 × 2048. As luzes ficam nos vãos das janelas e junto à lamparina, com preenchimento fraco. O GLB preserva UV0 para PBR e UV1 para `lightMap`.

O arquivo `irradiance.webp` é um bake de iluminação, não uma textura pintada de sombras. Um panorama HDR de reflexão de 1024 × 512 é renderizado a partir da própria sala com seus materiais. No Three.js ele passa por PMREM. Não há luz ou sombra dinâmica custosa na sala. O ponteiro educativo segue como o único objeto de animação ativada.

## Escala da interface VR

| Elemento | Anterior | Agora |
| --- | --- | --- |
| Corpo do painel | 3,3 × 1,9 m a 2,7 m | 1,25 × 0,86 m a 1,9 m |
| Opções do menu | 2,5 × 0,4 m a 2,8 m | 0,95 × 0,17 m a 2,1 m |
| Placas das estações | 1,8 × 0,38 m | 0,72 × 0,15 m |
| Atalho para cientistas | 2,6 × 0,45 m | 0,86 × 0,16 m |

O painel passa de aproximadamente 63° para 36° de largura angular. A tipografia foi aumentada dentro da textura para compensar a redução física. Recentralizar/sair em 3D ficam visíveis apenas no estéreo; no modo normal continuam na barra HTML. Os alvos continuam respondendo ao mesmo raycast, permanência configurável, cancelamento e clique/toque.

Os arquivos de câmera fixa, controle de orientação e Cardboard não foram alterados nesta revisão. Apenas a espera pelo carregamento assíncrono do ambiente foi acrescentada ao app, junto aos ajustes de escala/posição dos widgets.

## Recursos e licença

Todos os recursos de terceiros são do [Poly Haven](https://polyhaven.com/) e licenciados como [CC0](https://polyhaven.com/license). IDs, links e resoluções estão em `visual-assets.json`; o cache de download guarda manifestos e checksums. As versões de cache incluem alguns recursos experimentados e não usados na exportação final.

As referências são recursos para uma composição artística, não objetos comprovadamente pertencentes aos Curie. Não se afirma que a arquitetura é uma reconstrução autenticada do laboratório original. As texturas fotográficas também não são fotografias do laboratório histórico.

## Reproduzir a preparação

O navegador não precisa de Blender, Python ou Pillow. O build Vite usa os arquivos prontos em `public/assets/marie-curie/`.

Para reconstruir os recursos, com Blender 4.5 e Pillow disponíveis:

```bash
python3 scripts/download-visual-assets.py
python3 scripts/create-curie-documents.py
.runtime/blender-4.5.9-linux-x64/blender -b --threads 6 --python scripts/build-curie-scene.py
python3 scripts/optimize-curie-assets.py
npm run build
```

O GLB bruto e a cena autoral ficam em `.runtime/`. As imagens PBR são convertidas para WebP num GLB com `EXT_texture_webp`; o atlas de luz usa WebP sem perdas. Os originais são preservados. Downloads verificam MD5 contra os manifestos oficiais; o Blender foi verificado com o SHA-256 oficial.

## Limites de validação

A revisão é um avanço de modelos, materiais, composição e bake; não certifica fotorrealismo documental. A avaliação visual final cabe ao usuário. Performance, leitura e conforto dentro de Cardboard precisam de novo teste no Android real. Os testes de orientação simulada não validam os sensores físicos. Hedy e Katherine não tiveram seus ambientes desenvolvidos.

A textura de irradiância é normalizada antes de salvar em 8 bits; o valor `lightmapScale` nos metadados recompõe a intensidade no shader. Isso preserva o contraste das sombras e evita saturar grandes áreas do atlas. Os rótulos comerciais dos recipientes CC0 são substituídos por uma ilustração educativa autoral.
