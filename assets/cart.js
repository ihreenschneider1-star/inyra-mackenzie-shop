// ============================================================
// WARENKORB — Zustand liegt im localStorage des Browsers.
// Der eigentliche Bezahlvorgang läuft über /api/create-checkout-session,
// die Stripe Checkout aufruft (echte Zahlungsabwicklung).
// ============================================================

const CART_KEY = "inyra_cart_v1";
let PRODUCTS = [];

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function addToCart(productId) {
  const cart = getCart();
  if (!cart.includes(productId)) {
    cart.push(productId);
    saveCart(cart);
    showToast("Zum Warenkorb hinzugefügt");
  } else {
    showToast("Ist schon im Warenkorb");
  }
}

function removeFromCart(productId) {
  saveCart(getCart().filter((id) => id !== productId));
}

function formatPrice(cents, currency) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderCart() {
  const cart = getCart();
  const itemsEl = document.getElementById("cart-items");
  const countEl = document.getElementById("cart-count");
  const totalEl = document.getElementById("cart-total-amount");
  if (!itemsEl) return;

  countEl.textContent = cart.length;
  countEl.style.display = cart.length ? "flex" : "none";

  if (!cart.length) {
    itemsEl.innerHTML = '<p class="cart-empty">Dein Warenkorb ist noch leer.</p>';
    totalEl.textContent = formatPrice(0, "eur");
    return;
  }

  let total = 0;
  itemsEl.innerHTML = cart
    .map((id) => {
      const p = PRODUCTS.find((prod) => prod.id === id);
      if (!p) return "";
      total += p.price;
      return `
        <div class="cart-item">
          <div>
            <div class="cart-item-title">${p.title}</div>
            <div style="color:var(--brass); font-family: var(--font-label); font-size:0.85rem;">${formatPrice(p.price, p.currency)}</div>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart('${id}')">Entfernen</button>
        </div>`;
    })
    .join("");
  totalEl.textContent = formatPrice(total, "eur");
}

function toggleCart(open) {
  document.getElementById("cart-drawer").classList.toggle("open", open);
  document.getElementById("cart-overlay").classList.toggle("open", open);
}

async function checkout() {
  const cart = getCart();
  if (!cart.length) return;
  const btn = document.getElementById("checkout-btn");
  btn.disabled = true;
  btn.textContent = "Einen Moment …";
  try {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: cart }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || "Unbekannter Fehler");
    }
  } catch (err) {
    showToast("Zahlung konnte nicht gestartet werden");
    btn.disabled = false;
    btn.textContent = "Zur Kasse";
  }
}

function renderBookGrid(filterCategory) {
  const grid = document.getElementById("book-grid");
  if (!grid) return;
  const list = filterCategory && filterCategory !== "Alle"
    ? PRODUCTS.filter((p) => p.category === filterCategory)
    : PRODUCTS;

  grid.innerHTML = list
    .map(
      (p) => `
    <article class="book-card">
      <img class="book-cover" src="${p.cover}" alt="Cover: ${p.title}" loading="lazy" />
      <div class="book-info">
        <span class="book-category">${p.category}</span>
        <h3 class="book-title">${p.title}</h3>
        <p class="book-author">${p.author}</p>
        <p class="book-blurb">${p.blurb}</p>
        <div class="book-footer">
          <span class="book-price">${formatPrice(p.price, p.currency)}</span>
          <button class="add-to-cart" onclick="addToCart('${p.id}')">In den Korb</button>
        </div>
      </div>
    </article>`
    )
    .join("");
}

function renderFilterBar() {
  const bar = document.getElementById("filter-bar");
  if (!bar) return;
  const categories = ["Alle", ...new Set(PRODUCTS.map((p) => p.category))];
  bar.innerHTML = categories
    .map(
      (c, i) =>
        `<button class="filter-chip ${i === 0 ? "active" : ""}" data-cat="${c}" onclick="selectFilter('${c}', this)">${c}</button>`
    )
    .join("");
}

function selectFilter(cat, el) {
  document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("active"));
  el.classList.add("active");
  renderBookGrid(cat);
}

async function initShop() {
  try {
    const res = await fetch("/data/products.json");
    PRODUCTS = await res.json();
  } catch {
    PRODUCTS = [];
  }
  renderFilterBar();
  renderBookGrid("Alle");
  renderCart();
}

document.addEventListener("DOMContentLoaded", initShop);
