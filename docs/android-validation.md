# Validação no Android real

Os ambientes históricos não foram alterados nesta preparação. Os sensores continuam **pendentes de validação física pelo usuário**. Eventos sintéticos não comprovam rastreamento no aparelho nem desempenho nos óculos.

## Servidores desta sessão

- Computador: http://localhost:5173/sites/marie-curie/
- Rede local, somente toque/interface: http://192.168.1.109:5173/sites/marie-curie/
- HTTPS por Wi-Fi, após confiar no certificado: https://192.168.1.109:5174/sites/marie-curie/
- Diagnóstico: acrescente `/dev-tools/` à origem escolhida.

O IP pode mudar ao trocar de rede. HTTP por IP local não libera sensores de orientação.

## Opção recomendada: USB com localhost

O ADB já está instalado no computador. Na última verificação, não havia aparelho conectado.

1. No Android, habilite Opções do desenvolvedor (em muitos modelos: Configurações → Sobre o telefone → tocar sete vezes em Número da versão). Ative Depuração USB.
2. Conecte por um cabo USB de dados. Desbloqueie o celular e autorize a depuração deste computador.
3. No terminal, na pasta deste projeto, execute:

```bash
bash scripts/android-usb.sh
```

O script verifica o aparelho e configura somente `adb reverse tcp:5173 tcp:5173`. Se houver mais de um, informe o serial como argumento. A mensagem `unauthorized` exige autorização na tela do Android. A mensagem `no permissions` exige configuração de acesso USB/udev no computador, não uma mudança no laboratório.

4. No Chrome **do celular**, abra http://localhost:5173/dev-tools/ e confirme **Contexto seguro: Sim**.
5. Abra http://localhost:5173/sites/marie-curie/ no mesmo celular.

Mantenha o cabo conectado. Este método não precisa instalar certificados; localhost é um contexto potencialmente confiável. Para remover só o encaminhamento depois: `adb reverse --remove tcp:5173` (com `-s SERIAL` se necessário).

