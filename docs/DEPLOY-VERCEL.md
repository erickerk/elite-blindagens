# 🚀 Guia de Deploy - Elite Blindagens na Vercel

## 📋 Pré-requisitos

- ✅ Código commitado e enviado para o GitHub
- ✅ Conta na Vercel (https://vercel.com)
- ✅ Repositório GitHub conectado

---

## 🎯 Passo a Passo para Deploy

### 1️⃣ Acessar Vercel Dashboard

1. Acesse: https://vercel.com/dashboard
2. Faça login com sua conta GitHub

### 2️⃣ Importar Projeto

1. Clique em **"Add New..."** → **"Project"**
2. Selecione o repositório: **`erickerk/elite-blindagens`**
3. Clique em **"Import"**

### 3️⃣ Configurar Variáveis de Ambiente

**IMPORTANTE:** Antes de fazer o deploy, configure as variáveis de ambiente:

1. Na página de configuração do projeto, vá para **"Environment Variables"**
2. Adicione as seguintes variáveis:

```
SUPABASE_URL
Valor: https://rlaxbloitiknjikrpbim.supabase.co

SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYXhibG9pdGlrbmppa3JwYmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MzQwNzcsImV4cCI6MjA4MjQxMDA3N30.Aw-Tn_hnSJNGdkOFKnxp0RfXxLN0cQJLHQxCYNfHGRo

SUPABASE_SERVICE_ROLE_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYXhibG9pdGlrbmppa3JwYmltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjgzNDA3NywiZXhwIjoyMDgyNDEwMDc3fQ.aJHSnFXp8cG7kcWCaJI_h-NNPneL2eevy1vt4r96-34

NODE_ENV
Valor: production
```

3. Certifique-se de que todas as variáveis estão marcadas para **Production**, **Preview** e **Development**

### 4️⃣ Configurações do Build

A Vercel detectará automaticamente as configurações do `vercel.json`. Não é necessário alterar nada.

**Configurações padrão:**
- Framework Preset: **Other**
- Build Command: (deixe vazio)
- Output Directory: (deixe vazio)
- Install Command: `npm install`

### 5️⃣ Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde o build e deploy (leva cerca de 1-2 minutos)
3. Quando concluído, você verá: ✅ **"Your project has been deployed"**

---

## 🌐 URLs do Site

Após o deploy, você terá:

- **URL de Produção:** `https://elite-blindagens.vercel.app`
- **URL Personalizada:** Configure um domínio customizado se desejar

### Páginas Disponíveis:

- **Home:** `https://elite-blindagens.vercel.app/`
- **Admin:** `https://elite-blindagens.vercel.app/admin`
- **Veículos:** `https://elite-blindagens.vercel.app/veiculos-venda`
- **API Upload:** `https://elite-blindagens.vercel.app/api/upload-apresentacao`

---

## ⚠️ IMPORTANTE: Rotacionar Service Role Key

Como a `SUPABASE_SERVICE_ROLE_KEY` foi exposta no GitHub, você **DEVE** rotacioná-la:

### Como Rotacionar:

1. Acesse: https://supabase.com/dashboard/project/rlaxbloitiknjikrpbim/settings/api
2. Na seção **"Service Role Key"**, clique em **"Reset"**
3. Copie a nova chave gerada
4. Atualize a variável de ambiente na Vercel:
   - Vá em: **Settings** → **Environment Variables**
   - Edite `SUPABASE_SERVICE_ROLE_KEY`
   - Cole a nova chave
   - Clique em **"Save"**
5. Faça um novo deploy:
   - Vá em **Deployments**
   - Clique nos três pontos do último deploy
   - Selecione **"Redeploy"**

---

## 🔧 Configurações Adicionais (Opcional)

### Domínio Personalizado

1. Vá em **Settings** → **Domains**
2. Clique em **"Add"**
3. Digite seu domínio (ex: `eliteblindagens.com.br`)
4. Siga as instruções para configurar o DNS

### Proteção do Painel Admin

Para adicionar autenticação extra ao painel admin:

1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   ```
   ADMIN_PASSWORD
   Valor: sua_senha_segura_aqui
   ```

---

## 🧪 Testar o Deploy

Após o deploy, teste as seguintes funcionalidades:

### ✅ Checklist de Testes:

- [ ] Site principal carrega corretamente
- [ ] Painel admin acessível
- [ ] Login no painel admin funciona
- [ ] QR Code aparece na aba "QR Code Apresentação"
- [ ] Download do QR Code em PDF funciona
- [ ] Download do QR Code em PNG funciona
- [ ] Upload de novo PDF funciona (teste com arquivo pequeno)
- [ ] Formulários de contato funcionam
- [ ] Galeria de veículos carrega

---

## 🐛 Troubleshooting

### Erro: "API route not found"

**Solução:** Verifique se as variáveis de ambiente estão configuradas corretamente.

### Erro: "Failed to upload file"

**Solução:** 
1. Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada
2. Verifique se o bucket `apresentacoes` existe no Supabase
3. Verifique se o bucket é público

### Site não carrega

**Solução:**
1. Verifique os logs do deploy na Vercel
2. Vá em **Deployments** → clique no deploy → **"View Function Logs"**

---

## 📊 Monitoramento

### Ver Logs em Tempo Real:

1. Acesse o dashboard da Vercel
2. Vá em **Deployments**
3. Clique no deployment ativo
4. Clique em **"View Function Logs"**

### Métricas:

- **Analytics:** Veja visitantes, páginas mais acessadas
- **Speed Insights:** Performance do site
- **Web Vitals:** Métricas de experiência do usuário

---

## 🔄 Atualizações Futuras

Para fazer atualizações no site:

1. Faça as alterações no código local
2. Commit e push para o GitHub:
   ```bash
   git add .
   git commit -m "feat: sua descrição"
   git push origin master
   ```
3. A Vercel fará o deploy automaticamente!

---

## 📞 Suporte

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Status Vercel:** https://vercel-status.com

---

## ✅ Resumo

1. ✅ Código commitado e enviado para GitHub
2. ⏳ **PRÓXIMO:** Importar projeto na Vercel
3. ⏳ **PRÓXIMO:** Configurar variáveis de ambiente
4. ⏳ **PRÓXIMO:** Fazer deploy
5. ⏳ **IMPORTANTE:** Rotacionar service_role_key
6. ⏳ **FINAL:** Testar todas as funcionalidades

---

**Data:** 29/01/2026  
**Versão:** 1.0.0  
**Status:** Pronto para deploy 🚀
