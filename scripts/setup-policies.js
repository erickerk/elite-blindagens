import https from 'https';

const SUPABASE_URL = 'https://rlaxbloitiknjikrpbim.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYXhibG9pdGlrbmppa3JwYmltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjgzNDA3NywiZXhwIjoyMDgyNDEwMDc3fQ.aJHSnFXp8cG7kcWCaJI_h-NNPneL2eevy1vt4r96-34';

// SQL para criar políticas de storage
const policies = [
  // Remover políticas existentes
  `DROP POLICY IF EXISTS "Public Read apresentacoes" ON storage.objects`,
  `DROP POLICY IF EXISTS "Public Insert apresentacoes" ON storage.objects`,
  `DROP POLICY IF EXISTS "Public Update apresentacoes" ON storage.objects`,
  // Criar novas políticas
  `CREATE POLICY "Public Read apresentacoes" ON storage.objects FOR SELECT TO public USING (bucket_id = 'apresentacoes')`,
  `CREATE POLICY "Public Insert apresentacoes" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'apresentacoes')`,
  `CREATE POLICY "Public Update apresentacoes" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'apresentacoes') WITH CHECK (bucket_id = 'apresentacoes')`
];

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + '/rest/v1/');
    
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data}`);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('Configurando políticas de storage no Supabase...\n');
  
  for (const sql of policies) {
    console.log(`Executando: ${sql.substring(0, 50)}...`);
    try {
      await executeSQL(sql);
    } catch (err) {
      console.error('Erro:', err.message);
    }
    console.log('');
  }
  
  console.log('Configuração concluída!');
}

main();
