import fetch from 'node-fetch';

export default async function handler(request, response) {
  // Configura CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method === 'POST') {
    try {
      const { url } = await request.json();
      
      if (!url) {
        return response.status(400).json({ error: 'URL é obrigatória' });
      }

      console.log(`Verificando: ${url}`);
      
      // Verificação simples do site
      const startTime = Date.now();
      const result = await fetch(url, { 
        method: 'HEAD',
        timeout: 10000 
      });
      const responseTime = Date.now() - startTime;

      if (result.ok) {
        return response.json({ 
          status: 'online',
          responseTime: responseTime,
          message: `✅ ${url} está ONLINE (${responseTime}ms)`
        });
      } else {
        return response.json({ 
          status: 'offline', 
          message: `❌ ${url} está OFFLINE - Status: ${result.status}`
        });
      }
    } catch (error) {
      return response.json({ 
        status: 'error',
        message: `❌ Erro ao verificar: ${error.message}`
      });
    }
  }

  // GET - Status do serviço
  return response.json({ 
    service: 'VigiaSite Monitor',
    status: 'online',
    message: 'API funcionando perfeitamente!',
    timestamp: new Date().toISOString()
  });
}
