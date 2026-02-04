/**
 * Script de Teste do Deploy - Elite Blindagens
 * Testa todas as funcionalidades do site em produção
 */

const SITE_URL = 'https://elite-blindagens.vercel.app';

const tests = [
  {
    name: 'Site Principal',
    url: `${SITE_URL}/`,
    expected: 200
  },
  {
    name: 'Painel Admin',
    url: `${SITE_URL}/admin.html`,
    expected: 200
  },
  {
    name: 'Veículos à Venda',
    url: `${SITE_URL}/veiculos-venda.html`,
    expected: 200
  },
  {
    name: 'API Health Check',
    url: `${SITE_URL}/api/health`,
    expected: 200
  }
];

async function testEndpoint(test) {
  try {
    console.log(`\n🧪 Testando: ${test.name}`);
    console.log(`   URL: ${test.url}`);
    
    const response = await fetch(test.url);
    const status = response.status;
    
    if (status === test.expected) {
      console.log(`   ✅ Status: ${status} - OK`);
      
      // Se for a API health, mostrar detalhes
      if (test.url.includes('/api/health')) {
        const data = await response.json();
        console.log(`   📊 Resposta:`, JSON.stringify(data, null, 2));
        
        // Verificar variáveis de ambiente
        if (data.environment) {
          console.log(`\n   🔐 Variáveis de Ambiente:`);
          console.log(`      SUPABASE_URL: ${data.environment.SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada'}`);
          console.log(`      SUPABASE_SERVICE_ROLE_KEY: ${data.environment.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
          console.log(`      NODE_ENV: ${data.environment.NODE_ENV}`);
        }
      }
      
      return true;
    } else {
      console.log(`   ❌ Status: ${status} - Esperado: ${test.expected}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 ============================================');
  console.log('🧪 Testando Deploy - Elite Blindagens');
  console.log('🚀 ============================================');
  console.log(`\n📍 URL Base: ${SITE_URL}`);
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testEndpoint(test);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n🚀 ============================================');
  console.log('📊 Resultados dos Testes');
  console.log('🚀 ============================================');
  console.log(`\n✅ Testes Passados: ${passed}`);
  console.log(`❌ Testes Falhados: ${failed}`);
  console.log(`📈 Taxa de Sucesso: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 Todos os testes passaram! O site está funcionando perfeitamente.');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique os logs acima.');
    console.log('\n💡 Dicas:');
    console.log('   - Aguarde alguns minutos para o deploy da Vercel completar');
    console.log('   - Verifique se as variáveis de ambiente estão configuradas na Vercel');
    console.log('   - Acesse: https://vercel.com/dashboard para ver os logs');
  }
  
  console.log('\n🚀 ============================================\n');
}

// Executar testes
runTests().catch(console.error);
