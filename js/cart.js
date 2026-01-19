
const WHATSAPP_PHONE = "5585992140821";

let cart = [];

try {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
} catch (e) {
  cart = [];
  localStorage.removeItem("cart");
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

const cartCountEl = document.getElementById("cart-count");
const cartEl = document.getElementById("cart");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");

const cartToggleBtn = document.querySelector(".cart-toggle");
const cartCloseBtn = document.querySelector(".cart__close");
const cartOverlay = document.querySelector(".cart__overlay");

// Botões de navegação entre seções
const btnNextAddress = document.getElementById("btn-next-address");
const btnBack = document.querySelector(".cart__back");
const addressForm = document.getElementById("address-form");

// Seções do carrinho
const cartSectionItems = document.getElementById("cart-section-items");
const cartSectionAddress = document.getElementById("cart-section-address");

// EVENTOS BÁSICOS
cartToggleBtn.addEventListener("click", () => toggleCart(true));
cartCloseBtn.addEventListener("click", () => toggleCart(false));
cartOverlay.addEventListener("click", () => toggleCart(false));

// Eventos de navegação entre seções
btnNextAddress.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }
  showAddressSection();
});

btnBack.addEventListener("click", () => {
  showItemsSection();
  document.getElementById("address-input").value = "";
});

// Enviar formulário de endereço
addressForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const customerName = document.getElementById("customer-name").value.trim();
  const address = document.getElementById("address-input").value.trim();
  
  if (!customerName) {
    alert("Por favor, preencha seu nome.");
    return;
  }
  
  if (!address) {
    alert("Por favor, preencha seu endereço.");
    return;
  }

  sendToWhatsApp(customerName, address);
  toggleCart(false);
});

// Filtros de categoria - Inicializar quando DOM estiver pronto
function initializeCategoryFilters() {
  const buttons = document.querySelectorAll(".category-btn");
  console.log("Botões de categoria encontrados:", buttons.length);
  
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      console.log("Filtro clicado:", category);
      filterProducts(category);
      
      // Atualiza botão ativo
      document.querySelectorAll(".category-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      console.log("Botão ativo agora:", category);
    });
  });
}

// Inicializar barra de busca
function initializeSearchBar() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;
  
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    filterBySearch(searchTerm);
  });
}

// Garantir que os filtros sejam inicializados quando o documento estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeCategoryFilters();
    initializeSearchBar();
    updateCartUI();
  });
} else {
  initializeCategoryFilters();
  initializeSearchBar();
  updateCartUI(); 
}

// Adicionar ao carrinho
document.querySelectorAll(".add-to-cart").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".product-card");
    if (!card) return;

    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);

    addToCart({ id, name, price });
    animateAddToCart(card);
    animateCartCount();
  });
});

// Ações dentro do carrinho (delegação de eventos)
cartItemsEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".cart-item__btn");
  if (!btn) return;

  const action = btn.dataset.action;
  const itemEl = btn.closest(".cart-item");
  const id = itemEl?.dataset.id;
  if (!id) return;

  const item = cart.find((i) => i.id === id);
  if (!item) return;

  if (action === "increase") {
    item.quantity++;
  } else if (action === "decrease") {
    item.quantity--;
    if (item.quantity <= 0) {
      const index = cart.findIndex((i) => i.id === id);
      if (index > -1) cart.splice(index, 1);
    }
  } else if (action === "remove") {
    const index = cart.findIndex((i) => i.id === id);
    if (index > -1) cart.splice(index, 1);
  }
   saveCart();  
  updateCartUI();
});

// FUNÇÕES
function showItemsSection() {
  cartSectionItems.style.display = "block";
  cartSectionAddress.style.display = "none";
}

function showAddressSection() {
  cartSectionItems.style.display = "none";
  cartSectionAddress.style.display = "block";
  document.getElementById("customer-name").focus();
}

function sendToWhatsApp(customerName, address) {
  if (!WHATSAPP_PHONE || WHATSAPP_PHONE === "5599999999999") {
    alert("Configure o número de WhatsApp no arquivo script.js.");
    return;
  }

  let message = `*NOVO PEDIDO - BODEGA SÃO JOSÉ*\n\n`;
  message += `*Cliente:* ${customerName}\n`;
  message += `*Endereço:* ${address}\n\n`;
  message += `ITENS DO PEDIDO:\n`;

  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.quantity;
    message += `${item.name}\n`;
    message += `  └─ *${item.quantity}x* ${formatCurrency(item.price)}\n`;
  });

  message += `\n*TOTAL:* ${formatCurrency(total)}`;

  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

  // 🔴 ISSO É O QUE ESTAVA FALTANDO
  window.open(url, "_blank");

  if (confirm("Pedido enviado! Deseja limpar o carrinho?")) {
    cart.length = 0;
    saveCart();
    updateCartUI();
  }
}


