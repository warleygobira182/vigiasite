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

      // SIMULAÇÃO - Vamos implementar a verificação real depois
      const isOnline = Math.random() > 0.3; // 70% de chance de estar online
      
      if (isOnline) {
        return res.json({ 
          status: 'online',
          responseTime: Math.floor(Math.random() * 500) + 100,
          message: `✅ ${url} está ONLINE`
        });
      } else {
        return res.json({ 
          status: 'offline', 
          message: `❌ ${url} está OFFLINE`
        });
      }
    } catch (error) {
      return res.json({ 
        status: 'error',
        message: `❌ Erro ao verificar ${url}`
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
