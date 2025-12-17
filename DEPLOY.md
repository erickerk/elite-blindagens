# Guia de Deploy - Elite Blindagens

## ✅ Repositório GitHub Configurado

**URL do Repositório:** <https://github.com/erickerk/elite-blindagens>

## 🚀 Workflow de Deploy Automático

### Alterações Locais → GitHub

Sempre que você fizer alterações no código local e quiser enviar para o GitHub:

```bash
# 1. Verificar status das alterações
git status

# 2. Adicionar arquivos modificados
git add .

# 3. Fazer commit com mensagem descritiva
git commit -m "Descrição da alteração"

# 4. Enviar para o GitHub
git push origin master
```

### Sincronização Automática

O Windsurf está conectado ao repositório Git. Qualquer alteração que você ou eu fizermos será rastreada automaticamente.

## 📝 Comandos Úteis

```bash
# Ver histórico de commits
git log --oneline

# Ver diferenças não commitadas
git diff

# Desfazer alterações não commitadas
git checkout -- nome-do-arquivo

# Ver arquivos modificados
git status
```

## Opções de Deploy

### 1. GitHub Pages (Gratuito)

- Acesse: Settings → Pages
- Source: Deploy from branch
- Branch: master → /root
- Seu site ficará em: `https://erickerk.github.io/elite-blindagens/`

### 2. Netlify (Recomendado - Gratuito)

- Conecte seu repositório GitHub
- Build settings: Nenhum (site estático)
- Deploy automático a cada push

### 3. Vercel (Gratuito)

- Conecte seu repositório GitHub
- Framework: Other
- Deploy automático a cada push

## Próximos Passos

1. Repositório criado e sincronizado
2. Código enviado para GitHub
3. Escolher plataforma de deploy (GitHub Pages/Netlify/Vercel)
4. Configurar deploy automático
5. Testar site em produção

---

**Última atualização:** 17/12/2025
