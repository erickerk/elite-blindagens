/**
 * API Endpoint Seguro para Upload de Apresentação
 * Elite Blindagens - Backend
 * 
 * Este endpoint gerencia o upload seguro de PDFs para o Supabase Storage
 * sem expor credenciais sensíveis no frontend.
 */

import { createClient } from '@supabase/supabase-js';
import { IncomingForm } from 'formidable';
import fs from 'fs';

// Carregar variáveis de ambiente
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validar variáveis de ambiente
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
}

// Criar cliente Supabase com service_role (backend only)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Configurações de segurança
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = ['application/pdf'];
const BUCKET_NAME = 'apresentacoes';
const FILE_PATH = 'elite-blindagens-apresentacao.pdf';

/**
 * Handler principal do endpoint
 */
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder OPTIONS para CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido. Use POST.' 
    });
  }

  try {
    // Parse do formulário multipart usando IncomingForm
    const form = new IncomingForm({
      maxFileSize: MAX_FILE_SIZE,
      keepExtensions: true,
      multiples: false
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Validar se o arquivo foi enviado
    if (!files.file || !files.file[0]) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const uploadedFile = files.file[0];

    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(uploadedFile.mimetype)) {
      // Limpar arquivo temporário
      fs.unlinkSync(uploadedFile.filepath);
      
      return res.status(400).json({
        success: false,
        message: 'Tipo de arquivo inválido. Apenas PDF é permitido.'
      });
    }

    // Validar tamanho
    if (uploadedFile.size > MAX_FILE_SIZE) {
      fs.unlinkSync(uploadedFile.filepath);
      
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo: 50MB'
      });
    }

    // Ler o arquivo
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);

    // Upload para o Supabase Storage (sobrescrever arquivo existente)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(FILE_PATH, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true, // Sobrescrever se já existir
        cacheControl: '3600'
      });

    // Limpar arquivo temporário
    fs.unlinkSync(uploadedFile.filepath);

    if (error) {
      console.error('[Elite API] Erro no upload para Supabase:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload para o storage',
        error: error.message
      });
    }

    // Sucesso
    console.log('[Elite API] Upload realizado com sucesso:', data);
    
    return res.status(200).json({
      success: true,
      message: 'Apresentação atualizada com sucesso',
      data: {
        path: data.path,
        publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${FILE_PATH}`
      }
    });

  } catch (error) {
    console.error('[Elite API] Erro no processamento:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Configuração para Next.js API Routes (se aplicável)
export const config = {
  api: {
    bodyParser: false, // Desabilitar body parser padrão para usar formidable
  },
};
