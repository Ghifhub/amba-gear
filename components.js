// ============================================
//   AMBA GEAR - Shared HTML Components
//   Eliminates duplicated navbar, footer,
//   sidebars, overlay, and WhatsApp button
//   across all pages.
// ============================================

function getActivePage() {
  const path = window.location.pathname;
  if (path.includes('produk.html')) return 'produk';
  if (path.includes('tentang.html')) return 'tentang';
  if (path.includes('kontak.html')) return 'kontak';
  if (path.includes('login.html')) return 'login';
  if (path.includes('admin.html')) return 'admin';
  return 'index';
}

function renderTopbar() {
  return `
  <div class="topbar">
    <span><i class="fas fa-truck"></i> Free Shipping semua pesanan di atas <strong>Rp500.000</strong></span>
    <div class="topbar-right">
      <a href="kontak.html"><i class="fab fa-whatsapp"></i> Chat Admin</a>
      <a href="login.html"><i class="fas fa-user"></i> Sign In / Register</a>
    </div>
  </div>`;
}

function renderNavbar(options = {}) {
  const page = getActivePage();
  const showCartWishlist = options.showCartWishlist !== false;

  const navLinks = [
    { href: 'index.html', label: 'Home', id: 'index' },
    { href: 'produk.html', label: 'Shop', id: 'produk' },
    { href: 'tentang.html', label: 'Tentang Kami', id: 'tentang' },
    { href: 'kontak.html', label: 'Kontak', id: 'kontak' }
  ];

  const linksHTML = navLinks.map(link =>
    `<li><a href="${link.href}"${link.id === page ? ' class="active"' : ''}>${link.label}</a></li>`
  ).join('\n        ');

  const cartWishlistHTML = showCartWishlist ? `
        <button class="icon-btn" onclick="toggleWishlist()" title="Wishlist" style="position: relative;"><i class="fas fa-heart"></i> <span id="wishlistCount" class="cart-count">0</span></button>
        <button class="icon-btn" onclick="toggleCart()" title="Cart" style="position: relative;"><i class="fas fa-shopping-cart"></i> <span id="cartCount" class="cart-count">0</span></button>` : '';

  return `
  <nav class="navbar" id="navbar">
    <div class="nav-container">
      <a href="index.html" class="logo">
        <img src="assets/Dingin, tetapi tidak kejam.jpg" alt="amba gear" style="height:40px; width:auto; max-width:150px; object-fit:contain; display:block;" />
        <span class="logo-text"><span class="amba-text">AMBA</span> GEAR</span>
      </a>
      <ul class="nav-links" id="navLinks">
        ${linksHTML}
      </ul>
      <div class="nav-actions">
        <button class="icon-btn" onclick="toggleSearch()" title="Search"><i class="fas fa-search"></i></button>${cartWishlistHTML}
        <button class="icon-btn wa-icon" onclick="openWACS()" title="Chat CS WhatsApp"><i class="fab fa-whatsapp"></i></button>
        <button class="hamburger icon-btn" id="hamburger" onclick="toggleMenu()"><i class="fas fa-bars"></i></button>
      </div>
    </div>
    <div class="search-bar" id="searchBar">
      <input type="text" placeholder="Cari produk gaming..." />
      <button onclick="performSearch()"><i class="fas fa-search"></i></button>
    </div>
  </nav>`;
}

