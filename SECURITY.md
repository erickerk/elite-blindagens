# 🔒 Guia de Segurança - Elite Blindagens

## ⚠️ IMPORTANTE: Configuração de Credenciais

### 1. Configurar Variáveis de Ambiente

**NUNCA commite o arquivo `.env` para o repositório!**

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` e adicione suas credenciais:
```env
SUPABASE_URL=https://rlaxbloitiknjikrpbim.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
NODE_ENV=production
PORT=3000
```

3. **IMPORTANTE:** A `SUPABASE_SERVICE_ROLE_KEY` é extremamente sensível e tem privilégios administrativos completos. **NUNCA** exponha esta chave no frontend ou em repositórios públicos.

### 2. Estrutura de Segurança

```
┌─────────────────┐
│   Frontend      │
│   (admin.html)  │  ← Sem credenciais sensíveis
└────────┬────────┘
         │
         │ HTTP Request
         ▼
┌─────────────────┐
│   Backend       │
│   (server.js)   │  ← Credenciais protegidas via .env
└────────┬────────┘
         │
         │ Authenticated Request
         ▼
┌─────────────────┐
│   Supabase      │
│   Storage       │
└─────────────────┘
```

### 3. Como Funciona o Upload Seguro

1. **Frontend** (`admin.html`):
   - Usuário seleciona arquivo PDF
   - Envia para `/api/upload-apresentacao` (backend)
   - **Não possui** `service_role_key`

2. **Backend** (`server.js`):
   - Recebe arquivo do frontend
   - Valida tipo, tamanho e segurança
   - Usa `service_role_key` do `.env` para autenticar com Supabase
   - Faz upload para Supabase Storage
   - Retorna resultado para o frontend

### 4. Iniciar o Servidor

```bash
# Desenvolvimento
npm run server

# Produção
npm start
```

O servidor rodará em `http://localhost:3000` e servirá tanto os arquivos estáticos quanto os endpoints da API.

### 5. Endpoints Disponíveis

- `POST /api/upload-apresentacao` - Upload seguro de PDF
- `GET /api/health` - Status do servidor

### 6. Validações de Segurança Implementadas

✅ **Validação de tipo de arquivo** - Apenas PDF permitido  
✅ **Validação de tamanho** - Máximo 50MB  
✅ **Credenciais protegidas** - Service key apenas no backend  
✅ **Variáveis de ambiente** - Nunca commitadas  
✅ **Tratamento de erros** - Sem exposição de detalhes sensíveis  
✅ **CORS configurado** - Proteção contra requisições não autorizadas  

### 7. Checklist de Segurança

Antes de fazer deploy:

- [ ] Arquivo `.env` criado e configurado
- [ ] `.env` está no `.gitignore`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` não está exposta no código frontend
- [ ] Servidor backend está rodando
- [ ] Endpoints da API estão funcionando
- [ ] CORS configurado corretamente para produção

### 8. Rotação de Credenciais

Se suas credenciais foram expostas:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Settings** → **API**
3. Clique em **Reset** na `service_role key`
4. Atualize o arquivo `.env` com a nova chave
5. Reinicie o servidor

### 9. Monitoramento

Monitore os logs do servidor para detectar:
- Tentativas de upload inválidas
- Erros de autenticação
- Requisições suspeitas

```bash
# Ver logs em tempo real
npm run server
```

### 10. Suporte

Para questões de segurança, entre em contato com o administrador do sistema.

---

**Última atualização:** 29/01/2026  
**Versão:** 1.0.0
