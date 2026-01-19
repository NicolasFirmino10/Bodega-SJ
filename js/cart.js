const WHATSAPP_PHONE = "5585992140821";

// ================= ESTADO DO APP =================
let cart = [];

// Tenta carregar o carrinho do LocalStorage com tratamento de erro
try {
  const savedCart = localStorage.getItem("cart");
  cart = savedCart ? JSON.parse(savedCart) : [];
} catch (e) {
  console.error("Erro ao carregar carrinho:", e);
  cart = [];
}

// ================= SELETORES =================
const cartEl = document.getElementById("cart");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const cartCountEl = document.getElementById("cart-count");

const cartSectionItems = document.getElementById("cart-section-items");
const cartSectionAddress = document.getElementById("cart-section-address");

// ================= CARREGAMENTO DE PRODUTOS =================
function renderProducts() {
  if (typeof produtos === 'undefined') {
    console.error("Erro: O objeto 'produtos' não foi encontrado. Verifique o arquivo produtos.js");
    return;
  }

  const categories = ['petshop', 'mercearia', 'lanches'];
  
  categories.forEach(cat => {
    const grid = document.getElementById(`${cat}-products`);
    if (grid && produtos[cat]) {
      grid.innerHTML = produtos[cat].map(p => {
        const nome = p.name || p.nome || "Produto";
        const preco = Number(p.price || p.preco || 0);
        const descricao = p.desc || p.descricao || "";
        const id = p.id || Math.random().toString(36).substr(2, 9);
        const imagem = p.image || p.imagem || "";

        return `
        <div class="product-card" data-id="${id}" data-name="${nome}" data-price="${preco}">
          <div class="product-card__image" ${imagem ? `style="background-image: url('${imagem}'); background-size: cover;"` : ''}>
            ${!imagem ? '🛍️' : ''}
          </div>
          <div class="product-card__body">
            <h3 class="product-card__title">${nome}</h3>
            <p class="product-card__desc">${descricao}</p>
            <div class="product-card__footer">
              <span class="product-card__price">R$ ${preco.toFixed(2).replace('.', ',')}</span>
              <button class="btn btn--primary add-to-cart">Adicionar</button>
            </div>
          </div>
        </div>
      `}).join('');
    }
  });
}

// ================= LÓGICA DO CARRINHO =================
function addToCart(id, name, price) {
  const itemPrice = Number(price);
  const existingItem = cart.find(item => String(item.id) === String(id));

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: String(id),
      name: name,
      price: itemPrice,
      quantity: 1
    });
  }

  updateCartUI();
  // Opcional: abrir o carrinho ao adicionar item
  // toggleCart(true); 
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  
  if (cartCountEl) {
    cartCountEl.textContent = totalItems;
    cartCountEl.style.display = totalItems > 0 ? "inline-block" : "none";
  }

  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart__empty">Seu carrinho está vazio.</p>';
    cartTotalEl.textContent = "R$ 0,00";
  } else {
    cartItemsEl.innerHTML = cart.map(item => {
      const preco = Number(item.price || 0);
      const qtd = Number(item.quantity || 0);
      
      return `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item__info">
          <h3>${item.name || "Produto"}</h3>
          <span>R$ ${preco.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="cart-item__actions">
          <button class="cart-item__btn" data-action="decrease">-</button>
          <span>${qtd}</span>
          <button class="cart-item__btn" data-action="increase">+</button>
          <button class="cart-item__btn" data-action="remove">&times;</button>
        </div>
      </div>
    `}).join("");

    const totalValue = cart.reduce((sum, item) => {
      return sum + (Number(item.price || 0) * Number(item.quantity || 0));
    }, 0);
    
    cartTotalEl.textContent = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;
  }
  
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ================= FILTROS =================
function applyFilters() {
  const searchTerm = document.getElementById("search-input")?.value.toLowerCase() || "";
  const activeBtn = document.querySelector(".category-btn.active");
  const activeCat = activeBtn ? activeBtn.dataset.category : "all";
  
  document.querySelectorAll(".category-section").forEach(section => {
    const sectionCat = section.dataset.category;
    const cards = section.querySelectorAll(".product-card");
    let hasVisible = false;

    cards.forEach(card => {
      const name = card.dataset.name.toLowerCase();
      const matchesSearch = name.includes(searchTerm);
      const matchesCat = (activeCat === "all" || activeCat === sectionCat);

      if (matchesSearch && matchesCat) {
        card.style.display = "flex";
        hasVisible = true;
      } else {
        card.style.display = "none";
      }
    });

    section.style.display = hasVisible ? "block" : "none";
  });
}

