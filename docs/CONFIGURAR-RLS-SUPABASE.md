# 🔐 Configurar RLS no Supabase - Bucket Apresentações

## 🚨 Erro Atual

```
Erro ao atualizar a apresentação: new row violates row-level security policy
```

**Causa**: O bucket `apresentacoes` tem Row-Level Security (RLS) ativado mas **não tem políticas** que permitam upload público.

---

## ✅ Solução - Criar Políticas Públicas

### Passo 1: Acessar Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Login com sua conta
3. Selecione o projeto: `rlaxbloitiknjikrpbim`

---

### Passo 2: Navegar para Storage

1. No menu lateral esquerdo, clique em **"Storage"**
2. Você verá a lista de buckets
3. Clique no bucket **"apresentacoes"**

---

### Passo 3: Configurar Políticas (Método 1 - Mais Simples)

#### Opção A: Desabilitar RLS (Mais Simples)

1. No bucket `apresentacoes`, clique em **"Policies"** (ou "Políticas")
2. Procure por um botão/toggle **"Disable RLS"** ou **"Public bucket"**
3. **Desative o RLS** para tornar o bucket completamente público

**OU**

#### Opção B: Criar Políticas Públicas (Recomendado)

Se quiser manter RLS ativo com políticas:

1. Clique em **"New Policy"** (Nova Política)
2. Escolha **"Custom"** (ou "For full customization")

**Criar 2 políticas**:

---

#### Política 1: Permitir SELECT (Leitura) para Todos

- **Policy name**: `Public Read`
- **Allowed operation**: `SELECT`
- **Target roles**: `public` (ou `anon`)
- **Policy definition**:
  ```sql
  true
  ```

**OU use o template "Enable read access for all users"**

---

#### Política 2: Permitir INSERT/UPDATE (Upload) para Todos

- **Policy name**: `Public Upload`
- **Allowed operation**: `INSERT` e `UPDATE` (marque ambos)
- **Target roles**: `public` (ou `anon`)
- **Policy definition**:
  ```sql
  true
  ```

**OU crie duas políticas separadas**:
- Uma para INSERT
- Outra para UPDATE

---

### Passo 4: Salvar e Testar

1. Clique em **"Review"** → **"Save policy"**
2. Volte para o site: https://elite-blindagens.vercel.app/admin.html
3. Tente fazer upload novamente

---

## 🎯 Resultado Esperado

Após configurar as políticas:

✅ Upload deve funcionar sem erro de RLS
✅ Console mostra: `[Elite] Upload concluído com sucesso`

---

## 🔍 Verificação Rápida

### Via Supabase Dashboard

1. Vá em **Storage** → **Policies**
2. Você deve ver as políticas criadas:
   - ✅ `Public Read` (SELECT para anon/public)
   - ✅ `Public Upload` (INSERT/UPDATE para anon/public)

**OU**

- ✅ RLS desabilitado (bucket público)

---

## 📸 Capturas de Tela (Referência)

Procure por:
- **"Storage"** no menu lateral
- **"Policies"** ou **"Políticas"** no bucket
- **"New Policy"** ou **"Nova Política"**
- **"Disable RLS"** ou **"Public bucket"**

---

## ⚠️ Notas de Segurança

**É seguro tornar o bucket público?**

✅ **SIM**, para este caso:
- O bucket só tem 2 arquivos (apresentação e manual)
- URLs são fixas (não expõe informações sensíveis)
- Apenas sobrescreve arquivos existentes (não cria novos)

Se quiser mais controle, use as políticas em vez de desabilitar RLS.

---

## 🚀 Após Configuração

1. Teste upload em: https://elite-blindagens.vercel.app/admin.html
2. Se funcionar: ✅ **SISTEMA PRONTO PARA PRODUÇÃO**
3. Se erro persistir: Me envie o novo erro do console

---

## 📞 Suporte

Se tiver dúvida ao configurar, tire um print da tela do Supabase Storage e me envie.