function renderFooter() {
  return `
  <footer class="footer">
    <div class="footer-top">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="logo"><img src="assets/rusdi.jpg" alt="amba gear" style="height:40px; width:auto; max-width:150px; object-fit:contain; display:block;" /></a>
            <p>Premium gaming gear untuk mereka yang menuntut performa terbaik. Play harder. Win more.</p>
            <div class="social-links">
              <a href="#"><i class="fab fa-instagram"></i></a>
              <a href="#"><i class="fab fa-tiktok"></i></a>
              <a href="#"><i class="fab fa-youtube"></i></a>
              <a href="kontak.html"><i class="fab fa-whatsapp"></i></a>
            </div>
          </div>
          <div class="footer-col">
            <h5>SHOP</h5>
            <ul>
              <li><a href="produk.html">Semua Produk</a></li>
              <li><a href="produk.html?cat=mouse">Mouse Gaming</a></li>
              <li><a href="produk.html?cat=keyboard">Keyboard Gaming</a></li>
              <li><a href="produk.html?cat=headset">Headset Gaming</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>NEWSLETTER</h5>
            <p>Subscribe untuk promo spesial dan deals eksklusif!</p>
            <form class="newsletter-form" onsubmit="subscribeNewsletter(event)">
              <div class="newsletter-input">
                <input type="email" placeholder="Email kamu..." required />
                <button type="submit"><i class="fas fa-paper-plane"></i></button>
              </div>
            </form>
          </div>
          <div class="footer-col">
            <h5>PAYMENT</h5>
            <div class="payment-methods">
              <img src="assets/bca logo.png" alt="BCA" />
              <img src="assets/mandiri logo.png" alt="Mandiri" />
              <img src="assets/gopay logo.png" alt="GoPay" />
              <img src="assets/dana.png" alt="DANA" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>&copy; 2024 AMBA GEAR. All Rights Reserved.</p>
      </div>
    </div>
  </footer>`;
}

function renderCartSidebar() {
  return `
  <div id="cartSidebar" class="sidebar">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
      <h3 style="margin: 0;">Shopping Cart</h3>
      <button onclick="toggleCart()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: white;">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div id="cartItems">
      <p style="text-align: center; color: var(--text-muted); margin: 40px 0;">Your cart is empty</p>
    </div>
    <div id="cartTotal" style="border-top: 1px solid var(--card-border); padding-top: 20px; margin-top: 20px; display: none;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <strong>Total:</strong>
        <strong id="totalPrice">Rp0</strong>
      </div>
      <button class="btn btn-primary" style="width: 100%;" onclick="checkout()">Checkout</button>
    </div>
  </div>`;
}

function renderWishlistSidebar() {
  return `
  <div id="wishlistSidebar" class="sidebar">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
      <h3 style="margin: 0;">Wishlist</h3>
      <button onclick="toggleWishlist()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: white;">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div id="wishlistItems">
      <p style="text-align: center; color: var(--text-muted); margin: 40px 0;">Your wishlist is empty</p>
    </div>
  </div>`;
}

function renderProductModal() {
  return `
  <div id="productModal" class="modal" style="display: none; position: fixed; inset: 0; align-items: center; justify-content: center; z-index: 1200; padding: 20px;">
    <div class="modal-content" style="background: var(--card); width: 100%; max-width: 900px; border-radius: var(--radius); border: 1px solid var(--card-border); position: relative; max-height: 90vh; overflow-y: auto;">
      <button class="modal-close" onclick="closeProductModal()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; z-index: 10;"><i class="fas fa-times"></i></button>
      <div id="productDetail" class="product-detail-container"></div>
    </div>
  </div>`;
}

function renderOverlay() {
  return `<div id="overlay" class="overlay" onclick="closeAllSidebars()"></div>`;
}

function renderWhatsAppFloat() {
  return `
  <a href="#" onclick="openWACS(); return false;" class="wa-float" rel="noopener">
    <i class="fab fa-whatsapp"></i>
    <span class="wa-tooltip">Chat CS</span>
  </a>`;
}

// Inject all shared components into designated placeholder elements
function injectSharedComponents(options = {}) {
  const topbarEl = document.getElementById('shared-topbar');
  const navbarEl = document.getElementById('shared-navbar');
  const footerEl = document.getElementById('shared-footer');
  const sidebarsEl = document.getElementById('shared-sidebars');

  if (topbarEl) topbarEl.outerHTML = renderTopbar();
  if (navbarEl) navbarEl.outerHTML = renderNavbar(options);
  if (footerEl) footerEl.outerHTML = renderFooter();
  if (sidebarsEl) {
    sidebarsEl.outerHTML = renderCartSidebar() + renderWishlistSidebar() +
      renderProductModal() + renderOverlay() + renderWhatsAppFloat();
  }
}
