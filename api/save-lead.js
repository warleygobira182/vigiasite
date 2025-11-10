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
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      // Aqui vamos configurar a integração com Google Sheets depois
      // Por enquanto, só registra no console
      console.log('📧 NOVO LEAD:', email, new Date().toISOString());
      
      return res.json({ 
        success: true, 
        message: 'Email salvo com sucesso! Em breve entraremos em contato.',
        email: email
      });
      
    } catch (error) {
      console.log('❌ Erro ao salvar lead:', error);
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  res.status(404).json({ error: 'Not found' });
};
