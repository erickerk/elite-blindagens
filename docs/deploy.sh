#!/bin/bash

# Elite Blindagens - Script de Deploy Automatizado
# Este script faz o deploy do site para a Vercel com todas as configurações necessárias

echo "🚀 Iniciando deploy do Elite Blindagens..."
echo ""

# Verificar se está logado na Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Você não está logado na Vercel."
    echo "Execute: vercel login"
    exit 1
fi

echo "✅ Usuário Vercel autenticado"
echo ""

# Fazer deploy para produção
echo "📦 Fazendo deploy para produção..."
vercel --prod --yes

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "⚠️  IMPORTANTE: Configure as variáveis de ambiente na Vercel:"
echo ""
echo "   SUPABASE_URL=https://rlaxbloitiknjikrpbim.supabase.co"
echo "   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key"
echo ""
echo "🔗 Acesse: https://vercel.com/dashboard"
echo ""
