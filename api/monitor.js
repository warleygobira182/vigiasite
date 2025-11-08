module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { url, chatId } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL é obrigatória' });
      }

      // VERIFICAÇÃO REAL DO SITE (usando fetch nativo da Vercel)
      const startTime = Date.now();
      const response = await fetch(url);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        // Site ONLINE
        return res.json({ 
          status: 'online',
          responseTime: responseTime,
          message: `✅ ${url} está ONLINE (${responseTime}ms)`
        });
      } else {
        // Site OFFLINE - Enviar alerta para Telegram
        if (chatId) {
          await sendTelegramAlert(chatId, `🚨 ALERTA: ${url} está OFFLINE!`);
        }
        
        return res.json({ 
          status: 'offline', 
          message: `❌ ${url} está OFFLINE - Status: ${response.status}`
        });
      }
    } catch (error) {
      // Erro na verificação - Site OFFLINE
      const { chatId } = req.body;
      if (chatId) {
        await sendTelegramAlert(chatId, `🚨 ALERTA: ${url} está INACESSÍVEL!`);
      }
      
      return res.json({ 
        status: 'error',
        message: `❌ ${url} está INACESSÍVEL - Erro: ${error.message}`
      });
    }
  }

  // GET - Status do serviço
  res.json({ 
    service: 'VigiaSite API',
    status: 'online',
    message: 'API funcionando perfeitamente!',
    version: '1.0',
    timestamp: new Date().toISOString()
  });
};

// Função para enviar alertas no Telegram
async function sendTelegramAlert(chatId, message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.log('Token do Telegram não configurado');
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
  } catch (error) {
    console.log('Erro ao enviar alerta para Telegram:', error);
  }
}
