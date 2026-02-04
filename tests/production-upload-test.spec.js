import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTION_URL = 'https://elite-blindagens.vercel.app';
const ADMIN_EMAIL = 'juniorrodrigues1011@gmail.com';
const ADMIN_PASSWORD = 'Elite@2024#Admin!';

test.describe('Upload em Produção - Elite Blindagens', () => {
  let testPdfPath;

  test.beforeAll(async () => {
    // Criar PDF de teste
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    page.drawText('PDF de Teste - Elite Blindagens', {
      x: 50,
      y: 350,
      size: 20
    });
    page.drawText(`Gerado em: ${new Date().toISOString()}`, {
      x: 50,
      y: 300,
      size: 12
    });
    
    const pdfBytes = await pdfDoc.save();
    testPdfPath = path.join(__dirname, 'test-upload.pdf');
    fs.writeFileSync(testPdfPath, pdfBytes);
    
    console.log('[Test Setup] PDF de teste criado:', testPdfPath);
  });

  test.afterAll(async () => {
    // Limpar arquivo de teste
    if (fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath);
      console.log('[Test Cleanup] PDF de teste removido');
    }
  });

  test('Upload de Apresentação em Produção', async ({ page }) => {
    console.log('[Test] Iniciando teste de upload de apresentação...');
    
    // 1. Acessar admin em produção
    await page.goto(`${PRODUCTION_URL}/admin.html`);
    await page.waitForLoadState('networkidle');
    
    console.log('[Test] Página carregada');

    // 2. Fazer login
    await page.fill('#login-user', ADMIN_EMAIL);
    await page.fill('#login-pass', ADMIN_PASSWORD);
    
    console.log('[Test] Credenciais inseridas');

    // Interceptar alerts
    page.on('dialog', async dialog => {
      console.log('[Test] Alert detectado:', dialog.message());
      await dialog.accept();
    });

    await page.click('button[type="submit"]');
    
    console.log('[Test] Login submetido, aguardando dashboard...');

    // 3. Aguardar dashboard carregar
    await page.waitForSelector('#admin-dashboard:not(.hidden)', { timeout: 15000 });
    
    console.log('[Test] Dashboard carregado');

    // 4. Navegar para aba QR Code Apresentação
    await page.click('button:has-text("QR Code Apresentação")');
    await page.waitForTimeout(1000);
    
    console.log('[Test] Aba QR Code Apresentação aberta');

    // 5. Selecionar arquivo
    const fileInput = page.locator('input[type="file"]#upload-pdf');
    await fileInput.setInputFiles(testPdfPath);
    
    console.log('[Test] Arquivo selecionado');

    // 6. Aguardar progresso e sucesso
    await page.waitForSelector('#upload-progress:not(.hidden)', { timeout: 5000 });
    console.log('[Test] Upload iniciado...');

    await page.waitForSelector('#upload-success:not(.hidden)', { timeout: 70000 });
    console.log('[Test] ✅ Upload concluído com sucesso!');

    // 7. Verificar mensagem de sucesso
    const successVisible = await page.locator('#upload-success:not(.hidden)').isVisible();
    expect(successVisible).toBe(true);
    
    console.log('[Test] ✅ Teste de upload de apresentação PASSOU');
  });

  test('Upload de Manual Elite Track em Produção', async ({ page }) => {
    console.log('[Test] Iniciando teste de upload de Manual Elite Track...');
    
    // 1. Acessar admin em produção
    await page.goto(`${PRODUCTION_URL}/admin.html`);
    await page.waitForLoadState('networkidle');
    
    console.log('[Test] Página carregada');

    // 2. Fazer login
    await page.fill('#login-user', ADMIN_EMAIL);
    await page.fill('#login-pass', ADMIN_PASSWORD);
    
    console.log('[Test] Credenciais inseridas');

    // Interceptar alerts
    page.on('dialog', async dialog => {
      console.log('[Test] Alert detectado:', dialog.message());
      await dialog.accept();
    });

    await page.click('button[type="submit"]');
    
    console.log('[Test] Login submetido, aguardando dashboard...');

    // 3. Aguardar dashboard carregar
    await page.waitForSelector('#admin-dashboard:not(.hidden)', { timeout: 15000 });
    
    console.log('[Test] Dashboard carregado');

    // 4. Navegar para aba Manual Garantia
    await page.click('button:has-text("Manual Garantia")');
    await page.waitForTimeout(1000);
    
    console.log('[Test] Aba Manual Garantia aberta');

    // 5. Selecionar arquivo
    const fileInput = page.locator('input[type="file"]#upload-pdf-elitetrack');
    await fileInput.setInputFiles(testPdfPath);
    
    console.log('[Test] Arquivo selecionado');

    // 6. Aguardar progresso e sucesso
    await page.waitForSelector('#upload-progress-elitetrack:not(.hidden)', { timeout: 5000 });
    console.log('[Test] Upload iniciado...');

    await page.waitForSelector('#upload-success-elitetrack:not(.hidden)', { timeout: 70000 });
    console.log('[Test] ✅ Upload concluído com sucesso!');

    // 7. Verificar mensagem de sucesso
    const successVisible = await page.locator('#upload-success-elitetrack:not(.hidden)').isVisible();
    expect(successVisible).toBe(true);
    
    console.log('[Test] ✅ Teste de upload de Manual Elite Track PASSOU');
  });
});
