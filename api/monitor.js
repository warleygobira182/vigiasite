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
      const response = await fetch(site.url, { timeout: 10000 });
      
      // Site CAIU (estava online mas agora está offline)
      if (site.status === 'online' && !response.ok) {
        console.log(`🚨 ALERTA: ${site.url} CAIU!`);
        await enviarAlertaTelegram(site.chatId, 
          `🚨 ALERTA VIGIASITE\n\n` +
          `❌ ${site.url} CAIU!\n` +
          `Status: ${response.status}\n` +
          `⏰ ${new Date().toLocaleString('pt-BR')}`
        );
        site.status = 'offline';
      }
      
      // Site VOLTOU (estava offline mas agora está online)
      else if (site.status === 'offline' && response.ok) {
        console.log(`✅ ${site.url} VOLTOU!`);
        await enviarAlertaTelegram(site.chatId,
          `✅ ALERTA VIGIASITE\n\n` +
          `🟢 ${site.url} VOLTOU ao ar!\n` +
          `⏰ ${new Date().toLocaleString('pt-BR')}`
        );
        site.status = 'online';
      }
      
      // PRIMEIRA VERIFICAÇÃO (define status inicial)
      else if (!site.status) {
        site.status = response.ok ? 'online' : 'offline';
        console.log(`📝 ${site.url} status inicial: ${site.status}`);
        
        await enviarAlertaTelegram(site.chatId,
          `📝 VIGIASITE CONFIGURADO\n\n` +
          `🔧 ${site.url} agora está sendo monitorado!\n` +
          `Status inicial: ${site.status === 'online' ? '🟢 ONLINE' : '🔴 OFFLINE'}\n` +
          `⏰ Verificações a cada 10 minutos`
        );
      }
      
    } catch (error) {
      console.log(`❌ Erro em ${site.url}:`, error.message);
      
      // Se estava online mas agora deu erro (caiu)
      if (site.status === 'online') {
        await enviarAlertaTelegram(site.chatId,
          `🚨 ALERTA VIGIASITE\n\n` +
          `❌ ${site.url} CAIU!\n` +
          `Erro: ${error.message}\n` +
          `⏰ ${new Date().toLocaleString('pt-BR')}`
        );
        site.status = 'offline';
      }
    }
  }
  
  console.log('✅ VERIFICAÇÃO AUTOMÁTICA CONCLUÍDA');
}

// HANDLER PRINCIPAL
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 🔄 CHAMADA AUTOMÁTICA DO CRON JOB (sem body)
  if (req.method === 'GET' && Object.keys(req.body || {}).length === 0) {
    console.log('⏰ CRON JOB ACIONADO');
    await verificarTodosSites();
    return res.json({ 
      automatic: true, 
      sitesMonitorados: sitesClientes.length,
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    const { url, chatId, action } = req.body;

     if (action === 'cron-job') {
    console.log('⏰ GITHUB ACTIONS ACIONADO - Verificando sites...');
    await verificarTodosSites();
    return res.json({ 
      success: true,
      automatic: true, 
      sitesMonitorados: sitesClientes.length,
      message: 'Verificação automática concluída!',
      timestamp: new Date().toISOString()
    });
  }
    
    // ➕ CLIENTE ADICIONANDO SITE PARA MONITORAMENTO AUTOMÁTICO
    if (action === 'add-site' && url && chatId) {
      // Verifica se já existe
      const siteExistente = sitesClientes.find(s => s.url === url && s.chatId === chatId);
      if (siteExistente) {
        return res.json({ success: false, message: 'Site já está sendo monitorado' });
      }
      
      // Adiciona novo site
      const novoSite = { 
        url: url.startsWith('http') ? url : `https://${url}`,
        chatId, 
        status: null,
        dataCadastro: new Date().toISOString()
      };
      
      sitesClientes.push(novoSite);
      console.log(`📝 Novo site adicionado: ${url} para chatId: ${chatId}`);
      
      // Verificação imediata do novo site
      try {
        const response = await fetch(novoSite.url, { timeout: 10000 });
        novoSite.status = response.ok ? 'online' : 'offline';
        
        await enviarAlertaTelegram(chatId,
          novoSite.status === 'online'
            ? `✅ VIGIASITE CONFIGURADO\n\n🟢 ${url} está ONLINE!\nAgora monitorando 24/7 com verificações a cada 10 minutos.`
            : `⚠️ VIGIASITE CONFIGURADO\n\n🔴 ${url} está OFFLINE!\nMonitorando e avisarei quando voltar.`
        );
        
        return res.json({ 
          success: true, 
          status: novoSite.status,
          message: 'Site adicionado para monitoramento automático 24/7!'
        });
      } catch (error) {
        novoSite.status = 'error';
        await enviarAlertaTelegram(chatId, `❌ ${url} adicionado mas está INACESSÍVEL!`);
        return res.json({ success: false, message: 'Site inacessível' });
      }
    }
    
    // 📊 CLIENTE SOLICITANDO STATUS
    if (action === 'status' && chatId) {
      const sitesDoCliente = sitesClientes.filter(s => s.chatId === chatId);
      return res.json({
        success: true,
        sites: sitesDoCliente,
        total: sitesDoCliente.length
      });
    }
  }

  // ℹ️ GET NORMAL - Status do sistema
  res.json({ 
    service: 'VigiaSite - Monitoramento Automático 24/7',
    status: 'online',
    sitesAtivos: sitesClientes.length,
    cronJob: 'Ativo (verificação a cada 10 minutos)',
    message: 'Sistema de monitoramento automático funcionando!',
    timestamp: new Date().toISOString()
  });
};

// 📱 FUNÇÃO TELEGRAM (mantida)
async function enviarAlertaTelegram(chatId, message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log('❌ Token do Telegram não configurado');
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
    return result.ok;
  } catch (error) {
    console.log('❌ Erro Telegram:', error.message);
    return false;
  }
}
