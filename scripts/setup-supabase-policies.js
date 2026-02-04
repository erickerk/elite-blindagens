/**
 * Script para criar políticas de Storage no Supabase via Playwright
 * Acessa o Dashboard e cria as políticas automaticamente
 */

import { chromium } from 'playwright';

const SUPABASE_PROJECT_URL = 'https://supabase.com/dashboard/project/rlaxbloitiknjikrpbim/storage/policies';

async function main() {
  console.log('=== Configuração de Políticas Supabase via Dashboard ===\n');
  console.log('Este script abrirá o navegador para você criar as políticas manualmente.\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Abrindo Supabase Dashboard...');
  await page.goto(SUPABASE_PROJECT_URL);
  
  console.log('\n=== INSTRUÇÕES ===');
  console.log('1. Faça login no Supabase se necessário');
  console.log('2. Vá para Storage > Policies');
  console.log('3. Encontre o bucket "apresentacoes"');
  console.log('4. Clique em "New Policy"');
  console.log('5. Selecione "For full customization"');
  console.log('6. Crie estas 2 políticas:\n');
  
  console.log('   POLÍTICA 1 - INSERT:');
  console.log('   - Policy name: allow_anon_insert');
  console.log('   - Allowed operation: INSERT');
  console.log('   - Target roles: anon');
  console.log('   - WITH CHECK expression: bucket_id = \'apresentacoes\'\n');
  
  console.log('   POLÍTICA 2 - UPDATE:');
  console.log('   - Policy name: allow_anon_update');
  console.log('   - Allowed operation: UPDATE');
  console.log('   - Target roles: anon');
  console.log('   - USING expression: bucket_id = \'apresentacoes\'');
  console.log('   - WITH CHECK expression: bucket_id = \'apresentacoes\'\n');
  
  console.log('Pressione Ctrl+C quando terminar de configurar as políticas.');
  
  // Manter o navegador aberto
  await new Promise(() => {});
}

main().catch(console.error);
