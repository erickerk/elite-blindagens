/**
 * Health Check Endpoint
 * Verifica se a API está funcionando e se as variáveis de ambiente estão configuradas
 */

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder OPTIONS para CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verificar variáveis de ambiente
  const envCheck = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV || 'not set'
  };

  // Retornar status
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Elite Blindagens API',
    environment: envCheck,
    message: 'API funcionando corretamente'
  });
}
