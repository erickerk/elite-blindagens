/**
 * Script para criar políticas de Storage no Supabase
 * Usa a Management API para executar SQL diretamente
 */

import https from 'https';

const PROJECT_REF = 'rlaxbloitiknjikrpbim';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYXhibG9pdGlrbmppa3JwYmltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjgzNDA3NywiZXhwIjoyMDgyNDEwMDc3fQ.aJHSnFXp8cG7kcWCaJI_h-NNPneL2eevy1vt4r96-34';

// SQL para criar políticas
const SQL_POLICIES = `
-- Remover políticas existentes (ignorar erros se não existirem)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "allow_public_select" ON storage.objects;
  DROP POLICY IF EXISTS "allow_public_insert" ON storage.objects;
  DROP POLICY IF EXISTS "allow_public_update" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Criar política de SELECT (leitura pública)
CREATE POLICY "allow_public_select" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'apresentacoes');

-- Criar política de INSERT (upload público)
CREATE POLICY "allow_public_insert" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'apresentacoes');

-- Criar política de UPDATE (sobrescrever público)
CREATE POLICY "allow_public_update" ON storage.objects
FOR UPDATE TO anon, authenticated
USING (bucket_id = 'apresentacoes')
WITH CHECK (bucket_id = 'apresentacoes');
`;

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/pg_execute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(postData),
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('=== Criando Políticas de Storage ===\n');
  
  try {
    const result = await executeSQL(SQL_POLICIES);
    console.log('Status:', result.status);
    console.log('Response:', result.data);
    
    if (result.status === 200 || result.status === 204) {
      console.log('\n✅ Políticas criadas com sucesso!');
    } else {
      console.log('\n⚠️ Resposta inesperada. Verifique o Dashboard.');
    }
  } catch (err) {
    console.error('Erro:', err.message);
  }
}

main();
