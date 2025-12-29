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

  // Buscar fotos de um veículo (ordenadas, com capa primeiro)
  async getFotosVeiculo(vehicleId) {
    return this.fetch(`preowned_photos?vehicle_id=eq.${vehicleId}&select=*&order=is_cover.desc,sort_order.asc`)
  }

  // Buscar foto principal (capa) de um veículo
  async getFotoPrincipal(vehicleId) {
    const fotos = await this.fetch(`preowned_photos?vehicle_id=eq.${vehicleId}&is_cover=eq.true&select=photo_url&limit=1`)
    return fotos[0]?.photo_url || null
  }

  // Buscar veículos vendidos para relatório
  async getVeiculosVendidos() {
    return this.fetch('preowned_vehicles?status=eq.sold&select=*&order=sold_date.desc')
  }

  // Autenticar admin do site
  async autenticarAdmin(email, senha) {
    const admins = await this.fetch(`site_admin_users?email=eq.${encodeURIComponent(email)}&is_active=eq.true&select=*`)
    if (admins.length === 0) return null
    // Verificação de senha será feita no frontend com bcrypt.js
    return admins[0]
  }
}

// Instância global do cliente
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Função para formatar veículo do Supabase para o formato do site
function formatarVeiculoParaSite(veiculo, fotoPrincipal = null, todasFotos = []) {
  // Prioridade de imagem: 1) foto principal da galeria, 2) image_url do veículo, 3) fallback
  const imagemPrincipal = fotoPrincipal || veiculo.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'
  
  return {
    id: veiculo.id,
    titulo: `${veiculo.brand} ${veiculo.model} ${veiculo.year_model} Blindado`,
    categoria: veiculo.category || 'suv',
    preco: formatarPreco(veiculo.sale_price),
    precoNumerico: parseFloat(veiculo.sale_price) || 0,
    descricao: veiculo.description || `${veiculo.brand} ${veiculo.model} com blindagem nível ${veiculo.blinding_level || 'III-A'}. ${veiculo.features ? veiculo.features.join(', ') : 'Veículo em excelente estado.'}`,
    imagem: imagemPrincipal,
    fotos: todasFotos, // Array de todas as fotos para galeria
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

// Carregar veículos do Supabase com fotos
async function carregarVeiculosSupabase() {
  try {
    const veiculos = await supabase.getVeiculosPublicados()
    
    // Buscar fotos de cada veículo em paralelo
    const veiculosComFotos = await Promise.all(
      veiculos.map(async (veiculo) => {
        try {
          const fotos = await supabase.getFotosVeiculo(veiculo.id)
          const fotoPrincipal = fotos.find(f => f.is_cover)?.photo_url || fotos[0]?.photo_url || null
          const todasFotos = fotos.map(f => f.photo_url)
          return formatarVeiculoParaSite(veiculo, fotoPrincipal, todasFotos)
        } catch {
          return formatarVeiculoParaSite(veiculo)
        }
      })
    )
    
    return veiculosComFotos
  } catch (error) {
    console.error('Erro ao carregar veículos do Supabase:', error)
    return []
  }
}

// Exportar relatório de veículos vendidos em Excel/CSV
async function exportarRelatorioVendidos() {
  try {
    const veiculos = await supabase.getVeiculosVendidos()
    
    if (veiculos.length === 0) {
      alert('Nenhum veículo vendido para exportar.')
      return
    }
    
    // Criar CSV
    const headers = ['Marca', 'Modelo', 'Ano', 'Cor', 'KM', 'Nível Blindagem', 'Preço Compra', 'Preço Venda', 'Preço Vendido', 'Data Venda', 'Lucro']
    let csv = headers.join(';') + '\n'
    
    veiculos.forEach(v => {
      const lucro = (parseFloat(v.sold_price) || parseFloat(v.sale_price) || 0) - (parseFloat(v.purchase_price) || 0)
      const row = [
        v.brand || '',
        v.model || '',
        v.year_model || '',
        v.color || '',
        v.mileage || '',
        v.blinding_level || '',
        formatarPreco(v.purchase_price),
        formatarPreco(v.sale_price),
        formatarPreco(v.sold_price || v.sale_price),
        v.sold_date ? new Date(v.sold_date).toLocaleDateString('pt-BR') : '',
        formatarPreco(lucro)
      ]
      csv += row.join(';') + '\n'
    })
    
    // Download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `veiculos_vendidos_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    return veiculos.length
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    alert('Erro ao exportar relatório. Tente novamente.')
    return 0
  }
}

// Exportar para uso global
window.supabaseClient = supabase
window.carregarVeiculosSupabase = carregarVeiculosSupabase
window.formatarVeiculoParaSite = formatarVeiculoParaSite
window.exportarRelatorioVendidos = exportarRelatorioVendidos
window.SUPABASE_URL = SUPABASE_URL
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY

console.log('[Elite Site] Supabase configurado com sucesso')
