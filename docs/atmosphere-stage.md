# Marie Curie — proximidade, figuras e atmosfera

Revisão de 23/10/2026. Restauração anterior às alterações: `.runtime/restore-before-atmosphere-20261023.tar.gz`. Nenhum arquivo foi excluído. O build preserva arquivos anteriores em `dist/`.

## Disposição

A câmera permanece em `(0, 0, 0)`. As mesas das janelas e da parede direita passaram de x = −3,85/+3,80 m para −2,25/+2,25 m, com centro longitudinal z = 0,35 m. A borda interna fica a aproximadamente 1,825 m do centro. São coordenadas do cenário, não uma certificação de conforto: este depende do teste real com as lentes.

O caderno e suas folhas acompanham a mesa esquerda; a amostra de mineral acompanha a direita. O banco lateral foi reposicionado fora da área central. Uma lamparina de época na mesa direita dá uma origem visual à iluminação quente local. A mesa principal conserva sua posição. Os alvos e suas placas acompanham os objetos.

## Painéis

As oito estações agora têm apresentações com título, texto breve e imagem. Seis ilustrações pictóricas coloridas formam uma série: eletrômetro, microscópio, vidrarias, registros, mineral e medalhas. Cobre, azul, âmbar e bordô convivem com fundos escuros texturizados. Foram geradas por IA para o museu, identificadas como interpretações educativas e não como fotografias/documentos originais.

Um único atlas WebP de aproximadamente 329 KB é compartilhado pelas apresentações, com recorte feito no canvas. O PNG original foi preservado. As animações pequenas explicam leitura variável, foco, reflexos, registro e emissões conceituais; não representam valores experimentais. Somente o canvas pequeno da animação é atualizado em até 12 Hz. A fotografia documental da Wellcome continua disponível em página separada, identificada como fotografia de 1950 e CC BY 4.0.

## Iluminação

A irradiância direta/indireta e o panorama de reflexos foram recalculados no Cycles com a nova disposição. A potência das duas fontes de janela caiu de 65/35 para 18/10 W no modelo de iluminação; a força ambiente caiu de 0,025 para 0,008. O plano externo tem albedo azul escuro e emissão 0,025 em lugar de 0,7. Portanto as janelas não dependem de um retângulo branco luminoso.

A luz fria difusa das janelas é complementada pelo calor localizado das lamparinas. Dois pontos fixos fracos, sem sombras dinâmicas, dão resposta especular aos metais junto à janela e à lamparina principal. O restante da luz e das sombras vem do bake. Não há animação de luz nem cintilação.

## Preservação

Os módulos de câmera fixa, orientação por sensores e Cardboard permanecem idênticos ao estado anterior. Seleção pelo olhar, navegação, recentralização e controles móveis continuam no fluxo existente. Hedy e Katherine permanecem páginas de estrutura, sem novos ambientes. Sensores, conforto, alinhamento das lentes e desempenho em Android continuam pendentes de teste físico do usuário.
