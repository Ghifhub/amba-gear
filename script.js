// ============================================
//   AMBA GEAR - Main JavaScript
// ============================================

// === HERO SLIDER ===
// Hero slider removed - now using single video background
let slideInterval;

function initSlider() {
  // Hero slider removed - now using single video background
}

// === NAVBAR ===
function toggleMenu() {
  const links = document.getElementById('navLinks');
  const btn = document.getElementById('hamburger');
  const isOpen = links.classList.toggle('open');
  btn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
}

function toggleSearch() {
  const bar = document.getElementById('searchBar');
  bar.classList.toggle('open');
  if (bar.classList.contains('open')) bar.querySelector('input').focus();
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
  alert(`Terima kasih! ${input.value} telah terdaftar untuk newsletter kami. 🎮`);
  input.value = '';
}

// === LOGIN HANDLER ===
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.token) {
      // Save token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      alert(`Login berhasil! Selamat datang ${data.user.name} (${data.user.role})`);

      // Redirect based on role
      if (data.user.role === 'admin') {
        window.location.href = 'admin.html'; // Create admin page later
      } else {
        window.location.href = 'index.html';
      }
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

  if (token && user) {
    // User logged in
    topbarRight.innerHTML = `
      <span>Welcome, ${user.name || user.email}!</span>
      <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
    `;
  } else {
    // Not logged in
    topbarRight.innerHTML = `
      <a href="kontak.html"><i class="fab fa-whatsapp"></i> Chat Admin</a>
      <a href="login.html"><i class="fas fa-user"></i> Sign In / Register</a>
    `;
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

// === PRODUCT FILTER (products page) ===
function initFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      filterProducts(cat);
    });
  });
}

// === DYNAMIC PRODUCT LOADING ===
let allProducts = [];

async function loadProducts() {
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return Promise.resolve();

  try {
    const response = await fetch('http://127.0.0.1:5000/api/products');
    const data = await response.json();

    // Handle both formats: direct array or {products: array}
    let products = Array.isArray(data) ? data : (data.products || []);

    // Remove duplicates based on id
    const uniqueProducts = products.filter((product, index, self) =>
      index === self.findIndex(p => p.id === product.id)
    );

    if (uniqueProducts.length > 0) {
      allProducts = uniqueProducts;

      // Auto-filter from URL param after products are loaded
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('cat');
      if (catParam) {
        filterProducts(catParam);
      } else {
        displayProducts(allProducts);
      }
    } else {
      console.error('No products received:', data);
      productsGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><p>No products found.</p></div>';
    }
  } catch (error) {
    console.error('Error loading products:', error);
    productsGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><p>Error loading products. Please try again later.</p></div>';
  }

  return Promise.resolve();
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

async function filterProducts(category) {
  // If products haven't loaded yet, load them first
  if (!allProducts || allProducts.length === 0) {
    await loadProducts();
    // After loading, display all products first, then filter
    displayProducts(allProducts);
  }

  // Update active button state
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === category) {
      btn.classList.add('active');
    }
  });

  let filteredProducts = allProducts;
  if (category !== 'all' && category !== 'Semua') {
    filteredProducts = allProducts.filter(product => product.category === category);
  }

  displayProducts(filteredProducts);
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    '<i class="fas fa-star"></i>'.repeat(fullStars) +
    (hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : '') +
    '<i class="far fa-star"></i>'.repeat(emptyStars)
  );
}

