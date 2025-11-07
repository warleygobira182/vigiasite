// Sistema de monitoramento do VigiaSite
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Configura CORS para permitir requisições
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

      // Verifica se o site está online
      const startTime = Date.now();
      const response = await fetch(url, { 
        method: 'HEAD',
        timeout: 10000 
      });
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return res.json({ 
          status: 'online',
          responseTime: responseTime,
          message: `✅ ${url} está ONLINE (${responseTime}ms)`
        });
      } else {
        return res.json({ 
          status: 'offline', 
          message: `❌ ${url} está OFFLINE - Status: ${response.status}`
        });
      }
    } catch (error) {
      return res.json({ 
        status: 'offline',
        message: `❌ ${url} está OFFLINE - Erro: ${error.message}`
      });
    }
  }

  // GET request - retorna status do serviço
  return res.json({ 
    service: 'VigiaSite Monitor',
    status: 'online',
    message: 'Sistema de monitoramento funcionando!'
  });
};
