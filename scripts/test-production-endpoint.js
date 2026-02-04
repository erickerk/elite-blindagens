/**
 * Testar endpoint get-upload-url em produção
 */

const PRODUCTION_URL = 'https://elite-blindagens.vercel.app';

async function testEndpoint() {
  console.log('=== Testando Endpoint em Produção ===\n');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/get-upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'elite-blindagens-apresentacao.pdf' })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data && data.data.uploadUrl) {
      console.log('\n✅ Endpoint funcionando!');
      console.log('Upload URL:', data.data.uploadUrl);
      
      // Testar upload com um arquivo pequeno
      console.log('\n=== Testando Upload ===\n');
      
      const testContent = Buffer.from('%PDF-1.4 test file - ' + new Date().toISOString());
      
      const uploadResponse = await fetch(data.data.uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': data.data.headers['Authorization'],
          'x-upsert': 'true',
          'Content-Type': 'application/pdf'
        },
        body: testContent
      });
      
      console.log('Upload Status:', uploadResponse.status);
      const uploadResult = await uploadResponse.text();
      console.log('Upload Response:', uploadResult);
      
      if (uploadResponse.ok) {
        console.log('\n✅ UPLOAD FUNCIONANDO EM PRODUÇÃO!');
      } else {
        console.log('\n❌ Upload falhou');
      }
    } else {
      console.log('\n❌ Endpoint retornou erro:', data.message);
    }
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testEndpoint();
