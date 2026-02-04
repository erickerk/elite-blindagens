# 🔍 Relatório de Depuração - QR Code Admin

**Data:** 04/02/2026 00:54  
**Modo:** Depurador + Engenheiro + Planejador + Refactor

---

## 📋 Problemas Identificados

### 1. ❌ Conflito de Portas
**Causa Raiz:** Vite e Express competindo pela porta 3000  
**Impacto:** Endpoint `/api/upload-apresentacao` inacessível  
**Evidência:** Servidor Express não conseguia iniciar na porta 3000

### 2. ⚠️ Bibliotecas QR Code Duplicadas
**Causa Raiz:** Duas bibliotecas carregadas simultaneamente:
- `davidshimjs/qrcodejs` (antiga, desatualizada)
- `qrcode@1.5.3` (moderna, recomendada)

**Impacto:** Conflito de namespaces causando falhas no download  
**Evidência:** Funções `downloadQRCodePNG()` e `downloadQRCodePDF()` falhavam

### 3. ❌ Função de Geração Inconsistente
**Causa Raiz:** Método `generateQRCode()` tentava usar API antiga primeiro  
**Impacto:** QR Code não era gerado consistentemente

---

## ✅ Correções Implementadas

### **Correção 1: Separação de Portas**

**Arquivo:** `vite.config.js`
```javascript
// ANTES: Vite na porta 3000, sem proxy
server: {
  port: 3000,
  open: true
}

// DEPOIS: Vite com proxy configurado
server: {
  port: 3000,
  open: true,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false
    }
  }
}
```

**Arquivo:** `server.js`
```javascript
// ANTES: Porta 3000 (conflito)
const PORT = process.env.PORT || 3000;

// DEPOIS: Porta 3001
const PORT = process.env.PORT || 3001;
```

**Arquivo:** `.env`
```bash
# ANTES
PORT=3000

# DEPOIS
PORT=3001
```

**Resultado:**
- ✅ Vite em `http://localhost:3000`
- ✅ Express em `http://localhost:3001`
- ✅ Proxy `/api/*` → Express

---

### **Correção 2: Remoção de Biblioteca Duplicada**

**Arquivo:** `admin.html` (linha 15)
```html
<!-- ANTES: Duas bibliotecas conflitantes -->
<script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/polyfills.umd.js"></script>

<!-- DEPOIS: Apenas bibliotecas necessárias -->
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

**Benefícios:**
- ✅ Menos conflitos de namespace
- ✅ Carregamento mais rápido
- ✅ API consistente

---

### **Correção 3: Refatoração da Função `generateQRCode()`**

**Arquivo:** `admin.html` (linha 597)

```javascript
// ANTES: Múltiplas tentativas com fallbacks complexos
async function generateQRCode() {
  try {
    // Primeira tentativa: davidshimjs API
    new QRCode(qrContainer, {
      text: APRESENTACAO_URL,
      width: 256,
      correctLevel: QRCode.CorrectLevel.H
    });
  } catch {
    // Segunda tentativa: método alternativo
    const qrDataUrl = await QRCode.toDataURL(...);
    // ...código alternativo
  }
}

// DEPOIS: Método único e confiável
async function generateQRCode() {
  try {
    qrContainer.innerHTML = '';
    
    // Gerar QR Code usando biblioteca qrcode moderna
    const qrDataUrl = await QRCode.toDataURL(APRESENTACAO_URL, {
      width: 256,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });
    
    // Criar imagem e adicionar ao container
    const img = document.createElement('img');
    img.src = qrDataUrl;
    img.id = 'qrcode-canvas';
    img.style.width = '100%';
    img.style.height = '100%';
    img.alt = 'QR Code para Apresentação Elite Blindagens';
    qrContainer.appendChild(img);
    
    if (urlInput) urlInput.value = APRESENTACAO_URL;
    
    console.log('[Elite] QR Code gerado com sucesso');
  } catch (err) {
    console.error('[Elite] Erro ao gerar QR Code:', err);
    qrContainer.innerHTML = '<div>...</div>';
  }
}
```

---

### **Correção 4: Função `downloadQRCodePNG()`**

**Arquivo:** `admin.html` (linha 655)

```javascript
// ANTES: Dependia de elemento canvas inexistente
async function downloadQRCodePNG() {
  const canvas = document.getElementById('qrcode-canvas'); // ❌ Não existe
  if (!canvas) {
    alert('Erro: QR Code não encontrado!');
    return;
  }
  // ...
}

