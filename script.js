// ============================================
//   AMBA GEAR - Main JavaScript
// ============================================

// === HERO SLIDER ===
// Hero slider removed - now using single video background
function initSlider() {}

// === NAVBAR ===
function toggleMenu() {
  const links = document.getElementById('navLinks');
  const btn = document.getElementById('hamburger');
  if (!links || !btn) return;
  const isOpen = links.classList.toggle('open');
  btn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
}

function toggleSearch() {
  const bar = document.getElementById('searchBar');
  if (!bar) return;
  bar.classList.toggle('open');
  if (bar.classList.contains('open')) bar.querySelector('input')?.focus();
}

// Sticky navbar shadow
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  if (navLinks && hamburger && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
  }
});

// === NEWSLETTER ===
function subscribeNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  if (input) {
    alert(`Terima kasih! ${input.value} telah terdaftar untuk newsletter kami. 🎮`);
    input.value = '';
  }
}

// === LOGIN HANDLER ===
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  
  if (!email || !password) return;

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      alert(`Login berhasil! Selamat datang ${data.user.name}`);
      window.location.href = data.user.role === 'admin' ? 'admin.html' : 'index.html';
    } else {
      alert('Login gagal: ' + data.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// === CHECK LOGIN STATUS ===
function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const topbarRight = document.querySelector('.topbar-right');

  if (topbarRight) {
    if (token && user) {
      topbarRight.innerHTML = `
        <span>Welcome, ${user.name || user.email}!</span>
        <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
      `;
    } else {
      topbarRight.innerHTML = `
        <a href="kontak.html"><i class="fab fa-whatsapp"></i> Chat Admin</a>
        <a href="login.html"><i class="fas fa-user"></i> Sign In / Register</a>
      `;
    }
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  localStorage.removeItem('wishlist');
  alert('Logged out successfully!');
  window.location.reload();
}

// === SCROLL REVEAL ANIMATIONS ===
function revealOnScroll() {
  const elements = document.querySelectorAll('.benefit-item, .category-card, .product-card, .testi-card, .stat-box');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('reveal', 'visible');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

// === PRODUCT LOADING & DISPLAY ===
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

async function loadProducts() {
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return;

  try {
    const response = await fetch('http://127.0.0.1:5000/api/products');
    const data = await response.json();
    allProducts = Array.isArray(data) ? data : (data.products || []);

    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat');
    if (catParam) {
      filterProducts(catParam);
    } else {
      displayProducts(allProducts);
    }
  } catch (error) {
    console.error('Error loading products:', error);
    productsGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><p>Error loading products. Please try again later.</p></div>';
  }
}

function displayProducts(products) {
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return;

  if (!products || products.length === 0) {
    productsGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><p>No products found.</p></div>';
    return;
  }

  productsGrid.innerHTML = products.map(product => `
    <div class="product-card" data-cat="${product.category}" data-id="${product.id}">
      ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
      <div class="product-img">
        <img src="${product.image_url}" alt="${product.name}" />
      </div>
      <div class="product-info">
        <h4>${product.name}</h4>
        <p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:8px;">${product.description}</p>
        <div class="stars">${generateStars(product.rating || 5)} (${product.reviews_count || 0})</div>
        <div class="price">Rp${parseInt(product.price).toLocaleString('id-ID')}</div>
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button class="btn btn-primary" style="flex: 1;" onclick="viewProduct('${product.id}')">Detail</button>
          <button class="icon-btn" onclick="toggleWishlistItem('${product.id}')" style="width: 40px; height: 40px; border: 1px solid var(--card-border); border-radius: var(--radius);">
            <i class="fas fa-heart" style="color: var(--text-muted);"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  return '<i class="fas fa-star"></i>'.repeat(fullStars) + (hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : '') + '<i class="far fa-star"></i>'.repeat(emptyStars);
}

async function filterProducts(category) {
  if (!allProducts.length) await loadProducts();
  
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === category));

  const filtered = (category === 'all' || category === 'Semua') ? allProducts : allProducts.filter(p => p.category === category);
  displayProducts(filtered);
}

// === PRODUCT MODAL ===
function viewProduct(productId) {
  const product = allProducts.find(p => p.id == productId);
  if (!product) return;

  const modal = document.getElementById('productModal');
  const detail = document.getElementById('productDetail');
  if (!modal || !detail) return;

  detail.innerHTML = `
    <div class="product-detail-layout">
      <div class="detail-left">
        <div class="detail-image-box"><img src="${product.image_url}" alt="${product.name}" /></div>
      </div>
      <div class="detail-right">
        <div class="detail-header">
          <span class="detail-brand">${product.brand}</span>
          <h2 class="detail-title">${product.name}</h2>
          <div class="detail-price">Rp${parseInt(product.price).toLocaleString('id-ID')}</div>
        </div>
        <div class="detail-actions">
          <button class="btn btn-primary btn-lg" onclick="fastCheckout('${product.id}')" style="flex:1;">Beli</button>
          <button class="btn btn-secondary btn-lg" onclick="addToCart('${product.id}')" style="flex:1;"><i class="fas fa-shopping-cart"></i> Tambah</button>
        </div>
        <div class="detail-section"><h3>Deskripsi</h3><p>${product.description}</p></div>
        <div class="detail-section"><h3>Spesifikasi</h3>${product.specs || 'Tersedia di deskripsi.'}</div>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
  getOverlay().classList.add('open');
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) modal.style.display = 'none';
  getOverlay().classList.remove('open');
}

// === CART & WISHLIST LOGIC ===
function addToCart(productId) {
  const product = allProducts.find(p => p.id == productId);
  if (!product) return;
  const existing = cart.find(item => item.id == productId);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  updateCartDisplay();
  showToast(`${product.name} ditambahkan!`);
}

function toggleWishlistItem(productId) {
  const product = allProducts.find(p => p.id == productId);
  if (!product) return;
  const idx = wishlist.findIndex(item => item.id == productId);
  if (idx > -1) wishlist.splice(idx, 1);
  else wishlist.push(product);
  
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
  updateWishlistDisplay();
  showToast(idx > -1 ? 'Dihapus dari Wishlist' : 'Ditambahkan ke Wishlist');
}

function updateCartCount() {
  const el = document.getElementById('cartCount');
  if (el) {
    const count = cart.reduce((t, i) => t + i.quantity, 0);
    el.textContent = count;
    el.style.display = count > 0 ? 'block' : 'none';
  }
}

function updateWishlistCount() {
  const el = document.getElementById('wishlistCount');
  if (el) {
    el.textContent = wishlist.length;
    el.style.display = wishlist.length > 0 ? 'block' : 'none';
  }
}

// === SIDEBARS ===
function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = getOverlay();
  if (!sidebar) return;
  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  } else {
    updateCartDisplay();
    sidebar.classList.add('open');
    overlay.classList.add('open');
  }
}

function toggleWishlist() {
  const sidebar = document.getElementById('wishlistSidebar');
  const overlay = getOverlay();
  if (!sidebar) return;
  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  } else {
    updateWishlistDisplay();
    sidebar.classList.add('open');
    overlay.classList.add('open');
  }
}

