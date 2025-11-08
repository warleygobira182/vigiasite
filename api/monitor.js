module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    // Simula monitoramento (implementaremos depois)
    return res.json({ 
      status: 'online', 
      message: '✅ Site está ONLINE (simulação)',
      timestamp: new Date().toISOString()
    });
  }

  // GET
  res.json({ 
    service: 'VigiaSite API',
    status: 'online',
    message: 'API funcionando!',
    endpoint: '/api/monitor'
  });
};
