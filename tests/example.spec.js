const { test, expect } = require('@playwright/test');

test('Testar fluxo completo', async ({ page }) => {
  // Testar newsletter
  await page.goto('http://localhost:3000');
  await page.fill('#newsletter-email', 'teste@email.com');
  await page.click('button:has-text("Cadastrar")');
  await expect(page.locator('#newsletter-success')).toBeVisible();

  // Testar admin login
  await page.goto('http://localhost:3000/admin.html');
  await page.fill('input[placeholder="Digite seu usuário"]', 'eliteadmin');
  await page.fill('input[placeholder="Digite sua senha"]', '2024@elite');
  await page.click('button:has-text("Entrar")');
  await expect(page.locator('text=E-mails Cadastrados')).toBeVisible();

  // Testar adição de veículo
  await page.click('text=Veículos à Venda');
  await page.click('text=Adicionar Veículo');
  await page.fill('#veiculo-titulo', 'Teste Playwright');
  await page.fill('#veiculo-preco', 'R$ 100.000');
  await page.fill('#veiculo-imagem', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7');
  await page.click('text=Salvar');
  await expect(page.locator('text=Teste Playwright')).toBeVisible();

  // Verificar se veículo aparece no site
  await page.goto('http://localhost:3000/veiculos-venda.html');
  await expect(page.locator('text=Teste Playwright')).toBeVisible();
});
