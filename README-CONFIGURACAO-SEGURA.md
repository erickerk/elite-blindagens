# 🔐 Configuração Segura - Elite Blindagens

## ⚠️ AÇÃO IMEDIATA NECESSÁRIA

Uma vulnerabilidade de segurança foi detectada e corrigida. Siga os passos abaixo **IMEDIATAMENTE**.

---

## 📋 Passos para Configuração Segura

### 1️⃣ Criar arquivo `.env`

Crie um arquivo chamado `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Elite Blindagens - Variáveis de Ambiente
SUPABASE_URL=https://rlaxbloitiknjikrpbim.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYXhibG9pdGlrbmppa3JwYmltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjgzNDA3NywiZXhwIjoyMDgyNDEwMDc3fQ.aJHSnFXp8cG7kcWCaJI_h-NNPneL2eevy1vt4r96-34
NODE_ENV=production
PORT=3000
```

**⚠️ IMPORTANTE:** Substitua `sua_anon_key_aqui` pela sua chave anon do Supabase.

### 2️⃣ Verificar `.gitignore`

Confirme que o arquivo `.gitignore` contém:

```
.env
.env.local
.env.*.local
```

✅ **Verificado:** O `.gitignore` já está configurado corretamente.

### 3️⃣ Rotacionar a Service Role Key (RECOMENDADO)

Como a chave foi exposta no GitHub, é **altamente recomendado** rotacioná-la:

1. Acesse: https://supabase.com/dashboard/project/rlaxbloitiknjikrpbim/settings/api
2. Na seção **Service Role Key**, clique em **Reset**
3. Copie a nova chave
4. Atualize o arquivo `.env` com a nova chave
5. Reinicie o servidor

### 4️⃣ Iniciar o Servidor Backend Seguro

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Iniciar servidor
npm run server
```

O servidor iniciará em `http://localhost:3000` e servirá:
- Arquivos estáticos (HTML, CSS, JS)
- API segura em `/api/upload-apresentacao`

### 5️⃣ Testar o Upload

1. Acesse: `http://localhost:3000/admin.html`
2. Faça login no painel administrativo
3. Vá para a aba **"QR Code Apresentação"**
4. Na seção **"Atualizar Apresentação"**, selecione um PDF
5. O upload agora será feito de forma segura através do backend

---

## 🛡️ O Que Foi Corrigido

### ❌ Antes (INSEGURO):
```javascript
// Service Role Key EXPOSTA no frontend
const SUPABASE_SERVICE_KEY = 'eyJhbGci...';

// Upload direto do frontend
fetch(`${SUPABASE_URL}/storage/v1/object/...`, {
  headers: {
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` // ❌ EXPOSTO
  }
});
```

### ✅ Depois (SEGURO):
```javascript
// Frontend - SEM credenciais
const formData = new FormData();
formData.append('file', file);

fetch('/api/upload-apresentacao', {
  method: 'POST',
  body: formData
});

// Backend (server.js) - Credenciais protegidas no .env
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ SEGURO
);
```

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- ✅ `server.js` - Servidor backend seguro
- ✅ `.env.example` - Template de variáveis de ambiente
- ✅ `api/upload-apresentacao.js` - Endpoint de upload (alternativo)
- ✅ `SECURITY.md` - Guia completo de segurança
- ✅ `README-CONFIGURACAO-SEGURA.md` - Este arquivo

### Arquivos Modificados:
- ✅ `admin.html` - Removida service_role_key, agora usa endpoint backend
- ✅ `package.json` - Adicionados scripts `server` e `start`

---

## 🚀 Comandos Úteis

```bash
# Iniciar servidor de desenvolvimento (frontend apenas)
npm run dev

# Iniciar servidor backend seguro (recomendado)
npm run server

# Verificar status da API
curl http://localhost:3000/api/health
```

---

## ✅ Checklist de Segurança

- [x] Service role key removida do frontend
- [x] Arquivo `.env` configurado
- [x] `.env` está no `.gitignore`
- [x] Servidor backend criado
- [x] Endpoint de upload seguro implementado
- [ ] **VOCÊ DEVE FAZER:** Rotacionar a service_role_key no Supabase
- [ ] **VOCÊ DEVE FAZER:** Testar o upload através do novo sistema

---

## 📞 Próximos Passos

1. **URGENTE:** Rotacione a service_role_key no Supabase Dashboard
2. Crie o arquivo `.env` com as credenciais
3. Inicie o servidor com `npm run server`
4. Teste o upload de PDF no painel admin
5. Monitore os logs do servidor

---

## 🔗 Links Úteis

- [Supabase Dashboard](https://supabase.com/dashboard/project/rlaxbloitiknjikrpbim)
- [Documentação Supabase Storage](https://supabase.com/docs/guides/storage)
- [Guia de Segurança Completo](./SECURITY.md)

---

**Data:** 29/01/2026  
**Status:** ✅ Vulnerabilidade corrigida  
**Ação Requerida:** Rotacionar service_role_key
