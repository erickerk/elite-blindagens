/**
 * Elite Blindagens - Servidor Backend Seguro
 * 
 * Este servidor gerencia endpoints seguros para operações administrativas
 * sem expor credenciais sensíveis no frontend.
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

// Validar variáveis de ambiente obrigatórias
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ [Elite Server] Variáveis de ambiente faltando:', missingVars.join(', '));
  console.error('📝 [Elite Server] Crie um arquivo .env baseado no .env.example');
  process.exit(1);
}

// Criar cliente Supabase com service_role (backend only)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Configurar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Configurações de segurança para upload
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = ['application/pdf'];
const BUCKET_NAME = 'apresentacoes';
const FILE_PATH = 'elite-blindagens-apresentacao.pdf';

/**
 * Endpoint: Upload de Apresentação
 * POST /api/upload-apresentacao
 */
app.post('/api/upload-apresentacao', async (req, res) => {
  console.log('📤 [Elite API] Recebendo requisição de upload...');

  try {
    // Parse do formulário multipart
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
      keepExtensions: true,
      multiples: false
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('❌ [Elite API] Erro ao fazer parse do formulário:', err);
          reject(err);
        } else {
          resolve([fields, files]);
        }
      });
    });

    // Validar se o arquivo foi enviado
    if (!files.file || !files.file[0]) {
      console.warn('⚠️ [Elite API] Nenhum arquivo enviado');
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const uploadedFile = files.file[0];
    console.log('📄 [Elite API] Arquivo recebido:', {
      name: uploadedFile.originalFilename,
      size: uploadedFile.size,
      type: uploadedFile.mimetype
    });

    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(uploadedFile.mimetype)) {
      fs.unlinkSync(uploadedFile.filepath);
      console.warn('⚠️ [Elite API] Tipo de arquivo inválido:', uploadedFile.mimetype);
      
      return res.status(400).json({
        success: false,
        message: 'Tipo de arquivo inválido. Apenas PDF é permitido.'
      });
    }

    // Validar tamanho
    if (uploadedFile.size > MAX_FILE_SIZE) {
      fs.unlinkSync(uploadedFile.filepath);
      console.warn('⚠️ [Elite API] Arquivo muito grande:', uploadedFile.size);
      
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo: 50MB'
      });
    }

    // Ler o arquivo
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    console.log('📖 [Elite API] Arquivo lido, fazendo upload para Supabase...');

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
      console.error('❌ [Elite API] Erro no upload para Supabase:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload para o storage',
        error: error.message
      });
    }

    // Sucesso
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${FILE_PATH}`;
    console.log('✅ [Elite API] Upload realizado com sucesso!');
    console.log('🔗 [Elite API] URL pública:', publicUrl);
    
    return res.status(200).json({
      success: true,
      message: 'Apresentação atualizada com sucesso',
      data: {
        path: data.path,
        publicUrl: publicUrl
      }
    });

  } catch (error) {
    console.error('❌ [Elite API] Erro no processamento:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro desconhecido'
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Elite Blindagens API'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ============================================');
  console.log('🛡️  Elite Blindagens - Servidor Backend Seguro');
  console.log('🚀 ============================================');
  console.log('');
  console.log(`✅ Servidor rodando em: http://localhost:${PORT}`);
  console.log(`🔒 Credenciais protegidas via .env`);
  console.log(`📡 API disponível em: http://localhost:${PORT}/api/`);
  console.log('');
  console.log('📋 Endpoints disponíveis:');
  console.log('   POST /api/upload-apresentacao - Upload seguro de PDF');
  console.log('   GET  /api/health - Status do servidor');
  console.log('');
  console.log('🚀 ============================================');
  console.log('');
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ [Elite Server] Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [Elite Server] Promise rejeitada não tratada:', reason);
});
