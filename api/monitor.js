// Sistema de monitoramento para Vercel
export default async function handler(req, res) {
  // Permite CORS
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

      // Simula verificação (vamos implementar depois)
      const isOnline = Math.random() > 0.2; // 80% de chance de estar online
      
      if (isOnline) {
        return res.json({ 
          status: 'online',
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
        message: `Erro: ${error.message}`
      });
    }
  }

  // GET request - status do serviço
  return res.json({ 
    service: 'VigiaSite Monitor',
    status: 'online',
    message: 'Sistema de monitoramento funcionando!',
    version: '1.0'
  });
}
