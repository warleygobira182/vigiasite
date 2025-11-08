const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL é obrigatória' });
      }

      // VERIFICAÇÃO REAL DO SITE
      const startTime = Date.now();
      const response = await fetch(url);
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
        status: 'error',
        message: `❌ Erro ao verificar ${url}: ${error.message}`
      });
    }
  }

  // GET - Status do serviço
  res.json({ 
    service: 'VigiaSite API',
    status: 'online',
    message: 'API funcionando!',
    endpoint: '/api/monitor'
  });
};
