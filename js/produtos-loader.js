// Carrega produtos dinamicamente
document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
  inicializarFiltros();
});

function carregarProdutos() {
  // Petshop
  const petshopGrid = document.getElementById('petshop-products');
  if (petshopGrid) {
    petshopGrid.innerHTML = produtos.petshop.map((p, i) => criarCardProduto(p, i + 1)).join('');
  }

  // Mercearia
  const mercearia = document.getElementById('mercearia-products');
  if (mercearia) {
    mercearia.innerHTML = produtos.mercearia.map((p, i) => criarCardProduto(p, i + 1)).join('');
  }

  // Lanches
  const lanches = document.getElementById('lanches-products');
  if (lanches) {
    lanches.innerHTML = produtos.lanches.map((p, i) => criarCardProduto(p, i + 1)).join('');
  }

  // Reanexa eventos aos botões
  document.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      if (!card) return;
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseFloat(card.dataset.price);
      addToCart({ id, name, price });
      animateAddToCart(card);
      animateCartCount();
    });
  });
}

function criarCardProduto(produto, index) {
  // Define o estilo da imagem ou usa um ícone padrão se não houver imagem
  const imageStyle = produto.image 
    ? `style="background-image: url('${produto.image}'); background-size: cover; background-position: center;"` 
    : '';
  
  // Define um ícone padrão caso não tenha imagem
  const placeholderIcon = produto.image ? '' : '🛍️';
  
  return `
    <div class="product-card" data-id="${produto.id}" data-name="${produto.name}" data-price="${produto.price}">
      <div class="product-card__image" ${imageStyle}>
        ${placeholderIcon}
      </div>
      <div class="product-card__body">
        <h3 class="product-card__title">${produto.name}</h3>
        <p class="product-card__desc">${produto.desc}</p>
        <div class="product-card__footer">
          <span class="product-card__price">R$ ${produto.price}</span>
          <button class="btn btn--primary add-to-cart">Adicionar</button>
        </div>
      </div>
    </div>
  `;
}

function inicializarFiltros() {
  // Mostra todas as seções inicialmente
  document.querySelectorAll('.category-section').forEach(section => {
    section.style.display = 'block';
    section.classList.add('fade-in');
  });
}
