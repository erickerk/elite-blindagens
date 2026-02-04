/**
 * API para gerar Signed Upload URLs do Supabase
 * Elite Blindagens - Solução para Erro 413 (Payload Too Large)
 * 
 * Este endpoint gera URLs assinadas para upload direto do cliente ao Supabase,
 * evitando o limite de 4.5MB do Vercel.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const BUCKET_NAME = 'apresentacoes';

/**
 * Gera URL assinada para upload direto ao Supabase
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido. Use POST.' 
    });
  }

  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'Nome do arquivo é obrigatório'
      });
    }

    // Validar fileName (apenas nomes permitidos)
    const allowedFiles = [
      'elite-blindagens-apresentacao.pdf',
      'Manual-Digital-de-Seguranca-e-Garantia.pdf'
    ];

    if (!allowedFiles.includes(fileName)) {
      return res.status(400).json({
        success: false,
        message: 'Nome de arquivo não permitido'
      });
    }

    // Gerar URL assinada para upload (válida por 5 minutos)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(fileName);

    if (error) {
      console.error('[Get Upload URL] Erro ao gerar URL:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao gerar URL de upload',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        signedUrl: data.signedUrl,
        token: data.token,
        path: data.path,
        fileName: fileName
      }
    });

  } catch (error) {
    console.error('[Get Upload URL] Erro no processamento:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