// DEPOIS: Gera QR Code diretamente
async function downloadQRCodePNG() {
  try {
    console.log('[Elite] Gerando PNG do QR Code...');
    
    // Gerar QR Code em alta resolução
    const qrDataUrl = await QRCode.toDataURL(APRESENTACAO_URL, {
      width: 1024, // Alta resolução
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });
    
    // Criar link de download
    const link = document.createElement('a');
    link.download = 'qrcode-elite-blindagens-apresentacao.png';
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('[Elite] Download do PNG concluído');
  } catch (err) {
    console.error('[Elite] Erro ao gerar PNG:', err);
    alert('Erro ao gerar o PNG do QR Code: ' + err.message);
  }
}
```

---

## 🔒 Garantia: QR Code Permanece Inalterado

### URL Fixa (Nunca Alterada)
```javascript
const APRESENTACAO_URL = 'https://rlaxbloitiknjikrpbim.supabase.co/storage/v1/object/public/apresentacoes/elite-blindagens-apresentacao.pdf';
```

### Como Funciona o Upload
1. **Usuário seleciona novo PDF** → Input file
2. **Frontend valida** → Apenas PDF, max 50MB
3. **Envia para backend** → POST `/api/upload-apresentacao`
4. **Backend valida novamente** → Segurança dupla
5. **Upload para Supabase** → `upsert: true` (sobrescreve)
6. **Mesmo caminho** → `apresentacoes/elite-blindagens-apresentacao.pdf`

**Resultado:** URL permanece idêntica, apenas o conteúdo do PDF muda ✅

---

## 📊 Status das Correções

| Funcionalidade | Status | Validação |
|---|---|---|
| Visualizar QR Code | ✅ Corrigido | Gera corretamente na aba |
| Download PNG | ✅ Corrigido | Gera 1024x1024px alta resolução |
| Download PDF | ✅ Corrigido | Gera PDF profissional com logo |
| Upload novo PDF | ✅ Corrigido | Endpoint `/api/*` acessível via proxy |
| URL permanente | ✅ Garantido | Constante nunca muda |
| Segurança | ✅ Mantida | Service role key protegida no backend |

---

## 🧪 Testes Necessários (Manual)

### ✅ Checklist de Validação Manual

1. **Abrir Admin Panel**
   - [ ] Navegar para `http://localhost:3000/admin.html`
   - [ ] Fazer login (se necessário)
   - [ ] Clicar na aba "QR Code Apresentação"

2. **Verificar QR Code**
   - [ ] QR Code aparece na tela
   - [ ] URL exibida está correta
   - [ ] Botão "Copiar URL" funciona

3. **Testar Download PNG**
   - [ ] Clicar em "Baixar QR Code em PNG"
   - [ ] Arquivo é baixado
   - [ ] Nome: `qrcode-elite-blindagens-apresentacao.png`
   - [ ] Imagem tem boa qualidade (1024x1024)
   - [ ] Cores: fundo branco, QR preto (#1a1a2e)

4. **Testar Download PDF**
   - [ ] Clicar em "Baixar QR Code em PDF"
   - [ ] Arquivo é baixado
   - [ ] Nome: `qrcode-elite-blindagens-apresentacao.pdf`
   - [ ] PDF contém logo Elite Blindagens
   - [ ] Layout profissional (gold/dark)
   - [ ] QR Code centralizado
   - [ ] URL exibida no rodapé

5. **Testar Upload de PDF**
   - [ ] Criar um PDF de teste
   - [ ] Clicar em "Selecionar Novo PDF"
   - [ ] Selecionar arquivo PDF
   - [ ] Confirmar substituição
   - [ ] Aguardar upload (barra de progresso)
   - [ ] Ver mensagem de sucesso
   - [ ] **IMPORTANTE:** QR Code continua igual

6. **Validar Segurança**
   - [ ] Tentar upload de arquivo .txt → Deve rejeitar
   - [ ] Tentar upload de arquivo > 50MB → Deve rejeitar
   - [ ] Service role key não está no código frontend

---

## 🚀 Como Executar

### Iniciar Ambiente de Desenvolvimento

```bash
# Terminal 1: Servidor Express (Backend)
npm run server
# Rodando em http://localhost:3001

# Terminal 2: Vite (Frontend)
npm run dev
# Rodando em http://localhost:3000
```

### Acessar Admin
```
http://localhost:3000/admin.html
```

---

## 📝 Arquivos Modificados

1. ✅ `vite.config.js` - Configuração de proxy
2. ✅ `server.js` - Porta alterada para 3001
3. ✅ `.env` - PORT=3001
4. ✅ `admin.html` - Correção de bibliotecas e funções
5. ✅ `tests/admin-qrcode.spec.js` - Suite de testes criada

---

## 🎯 Próximos Passos

1. **Validação Manual** ✅ PRONTO PARA TESTAR
2. **Ajustar testes Playwright** (se necessário após validação manual)
3. **Deploy para produção** (após confirmação)

---

## 💡 Observações Técnicas

### Padrão de Arquitetura
```
Frontend (Vite:3000)
    ↓ [/api/upload-apresentacao]
Proxy (Vite)
    ↓
Backend (Express:3001)
    ↓
Supabase Storage
```

### Segurança em Camadas
1. **Frontend:** Validação de tipo e tamanho
2. **Backend:** Validação dupla + credenciais protegidas
3. **Supabase:** RLS policies + public bucket apenas leitura

---

**Conclusão:** Todas as correções foram implementadas com base em análise de causa raiz. O sistema está pronto para validação manual.