// === PRODUCT MODAL ===
function viewProduct(productId) {
  const product = allProducts.find(p => p.id == productId);
  if (!product) return;

  const modal = document.getElementById('productModal');
  const detail = document.getElementById('productDetail');

  let imagesHtml = `<img src="${product.image_url}" alt="${product.name}" />`;
  if (product.name === 'Logitech G403 HERO') {
    imagesHtml = `
      <img src="https://m.media-amazon.com/images/I/61bWpAMxXcL._AC_SL1500_.jpg" alt="${product.name} View 1" />
      <img src="https://m.media-amazon.com/images/I/51r2zB2w3YL._AC_SL1500_.jpg" alt="${product.name} View 2" style="margin-top: 20px;" />
    `;
  }

  detail.innerHTML = `
    <div class="product-detail-layout">
      <div class="detail-left">
        <div class="detail-image-box" style="flex-direction: column;">
          ${imagesHtml}
        </div>
      </div>
      <div class="detail-right">
        <div class="detail-header">
          <span class="detail-brand">${product.brand}</span>
          <h2 class="detail-title">${product.name}</h2>
          <p class="detail-category">${product.category.toUpperCase()} GAMING</p>
          <div class="detail-price">Rp${product.price.toLocaleString('id-ID')}</div>
        </div>
        
        <div class="detail-actions">
          <button class="btn btn-primary btn-lg" onclick="fastCheckout('${product.id}')" style="flex:1;">Beli</button>
          <button class="btn btn-secondary btn-lg" onclick="addToCart('${product.id}')" style="flex:1;">
            <i class="fas fa-shopping-cart"></i> Tambah Keranjang
          </button>
        </div>

        <div class="detail-section">
          <h3>Deskripsi</h3>
          <p>${product.description}</p>
        </div>

        <div class="detail-section">
          <h3>Spesifikasi dan Kompatibilitas</h3>
          ${product.specs && product.specs.includes('<div') ? product.specs : `<div class="specs-content"><p>${product.specs || 'Spesifikasi tidak tersedia.'}</p></div>`}
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  getOverlay().style.display = 'block';
}

function closeProductModal() {
  document.getElementById('productModal').style.display = 'none';
  getOverlay().style.display = 'none';
}

// === CART MANAGEMENT ===
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

function addToCart(productId) {
  const product = allProducts.find(p => p.id == productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id == productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  if (typeof updateCartDisplay === 'function') updateCartDisplay();
  showToast(`${product.name} ditambahkan ke Keranjang!`);
}

function toggleWishlistItem(productId) {
  const product = allProducts.find(p => p.id == productId);
  if (!product) return;

  const index = wishlist.findIndex(item => item.id == productId);
  if (index > -1) {
    wishlist.splice(index, 1);
    showToast(`${product.name} dihapus dari Wishlist!`);
  } else {
    wishlist.push(product);
    showToast(`${product.name} ditambahkan ke Wishlist!`);
  }

  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCountEl = document.getElementById('cartCount');
  if (cartCountEl) {
    cartCountEl.textContent = count;
    cartCountEl.style.display = count > 0 ? 'block' : 'none';
  }
}

function updateWishlistCount() {
  const count = wishlist.length;
  const wishlistCountEl = document.getElementById('wishlistCount');
  if (wishlistCountEl) {
    wishlistCountEl.textContent = count;
    wishlistCountEl.style.display = count > 0 ? 'block' : 'none';
  }
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = getOverlay();

  if (sidebar.style.right === '0px') {
    sidebar.style.right = '-420px';
    overlay.style.display = 'none';
  } else {
    updateCartDisplay();
    sidebar.style.display = 'block'; // ensure it's block
    setTimeout(() => { sidebar.style.right = '0px'; }, 10);
    overlay.style.display = 'block';
  }
}

function toggleWishlist() {
  const sidebar = document.getElementById('wishlistSidebar');
  const overlay = getOverlay();

  if (sidebar.style.right === '0px') {
    sidebar.style.right = '-420px';
    overlay.style.display = 'none';
  } else {
    updateWishlistDisplay();
    sidebar.style.display = 'block'; // ensure it's block
    setTimeout(() => { sidebar.style.right = '0px'; }, 10);
    overlay.style.display = 'block';
  }
}

// === TOAST & OVERLAY SYSTEM ===
function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.style.cssText = 'background: var(--card); color: white; padding: 16px 24px; border-radius: var(--radius); border-left: 4px solid var(--pink); box-shadow: 0 10px 20px rgba(0,0,0,0.3); font-weight: 500; opacity: 0; transform: translateX(100%); transition: all 0.3s ease; display: flex; align-items: center; gap: 12px;';
  toast.innerHTML = `<i class="fas fa-check-circle" style="color: var(--pink); font-size: 1.2rem;"></i> ${message}`;
  container.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.style.opacity = '1'; 
    toast.style.transform = 'translateX(0)';
  });
  
  setTimeout(() => {
    toast.style.opacity = '0'; 
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getOverlay() {
  let overlay = document.getElementById('overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.style.cssText = 'display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 999; backdrop-filter: blur(4px);';
    overlay.onclick = closeAllSidebars;
    document.body.appendChild(overlay);
  }
  return overlay;
}

function updateCartDisplay() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');

  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin: 40px 0;">Your cart is empty</p>';
    cartTotal.style.display = 'none';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--card-border);">
      <img src="${item.image_url}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius);" />
      <div style="flex: 1;">
        <h4 style="margin: 0 0 5px 0; font-size: 1rem;">${item.name}</h4>
        <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;">Rp${parseInt(item.price).toLocaleString('id-ID')}</p>
        <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
          <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})" style="width: 25px; height: 25px; border: 1px solid var(--card-border); background: var(--bg); border-radius: var(--radius); cursor: pointer; color: white;">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})" style="width: 25px; height: 25px; border: 1px solid var(--card-border); background: var(--bg); border-radius: var(--radius); cursor: pointer; color: white;">+</button>
        </div>
      </div>
      <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem;">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + (parseInt(item.price) * item.quantity), 0);
  document.getElementById('totalPrice').textContent = `Rp${total.toLocaleString('id-ID')}`;
  cartTotal.style.display = 'block';
}

function updateWishlistDisplay() {
  const wishlistItems = document.getElementById('wishlistItems');

  if (wishlist.length === 0) {
    wishlistItems.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin: 40px 0;">Your wishlist is empty</p>';
    return;
  }

  wishlistItems.innerHTML = wishlist.map(item => `
    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--card-border);">
      <img src="${item.image_url}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius);" />
      <div style="flex: 1;">
        <h4 style="margin: 0 0 5px 0; font-size: 1rem;">${item.name}</h4>
        <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;">Rp${parseInt(item.price).toLocaleString('id-ID')}</p>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <button onclick="addToCart('${item.id}')" class="btn btn-primary" style="font-size: 0.8rem; padding: 5px 10px;">Add to Cart</button>
        <button onclick="removeFromWishlist('${item.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.8rem;">
          <i class="fas fa-times"></i> Remove
        </button>
      </div>
    </div>
  `).join('');
}

function updateCartQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  const item = cart.find(item => item.id == productId);
  if (item) {
    item.quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
  }
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id != productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  updateCartDisplay();
}

function removeFromWishlist(productId) {
  wishlist = wishlist.filter(item => item.id != productId);
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
  updateWishlistDisplay();
}

function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  // For now, redirect to WhatsApp with order details
  const orderText = encodeURIComponent(
    `Halo AMBA GEAR! Saya ingin checkout:\n\n` +
    cart.map(item => `${item.name} x${item.quantity} - Rp${parseInt(item.price).toLocaleString('id-ID')}`).join('\n') +
    `\n\nTotal: Rp${cart.reduce((sum, item) => sum + (parseInt(item.price) * item.quantity), 0).toLocaleString('id-ID')}`
  );

  window.open(`https://wa.me/6283896431050?text=${orderText}`, '_blank');
}

