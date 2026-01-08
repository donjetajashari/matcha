
const productsGrid = document.getElementById("productsGrid");
const bestGrid = document.getElementById("bestSellersGrid");

const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const cartCountEl = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");

const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

const modalBackdrop = document.getElementById("modalBackdrop");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalContent = document.getElementById("modalContent");

const scrollBestBtn = document.getElementById("scrollBestBtn");

const reviewForm = document.getElementById("reviewForm");
const reviewsList = document.getElementById("reviewsList");


function money(n) {
  return `$${n.toFixed(2)}`;
}

function setCartUI(cart) {
  cartCountEl.textContent = cartCount(cart);
  cartTotalEl.textContent = money(cartTotal(cart));

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="muted">Your cart is empty. Add a drink ✨</p>`;
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-top">
        <div>
          <strong>${item.name}</strong><br/>
          <small>${item.variant}</small>
        </div>
        <div><strong>${money(item.price)}</strong></div>
      </div>

      <div class="qty-controls">
        <button class="btn ghost" data-action="dec" data-key="${item.key}">-</button>
        <button class="btn" disabled>${item.qty}</button>
        <button class="btn ghost" data-action="inc" data-key="${item.key}">+</button>
      </div>

      <button class="btn ghost w-full" style="margin-top:10px"
        data-action="remove" data-key="${item.key}">
        Remove
      </button>
    </div>
  `).join("");
}

function openCart() {
  cartDrawer.classList.add("show");
  cartDrawer.setAttribute("aria-hidden", "false");
}
function closeCart() {
  cartDrawer.classList.remove("show");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function openModal() {
  modalBackdrop.classList.add("show");
  modalBackdrop.setAttribute("aria-hidden", "false");
}
function closeModal() {
  modalBackdrop.classList.remove("show");
  modalBackdrop.setAttribute("aria-hidden", "true");
  modalContent.innerHTML = "";
}


function productCard(p) {
  return `
    <div class="card">
      <div class="card-top">
        <span class="tag">${p.category === "matcha" ? "🌿 Matcha" : "🧊 Iced Coffee"}</span>
        <span class="price">${money(p.price)}</span>
      </div>
      <h3>${p.name}</h3>
      <p class="muted">${p.desc}</p>
      <div class="card-actions">
        <button class="btn ghost" data-action="details" data-id="${p.id}">Details</button>
        <button class="btn primary" data-action="quickadd" data-id="${p.id}">Add</button>
      </div>
    </div>
  `;
}

function getFilteredProducts() {
  const cat = categoryFilter.value;
  const q = searchInput.value.trim().toLowerCase();
  const sort = sortSelect.value;

  let list = [...PRODUCTS];

  if (cat !== "all") list = list.filter(p => p.category === cat);
  if (q) list = list.filter(p =>
    (p.name + " " + p.desc).toLowerCase().includes(q)
  );

  if (sort === "low") list.sort((a,b) => a.price - b.price);
  else if (sort === "high") list.sort((a,b) => b.price - a.price);
  else list.sort((a,b) => b.popular - a.popular); 

  return list;
}

function renderProducts() {
  const list = getFilteredProducts();
  productsGrid.innerHTML = list.map(productCard).join("");
}

function renderBestSellers() {
  const list = [...PRODUCTS].sort((a,b) => b.popular - a.popular).slice(0,3);
  bestGrid.innerHTML = list.map(productCard).join("");
}


function renderModal(product) {
  let selected = product.options[0];

  modalContent.innerHTML = `
    <div class="modal-grid">
      <div class="fake-photo"></div>
      <div>
        <span class="tag">${product.category === "matcha" ? "🌿 Matcha" : "🧊 Iced Coffee"}</span>
        <h2 style="margin:10px 0 6px">${product.name}</h2>
        <p class="muted" style="margin:0 0 12px">${product.desc}</p>
        <p><strong>${money(product.price)}</strong></p>

        <p class="muted small" style="margin:12px 0 8px">Choose an option</p>
        <div class="option-row" id="optionRow">
          ${product.options.map((opt, idx) => `
            <div class="option ${idx === 0 ? "active" : ""}" data-opt="${opt}">
              ${opt}
            </div>
          `).join("")}
        </div>

        <button class="btn primary w-full" id="addFromModalBtn">Add to cart</button>
      </div>
    </div>
  `;

  const optionRow = document.getElementById("optionRow");
  optionRow.addEventListener("click", (e) => {
    const el = e.target.closest(".option");
    if (!el) return;
    selected = el.dataset.opt;

    [...optionRow.querySelectorAll(".option")].forEach(o => o.classList.remove("active"));
    el.classList.add("active");
  });

  document.getElementById("addFromModalBtn").addEventListener("click", () => {
    const cart = addToCart(product, selected);
    setCartUI(cart);
    closeModal();
    openCart();
  });
}


const REVIEWS_KEY = "glowsip_reviews_v1";
function loadReviews() {
  try { return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || []; }
  catch { return []; }
}
function saveReviews(list) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(list));
}
function stars(n) {
  const full = "★★★★★".slice(0, n);
  const empty = "☆☆☆☆☆".slice(0, 5 - n);
  return full + empty;
}
function renderReviews() {
  const list = loadReviews();
  if (list.length === 0) {
    reviewsList.innerHTML = `<p class="muted">No reviews yet. Be the first ✨</p>`;
    return;
  }
  reviewsList.innerHTML = list.slice().reverse().map(r => `
    <div class="review">
      <div class="row">
        <strong>${r.name}</strong>
        <span class="stars">${stars(r.rating)}</span>
      </div>
      <p class="muted" style="margin:8px 0 0">${r.text}</p>
    </div>
  `).join("");
}

