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
      
      // VERIFICAÇÃO COM TRATAMENTO DE ERRO MELHORADO
      const startTime = Date.now();
      
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, { 
          signal: controller.signal,
          headers: {
            'User-Agent': 'VigiaSite-Monitor/1.0',
            'Accept': '*/*'
          }
        });
        
        clearTimeout(timeout);
        const responseTime = Date.now() - startTime;

        if (response.status >= 200 && response.status < 400) {
          console.log(`✅ ${url} está ONLINE`);
          
          if (testAlert) {
            await sendTelegramAlert(`✅ TESTE: ${url} está ONLINE (${responseTime}ms) - Sistema funcionando!`);
          }
          
          return res.json({ 
            status: 'online',
            responseTime: responseTime,
            message: `✅ ${url} está ONLINE (${responseTime}ms)`
          });
        } else {
          console.log(`❌ ${url} está OFFLINE - Status: ${response.status}`);
          await sendTelegramAlert(`🚨 ALERTA VIGIASITE\n❌ ${url} está OFFLINE!\nStatus: ${response.status}`);
          
          return res.json({ 
            status: 'offline', 
            message: `❌ ${url} está OFFLINE - Status: ${response.status}`
          });
        }
      } catch (fetchError) {
        // Erro de rede - site inacessível
        console.log(`❌ ${url} está INACESSÍVEL:`, fetchError.message);
        await sendTelegramAlert(`🚨 ALERTA VIGIASITE\n❌ ${url} está INACESSÍVEL!\nErro: ${fetchError.message}`);
        
        return res.json({ 
          status: 'error',
          message: `❌ ${url} está INACESSÍVEL - ${fetchError.message}`
        });
      }

    } catch (error) {
      console.log('❌ Erro geral:', error);
      return res.json({ 
        status: 'error',
        message: 'Erro interno do servidor'
      });
    }
  }

  // GET - Status do serviço
  res.json({ 
    service: 'VigiaSite API',
    status: 'online',
    message: '✅ Sistema funcionando!',
    timestamp: new Date().toISOString()
  });
};

// Função para enviar alertas no Telegram
async function sendTelegramAlert(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) {
    console.log('❌ Variáveis do Telegram não configuradas');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    const result = await response.json();
    console.log('📨 Alerta enviado:', result.ok ? '✅' : '❌');
    return result.ok;
  } catch (error) {
    console.log('❌ Erro Telegram:', error.message);
    return false;
  }
}