function closeAllSidebars() {
  document.querySelectorAll('.sidebar').forEach(s => s.classList.remove('open'));
  const modal = document.getElementById('productModal');
  if (modal) modal.style.display = 'none';
  getOverlay().classList.remove('open');
}

function updateCartDisplay() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!container) return;

  if (!cart.length) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin: 40px 0;">Keranjang kosong</p>';
    if (totalEl) totalEl.style.display = 'none';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--card-border);">
      <img src="${item.image_url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius);" />
      <div style="flex: 1;">
        <h4 style="margin: 0;">${item.name}</h4>
        <p style="color: var(--text-muted);">Rp${parseInt(item.price).toLocaleString('id-ID')}</p>
        <div style="display: flex; align-items: center; gap: 10px;">
          <button onclick="updateQty('${item.id}', ${item.quantity-1})" style="color:white; background:var(--bg); border:1px solid var(--card-border);">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQty('${item.id}', ${item.quantity+1})" style="color:white; background:var(--bg); border:1px solid var(--card-border);">+</button>
        </div>
      </div>
      <button onclick="removeFromCart('${item.id}')" style="background:none; border:none; color:var(--text-muted);"><i class="fas fa-times"></i></button>
    </div>
  `).join('');

  const total = cart.reduce((s, i) => s + (parseInt(i.price) * i.quantity), 0);
  const priceEl = document.getElementById('totalPrice');
  if (priceEl) priceEl.textContent = `Rp${total.toLocaleString('id-ID')}`;
  if (totalEl) totalEl.style.display = 'block';
}

function updateWishlistDisplay() {
  const container = document.getElementById('wishlistItems');
  if (!container) return;
  if (!wishlist.length) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin: 40px 0;">Wishlist kosong</p>';
    return;
  }
  container.innerHTML = wishlist.map(item => `
    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--card-border);">
      <img src="${item.image_url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius);" />
      <div style="flex: 1;">
        <h4 style="margin: 0;">${item.name}</h4>
        <p style="color: var(--text-muted);">Rp${parseInt(item.price).toLocaleString('id-ID')}</p>
      </div>
      <button onclick="addToCart('${item.id}')" class="btn btn-primary" style="padding:5px 10px;">Add</button>
    </div>
  `).join('');
}

function updateQty(id, q) {
  if (q <= 0) removeFromCart(id);
  else {
    const item = cart.find(i => i.id == id);
    if (item) item.quantity = q;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
  }
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id != id);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  updateCartDisplay();
}

// === OVERLAY & TOAST ===
function getOverlay() {
  let overlay = document.getElementById('overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.className = 'overlay';
    overlay.onclick = closeAllSidebars;
    document.body.appendChild(overlay);
  }
  return overlay;
}

function showToast(msg) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.style.cssText = 'background: var(--card); color: white; padding: 16px 24px; border-radius: var(--radius); border-left: 4px solid var(--pink); box-shadow: 0 10px 20px rgba(0,0,0,0.3); font-weight: 500; transition: all 0.3s ease; display: flex; align-items: center; gap: 12px;';
  toast.innerHTML = `<i class="fas fa-check-circle" style="color: var(--pink);"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function checkout() {
  const total = cart.reduce((s, i) => s + (parseInt(i.price) * i.quantity), 0);
  const text = encodeURIComponent(`Halo AMBA GEAR! Saya ingin checkout:\n\n${cart.map(i => `${i.name} x${i.quantity}`).join('\n')}\n\nTotal: Rp${total.toLocaleString('id-ID')}`);
  window.open(`https://wa.me/6283896431050?text=${text}`, '_blank');
}

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  revealOnScroll();
  checkLoginStatus();
  loadProducts();
  updateCartCount();
  updateWishlistCount();
});

function fastCheckout(id) {
  const p = allProducts.find(x => x.id == id);
  if (p) window.open(`https://wa.me/6283896431050?text=Order: ${p.name}`, '_blank');
}

// === NEWSLETTER ===
function subscribeNewsletter(event) {
  event.preventDefault();
  const input = event.target.querySelector('input');
  const email = input.value;
  
  if (email) {
    alert(`Terima kasih! Email ${email} telah terdaftar untuk promo eksklusif.`);
    input.value = '';
  }
}