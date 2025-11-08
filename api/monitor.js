module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { url, testAlert = false } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL é obrigatória' });
      }

      console.log(`🔍 Verificando: ${url}`);
      
      // VERIFICAÇÃO DO SITE
      const startTime = Date.now();
      const response = await fetch(url);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        console.log(`✅ ${url} está ONLINE`);
        
        // SE pediu teste de alerta, envia mesmo estando online
        if (testAlert) {
          await sendTelegramAlert(`✅ TESTE: ${url} está ONLINE - Sistema funcionando!`);
        }
        
        return res.json({ 
          status: 'online',
          responseTime: responseTime,
          message: `✅ ${url} está ONLINE (${responseTime}ms)`
        });
      } else {
        console.log(`❌ ${url} está OFFLINE`);
        // Site OFFLINE - enviar alerta
        await sendTelegramAlert(`🚨 ALERTA VIGIASITE\n❌ ${url} está OFFLINE!\nStatus: ${response.status}`);
        
        return res.json({ 
          status: 'offline', 
          message: `❌ ${url} está OFFLINE - Status: ${response.status}`
        });
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
      // Erro - enviar alerta
      await sendTelegramAlert(`🚨 ALERTA VIGIASITE\n❌ ${url} está INACESSÍVEL!\nErro: ${error.message}`);
      
      return res.json({ 
        status: 'error',
        message: `❌ ${url} está INACESSÍVEL`
      });
    }
  }

  // GET - Status do serviço
  res.json({ 
    service: 'VigiaSite API',
    status: 'online', 
    message: '✅ Sistema funcionando! Para testar alertas, faça POST para /api/monitor com: {"url": "https://exemplo.com", "testAlert": true}',
    timestamp: new Date().toISOString()
  });
};

// Função SIMPLIFICADA para enviar alertas
async function sendTelegramAlert(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  console.log('📤 Enviando alerta para Telegram...');
  console.log('Token:', token ? '✅ Configurado' : '❌ Faltando');
  console.log('Chat ID:', chatId ? '✅ Configurado' : '❌ Faltando');

  if (!token || !chatId) {
    console.log('❌ Variáveis do Telegram não configuradas corretamente');
    return false;
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    const result = await response.json();
    console.log('📨 Resposta do Telegram:', result.ok ? '✅ Sucesso' : '❌ Erro');
    return result.ok;
  } catch (error) {
    console.log('❌ Erro ao enviar para Telegram:', error.message);
    return false;
  }
}
