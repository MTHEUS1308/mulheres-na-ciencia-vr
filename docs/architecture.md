# Arquitetura · registro das etapas anteriores

**Arquitetura atual:** [lobby e sessão contínua](lobby-session.md). As descrições abaixo registram etapas anteriores, com entradas e tempos de gaze que foram substituídos.

## Decisão de renderização

Uma única versão de Three.js e um WebGLRenderer por aplicação. A-Frame não será integrado nesta etapa: adicionar outro ciclo de renderização ou controles de câmera não ajuda o protótipo. O addon StereoEffect é distribuído com a própria versão instalada do Three.js. Nenhuma biblioteca de sensores descontinuada foi adicionada.

O monorepositório npm tem três workspaces com HTML e JS próprios e módulos ES compartilhados. Vite usa entradas multipágina. As páginas de Hedy e Katherine têm estilos distintos e navegação, sem laboratórios 3D completos. Marie é importada de forma assíncrona. Existe carregamento e tratamento de falhas de WebGL/importação.

## Câmera e Cardboard

A câmera central fica em (0,0,0); orientação por Euler YXZ no mouse/toque e quaternion nos sensores. A transformação considera alpha/beta/gamma, correção do eixo da câmera e rotação da tela. Recentrar redefine o norte relativo sem forçar o visitante a nivelar artificialmente a cabeça. Translação do dispositivo não é lida.

StereoEffect gera projeções distintas para os dois olhos (IPD fixo de 64 mm, foco de 3 m). Cursor e painéis estão no scene graph, não em HTML duplicado. Fullscreen e landscape lock são tentados e tratados como opcionais. A saída tem um botão HTML de emergência para uso fora dos óculos, além de um botão 3D selecionável pelo olhar.

A permissão de orientação é solicitada no gesto de usuário; há validação de contexto seguro, API ausente, recusa e timeout de dados. O modo estéreo é encerrado caso não cheguem dados dos sensores após a entrada. Mouse e toque seguem disponíveis. Não se afirma compatibilidade com aparelhos sem giroscópio.

WebXR nativo não é oferecido nesta etapa. Basic Cardboard/VR Box frequentemente não expõem uma sessão immersive-vr. Prioriza-se testar o fallback explícito. Uma implementação futura de WebXR deverá ignorar translação da pose sem duplicar a separação dos olhos e passar pelo mesmo ciclo de aprovação e teste físico.

## Interações

Raycaster no centro da visão, permanência configurável e cancelamento ao desviar. A mesma placa dispara uma vez por permanência. Painéis e menus são modais, bloqueando objetos atrás. Clique/toque fora do estéreo usam coordenadas normalizadas da tela. Painéis são posicionados no espaço à frente do visitante e permanecem fixos enquanto ele olha; fechar também interrompe o ponteiro. A animação dura no máximo nove segundos e só é ativada pela estação de medição.

O menu 3D confirma a mudança de site e escurece a página antes de navegar. Carregamentos de página podem encerrar fullscreen e permissões. O visitante deve reativar os óculos na próxima página quando houver um laboratório disponível.

## Desempenho e conteúdo visual atual

Marie Curie agora carrega um GLB PBR assíncrono com recursos CC0 e elementos autorais. A iluminação direta/indireta foi calculada offline no Cycles, em UV1, com textura de irradiância normalizada e fator de reconstrução registrado nos metadados. UV0 conserva os materiais fotográficos, normais e rugosidade. Um HDR renderizado na própria sala é filtrado por PMREM para reflexos. Não há sombras dinâmicas no cenário.

O pixel ratio continua limitado a 1,5 por padrão e configurável. As texturas PBR usam WebP dentro do GLB. O modelo bruto e o Blender ficam apenas em `.runtime/`, sem dependência dessas ferramentas no navegador. O ponteiro continua leve e ativado por interação.

Os painéis foram reduzidos para 1,25 m de largura a 1,9 m de distância; os itens de menu têm 0,95 m de largura a 2,1 m. O raycast e os módulos de sensores/estéreo não mudaram. A câmera continua em (0,0,0).

A proveniência, pipeline e limites estão em [visual-reconstruction.md](visual-reconstruction.md) e [visual-assets.json](visual-assets.json). A geometria é uma composição histórica artística; não uma reprodução autenticada. Modelos e texturas aumentam carga e memória em relação ao blockout, portanto desempenho e conforto precisam ser aferidos no Android real.

Narrações e sons ainda não existem: a interface informa essa ausência e usa texto. Nenhum dos outros dois laboratórios foi aprofundado.
