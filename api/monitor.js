// No início do arquivo, adicione:
let sitesClientes = [];

// Função de verificação automática
async function verificarSitesAutomaticamente() {
  console.log('🤖 VERIFICAÇÃO AUTOMÁTICA INICIADA');
  
  for (const site of sitesClientes) {
    try {
      const response = await fetch(site.url);
      
      if (site.status === 'online' && !response.ok) {
        // SITE CAIU!
        await enviarAlertaTelegram(site.chatId, `🚨 ALERTA: ${site.url} CAIU!`);
        site.status = 'offline';
      }
      
      if (site.status === 'offline' && response.ok) {
        // SITE VOLTOU!
        await enviarAlertaTelegram(site.chatId, `✅ ${site.url} VOLTOU!`);
        site.status = 'online';
      }
      
      // Primeira verificação
      if (!site.status) {
        site.status = response.ok ? 'online' : 'offline';
      }
      
    } catch (error) {
      console.log(`Erro em ${site.url}:`, error.message);
    }
  }
}

// No handler, adicione no início:
module.exports = async (req, res) => {
  // Se for chamada automática do Cron (sem body)
  if (req.method === 'GET' && !req.body) {
    await verificarSitesAutomaticamente();
    return res.json({ automatic: true, checked: sitesClientes.length });
  }
  
  // ... resto do código atual
};
