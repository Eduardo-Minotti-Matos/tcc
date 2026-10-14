# Envio de arquivo 3D em anexo — demonstração do TCC

Solução opcional que mantém **GitHub Pages + Firebase Spark**. Utiliza **Google Apps Script, Gmail e Google Drive** na mesma conta Google. Não exige Cloud Functions nem servidor pago.

## Configurar

1. Entre em https://drive.google.com/ com o Gmail que enviará os arquivos. Faça upload dos `.stl`, `.obj` etc. Mantenha-os **privados**. Copie o ID de cada arquivo na URL do Drive, `https://drive.google.com/file/d/ID_AQUI/view`.
2. No `Code.gs`, preencha `ARQUIVOS_DRIVE` com o **ID real de cada produto em `products` no Firestore**, associando ao ID do respectivo arquivo no Google Drive. Exemplo: `'arquivo-001': '1abcDEF...';` **Na estrutura JavaScript, use vírgula e não ponto e vírgula** entre os pares.
3. Acesse https://script.google.com/, crie um projeto e cole todo o conteúdo de `Code.gs`.
4. Em **Configurações do projeto → Propriedades do script**, adicione `FIREBASE_API_KEY` com a API key pública do seu Firebase (está no `script.js` do site). Não é senha de usuário.
5. Em **Implantar → Nova implantação → Aplicativo da Web**, escolha **Executar como: Eu**, **Quem tem acesso: Qualquer pessoa**. Autorize Gmail, Drive, acesso externo e propriedades. Copie a URL terminada em `/exec`.
6. No `carrinho.html`, preencha `const EMAIL_SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';` com sua URL. Envie o site atualizado para o GitHub Pages.
7. Entre no site com sua **conta Firebase**, adicione um arquivo digital cadastrado na etapa 2 e faça uma compra *simulada* de teste. Confira entrada e spam. Se não chegar, abra o Apps Script → **Execuções** e confira o erro. Você pode inspecionar os registros na aba de execução.

## Importante

- **Sem arquivos reais anexados ao ZIP:** você precisa subir seus modelos 3D e mapear os IDs. Sem mapear, o script não envia anexos.
- Para enviar arquivos digitais, o cliente precisa estar **logado no Firebase**. O e-mail de destino vem **do login validado no servidor**, não de um campo alterável na página.
- O GitHub Pages envia a solicitação via formulário para evitar CORS. Por segurança do navegador, o site **não consegue saber se o Gmail realmente enviou**. A página apenas informa que a solicitação foi realizada. Confira Apps Script → Execuções; não trate o aviso como confirmação de entrega.
- Apps Script roda sob as permissões da conta que o publicou. **Não coloque senha do Gmail no GitHub**. A API key do Firebase é pública; não publique tokens do usuário, código de Drive nem credenciais de serviço.
- O script impõe limite de até **5 solicitações por usuário por dia**, até **10 arquivos distintos por solicitação** e máximo de **1 MB por anexo**. Google aplica também cotas próprias de Apps Script/Gmail, que podem mudar.
- **ATENÇÃO:** como o pagamento do TCC é simulado, qualquer usuário com login pode acionar uma compra demonstrativa e obter arquivos listados no servidor. Para vendas **reais**, será preciso um backend que valide a confirmação de pagamento pelo provedor e associe o pedido ao comprador, antes de liberar os anexos. Não disponibilize modelos comerciais valiosos nesta demonstração pública.
- O Apps Script não verifica compra real, estoque, nem protege os próprios modelos contra encaminhamento pelos compradores.
- Pix, boleto e cartão permanecem **simulações**. Nunca digite dados reais de cartão na demonstração.
