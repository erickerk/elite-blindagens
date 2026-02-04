import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Admin - Manual Digital de Segurança e Garantia (Elite Track)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/admin.html');
    
    // Fazer login
    await page.fill('#login-user', 'admin@eliteblindagens.com.br');
    await page.fill('#login-pass', 'Elite@2024#Admin!');
    
    // Handler para dialogs
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('button[type="submit"]');
    
    // Aguardar dashboard carregar
    await page.waitForSelector('#admin-dashboard:not(.hidden)', { timeout: 10000 });
  });

  test('deve exibir a aba Manual Garantia - Elite Track', async ({ page }) => {
    const eliteTrackTab = page.locator('button[data-tab="qrcode-elitetrack"]');
    await expect(eliteTrackTab).toBeVisible();
    await expect(eliteTrackTab).toContainText('Manual Garantia');
    
    await eliteTrackTab.click();
    
    const tabContent = page.locator('#tab-qrcode-elitetrack');
    await expect(tabContent).toBeVisible();
  });

  test('deve exibir título correto na aba Elite Track', async ({ page }) => {
    await page.click('button[data-tab="qrcode-elitetrack"]');
    await page.waitForTimeout(500);
    
    const heading = page.locator('#tab-qrcode-elitetrack h2');
    await expect(heading).toContainText('Manual Digital de Segurança e Garantia');
  });

  test('deve gerar e exibir o QR Code Elite Track', async ({ page }) => {
    await page.click('button[data-tab="qrcode-elitetrack"]');
    await page.waitForTimeout(2000);
    
    const qrContainer = page.locator('#qrcode-elitetrack-container');
    await expect(qrContainer).toBeVisible();
    
    const qrCanvas = qrContainer.locator('canvas');
    await expect(qrCanvas).toBeVisible();
  });

  test('deve exibir a URL do Manual de Garantia correta', async ({ page }) => {
    await page.click('button[data-tab="qrcode-elitetrack"]');
    await page.waitForTimeout(1000);
    
    const urlInput = page.locator('#elitetrack-url');
    const urlValue = await urlInput.inputValue();
    
    expect(urlValue).toBe('https://rlaxbloitiknjikrpbim.supabase.co/storage/v1/object/public/apresentacoes/Manual-Digital-de-Seguranca-e-Garantia.pdf');
  });

  test('deve baixar o QR Code Elite Track em PNG', async ({ page }) => {
    await page.click('button[data-tab="qrcode-elitetrack"]');
    await page.waitForTimeout(1500);
    
    const downloadPromise = page.waitForEvent('download');
    
    await page.click('#tab-qrcode-elitetrack button:has-text("Baixar QR Code em PNG")');
    
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toBe('qrcode-manual-garantia-elite-track.png');
    
    const filePath = path.join(process.cwd(), 'test-results', download.suggestedFilename());
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    await download.saveAs(filePath);
    
    expect(fs.existsSync(filePath)).toBeTruthy();
    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(0);
    
    fs.unlinkSync(filePath);
  });

  test('deve baixar o QR Code Elite Track em PDF', async ({ page }) => {
    await page.click('button[data-tab="qrcode-elitetrack"]');
    await page.waitForTimeout(1500);
    
    const downloadPromise = page.waitForEvent('download');
    
    await page.click('#tab-qrcode-elitetrack button:has-text("Baixar QR Code em PDF")');
    
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toBe('qrcode-manual-garantia-elite-track.pdf');
    
    const filePath = path.join(process.cwd(), 'test-results', download.suggestedFilename());
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    await download.saveAs(filePath);
    
    expect(fs.existsSync(filePath)).toBeTruthy();
    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(0);
    
    fs.unlinkSync(filePath);
  });

  test('deve fazer upload de novo PDF do Manual de Garantia', async ({ page }) => {
    await page.click('button[data-tab="qrcode-elitetrack"]');
    await page.waitForTimeout(1000);
    
    const testPdfPath = path.join(process.cwd(), 'test-results', 'test-manual-garantia.pdf');
    
    const pdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n210\n%%EOF';
    
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    fs.writeFileSync(testPdfPath, pdfContent);
    
    page.on('dialog', async dialog => {
      if (dialog.message().includes('substituir') || dialog.message().includes('Manual de Garantia')) {
        await dialog.accept();
      }
      if (dialog.message().includes('Upload realizado')) {
        await dialog.accept();
      }
    });
    
    const fileInput = page.locator('#novo-pdf-elitetrack-input');
    await fileInput.setInputFiles(testPdfPath);
    
    await page.waitForSelector('#upload-success-elitetrack', { state: 'visible', timeout: 15000 });
    
    const successMessage = page.locator('#upload-success-elitetrack');
    await expect(successMessage).toBeVisible();
    
    fs.unlinkSync(testPdfPath);
  });

  test('deve validar tipo de arquivo no upload Elite Track', async ({ page }) => {
    await page.click('button[data-tab="qrcode-elitetrack"]');
    await page.waitForTimeout(1000);
    
    const testFilePath = path.join(process.cwd(), 'test-results', 'test-invalid-elitetrack.txt');
    
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    fs.writeFileSync(testFilePath, 'Este não é um PDF');
    
    let alertShown = false;
    page.on('dialog', async dialog => {
      if (dialog.message().includes('PDF')) {
        alertShown = true;
        await dialog.accept();
      }
    });
    
    const fileInput = page.locator('#novo-pdf-elitetrack-input');
    await fileInput.setInputFiles(testFilePath);
    
    await page.waitForTimeout(1000);
    
    expect(alertShown).toBeTruthy();
    
    fs.unlinkSync(testFilePath);
  });

  test('deve exibir seção de integração Elite Track', async ({ page }) => {
    await page.click('button[data-tab="qrcode-elitetrack"]');
    await page.waitForTimeout(500);
    
    const integrationSection = page.locator('#tab-qrcode-elitetrack .bg-emerald-50');
    await expect(integrationSection).toBeVisible();
    await expect(integrationSection).toContainText('Integração Elite Track');
  });

  test('QR Code Elite Track deve permanecer consistente após reload', async ({ page }) => {
    await page.click('button[data-tab="qrcode-elitetrack"]');
    await page.waitForTimeout(2000);
    
    const urlInput = page.locator('#elitetrack-url');
    const url1 = await urlInput.inputValue();
    
    await page.reload();
    
    await page.click('button[data-tab="qrcode-elitetrack"]');
    await page.waitForTimeout(2000);
    
    const url2 = await urlInput.inputValue();
    
    expect(url1).toBe(url2);
  });
});
