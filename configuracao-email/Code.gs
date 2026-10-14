/** Descomplica3D Brasil — entrega DEMONSTRATIVA por Gmail com anexos privados do Drive.
 * Publique como aplicativo da Web: executar como EU, acesso QUALQUER PESSOA.
 * O acesso público é protegido por validação de Firebase ID token e limite de pedidos.
 * Não use para pagamentos reais: não existe verificação de transação!
 */
const ARQUIVOS_DRIVE = {
  // IDs dos PRODUTOS do Firestore -> ID do ARQUIVO PRIVADO do Google Drive.
  // 'id-do-produto-no-firebase': 'id-do-arquivo-no-google-drive',
};
const MAX_ARQUIVOS = 10;
const MAX_ENVIOS_POR_DIA = 5;

function doGet() {
  return ContentService.createTextOutput('Entrega digital demonstrativa.');
}

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};
    const token = String(params.token || '');
    const pedidoId = String(params.pedidoId || '');
    if (!/^[\w-]{8,100}$/.test(pedidoId)) throw new Error('Pedido inválido');
    const produtos = JSON.parse(params.arquivos || '[]');
    if (!Array.isArray(produtos) || produtos.length < 1 || produtos.length > MAX_ARQUIVOS) throw new Error('Lista inválida');
    const ids = produtos.map(String);
    if (new Set(ids).size !== ids.length || ids.some(id => !Object.prototype.hasOwnProperty.call(ARQUIVOS_DRIVE, id))) {
      throw new Error('Arquivo não cadastrado no servidor');
    }
    const usuario = validarFirebaseToken_(token);
    if (!usuario.email || !usuario.localId) throw new Error('Usuário sem e-mail');
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      const props = PropertiesService.getScriptProperties();
      const hoje = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyyMMdd');
      const chavePedido = 'pedido:' + usuario.localId + ':' + pedidoId;
      const chaveLimite = 'limite:' + usuario.localId + ':' + hoje;
      if (props.getProperty(chavePedido)) return resposta_('Pedido já recebido.');
      const numero = Number(props.getProperty(chaveLimite) || 0);
      if (numero >= MAX_ENVIOS_POR_DIA) throw new Error('Limite diário de envios de demonstração');
      const blobs = ids.map(id => {
        const blob = DriveApp.getFileById(ARQUIVOS_DRIVE[id]).getBlob();
        if (blob.getBytes().length > 1024 * 1024) throw new Error('Arquivo acima do limite de 1 MB');
        return blob;
      });
      // Gravamos antes de enviar para evitar duplicidade por cliques repetidos.
      props.setProperty(chavePedido, new Date().toISOString());
      props.setProperty(chaveLimite, String(numero + 1));
      try {
        GmailApp.sendEmail(usuario.email, 'Seus arquivos 3D — Descomplica3D Brasil',
          'Olá!\n\nSegue(m) em anexo o(s) arquivo(s) 3D do seu pedido de demonstração.\n' +
          'Esta é uma compra simulada para apresentação do TCC, sem pagamento real.\n\n' +
          'Obrigado!\nEquipe Descomplica3D Brasil', {
            attachments: blobs,
            name: 'Descomplica3D Brasil'
          });
      } catch (err) {
        props.deleteProperty(chavePedido);
        props.setProperty(chaveLimite, String(numero));
        throw err;
      }
    } finally {
      lock.releaseLock();
    }
    return resposta_('E-mail enviado.');
  } catch (err) {
    console.error(err);
    return resposta_('Falha no processamento: ' + String(err.message || err));
  }
}

function validarFirebaseToken_(token) {
  if (!token || token.length > 5000) throw new Error('Faça login');
  const chave = PropertiesService.getScriptProperties().getProperty('FIREBASE_API_KEY');
  if (!chave) throw new Error('FIREBASE_API_KEY não configurada');
  const response = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(chave), {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ idToken: token }),
    muteHttpExceptions: true
  });
  if (response.getResponseCode() !== 200) throw new Error('Login Firebase inválido ou expirado');
  const data = JSON.parse(response.getContentText());
  const usuario = (data.users || [])[0];
  if (!usuario || !usuario.localId || usuario.disabled) throw new Error('Conta inválida');
  return usuario;
}

function resposta_(mensagem) {
  return ContentService.createTextOutput(mensagem).setMimeType(ContentService.MimeType.TEXT);
}
