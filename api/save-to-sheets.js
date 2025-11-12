const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { chatId, url, status, timestamp } = req.body;
      
      if (!chatId || !url || !status) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }

      // 🔐 CONFIGURAÇÃO DO GOOGLE SHEETS
      const doc = new GoogleSpreadsheet('1w1IRvajcHU3Z141mGCi7TD6qkbdcX5pIDa9b5EF0e50');
      
      // Autenticação com Service Account
      await doc.useServiceAccountAuth({
        client_email: 'vigiasite-sheets@vigiasite.iam.gserviceaccount.com',
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      
      await doc.loadInfo();
      
      // Pega a primeira planilha
      const sheet = doc.sheetsByIndex[0];
      
      // Verifica se as colunas existem, se não, cria
      await sheet.setHeaderRow(['Data', 'ChatID', 'Site', 'Status', 'Vencimento']);
      
      // Adiciona nova linha
      const novaData = timestamp ? new Date(timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
      const vencimento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleString('pt-BR');
      
      await sheet.addRow({
        'Data': novaData,
        'ChatID': chatId,
        'Site': url,
        'Status': status,
        'Vencimento': vencimento
      });
      
      console.log('✅ Dados salvos no Google Sheets:', { chatId, url, status });
      return res.json({ success: true, message: 'Salvo na planilha!' });
      
    } catch (error) {
      console.log('❌ Erro ao salvar no Google Sheets:', error.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao salvar na planilha',
        details: error.message 
      });
    }
  }

  res.status(404).json({ error: 'Not found' });
};
