// BANCO DE DADOS SIMPLES (em produção usaríamos um banco real)
let sitesClientes = [];

// FUNÇÃO QUE VERIFICA TODOS OS SITES AUTOMATICAMENTE
async function verificarTodosSites() {
  console.log('🤖 VERIFICAÇÃO AUTOMÁTICA INICIADA -', new Date().toISOString());
  
  if (sitesClientes.length === 0) {
    console.log('📭 Nenhum site para monitorar');
    return;
  }

  for (const site of sitesClientes) {
    try {
      console.log(`🔍 Verificando: ${site.url}`);
      const response = await fetch(site.url);
      
      // Site CAIU (estava online mas agora está offline)
      if (site.status === 'online' && !response.ok) {
        console.log(`🚨 ALERTA: ${site.url} CAIU!`);
        await enviarAlertaTelegram(site.chatId, 
          `🚨 ALERTA VIGIASITE\n\n❌ ${site.url} CAIU!\nStatus: ${response.status}`
        );
        site.status = 'offline';
      }
      
      // Site VOLTOU (estava offline mas agora está online)  
      else if (site.status === 'offline' && response.ok) {
        console.log(`✅ ${site.url} VOLTOU!`);
        await enviarAlertaTelegram(site.chatId,
          `✅ ALERTA VIGIASITE\n\n🟢 ${site.url} VOLTOU ao ar!`
        );
        site.status = 'online';
      }
      
      // PRIMEIRA VERIFICAÇÃO
      else if (!site.status) {
        site.status = response.ok ? 'online' : 'offline';
        console.log(`📝 ${site.url} status inicial: ${site.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro em ${site.url}:`, error.message);
      
      // Se estava online mas agora deu erro
      if (site.status === 'online') {
        await enviarAlertaTelegram(site.chatId,
          `🚨 ALERTA VIGIASITE\n\n❌ ${site.url} CAIU!\nErro: ${error.message}`
        );
        site.status = 'offline';
      }
    }
  }
}

// HANDLER PRINCIPAL
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // CHAMADA AUTOMÁTICA DO CRON JOB
  if (req.method === 'GET' && Object.keys(req.body || {}).length === 0) {
    console.log('⏰ CRON JOB ACIONADO');
    await verificarTodosSites();
    return res.json({ 
      automatic: true, 
      sitesMonitorados: sitesClientes.length
    });
  }

  if (req.method === 'POST') {
    const { url, chatId, action } = req.body;
    
    // CLIENTE ADICIONANDO SITE
    if (action === 'add-site' && url && chatId) {
      const siteExistente = sitesClientes.find(s => s.url === url && s.chatId === chatId);
      if (siteExistente) {
        return res.json({ success: false, message: 'Site já está sendo monitorado' });
      }
      
      const novoSite = { 
        url: url.startsWith('http') ? url : `https://${url}`,
        chatId, 
        status: null
      };
      
      sitesClientes.push(novoSite);
      console.log(`📝 Novo site: ${url} para ${chatId}`);
      
      // Verificação imediata
      try {
        const response = await fetch(novoSite.url);
        novoSite.status = response.ok ? 'online' : 'offline';
        
        await enviarAlertaTelegram(chatId,
          novoSite.status === 'online'
            ? `✅ ${url} adicionado e está ONLINE! Monitorando 24/7.`
            : `⚠️ ${url} adicionado mas está OFFLINE! Monitorando.`
        );
        
        return res.json({ 
          success: true, 
          status: novoSite.status,
          message: 'Site em monitoramento automático 24/7!'
        });
      } catch (error) {
        await enviarAlertaTelegram(chatId, `❌ ${url} adicionado mas INACESSÍVEL!`);
        return res.json({ success: false, message: 'Site inacessível' });
      }
    }
  }

  // GET NORMAL - Status do sistema
  res.json({ 
    service: 'VigiaSite - Monitoramento Automático 24/7 - VERSÃO 2',
    status: 'online',
    sitesAtivos: sitesClientes.length,
    cronJob: 'Ativo (verificação a cada 10 minutos)',
    message: 'Sistema de monitoramento automático funcionando!',
    timestamp: new Date().toISOString()
  });
};

// FUNÇÃO TELEGRAM
async function enviarAlertaTelegram(chatId, message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

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
    return true;
  } catch (error) {
    console.log('❌ Erro Telegram:', error.message);
    return false;
  }
}
