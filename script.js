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
  if (bar.classList.contains('open')) {
    const input = bar.querySelector('input');
    input?.focus();
    // Add enter key listener
    input.onkeyup = (e) => {
      if (e.key === 'Enter') performSearch();
    };
  }
}

function performSearch() {
  const input = document.querySelector('#searchBar input');
  if (!input) return;
  const query = input.value.trim();
  if (!query) return;

  // If on products page, filter locally. Otherwise, redirect.
  if (window.location.pathname.includes('produk.html')) {
    const filtered = allProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.brand.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    );
    displayProducts(filtered);
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  } else {
    window.location.href = `produk.html?search=${encodeURIComponent(query)}`;
  }
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

  // Fallback data if backend is offline
  const fallbackProducts = [
    { id: 1, name: 'Logitech G403 HERO', category: 'mouse', brand: 'Logitech', price: 699000, description: 'Gaming mouse dengan sensor HERO 25K.', rating: 4.8, reviews_count: 128, badge: 'HOT' },
    { id: 2, name: 'Rexus Daxa Air III', category: 'mouse', brand: 'Rexus', price: 599000, description: 'Mouse gaming ringan performa optimal.', rating: 4.6, reviews_count: 85 },
    { id: 3, name: 'HyperX Pulsefire Dart', category: 'mouse', brand: 'HyperX', price: 1399000, description: 'Mouse gaming wireless premium.', rating: 4.7, reviews_count: 92, badge: 'SALE' },
    { id: 4, name: 'Logitech G915 TKL', category: 'keyboard', brand: 'Logitech', price: 2499000, description: 'Mechanical keyboard wireless premium.', rating: 4.9, reviews_count: 156, badge: 'HOT' },
    { id: 5, name: 'Rexus Daiva', category: 'keyboard', brand: 'Rexus', price: 799000, description: 'Keyboard mekanikal kokoh RGB.', rating: 4.5, reviews_count: 64 },
    { id: 6, name: 'HyperX Alloy Origins', category: 'keyboard', brand: 'HyperX', price: 1299000, description: 'Mechanical keyboard gaming switch kustom.', rating: 4.8, reviews_count: 112 },
    { id: 7, name: 'Logitech G Pro X', category: 'headset', brand: 'Logitech', price: 1499000, description: 'Gaming headset teknologi Blue VO!CE.', rating: 4.8, reviews_count: 203 },
    { id: 8, name: 'Rexus Thundervox', category: 'headset', brand: 'Rexus', price: 499000, description: 'Headset gaming virtual 7.1 bass tebal.', rating: 4.4, reviews_count: 150, badge: 'SALE' },
    { id: 9, name: 'HyperX Cloud II', category: 'headset', brand: 'HyperX', price: 999000, description: 'Headset legendaris kenyamanan maksimal.', rating: 4.9, reviews_count: 310, badge: 'HOT' }
  ];

  try {
    const response = await fetch('http://127.0.0.1:5000/api/products');
    if (!response.ok) throw new Error('Server response not ok');
    const data = await response.json();
    allProducts = Array.isArray(data) ? data : (data.products || []);
  } catch (error) {
    console.warn('Backend offline, using fallback data. Error:', error);
    allProducts = fallbackProducts;
  }

  // ==========================================
  // PUSAT DATA PRODUK (Override/Enrichment)
  // ==========================================
  allProducts = allProducts.map(p => {
    const name = p.name || "";
    
    // --- MOUSE ---
    if (name.includes('G403 HERO')) {
      p.image_url = 'assets/logitech_g403_hero_tampak_atas-removebg.png';
      p.description = 'Didesain untuk kenyamanan, G403 dibuat berkontur dengan pegangan karet untuk kontrol tambahan. Sensor HERO 25K memungkinkanmu untuk menelusuri dengan sangat akurat.';
      p.specs = `<div class="specs-content"><div class="spec-group"><h4>Spesifikasi</h4><ul><li>Sensor: HERO 25K (25.600 DPI)</li><li>Berat: 87.3g</li><li>Report Rate: 1ms</li><li>RGB: LIGHTSYNC RGB</li></ul></div></div>`;
    } 
    else if (name.includes('Daxa Air III')) {
      p.name = 'DAXA Air IV Pro Wireless Gen 2';
      p.image_url = 'assets/rexus_daxa_air_3_tampak_atas-removebg.png';
      p.description = 'Mouse gaming Wireless Gen 2 dengan sensor Pixart PAW3395 26.000 DPI. Dilengkapi switch Kailh GM 8.0, baterai tahan lama ±44 jam, dan 4 pilihan casing eksklusif.';
      p.specs = `<div class="specs-content"><div class="spec-group"><h4>Fitur Utama</h4><ul><li>Sensor: Pixart PAW3395 (26.000 DPI)</li><li>Switch: Kailh GM 8.0 (80jt Klik)</li><li>Berat: 66 gram</li><li>Baterai: 300mAh (±44 jam)</li></ul></div></div>`;
    }
    else if (name.includes('Pulsefire Dart')) {
      p.image_url = 'assets/hyperx_pulsefire_dart_top_view-removebg.png';
      p.description = 'Mouse gaming wireless premium dengan koneksi 2.4GHz RF (1ms response) dan daya tahan baterai hingga 50 jam. Didesain ergonomis dengan side grips leatherette empuk.';
      p.specs = `<div class="specs-content"><div class="spec-group"><h4>Fitur Utama</h4><ul><li>Koneksi: Wireless 2.4GHz RF</li><li>Baterai: Hingga 50 Jam</li><li>Side Grips: Padded Leatherette</li><li>Software: HyperX NGENUITY</li></ul></div></div>`;
    }

    // --- KEYBOARD ---
    else if (name.includes('G915 TKL')) {
      p.image_url = 'assets/Logitech_g915_tkl-removebg-preview.png';
      p.description = 'Keyboard mekanikal wireless premium ultra-tipis dengan teknologi Lightspeed Wireless 1ms dan RGB LIGHTSYNC.';
      p.specs = `<div class="specs-content"><div class="spec-group"><h4>Spesifikasi</h4><ul><li>Koneksi: Lightspeed Wireless & Bluetooth</li><li>Switch: Low Profile GL (Tactile/Linear/Clicky)</li><li>Material: Aircraft-grade Aluminum Alloy</li><li>Baterai: Hingga 40 Jam</li></ul></div></div>`;
    }
    else if (name.includes('Daiva')) {
      p.image_url = 'assets/Rexus_daiva-removebg-preview.png';
      p.description = 'Keyboard mekanikal TKL yang kokoh dengan switch Outemu dan pencahayaan RGB yang bisa dikustomisasi.';
      p.specs = `<div class="specs-content"><div class="spec-group"><h4>Spesifikasi</h4><ul><li>Switch: Outemu Mechanical (Removable)</li><li>Layout: TKL (87 Keys)</li><li>LED: RGB Lighting</li><li>Koneksi: Wired Braided Cable</li></ul></div></div>`;
    }
    else if (name.includes('Alloy Origins')) {
      p.image_url = 'assets/HyperX_Alloy_Origins-removebg-preview.png';
      p.description = 'Keyboard gaming ringkas dengan switch mekanikal HyperX kustom dan bodi full aluminum.';
      p.specs = `<div class="specs-content"><div class="spec-group"><h4>Spesifikasi</h4><ul><li>Switch: HyperX Mechanical Switch</li><li>Body: Full Aircraft-grade Aluminum</li><li>Software: HyperX NGENUITY</li><li>Kabel: Detachable USB-C</li></ul></div></div>`;
    }

    // --- HEADSET ---
    else if (name.includes('G Pro X')) {
      p.image_url = 'assets/Logitech G Refurbished PRO X 2 LIGHTSPEED.png';
      p.description = 'Headset gaming kelas profesional dengan teknologi mikrofon Blue VO!CE untuk komunikasi yang jernih.';
      p.specs = `<div class="specs-content"><div class="spec-group"><h4>Spesifikasi</h4><ul><li>Driver: PRO-G 50mm</li><li>Surround: DTS Headphone:X 2.0</li><li>Mic: Blue VO!CE Technology</li><li>Material: Aluminum & Steel</li></ul></div></div>`;
    }
    else if (name.includes('Thundervox')) {
      p.image_url = 'assets/Rexus Thundervox HX25.png';
      p.description = 'Headset gaming virtual 7.1 dengan driver 50mm yang menghasilkan suara bass mendalam dan detail.';
      p.specs = `<div class="specs-content"><div class="spec-group"><h4>Spesifikasi</h4><ul><li>Sound: Virtual 7.1 Surround</li><li>Driver: 50mm Driver</li><li>Earpad: Protein Leather yang Nyaman</li><li>LED: RGB Breathing</li></ul></div></div>`;
    }
    else if (name.includes('Cloud II')) {
      p.image_url = 'assets/HyperX Cloud II Gaming Headset.png';
      p.description = 'Headset gaming legendaris dengan busa memory foam yang sangat nyaman untuk sesi gaming lama.';
      p.specs = `<div class="specs-content"><div class="spec-group"><h4>Spesifikasi</h4><ul><li>Sound: Virtual 7.1 Surround Sound</li><li>Mic: Noise-cancelling Detachable</li><li>Frame: Solid Aluminum</li><li>Earpad: Signature Memory Foam</li></ul></div></div>`;
    }

    return p;
  });

    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat');
    const searchParam = params.get('search');

    if (searchParam) {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchParam.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchParam.toLowerCase()) ||
        p.category.toLowerCase().includes(searchParam.toLowerCase())
      );
      displayProducts(filtered);
    } else if (catParam) {
      filterProducts(catParam);
    } else {
      displayProducts(allProducts);
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

// ============================================
//   MOBILE-FIRST ENHANCEMENTS
// ============================================

// Touch Ripple Effect on buttons & cards
function createRipple(e) {
  const el = e.currentTarget;
  const existing = el.querySelector('.ripple');
  if (existing) existing.remove();

  const circle = document.createElement('span');
  const d = Math.max(el.clientWidth, el.clientHeight);
  const rect = el.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left - d / 2;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top  - d / 2;

  circle.className = 'ripple';
  circle.style.cssText = `
    position:absolute; width:${d}px; height:${d}px;
    left:${x}px; top:${y}px;
    border-radius:50%;
    background:rgba(255,255,255,0.18);
    transform:scale(0);
    animation:ripple-anim 0.55s linear;
    pointer-events:none;
    z-index:99;
  `;
  el.style.position = el.style.position || 'relative';
  el.style.overflow  = 'hidden';
  el.appendChild(circle);
  circle.addEventListener('animationend', () => circle.remove());
}

// Inject ripple keyframe once
(function injectRippleCSS() {
  if (document.getElementById('ripple-style')) return;
  const s = document.createElement('style');
  s.id = 'ripple-style';
  s.textContent = '@keyframes ripple-anim{to{transform:scale(3);opacity:0}}';
  document.head.appendChild(s);
})();

// Apply ripple to all primary buttons & filter buttons
function applyRippleToButtons() {
  document.querySelectorAll('.btn-primary, .btn-cyan, .filter-btn, .cat-circle-item, .mobile-cat-card').forEach(el => {
    el.removeEventListener('pointerdown', createRipple);
    el.addEventListener('pointerdown', createRipple);
  });
}

// Navbar scroll shadow (mobile + desktop)
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// Mobile toast — move to bottom on small screens
function showToastMobile(msg) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }
  const isMobile = window.innerWidth <= 560;
  container.style.cssText = isMobile
    ? 'position:fixed;bottom:80px;left:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:10px;'
    : 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
  showToast(msg);
}

// Re-apply ripple after products load
const _origDisplay = typeof displayProducts === 'function' ? displayProducts : null;

// Re-init mobile UX after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  applyRippleToButtons();

  // Re-apply after products are injected
  const grid = document.getElementById('productsGrid');
  if (grid) {
    const obs = new MutationObserver(() => applyRippleToButtons());
    obs.observe(grid, { childList: true });
  }

  // Prevent horizontal scroll bleed on body
  document.body.style.overflowX = 'hidden';
});