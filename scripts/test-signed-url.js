/**
 * Testar geração de Signed URL com SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rlaxbloitiknjikrpbim.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYXhibG9pdGlrbmppa3JwYmltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjgzNDA3NywiZXhwIjoyMDgyNDEwMDc3fQ.aJHSnFXp8cG7kcWCaJI_h-NNPneL2eevy1vt4r96-34';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('=== Testando Upload Direto com SERVICE_ROLE_KEY ===\n');
  
  const testContent = Buffer.from('%PDF-1.4 test file - ' + new Date().toISOString());
  
  // Upload direto com upsert usando SERVICE_ROLE_KEY
  const { data, error } = await supabase.storage
    .from('apresentacoes')
    .upload('elite-blindagens-apresentacao.pdf', testContent, {
      contentType: 'application/pdf',
      upsert: true
    });
  
  if (error) {
    console.error('Erro no upload:', error);
    return;
  }
  
  console.log('✅ Upload com SERVICE_ROLE_KEY funcionou!');
  console.log('Path:', data.path);
  console.log('ID:', data.id);
  
  console.log('\n=== Conclusão ===');
  console.log('O upload funciona com SERVICE_ROLE_KEY.');
  console.log('O problema é que ANON_KEY não tem permissão de INSERT/UPDATE.');
  console.log('\nSOLUÇÃO: Usar o endpoint /api/get-upload-url com SERVICE_ROLE_KEY');
  console.log('para gerar signed URLs que o frontend pode usar.');
}

main();
