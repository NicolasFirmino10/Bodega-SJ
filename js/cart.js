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

const btnNextAddress = document.getElementById("btn-next-address");
const btnBack = document.querySelector(".cart__back");
const addressForm = document.getElementById("address-form");

const cartSectionItems = document.getElementById("cart-section-items");
const cartSectionAddress = document.getElementById("cart-section-address");

// ================= EVENTOS BÁSICOS =================
cartToggleBtn.addEventListener("click", () => toggleCart(true));
cartCloseBtn.addEventListener("click", () => toggleCart(false));
cartOverlay.addEventListener("click", () => toggleCart(false));

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

// ================= FINALIZAÇÃO =================
addressForm.addEventListener("submit", (e) => {
  e.preventDefault();
  finalizarPedido();
});

document
  .getElementById("finalizar-whatsapp")
  .addEventListener("click", finalizarPedido);

function finalizarPedido() {
  if (cart.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  const customerName = document
    .getElementById("customer-name")
    .value.trim();

  const address = document
    .getElementById("address-input")
    .value.trim();

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
}

function sendToWhatsApp(customerName, address) {
  let message = `🛒 *NOVO PEDIDO - BODEGA SÃO JOSÉ*\n\n`;
  message += `👤 *Cliente:* ${customerName}\n`;
  message += `📍 *Endereço:* ${address}\n\n`;
  message += `📦 *ITENS DO PEDIDO:*\n`;

  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;
    message += `${item.name}\n`;
    message += `  └─ *${item.quantity}x* ${formatCurrency(item.price)}\n`;
  });

  message += `\n💰 *TOTAL:* ${formatCurrency(total)}`;

  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    message
  )}`;

  window.open(url, "_blank");

  cart = [];
  saveCart();
  updateCartUI();
}

// ================= CARRINHO =================
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

cartItemsEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".cart-item__btn");
  if (!btn) return;

  const action = btn.dataset.action;
  const itemEl = btn.closest(".cart-item");
  const id = itemEl?.dataset.id;
  if (!id) return;

  const item = cart.find((i) => i.id === id);
  if (!item) return;

  if (action === "increase") item.quantity++;
  if (action === "decrease") {
    item.quantity--;
    if (item.quantity <= 0)
      cart = cart.filter((i) => i.id !== id);
  }
  if (action === "remove")
    cart = cart.filter((i) => i.id !== id);

  saveCart();
  updateCartUI();
});

function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });

  saveCart();
  updateCartUI();
}

function updateCartUI() {
  cartCountEl.textContent = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

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
          <button class="cart-item__btn" data-action="decrease">-</button>
          <span>${item.quantity}</span>
          <button class="cart-item__btn" data-action="increase">+</button>
          <button class="cart-item__btn" data-action="remove">&times;</button>
        </div>
      </div>
    `
    )
    .join("");

  cartTotalEl.textContent = formatCurrency(
    cart.reduce((s, i) => s + i.price * i.quantity, 0)
  );
}

// ================= UI =================
function showItemsSection() {
  cartSectionItems.style.display = "block";
  cartSectionAddress.style.display = "none";
}

function showAddressSection() {
  cartSectionItems.style.display = "none";
  cartSectionAddress.style.display = "block";
  document.getElementById("customer-name").focus();
}

function toggleCart(open) {
  cartEl.classList.toggle("cart--open", open);
}

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function animateAddToCart(card) {
  card.classList.remove("product-card--bump");
  void card.offsetWidth;
  card.classList.add("product-card--bump");
}

function animateCartCount() {
  cartCountEl.classList.remove("cart-toggle__count--bump");
  void cartCountEl.offsetWidth;
  cartCountEl.classList.add("cart-toggle__count--bump");
}
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();
});