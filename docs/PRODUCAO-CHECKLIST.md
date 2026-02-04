# ✅ Checklist de Produção - Elite Blindagens

## 📋 Status do Sistema

### ✅ Backend (Express Server)
- [x] Endpoint `/api/upload-apresentacao` funcionando
- [x] Endpoint `/api/upload-elitetrack` funcionando
- [x] Endpoint `/api/health` funcionando
- [x] CORS configurado
- [x] Validação de arquivo (tipo PDF, max 50MB)
- [x] Upload para Supabase Storage com upsert

### ✅ Frontend (Admin Panel)
- [x] Aba "Manual Garantia - Elite Track" criada
- [x] QR Code permanente gerado
- [x] Download PNG funcionando
- [x] Download PDF funcionando
- [x] Upload de novo PDF com timeout de 30s
- [x] Tratamento de erro robusto
- [x] Mensagens de sucesso/erro claras

### ✅ Funções Serverless (Vercel)
- [x] `api/upload-apresentacao.js` - Upload de Apresentação
- [x] `api/upload-elitetrack.js` - Upload de Manual de Garantia
- [x] `api/health.js` - Health check

### ✅ Configuração Vercel
- [x] `vercel.json` configurado com rewrites para `/api/*`
- [x] Funções com 1024MB de memória e 10s timeout

---

## 🚀 Deploy para Vercel

### Passo 1: Configurar Variáveis de Ambiente na Vercel
No painel da Vercel, adicione estas variáveis de ambiente:

```
SUPABASE_URL=https://rlaxbloitiknjikrpbim.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

⚠️ **IMPORTANTE**: A `SUPABASE_SERVICE_ROLE_KEY` deve ser mantida em segredo!

### Passo 2: Deploy
```bash
vercel --prod
```

Ou conecte o repositório Git à Vercel para deploy automático.

---

## 🧪 Teste Manual Antes de Publicar

### 1. Testar Upload de Apresentação
1. Acesse `http://localhost:3000/admin.html`
2. Faça login com suas credenciais
3. Vá para a aba "QR Code Apresentação"
4. Clique em "Selecionar Novo PDF"
5. Escolha um PDF de teste
6. Confirme o upload
7. ✅ Deve mostrar mensagem de sucesso

### 2. Testar Upload de Manual de Garantia
1. Vá para a aba "Manual Garantia - Elite Track"
2. Clique em "Selecionar Novo PDF"
3. Escolha um PDF de teste
4. Confirme o upload
5. ✅ Deve mostrar mensagem de sucesso

### 3. Testar QR Codes
1. Na aba de Apresentação, baixe o QR Code em PNG
2. Escaneie com o celular - deve abrir o PDF
3. Na aba Elite Track, baixe o QR Code em PNG
4. Escaneie com o celular - deve abrir o PDF

---

## 📁 Estrutura de Arquivos Importantes

```
elite-blindagens-site/
├── admin.html              # Painel administrativo
├── server.js               # Backend Express (desenvolvimento)
├── vercel.json             # Configuração Vercel
├── api/
│   ├── health.js           # Health check serverless
│   ├── upload-apresentacao.js  # Upload Apresentação serverless
│   └── upload-elitetrack.js    # Upload Manual Garantia serverless
└── tests/
    ├── admin-qrcode.spec.js         # Testes Apresentação
    └── admin-manual-garantia.spec.js # Testes Manual Garantia
```

---

## 🔗 URLs Permanentes

| Recurso | URL |
|---------|-----|
| Apresentação | `https://rlaxbloitiknjikrpbim.supabase.co/storage/v1/object/public/apresentacoes/elite-blindagens-apresentacao.pdf` |
| Manual de Garantia | `https://rlaxbloitiknjikrpbim.supabase.co/storage/v1/object/public/apresentacoes/Manual-Digital-de-Seguranca-e-Garantia.pdf` |

---

## ⚠️ Notas Importantes

1. **Os QR Codes são permanentes** - Mesmo que você atualize o PDF, o QR Code continua o mesmo.

2. **Timeout de 30 segundos** - Se o upload demorar mais de 30 segundos, será cancelado automaticamente.

3. **Tamanho máximo** - Arquivos PDF até 50MB são aceitos.

4. **Múltiplos processos Node** - Se encontrar problemas de "Cannot POST", execute:
   ```powershell
   Stop-Process -Name node -Force
   npm run server
   ```

5. **Teste local antes de produção**:
   - Terminal 1: `npm run server` (backend na porta 3001)
   - Terminal 2: `npm run dev` (frontend na porta 3000)

---

## ✅ Pronto para Produção!

Se todos os testes manuais passaram, o sistema está pronto para deploy na Vercel.