function init() {
  renderBestSellers();
  renderProducts();

  const cart = loadCart();
  setCartUI(cart);

  renderReviews();
  initHeroSlider();
}

categoryFilter.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);
searchInput.addEventListener("input", renderProducts);

scrollBestBtn.addEventListener("click", () => {
  document.getElementById("best").scrollIntoView({ behavior: "smooth" });
});


document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === "details") {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    renderModal(p);
    openModal();
  }

  if (action === "quickadd") {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    const cart = addToCart(p, p.options[0]); 
    setCartUI(cart);
    openCart();
  }


  const key = btn.dataset.key;
  if (action === "inc") setCartUI(updateQty(key, +1));
  if (action === "dec") setCartUI(updateQty(key, -1));
  if (action === "remove") setCartUI(removeItem(key));
});


closeModalBtn.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeCart();
  }
});


openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);

clearCartBtn.addEventListener("click", () => {
  setCartUI(clearCart());
});

checkoutBtn.addEventListener("click", () => {
  alert("Checkout complete ✅ (demo)\nYour cart will be cleared.");
  setCartUI(clearCart());
  closeCart();
});


reviewForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("reviewName").value.trim();
  const rating = Number(document.getElementById("reviewRating").value);
  const text = document.getElementById("reviewText").value.trim();

  const list = loadReviews();
  list.push({ name, rating, text, ts: Date.now() });
  saveReviews(list);

  reviewForm.reset();
  renderReviews();
});

init();

const SLIDER_IMAGES = [
  'assets/mm2.jpg',
  'assets/mm1.jpg'
];

const SLIDER_COLORS = [
  'linear-gradient(180deg, rgba(124,255,178,.18), rgba(255,255,255,.03))',
  'linear-gradient(180deg, rgba(154,230,255,.14), rgba(255,255,255,.03))'
];

function initHeroSlider(){
  const imgEl = document.getElementById('sliderImage');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const dotsWrap = document.getElementById('sliderDots');
  if (!imgEl || !prevBtn || !nextBtn || !dotsWrap) return;

  let idx = 0;

  function renderDots(){
    try{
      dotsWrap.innerHTML = SLIDER_IMAGES.map((_, i) =>
        `<div class="slider-dot ${i===idx? 'active':''}" data-idx="${i}"></div>`
      ).join('');
      const dots = dotsWrap.querySelectorAll('.slider-dot');
      Array.from(dots || []).forEach(d => {
        d.addEventListener('click', (e) => {
          const target = e.currentTarget || e.target;
          const data = target && target.dataset && target.dataset.idx;
          if (typeof data === 'undefined') return;
          idx = Number(data);
          show();
        });
      });
    } catch (err) {
      console.error('renderDots error', err);
    }
  }

  const heroCard = document.querySelector('.hero-card');

  function show(){
    try{
      if (!SLIDER_IMAGES.length) return;
      imgEl.src = SLIDER_IMAGES[idx];
      Array.from(dotsWrap.children || []).forEach((d,i)=> d.classList.toggle('active', i===idx));
      if (heroCard) heroCard.style.background = SLIDER_COLORS[idx] || '';
    } catch(err){
      console.error('show slider error', err);
    }
  }

  prevBtn.addEventListener('click', () => {
    idx = (idx - 1 + SLIDER_IMAGES.length) % SLIDER_IMAGES.length;
    show();
  });
  nextBtn.addEventListener('click', () => {
    idx = (idx + 1) % SLIDER_IMAGES.length;
    show();
  });

  renderDots();
  show();

  let auto = setInterval(() => { try{ nextBtn.click(); }catch(e){} }, 5000);
  [imgEl, prevBtn, nextBtn, dotsWrap].forEach(el => {
    if (!el) return;
    el.addEventListener('mouseenter', () => { try{ clearInterval(auto); }catch(e){} });
    el.addEventListener('mouseleave', () => { try{ auto = setInterval(() => { nextBtn.click(); }, 5000); }catch(e){} });
  });
}
