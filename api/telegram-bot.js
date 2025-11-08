module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { message } = req.body;
    
    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text.toLowerCase();
      
      // Respostas automáticas
      if (text === '/start' || text === '/inicio') {
        await sendTelegramMessage(chatId, 
          `🎉 Bem-vindo ao VigiaSite Bot!\n\n` +
          `Eu vou te alertar quando seus sites ficarem offline.\n` +
          `Use /monitor para começar.`
        );
      }
      else if (text === '/test' || text === '/teste') {
        await sendTelegramMessage(chatId,
          `✅ Bot funcionando perfeitamente!\n` +
          `Chat ID: ${chatId}\n` +
          `Pronto para receber alertas!`
        );
      }
      else {
        await sendTelegramMessage(chatId,
          `🤖 Comandos disponíveis:\n` +
          `/start - Iniciar bot\n` +
          `/test - Testar funcionamento\n` +
          `/monitor - Configurar monitoramento`
        );
      }
    }
  }
  
  res.status(200).json({ ok: true });
};

async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  });
}