// ================= EVENTOS (DELEGAÇÃO) =================
document.addEventListener("click", (e) => {
  // Botão Adicionar ao Carrinho (usando closest para capturar o botão mesmo se clicar no texto)
  const addBtn = e.target.closest(".add-to-cart");
  if (addBtn) {
    const card = addBtn.closest(".product-card");
    if (card) {
      addToCart(card.dataset.id, card.dataset.name, card.dataset.price);
    }
    return;
  }

  // Ações dentro do carrinho (+, -, remover)
  const cartBtn = e.target.closest(".cart-item__btn");
  if (cartBtn) {
    const action = cartBtn.dataset.action;
    const cartItem = cartBtn.closest(".cart-item");
    const id = cartItem.dataset.id;
    const index = cart.findIndex(i => String(i.id) === String(id));

    if (index !== -1) {
      if (action === "increase") cart[index].quantity++;
      else if (action === "decrease") {
        if (cart[index].quantity > 1) cart[index].quantity--;
        else cart.splice(index, 1);
      } else if (action === "remove") {
        cart.splice(index, 1);
      }
      updateCartUI();
    }
    return;
  }

  // Abrir/Fechar Carrinho
  if (e.target.closest(".cart-toggle")) {
    toggleCart(true);
  } else if (e.target.classList.contains("cart__close") || e.target.classList.contains("cart__overlay")) {
    toggleCart(false);
  }

  // Navegação do Carrinho
  if (e.target.id === "btn-next-address") {
    if (cart.length === 0) return alert("Carrinho vazio!");
    cartSectionItems.style.display = "none";
    cartSectionAddress.style.display = "block";
  }
  
  if (e.target.classList.contains("cart__back")) {
    cartSectionItems.style.display = "block";
    cartSectionAddress.style.display = "none";
  }

  // Filtros de Categoria
  const catBtn = e.target.closest(".category-btn");
  if (catBtn) {
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    catBtn.classList.add("active");
    applyFilters();
  }
});

// Busca em tempo real
document.getElementById("search-input")?.addEventListener("input", applyFilters);

// Submit do formulário de endereço
document.getElementById("address-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("customer-name").value.trim();
  const address = document.getElementById("address-input").value.trim();

  if (!name || !address) return alert("Por favor, preencha todos os campos.");

  let msg = `🛒 *NOVO PEDIDO - BODEGA SÃO JOSÉ*\n\n`;
  msg += `👤 *Cliente:* ${name}\n📍 *Endereço:* ${address}\n\n📦 *ITENS:*\n`;
  
  let total = 0;
  cart.forEach(i => {
    const subtotal = i.price * i.quantity;
    total += subtotal;
    msg += `• ${i.name} (${i.quantity}x) - R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
  });
  msg += `\n💰 *TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*`;

  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
  
  // Limpar carrinho após finalizar
  cart = [];
  updateCartUI();
  toggleCart(false);
  e.target.reset();
});

// Utilitários
function toggleCart(open) {
  if (cartEl) {
    cartEl.classList.toggle("cart--open", open);
    if (open) {
      cartSectionItems.style.display = "block";
      cartSectionAddress.style.display = "none";
    }
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartUI();
});