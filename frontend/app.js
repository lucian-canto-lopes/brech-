// Estado
const state = {
  products: [],
  filtered: [],
};

// Elementos essenciais
const els = {
  grid: document.getElementById('productGrid'),
  empty: document.getElementById('emptyState'),
  searchInput: document.getElementById('searchInput'),
  categorySelect: document.getElementById('categorySelect'),
};

// Helpers
function money(v){
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// API
async function fetchProducts(){
  try {
    const params = new URLSearchParams();
    const term = els.searchInput?.value?.trim?.() || '';
    const category = els.categorySelect?.value || '';
    if (term) params.set('term', term);
    if (category) params.set('category', category);

    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) throw new Error('Falha ao carregar produtos');
    const data = await res.json();
    state.products = data;
    state.filtered = data;
    renderGrid();
  } catch (e) {
    console.error(e);
    if (els.empty){
      els.empty.hidden = false;
      els.empty.textContent = 'Erro ao carregar produtos.';
    }
  }
}

// Renderização (sem botão "Adicionar" e sem carrinho)
function renderGrid(){
  const list = state.filtered;
  if (!els.grid) return;
  els.grid.innerHTML = '';
  if (els.empty) els.empty.hidden = list.length > 0;
  if (list.length === 0) return;

  for (const p of list){
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/600x800?text=Sem+Imagem'" />
      <div class="card-body">
        <h4 class="title">${p.name}</h4>
        <div class="muted">${p.category} • ${p.condition}</div>
        <div class="row">
          <span class="price">${money(p.price)}</span>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" data-action="toggle">Detalhes</button>
        </div>
        <div class="details" hidden>
          <p class="muted">${p.description || ''}</p>
          <div class="kvs">
            <span><strong>Categoria:</strong> ${p.category || '-'}</span>
            <span><strong>Tamanho(s):</strong> ${(p.sizes || []).join(', ') || '-'}</span>
            <span><strong>Condição:</strong> ${p.condition || '-'}</span>
          </div>
        </div>
      </div>
    `;
    const toggleBtn = card.querySelector('button[data-action="toggle"]');
    const details = card.querySelector('.details');
    toggleBtn.addEventListener('click', () => { details.hidden = !details.hidden; });
    els.grid.appendChild(card);
  }
}

// Eventos (apenas filtros/pesquisa)
function wireUp(){
  els.searchInput?.addEventListener('input', debounce(fetchProducts, 250));
  els.categorySelect?.addEventListener('change', fetchProducts);
}

function debounce(fn, ms){
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(null,args), ms); };
}

// init
wireUp();
fetchProducts();
