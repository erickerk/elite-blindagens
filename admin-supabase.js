// ============================================
// ELITE BLINDAGENS - ADMIN SUPABASE INTEGRATION
// ============================================

// Funções auxiliares para Supabase REST API
async function supabaseSelect(table, options = {}) {
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
  if (options.order) url += `&order=${options.order}`;
  if (options.filter) url += `&${options.filter}`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  return response.json();
}

async function supabaseInsert(table, data) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

async function supabaseUpdate(table, id, data) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

async function supabaseDelete(table, id) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  return response.ok;
}

// ============================================
// E-MAILS (Supabase)
// ============================================
let emailsData = [];

async function loadEmails() {
  try {
    emailsData = await supabaseSelect('site_emails', { order: 'created_at.desc' });
    renderEmails();
  } catch (error) {
    console.error('Erro ao carregar emails:', error);
    emailsData = [];
    renderEmails();
  }
}

function renderEmails() {
  const table = document.getElementById('emails-table');
  const noEmails = document.getElementById('no-emails');

  if (emailsData.length === 0) {
    table.innerHTML = '';
    noEmails.classList.remove('hidden');
    return;
  }

  noEmails.classList.add('hidden');
  table.innerHTML = emailsData.map((email, i) => `
    <tr>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${i + 1}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${email.email}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(email.created_at).toLocaleDateString('pt-BR')}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm">
        <button onclick="deleteEmail('${email.id}')" class="text-red-500 hover:text-red-700"><i class="ri-delete-bin-line"></i></button>
      </td>
    </tr>
  `).join('');
}

async function deleteEmail(id) {
  if (!confirm('Tem certeza que deseja excluir este e-mail?')) return;
  await supabaseDelete('site_emails', id);
  loadEmails();
}

