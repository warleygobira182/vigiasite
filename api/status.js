export default function handler(req, res) {
  res.status(200).json({ 
    status: 'online',
    message: 'VigiaSite API funcionando!',
    timestamp: new Date().toISOString()
  });
}
