const CART_KEY = "glowsip_cart_v1";

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}
function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
}

function addToCart(product, variant) {
  const cart = loadCart();
  const key = `${product.id}__${variant}`;
  const existing = cart.find(i => i.key === key);

  if (existing) existing.qty += 1;
  else cart.push({
    key,
    id: product.id,
    name: product.name,
    variant,
    price: product.price,
    qty: 1,
  });

  saveCart(cart);
  return cart;
}

function updateQty(itemKey, delta) {
  const cart = loadCart();
  const item = cart.find(i => i.key === itemKey);
  if (!item) return cart;

  item.qty += delta;
  const next = cart.filter(i => i.qty > 0);
  saveCart(next);
  return next;
}

function removeItem(itemKey) {
  const cart = loadCart().filter(i => i.key !== itemKey);
  saveCart(cart);
  return cart;
}

function clearCart() {
  saveCart([]);
  return [];
}
