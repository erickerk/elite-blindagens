import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rlaxbloitiknjikrpbim.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYXhibG9pdGlrbmppa3JwYmltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjgzNDA3NywiZXhwIjoyMDgyNDEwMDc3fQ.aJHSnFXp8cG7kcWCaJI_h-NNPneL2eevy1vt4r96-34';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testUpload() {
  console.log('Testando upload com SERVICE_ROLE_KEY...\n');
  
  // Criar um PDF de teste simples
  const testContent = Buffer.from('%PDF-1.4 test file');
  
  const { data, error } = await supabase.storage
    .from('apresentacoes')
    .upload('test-upload-check.pdf', testContent, {
      contentType: 'application/pdf',
      upsert: true
    });
  
  if (error) {
    console.error('Erro no upload:', error);
    return false;
  }
  
  console.log('Upload de teste bem-sucedido:', data);
  
  // Remover arquivo de teste
  const { error: deleteError } = await supabase.storage
    .from('apresentacoes')
    .remove(['test-upload-check.pdf']);
  
  if (deleteError) {
    console.log('Aviso: não foi possível remover arquivo de teste:', deleteError);
  } else {
    console.log('Arquivo de teste removido');
  }
  
  return true;
}

async function main() {
  console.log('=== Verificação de Upload Supabase Storage ===\n');
  
  const success = await testUpload();
  
  if (success) {
    console.log('\n✅ SERVICE_ROLE_KEY funciona para uploads!');
    console.log('\nO problema é que ANON_KEY não tem permissão.');
    console.log('Você precisa criar políticas no Supabase Dashboard.\n');
    console.log('=== INSTRUÇÕES ===');
    console.log('1. Acesse: https://supabase.com/dashboard/project/rlaxbloitiknjikrpbim/storage/policies');
    console.log('2. Clique em "New Policy" para o bucket "apresentacoes"');
    console.log('3. Selecione "For full customization"');
    console.log('4. Crie estas políticas:\n');
    console.log('   POLÍTICA 1 - INSERT:');
    console.log('   - Policy name: allow_public_insert');
    console.log('   - Allowed operation: INSERT');
    console.log('   - Target roles: anon, authenticated');
    console.log('   - WITH CHECK expression: true\n');
    console.log('   POLÍTICA 2 - UPDATE:');
    console.log('   - Policy name: allow_public_update');
    console.log('   - Allowed operation: UPDATE');
    console.log('   - Target roles: anon, authenticated');
    console.log('   - USING expression: true');
    console.log('   - WITH CHECK expression: true\n');
  } else {
    console.log('\n❌ Erro no teste de upload');
  }
}

main();
