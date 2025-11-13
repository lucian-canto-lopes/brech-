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

// Modal de produto
let modalOverlay = null;
function openProductModal(product){
  if (!modalOverlay){
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'product-modal-overlay';
    document.body.appendChild(modalOverlay);
  }
  const sizes = (product.sizes || []).map(s => `<button type="button" class="size-btn" data-size="${s}">${s}</button>`).join('');
  modalOverlay.innerHTML = `
    <div class="product-modal">
      <button class="close-btn" aria-label="Fechar">✖</button>
      <div>
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div>
        <h3 class="title">${product.name}</h3>
        <div class="muted">${product.category} • ${product.condition}</div>
        <div class="price">${money(product.price)}</div>
        <p class="muted" style="margin:12px 0">${product.description || 'Sem descrição.'}</p>
        <div><strong style="color:#fff">Escolha o tamanho:</strong></div>
        <div class="sizes">${sizes}</div>
      </div>
    </div>
  `;
  modalOverlay.classList.add('active');
  
  // Tratamento de erro de imagem no modal
  const modalImg = modalOverlay.querySelector('img');
  modalImg.addEventListener('error', () => {
    modalImg.src = '/placeholder.png';
    modalImg.alt = 'Imagem não disponível';
  }, { once: true });
  
  // Fechar modal
  const closeBtn = modalOverlay.querySelector('.close-btn');
  closeBtn.addEventListener('click', closeProductModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeProductModal();
  });
  
  // Seleção de tamanho
  modalOverlay.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modalOverlay.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // ESC para fechar
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

function closeProductModal(){
  if (modalOverlay) modalOverlay.classList.remove('active');
}

// Renderização
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
      <img src="${p.image}" alt="${p.name}" />
      <div class="card-body">
        <h4 class="title">${p.name}</h4>
        <div class="muted">${p.category} • ${p.condition}</div>
        <div class="row">
          <span class="price">${money(p.price)}</span>
        </div>
      </div>
    `;
    const img = card.querySelector('img');
    img.addEventListener('error', () => {
      img.removeAttribute('onerror');
      img.src = '/placeholder.png';
      img.alt = 'Imagem não disponível';
      img.classList.add('no-image');
    }, { once: true });
    
    // Clique no card abre modal centralizado
    card.addEventListener('click', () => openProductModal(p));
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
