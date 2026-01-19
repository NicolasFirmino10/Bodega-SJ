const WHATSAPP_PHONE = "5585992140821";

// ================= ESTADO =================
let cart = [];

try {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
} catch {
  cart = [];
  localStorage.removeItem("cart");
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ================= ELEMENTOS =================
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

// ================= CONTADOR =================
function updateCartCount() {
  if (!cartCountEl) return;

  const total = cart.reduce((s, i) => s + i.quantity, 0);
  cartCountEl.textContent = total;
  cartCountEl.style.display = total > 0 ? "inline-block" : "none";
}

// ================= UI DO CARRINHO =================
function updateCartUI() {
  updateCartCount();

  if (!cartItemsEl || !cartTotalEl) return;

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

// ================= AÇÕES DO CARRINHO =================
function addToCart(product) {
  const existing = cart.find((i) => i.id === product.id);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });

  saveCart();
  updateCartUI();
  animateCartCount();
}

// ================= EVENTOS DO CARRINHO =================
if (cartToggleBtn && cartEl)
  cartToggleBtn.addEventListener("click", () => toggleCart(true));

if (cartCloseBtn && cartEl)
  cartCloseBtn.addEventListener("click", () => toggleCart(false));

if (cartOverlay && cartEl)
  cartOverlay.addEventListener("click", () => toggleCart(false));

if (btnNextAddress)
  btnNextAddress.addEventListener("click", () => {
    if (!cart.length) return alert("Seu carrinho está vazio.");
    showAddressSection();
  });

if (btnBack)
  btnBack.addEventListener("click", () => {
    showItemsSection();
    document.getElementById("address-input").value = "";
  });

if (addressForm)
  addressForm.addEventListener("submit", (e) => {
    e.preventDefault();
    finalizarPedido();
  });

// ================= FINALIZAÇÃO =================
function finalizarPedido() {
  if (!cart.length) return alert("Seu carrinho está vazio.");

  const name = document.getElementById("customer-name")?.value.trim();
  const address = document.getElementById("address-input")?.value.trim();

  if (!name || !address)
    return alert("Preencha nome e endereço.");

  sendToWhatsApp(name, address);
  toggleCart(false);
}

function sendToWhatsApp(name, address) {
  let msg = `🛒 *NOVO PEDIDO - BODEGA SÃO JOSÉ*\n\n`;
  msg += `👤 *Cliente:* ${name}\n📍 *Endereço:* ${address}\n\n📦 *ITENS:*\n`;

  let total = 0;
  cart.forEach((i) => {
    total += i.price * i.quantity;
    msg += `${i.name}\n  └─ ${i.quantity}x ${formatCurrency(i.price)}\n`;
  });

  msg += `\n💰 *TOTAL:* ${formatCurrency(total)}`;

  window.open(
    `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );

  cart = [];
  saveCart();
  updateCartUI();
}

// ================= FILTROS =================
function initializeCategoryFilters() {
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".category-btn")
        .forEach((b) => b.classList.remove("active"));

      btn.classList.add("active");
      applyFilters();
    });
  });
}

function initializeSearchBar() {
  const input = document.getElementById("search-input");
  if (!input) return;

  input.addEventListener("input", applyFilters);
}

function applyFilters() {
  const search =
    document.getElementById("search-input")?.value.toLowerCase() || "";

  const category =
    document.querySelector(".category-btn.active")?.dataset.category || "all";

  document.querySelectorAll(".category-section").forEach((section) => {
    let visible = false;

    section.querySelectorAll(".product-card").forEach((card) => {
      const name = card.dataset.name.toLowerCase();
      const matchesSearch = name.includes(search);
      const matchesCategory =
        category === "all" || section.dataset.category === category;

      const show = matchesSearch && matchesCategory;
      card.style.display = show ? "" : "none";
      if (show) visible = true;
    });

    section.style.display = visible ? "block" : "none";
  });
}

// ================= UTIL =================
function toggleCart(open) {
  if (cartEl) cartEl.classList.toggle("cart--open", open);
}

function showItemsSection() {
  if (!cartSectionItems || !cartSectionAddress) return;
  cartSectionItems.style.display = "block";
  cartSectionAddress.style.display = "none";
}

function showAddressSection() {
  if (!cartSectionItems || !cartSectionAddress) return;
  cartSectionItems.style.display = "none";
  cartSectionAddress.style.display = "block";
  document.getElementById("customer-name")?.focus();
}

function formatCurrency(v) {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function animateCartCount() {
  if (!cartCountEl) return;
  cartCountEl.classList.remove("cart-toggle__count--bump");
  void cartCountEl.offsetWidth;
  cartCountEl.classList.add("cart-toggle__count--bump");
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();
  initializeCategoryFilters();
  initializeSearchBar();
});