function closeAllSidebars() {
  const cs = document.getElementById('cartSidebar');
  if (cs) cs.style.right = '-420px';
  const ws = document.getElementById('wishlistSidebar');
  if (ws) ws.style.right = '-420px';
  const pm = document.getElementById('productModal');
  if (pm) pm.style.display = 'none';
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.style.display = 'none';
}

// === ORDER FORM ===
function initOrderForm() {
  const form = document.getElementById('orderForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name');
    const product = data.get('product');
    const phone = data.get('phone');
    const qty = data.get('qty') || '1';
    const address = data.get('address') || '';
    const msg = data.get('message') || '';

    const waText = encodeURIComponent(
      `Halo AMBA GEAR! 👋\n\n` +
      `Saya ingin memesan produk:\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `👤 Nama: ${name}\n` +
      `📱 HP: ${phone}\n` +
      `🎮 Produk: ${product}\n` +
      `📦 Jumlah: ${qty} unit\n` +
      `📍 Alamat: ${address}\n` +
      (msg ? `📝 Catatan: ${msg}\n` : '') +
      `━━━━━━━━━━━━━━━━━\n` +
      `Mohon konfirmasi ketersediaan dan total harga. Terima kasih!`
    );

    window.open(`https://wa.me/6283896431050?text=${waText}`, '_blank');
    const successMsg = document.getElementById('formSuccess');
    if (successMsg) successMsg.classList.add('show');
    form.reset();
    setTimeout(() => successMsg && successMsg.classList.remove('show'), 5000);
  });
}

// === SMOOTH ANCHOR SCROLL ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  revealOnScroll();
  initOrderForm();
  checkLoginStatus();
  loadProducts();
  updateCartCount();
  updateWishlistCount();
});

// === FAST CHECKOUT & VIDEO ===
function fastCheckout(productId) {
  const product = allProducts.find(p => p.id == productId);
  if (!product) return;
  const waText = encodeURIComponent(
    `Halo AMBA GEAR! 👋\n\nSaya mau order langsung:\n🎮 ${product.name}\n💰 ${product.price}\n\nApakah barang ready?`
  );
  window.open(`https://wa.me/6283896431050?text=${waText}`, '_blank');
}

function toggleHeroVideo() {
  const video = document.querySelector('.hero-video');
  const btnIcon = document.querySelector('.hero-pause-btn i');
  if (!video || !btnIcon) return;
  if (video.paused) {
    video.play();
    btnIcon.className = 'fas fa-pause';
  } else {
    video.pause();
    btnIcon.className = 'fas fa-play';
  }
}

// Login handler
document.getElementById('loginForm')?.addEventListener('submit', handleLogin);