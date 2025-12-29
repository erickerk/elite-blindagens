// Configuração do Supabase para Elite Blindagens Site
const SUPABASE_URL = 'https://rlaxbloitiknjikrpbim.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYXhibG9pdGlrbmppa3JwYmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MzQwNzcsImV4cCI6MjA4MjQxMDA3N30.pq550K7XirbU8QnKSNOaIvs9WD-wi6cLQbS0GlH_9o8'

// Cliente Supabase simplificado para o site
class SupabaseClient {
  constructor(url, key) {
    this.url = url
    this.key = key
    this.headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  }

  async fetch(endpoint, options = {}) {
    const response = await fetch(`${this.url}/rest/v1/${endpoint}`, {
      ...options,
      headers: { ...this.headers, ...options.headers }
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro na requisição')
    }
    return response.json()
  }

  // Buscar veículos publicados e disponíveis
  async getVeiculosDisponiveis() {
    return this.fetch('preowned_vehicles?is_published=eq.true&status=eq.available&select=*&order=created_at.desc')
  }

  // Buscar todos os veículos publicados (incluindo reservados)
  async getVeiculosPublicados() {
    return this.fetch('preowned_vehicles?is_published=eq.true&status=neq.sold&select=*&order=created_at.desc')
  }

  // Buscar veículo por ID
  async getVeiculoPorId(id) {
    const data = await this.fetch(`preowned_vehicles?id=eq.${id}&select=*`)
    return data[0] || null
  }
}

// Instância global do cliente
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Função para formatar veículo do Supabase para o formato do site
function formatarVeiculoParaSite(veiculo) {
  return {
    id: veiculo.id,
    titulo: `${veiculo.brand} ${veiculo.model} ${veiculo.year_model} Blindado`,
    categoria: veiculo.category || 'suv',
    preco: formatarPreco(veiculo.sale_price),
    precoNumerico: parseFloat(veiculo.sale_price) || 0,
    descricao: veiculo.description || `${veiculo.brand} ${veiculo.model} com blindagem nível ${veiculo.blinding_level || 'III-A'}. ${veiculo.features ? veiculo.features.join(', ') : 'Veículo em excelente estado.'}`,
    imagem: veiculo.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
    link: veiculo.external_link || '',
    date: veiculo.created_at,
    // Campos adicionais
    marca: veiculo.brand,
    modelo: veiculo.model,
    ano: veiculo.year_model,
    cor: veiculo.color,
    km: veiculo.mileage,
    combustivel: veiculo.fuel_type,
    cambio: veiculo.transmission,
    nivelBlindagem: veiculo.blinding_level,
    status: veiculo.status
  }
}

// Formatar preço em Real brasileiro
function formatarPreco(valor) {
  if (!valor) return 'Consulte'
  const numero = parseFloat(valor)
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Carregar veículos do Supabase
async function carregarVeiculosSupabase() {
  try {
    const veiculos = await supabase.getVeiculosPublicados()
    return veiculos.map(formatarVeiculoParaSite)
  } catch (error) {
    console.error('Erro ao carregar veículos do Supabase:', error)
    // Fallback para localStorage se Supabase falhar
    return JSON.parse(localStorage.getItem('elite_veiculos') || '[]')
  }
}

// Exportar para uso global
window.supabaseClient = supabase
window.carregarVeiculosSupabase = carregarVeiculosSupabase
window.formatarVeiculoParaSite = formatarVeiculoParaSite

console.log('[Elite Site] Supabase configurado com sucesso')
