import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Admin - QR Code Apresentação', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página de admin
    await page.goto('http://localhost:3000/admin.html');
    
    // Fazer login (se necessário)
    // await page.fill('input[type="email"]', 'admin@elite.com');
    // await page.fill('input[type="password"]', 'senha');
    // await page.click('button[type="submit"]');
  });

  test('deve exibir a aba QR Code Apresentação', async ({ page }) => {
    // Verificar se a aba existe
    const qrcodeTab = page.locator('button[data-tab="qrcode"]');
    await expect(qrcodeTab).toBeVisible();
    
    // Clicar na aba
    await qrcodeTab.click();
    
    // Verificar se o conteúdo da aba é exibido
    const tabContent = page.locator('#tab-qrcode');
    await expect(tabContent).toBeVisible();
  });

  test('deve gerar e exibir o QR Code corretamente', async ({ page }) => {
    // Clicar na aba QR Code
    await page.click('button[data-tab="qrcode"]');
    
    // Aguardar o QR Code ser gerado
    await page.waitForTimeout(2000);
    
    // Verificar se o container do QR Code está visível
    const qrContainer = page.locator('#qrcode-container');
    await expect(qrContainer).toBeVisible();
    
    // Verificar se a imagem do QR Code foi criada
    const qrImage = page.locator('#qrcode-canvas');
    await expect(qrImage).toBeVisible();
    
    // Verificar se a imagem tem src (data URL)
    const src = await qrImage.getAttribute('src');
    expect(src).toContain('data:image/png;base64');
  });

  test('deve exibir a URL permanente correta', async ({ page }) => {
    // Clicar na aba QR Code
    await page.click('button[data-tab="qrcode"]');
    
    // Aguardar o campo de URL ser preenchido
    await page.waitForTimeout(1000);
    
    // Verificar se a URL está correta
    const urlInput = page.locator('#apresentacao-url');
    const urlValue = await urlInput.inputValue();
    
    expect(urlValue).toBe('https://rlaxbloitiknjikrpbim.supabase.co/storage/v1/object/public/apresentacoes/elite-blindagens-apresentacao.pdf');
  });

  test('deve baixar o QR Code em PNG', async ({ page }) => {
    // Clicar na aba QR Code
    await page.click('button[data-tab="qrcode"]');
    await page.waitForTimeout(1000);
    
    // Configurar listener para download
    const downloadPromise = page.waitForEvent('download');
    
    // Clicar no botão de download PNG
    await page.click('button:has-text("Baixar QR Code em PNG")');
    
    // Aguardar download
    const download = await downloadPromise;
    
    // Verificar nome do arquivo
    expect(download.suggestedFilename()).toBe('qrcode-elite-blindagens-apresentacao.png');
    
    // Salvar arquivo temporariamente para verificar
    const filePath = path.join(process.cwd(), 'test-results', download.suggestedFilename());
    await download.saveAs(filePath);
    
    // Verificar se o arquivo existe e tem tamanho > 0
    expect(fs.existsSync(filePath)).toBeTruthy();
    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(0);
    
    // Limpar arquivo de teste
    fs.unlinkSync(filePath);
  });

  test('deve baixar o QR Code em PDF', async ({ page }) => {
    // Clicar na aba QR Code
    await page.click('button[data-tab="qrcode"]');
    await page.waitForTimeout(1000);
    
    // Configurar listener para download
    const downloadPromise = page.waitForEvent('download');
    
    // Clicar no botão de download PDF
    await page.click('button:has-text("Baixar QR Code em PDF")');
    
    // Aguardar download (pode demorar mais por causa do logo)
    const download = await downloadPromise;
    
    // Verificar nome do arquivo
    expect(download.suggestedFilename()).toBe('qrcode-elite-blindagens-apresentacao.pdf');
    
    // Salvar arquivo temporariamente para verificar
    const filePath = path.join(process.cwd(), 'test-results', download.suggestedFilename());
    await download.saveAs(filePath);
    
    // Verificar se o arquivo existe e tem tamanho > 0
    expect(fs.existsSync(filePath)).toBeTruthy();
    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(0);
    
    // Limpar arquivo de teste
    fs.unlinkSync(filePath);
  });

  test('deve copiar a URL para área de transferência', async ({ page, context }) => {
    // Permitir permissões de clipboard
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Clicar na aba QR Code
    await page.click('button[data-tab="qrcode"]');
    await page.waitForTimeout(1000);
    
    // Clicar no botão de copiar
    await page.click('button[onclick="copyApresentacaoUrl()"]');
    
    // Aguardar alert (se houver)
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('copiada');
      await dialog.accept();
    });
    
    await page.waitForTimeout(500);
    
    // Verificar se a URL foi copiada
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('https://rlaxbloitiknjikrpbim.supabase.co/storage/v1/object/public/apresentacoes/elite-blindagens-apresentacao.pdf');
  });

  test('deve fazer upload de novo PDF com sucesso', async ({ page }) => {
    // Clicar na aba QR Code
    await page.click('button[data-tab="qrcode"]');
    await page.waitForTimeout(1000);
    
    // Criar um arquivo PDF de teste
    const testPdfPath = path.join(process.cwd(), 'test-results', 'test-upload.pdf');
    
    // Criar um PDF simples (apenas para teste)
    const pdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n210\n%%EOF';
    
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    fs.writeFileSync(testPdfPath, pdfContent);
    
    // Esperar pelo diálogo de confirmação
    page.on('dialog', async dialog => {
      if (dialog.message().includes('substituir')) {
        await dialog.accept();
      }
    });
    
    // Fazer upload do arquivo
    const fileInput = page.locator('#novo-pdf-input');
    await fileInput.setInputFiles(testPdfPath);
    
    // Aguardar mensagem de sucesso
    await page.waitForSelector('#upload-success', { state: 'visible', timeout: 10000 });
    
    // Verificar se a mensagem de sucesso está visível
    const successMessage = page.locator('#upload-success');
    await expect(successMessage).toBeVisible();
    
    // Limpar arquivo de teste
    fs.unlinkSync(testPdfPath);
  });

  test('deve validar tipo de arquivo no upload', async ({ page }) => {
    // Clicar na aba QR Code
    await page.click('button[data-tab="qrcode"]');
    await page.waitForTimeout(1000);
    
    // Criar um arquivo não-PDF de teste
    const testFilePath = path.join(process.cwd(), 'test-results', 'test-invalid.txt');
    
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    fs.writeFileSync(testFilePath, 'Este não é um PDF');
    
    // Esperar pelo alert de erro
    let alertShown = false;
    page.on('dialog', async dialog => {
      if (dialog.message().includes('PDF')) {
        alertShown = true;
        await dialog.accept();
      }
    });
    
    // Fazer upload do arquivo inválido
    const fileInput = page.locator('#novo-pdf-input');
    await fileInput.setInputFiles(testFilePath);
    
    await page.waitForTimeout(1000);
    
    // Verificar se o alert foi mostrado
    expect(alertShown).toBeTruthy();
    
    // Limpar arquivo de teste
    fs.unlinkSync(testFilePath);
  });

  test('deve garantir que o QR Code não mudou após ajustes', async ({ page }) => {
    // Clicar na aba QR Code
    await page.click('button[data-tab="qrcode"]');
    await page.waitForTimeout(2000);
    
    // Capturar o QR Code atual
    const qrImage = page.locator('#qrcode-canvas');
    const src1 = await qrImage.getAttribute('src');
    
    // Recarregar a página
    await page.reload();
    
    // Clicar na aba QR Code novamente
    await page.click('button[data-tab="qrcode"]');
    await page.waitForTimeout(2000);
    
    // Capturar o QR Code novamente
    const src2 = await qrImage.getAttribute('src');
    
    // Verificar se o QR Code é o mesmo (mesma URL gera mesmo código)
    // Como é uma imagem base64, o conteúdo deve ser idêntico
    expect(src1).toBe(src2);
  });
});