async function exportEmails() {
  if (emailsData.length === 0) {
    alert('Nenhum e-mail para exportar.');
    return;
  }

  let csv = 'E-mail,Data Cadastro\n';
  emailsData.forEach(e => {
    csv += `${e.email},${new Date(e.created_at).toLocaleDateString('pt-BR')}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'emails_elite_blindagens_' + new Date().toISOString().split('T')[0] + '.csv';
  link.click();
}

// ============================================
// DEPOIMENTOS (Supabase)
// ============================================
let depoimentosData = [];

async function loadDepoimentos() {
  try {
    depoimentosData = await supabaseSelect('site_depoimentos', { order: 'created_at.desc' });
    renderDepoimentos();
  } catch (error) {
    console.error('Erro ao carregar depoimentos:', error);
    depoimentosData = [];
    renderDepoimentos();
  }
}

function renderDepoimentos() {
  const grid = document.getElementById('depoimentos-grid');
  const noDepoimentos = document.getElementById('no-depoimentos');

  if (depoimentosData.length === 0) {
    grid.innerHTML = '';
    noDepoimentos.classList.remove('hidden');
    return;
  }

  noDepoimentos.classList.add('hidden');
  grid.innerHTML = depoimentosData.map((d) => `
    <div class="border rounded-xl p-4 hover:shadow-lg transition-all">
      <div class="flex items-center gap-3 mb-3">
        ${d.foto_url ? `<img src="${d.foto_url}" alt="${d.nome}" class="w-12 h-12 rounded-full object-cover" onerror="this.src='https://via.placeholder.com/48'">` : `<div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">${d.nome.charAt(0)}</div>`}
        <div>
          <h4 class="font-bold text-secondary">${d.nome}</h4>
          ${d.profissao ? `<p class="text-gray-500 text-sm">${d.profissao}</p>` : ''}
        </div>
      </div>
      <p class="text-gray-600 text-sm italic">"${d.texto}"</p>
      <div class="flex gap-2 mt-4">
        <button onclick="editDepoimento('${d.id}')" class="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 text-sm"><i class="ri-edit-line"></i> Editar</button>
        <button onclick="deleteDepoimento('${d.id}')" class="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 text-sm"><i class="ri-delete-bin-line"></i> Excluir</button>
      </div>
    </div>
  `).join('');
}

function openDepoimentoModal(id = null) {
  document.getElementById('depoimento-modal').classList.remove('hidden');
  document.getElementById('depoimento-form').reset();
  document.getElementById('depoimento-id').value = '';

  if (id) {
    const d = depoimentosData.find(dep => dep.id === id);
    if (d) {
      document.getElementById('depoimento-modal-title').textContent = 'Editar Depoimento';
      document.getElementById('depoimento-id').value = d.id;
      document.getElementById('depoimento-nome').value = d.nome;
      document.getElementById('depoimento-profissao').value = d.profissao || '';
      document.getElementById('depoimento-texto').value = d.texto;
      document.getElementById('depoimento-foto').value = d.foto_url || '';
    }
  } else {
    document.getElementById('depoimento-modal-title').textContent = 'Adicionar Depoimento';
  }
}

function closeDepoimentoModal() {
  document.getElementById('depoimento-modal').classList.add('hidden');
}

function editDepoimento(id) {
  openDepoimentoModal(id);
}

async function deleteDepoimento(id) {
  if (!confirm('Tem certeza que deseja excluir este depoimento?')) return;
  await supabaseDelete('site_depoimentos', id);
  loadDepoimentos();
}

async function saveDepoimento(e) {
  e.preventDefault();
  const id = document.getElementById('depoimento-id').value;
  const data = {
    nome: document.getElementById('depoimento-nome').value,
    profissao: document.getElementById('depoimento-profissao').value || null,
    texto: document.getElementById('depoimento-texto').value,
    foto_url: document.getElementById('depoimento-foto').value || null,
    updated_at: new Date().toISOString()
  };

  if (id) {
    await supabaseUpdate('site_depoimentos', id, data);
  } else {
    await supabaseInsert('site_depoimentos', data);
  }

  closeDepoimentoModal();
  loadDepoimentos();
}

// ============================================
// FAQ (Supabase)
// ============================================
let faqData = [];

async function loadFaqs() {
  try {
    faqData = await supabaseSelect('site_faq', { order: 'ordem.asc,created_at.desc' });
    renderFaqs();
  } catch (error) {
    console.error('Erro ao carregar FAQs:', error);
    faqData = [];
    renderFaqs();
  }
}

function renderFaqs() {
  const list = document.getElementById('faq-list');
  const noFaq = document.getElementById('no-faq');

  if (faqData.length === 0) {
    list.innerHTML = '';
    noFaq.classList.remove('hidden');
    return;
  }

  noFaq.classList.add('hidden');
  list.innerHTML = faqData.map((faq) => `
    <div class="border rounded-xl p-4 hover:shadow-md transition-all bg-white">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <h4 class="font-bold text-secondary mb-2">${faq.pergunta}</h4>
          <p class="text-gray-600 text-sm">${faq.resposta}</p>
        </div>
        <div class="flex gap-2">
          <button onclick="editFaq('${faq.id}')" class="text-blue-500 hover:text-blue-700"><i class="ri-edit-line"></i></button>
          <button onclick="deleteFaq('${faq.id}')" class="text-red-500 hover:text-red-700"><i class="ri-delete-bin-line"></i></button>
        </div>
      </div>
    </div>
  `).join('');
}

function openFaqModal(id = null) {
  document.getElementById('faq-modal').classList.remove('hidden');
  document.getElementById('faq-form').reset();
  document.getElementById('faq-id').value = '';

  if (id) {
    const faq = faqData.find(f => f.id === id);
    if (faq) {
      document.getElementById('faq-modal-title').textContent = 'Editar Pergunta';
      document.getElementById('faq-id').value = faq.id;
      document.getElementById('faq-pergunta').value = faq.pergunta;
      document.getElementById('faq-resposta').value = faq.resposta;
    }
  } else {
    document.getElementById('faq-modal-title').textContent = 'Adicionar Pergunta';
  }
}

function closeFaqModal() {
  document.getElementById('faq-modal').classList.add('hidden');
}

function editFaq(id) {
  openFaqModal(id);
}

async function deleteFaq(id) {
  if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return;
  await supabaseDelete('site_faq', id);
  loadFaqs();
}

async function saveFaq(e) {
  e.preventDefault();
  const id = document.getElementById('faq-id').value;
  const data = {
    pergunta: document.getElementById('faq-pergunta').value,
    resposta: document.getElementById('faq-resposta').value,
    updated_at: new Date().toISOString()
  };

  if (id) {
    await supabaseUpdate('site_faq', id, data);
  } else {
    data.ordem = faqData.length;
    await supabaseInsert('site_faq', data);
  }

  closeFaqModal();
  loadFaqs();
}

// ============================================
// CASES DE SUCESSO (Supabase)
// ============================================
let casesData = [];

async function loadCases() {
  try {
    casesData = await supabaseSelect('site_cases', { order: 'created_at.desc' });
    renderCases();
  } catch (error) {
    console.error('Erro ao carregar cases:', error);
    casesData = [];
    renderCases();
  }
}

function renderCases() {
  const grid = document.getElementById('cases-grid');
  const noCases = document.getElementById('no-cases');

  if (casesData.length === 0) {
    grid.innerHTML = '';
    noCases.classList.remove('hidden');
    return;
  }

  noCases.classList.add('hidden');
  grid.innerHTML = casesData.map((c) => `
    <div class="border rounded-xl overflow-hidden hover:shadow-lg transition-all">
      ${c.imagem_url ? `<img src="${c.imagem_url}" alt="${c.titulo}" class="w-full h-48 object-cover" onerror="this.src='https://via.placeholder.com/400x200?text=Case'">` : '<div class="w-full h-48 bg-gray-200 flex items-center justify-center"><i class="ri-shield-star-line text-4xl text-gray-400"></i></div>'}
      <div class="p-4">
        <h4 class="font-bold text-lg text-secondary">${c.titulo}</h4>
        ${c.descricao ? `<p class="text-gray-600 text-sm mt-2 line-clamp-2">${c.descricao}</p>` : ''}
        <div class="flex gap-2 mt-4">
          <button onclick="editCase('${c.id}')" class="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 text-sm"><i class="ri-edit-line"></i> Editar</button>
          <button onclick="deleteCase('${c.id}')" class="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 text-sm"><i class="ri-delete-bin-line"></i> Excluir</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openCaseModal(id = null) {
  document.getElementById('case-modal').classList.remove('hidden');
  document.getElementById('case-form').reset();
  document.getElementById('case-id').value = '';

  if (id) {
    const c = casesData.find(cs => cs.id === id);
    if (c) {
      document.getElementById('case-modal-title').textContent = 'Editar Case';
      document.getElementById('case-id').value = c.id;
      document.getElementById('case-titulo').value = c.titulo;
      document.getElementById('case-descricao').value = c.descricao || '';
      document.getElementById('case-imagem').value = c.imagem_url || '';
    }
  } else {
    document.getElementById('case-modal-title').textContent = 'Novo Case';
  }
}

function closeCaseModal() {
  document.getElementById('case-modal').classList.add('hidden');
}

function editCase(id) {
  openCaseModal(id);
}

async function deleteCase(id) {
  if (!confirm('Tem certeza que deseja excluir este case?')) return;
  await supabaseDelete('site_cases', id);
  loadCases();
}

async function saveCase(e) {
  e.preventDefault();
  const id = document.getElementById('case-id').value;
  const data = {
    titulo: document.getElementById('case-titulo').value,
    descricao: document.getElementById('case-descricao').value || null,
    imagem_url: document.getElementById('case-imagem').value || null,
    updated_at: new Date().toISOString()
  };

  if (id) {
    await supabaseUpdate('site_cases', id, data);
  } else {
    await supabaseInsert('site_cases', data);
  }

  closeCaseModal();
  loadCases();
}

// ============================================
// INICIALIZAÇÃO
// ============================================
function initAdminSupabase() {
  // Sobrescrever event listeners dos formulários
  document.getElementById('depoimento-form').addEventListener('submit', saveDepoimento);
  document.getElementById('faq-form').addEventListener('submit', saveFaq);
  document.getElementById('case-form').addEventListener('submit', saveCase);
  
  console.log('[Admin] Supabase integrado com sucesso');
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminSupabase);
} else {
  initAdminSupabase();
}