Referências: [Chrome: encaminhamento por USB](https://developer.chrome.com/docs/devtools/remote-debugging/local-server/) e [W3C: contextos seguros](https://www.w3.org/TR/secure-contexts/).

## Alternativa sem cabo: HTTPS no Wi-Fi

Uma CA exclusiva deste projeto e um certificado de servidor já foram gerados em `.runtime/https/`, com validade de 30 dias. Não foi instalada confiança automaticamente em nenhum dispositivo. As chaves privadas têm permissão 600 e o diretório, 700. O servidor bloqueia acesso HTTP direto a `.runtime/`; só o certificado público da CA tem uma rota explícita de download.

Para repetir a preparação sem sobrescrever certificados existentes:

```bash
export PATH="$PWD/.runtime/node-v22.23.4-linux-x64/bin:$PATH"
npm run setup:https -- 192.168.1.109
npm run dev:https
```

O HTTPS já está ativo nesta sessão. A ferramenta verifica a CA, o IP do certificado e sua validade. Se o IP mudar ou o certificado expirar, ela informa o problema e não substitui arquivos automaticamente.

1. Coloque computador e Android na mesma rede Wi-Fi, com comunicação entre dispositivos permitida.
2. Transfira **somente** `.runtime/https/ca.crt` ao celular, preferencialmente por USB. Também é possível baixar em http://192.168.1.109:5173/__dev/ca.crt; confira sua impressão digital no computador antes de confiar. Nunca transfira `ca-key.pem` ou `key.pem`.
3. No Android, procure **Instalar certificado → Certificado de CA** nas configurações de Segurança / Criptografia e credenciais. Os nomes variam conforme o fabricante. Não escolha certificado de Wi-Fi ou VPN. Se o aparelho for gerenciado e bloquear CAs de usuário, use a alternativa USB/localhost.
4. Confira a CA denominada **Museu VR - CA local de desenvolvimento**. Essa instalação concede confiança a certificados assinados por essa CA; mantenha a chave privada protegida e remova apenas essa CA após concluir o teste.
5. Abra https://192.168.1.109:5174/dev-tools/. Não prossiga ignorando alerta TLS: a página deve abrir sem erro e indicar **Contexto seguro: Sim**. Se o Chrome não confiar na CA, prefira USB em vez de desativar segurança.
6. Abra https://192.168.1.109:5174/sites/marie-curie/.

Impressão digital SHA-256 da CA criada nesta sessão:

```text
8C:3A:2F:FC:15:0D:DC:84:E0:A6:43:95:82:03:44:F4:4A:FE:3B:0F:2A:A4:5D:18:45:80:A0:2A:26:1C:BB:A7
```

Para conferir novamente no computador:

```bash
openssl x509 -in .runtime/https/ca.crt -noout -fingerprint -sha256
```

Depois do teste, remova especificamente essa CA em Credenciais de confiança / Usuário. Não use “Limpar todas as credenciais”. Certificados e chaves não entram no Git nem no build.

## Testar giroscópio / orientação

1. Na página `/dev-tools/`, toque em **Iniciar teste**. Autorize sensores de movimento se o navegador solicitar. Em versões sem diálogo, os dados podem ser liberados diretamente; ausência de diálogo não é uma falha por si só.
2. Com o celular na mão e sem arrastar a tela, gire lentamente para esquerda e direita, depois incline para cima e para baixo.
3. Os contadores devem continuar aumentando, a idade do último evento deve ficar próxima de zero e alpha/beta/gamma devem variar com os movimentos.
4. Se a velocidade angular estiver disponível, ela deve responder ao giro e ficar próxima de zero em repouso. Eventos fabricados por `dispatchEvent` são ignorados pelo diagnóstico. Eventos genuínos ainda não dispensam a verificação física e visual.
5. No laboratório, entre e toque em **Ativar sensores**. Confira se olhar para cada direção funciona sem arrastar e sem mudar a posição central. “Sensores ativos” significa apenas que o navegador entregou dados, não uma aprovação do giroscópio.
6. Se falhar: confira o contexto seguro, a permissão **Sensores de movimento** no Chrome, se o aparelho tem sensores adequados e se a aba está em primeiro plano. Registre a mensagem exibida.

A API de orientação pode combinar acelerômetro, magnetômetro e giroscópio. Ela não certifica um giroscópio físico isoladamente. Se necessário, confira a especificação do modelo do celular.

## Testar Cardboard e seleção pelo olhar

1. Antes de colocar nos óculos, gire o aparelho para horizontal e toque em **Óculos Cardboard**. O app pede acesso aos sensores e tenta entrar em tela cheia/bloquear horizontal; essas duas últimas funções dependem do navegador.
2. Devem aparecer duas perspectivas lado a lado, separadas ao centro. Se houver timeout sem dados, o app sai do estéreo e informa a falha. Não confunda duas imagens com confirmação de rastreamento.
3. Confirme que girar a cabeça altera a visão horizontal e vertical. Olhando para a frente, use **Recentralizar**.
4. A seleção pelo olhar já fica ativa depois de **Entrar no laboratório**. Posicione o círculo central sobre uma placa de estação (Medição, Polônio etc.) e mantenha por **2 segundos**. O anel deve preencher e abrir o painel. Desviar antes do fim deve cancelar.
5. Olhe para **Fechar / interromper** para fechar. Em Configurações, fora dos óculos, é possível ajustar a permanência para 1,5 / 2 / 3 segundos.
6. Olhe para **Sair dos óculos** para voltar à tela única. Fora dos óculos, há também o botão no canto superior.

A seleção funciona mirando nas placas, não em qualquer parte de um objeto decorativo. A versão atual não faz correção óptica específica de lentes nem ajuste de IPD. Ainda precisamos do retorno sobre legibilidade, alinhamento e conforto no seu Cardboard/VR Box.

## Retorno esperado antes da aprovação

Informe modelo do Android, versão do Chrome, método de acesso (USB/HTTPS), se os números variaram, se a visão acompanhou o movimento, se a tela dividida ficou alinhada e se o painel abriu após dois segundos. Não avançar os ambientes antes desse teste e da aprovação do usuário.

## Lobby e navegação contínua

A entrada atual é a raiz `/` da mesma origem segura já configurada. Abra o lobby, gire o Android para paisagem e toque em **Ativar VR Cardboard** uma vez. Autorize os sensores se solicitado. Escolha cada portal pelo olhar por 3 s e use **⌂ Voltar ao lobby** após fechar os painéis. A qualidade começa em Alta; **Qualidade / VR** permite reduzi-la sem toque.

Teste no aparelho a sequência completa: Lobby → Marie → Lobby → Hedy → Lobby → Katherine → Lobby. Confirme rastreamento da cabeça e estéreo ao longo de todas as trocas. O aplicativo mantém as instâncias de câmera, renderer, sensores e StereoEffect; não usa carregamento de página para navegar. A validação automatizada desktop não comprova o sensor físico. Eventos do sistema/navegador ainda podem encerrar tela cheia e exigir novo gesto do usuário para recuperá-la.