function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = totalQty;

  if (cart.length === 0) {
    cartItemsEl.innerHTML =
      '<p class="cart__empty">Seu carrinho está vazio.</p>';
    cartTotalEl.textContent = "R$ 0,00";
    return;
  }

  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item__info">
          <h3>${item.name}</h3>
          <span>${formatCurrency(item.price)}</span>
        </div>
        <div class="cart-item__actions">
          <button class="cart-item__btn cart-item__btn--qty" data-action="decrease">-</button>
          <span class="cart-item__qty">${item.quantity}</span>
          <button class="cart-item__btn cart-item__btn--qty" data-action="increase">+</button>
          <button class="cart-item__btn cart-item__btn--remove" data-action="remove">&times;</button>
        </div>
      </div>
    `
    )
    .join("");

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  cartTotalEl.textContent = formatCurrency(total);
}

function toggleCart(open) {
  if (open) {
    cartEl.classList.add("cart--open");
  } else {
    cartEl.classList.remove("cart--open");
  }
}

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Animações extras
function animateAddToCart(card) {
  card.classList.remove("product-card--bump");
  void card.offsetWidth; // força reflow para reiniciar animação
  card.classList.add("product-card--bump");
}

function animateCartCount() {
  cartCountEl.classList.remove("cart-toggle__count--bump");
  void cartCountEl.offsetWidth;
  cartCountEl.classList.add("cart-toggle__count--bump");
}

function filterProducts(category) {
  console.log("filterProducts chamado com categoria:", category);
  const sections = document.querySelectorAll(".category-section");
  const allProducts = document.querySelectorAll(".product-card");
  
  console.log("Seções encontradas:", sections.length, "Produtos encontrados:", allProducts.length);
  
  let targetSection = null;
  
  // Primeiro, mostra/oculta as seções baseado na categoria
  sections.forEach((section) => {
    const sectionCategory = section.dataset.category;
    console.log("Verificando seção:", sectionCategory, "vs", category);
    
    // Remove fade-in primeiro
    section.classList.remove("fade-in");
    
    if (category === "all") {
      console.log("Mostrando seção 'all':", sectionCategory);
      section.style.display = "block";
      setTimeout(() => section.classList.add("fade-in"), 10);
      if (!targetSection) targetSection = section;
    } else if (sectionCategory === category) {
      console.log("Mostrando seção correspondente:", sectionCategory);
      section.style.display = "block";
      setTimeout(() => section.classList.add("fade-in"), 10);
      targetSection = section;
    } else {
      console.log("Ocultando seção:", sectionCategory);
      setTimeout(() => section.style.display = "none", 300);
    }
  });

  // Depois, mostra/oculta os produtos baseado na categoria
  allProducts.forEach(card => {
    const section = card.closest(".category-section");
    if (!section) return;
    
    const sectionCategory = section.dataset.category;
    
    if (category === "all") {
      card.style.display = "";
    } else if (sectionCategory === category) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });

  // Se há um termo de busca, aplica o filtro de busca também após a animação
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    setTimeout(() => {
      const searchTerm = searchInput.value.trim().toLowerCase();
      if (searchTerm && typeof filterBySearch === 'function') {
        filterBySearch(searchTerm);
      }
    }, 350);
  }
  
  // Scroll suave para o topo da página (onde estão os filtros)
  if (targetSection) {
    setTimeout(() => {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }, 100);
  }
}

// Função para filtrar produtos por busca de nome
function filterBySearch(searchTerm) {
  const allProducts = document.querySelectorAll(".product-card");
  const categorySections = document.querySelectorAll(".category-section");
  
  if (!searchTerm) {
    // Se não há termo de busca, mostra todos os produtos
    allProducts.forEach(card => {
      card.style.display = "";
    });
    // Reaplica o filtro de categoria atual
    const activeCategory = document.querySelector(".category-btn.active")?.dataset.category || "all";
    filterProducts(activeCategory);
    return;
  }

  let hasVisibleProducts = false;

  allProducts.forEach(card => {
    const productName = card.dataset.name.toLowerCase();
    const matches = productName.includes(searchTerm);
    
    if (matches) {
      card.style.display = "";
      hasVisibleProducts = true;
    } else {
      card.style.display = "none";
    }
  });

  // Mostrar/ocultar seções de categoria baseado se há produtos visíveis
  categorySections.forEach(section => {
    const visibleCards = Array.from(section.querySelectorAll(".product-card")).filter(
      card => card.style.display !== "none"
    );
    
    if (visibleCards.length > 0) {
      section.style.display = "block";
    } else {
      section.style.display = "none";
    }
  });

  // Mostrar mensagem se nenhum produto foi encontrado
  if (!hasVisibleProducts) {
    const existingMessage = document.getElementById("no-results-message");
    if (existingMessage) existingMessage.remove();
    
    const message = document.createElement("p");
    message.id = "no-results-message";
    message.style.cssText = `
      text-align: center;
      color: var(--muted);
      padding: 2rem;
      font-size: 1.1rem;
    `;
    message.textContent = `Nenhum produto encontrado para "${searchTerm}"`;
    
    const productsSection = document.getElementById("produtos");
    const categoryFilters = productsSection.querySelector(".category-filters");
    categoryFilters.parentNode.insertBefore(message, categoryFilters.nextSibling);
  } else {
    const existingMessage = document.getElementById("no-results-message");
    if (existingMessage) existingMessage.remove();
  }
}
