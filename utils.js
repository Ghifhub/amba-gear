// ============================================
//   AMBA GEAR - Shared Utilities
// ============================================

// === API CONFIGURATION ===
const API_BASE_URL = 'http://localhost:5000';

// === LOCAL STORAGE HELPERS ===
function getStoredJSON(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') || fallback;
  } catch {
    return fallback;
  }
}

function setStoredJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// === API FETCH HELPER ===
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data;
}

// === PRICE FORMATTING ===
function formatRupiah(amount) {
  return `Rp${parseInt(amount).toLocaleString('id-ID')}`;
}

// === BADGE COUNT UPDATE ===
function updateBadgeCount(elementId, count) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = count;
    el.style.display = count > 0 ? 'block' : 'none';
  }
}

// === SIDEBAR TOGGLE ===
function toggleSidebar(sidebarId, updateDisplayFn) {
  const sidebar = document.getElementById(sidebarId);
  const overlay = getOverlay();
  if (!sidebar) return;

  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  } else {
    if (updateDisplayFn) updateDisplayFn();
    sidebar.classList.add('open');
    overlay.classList.add('open');
  }
}

// === OVERLAY MANAGEMENT ===
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

// === TOAST NOTIFICATION ===
function showToast(msg) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    const isMobile = window.innerWidth <= 560;
    container.style.cssText = isMobile
      ? 'position:fixed;bottom:80px;left:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:10px;'
      : 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.style.cssText = 'background: var(--card); color: white; padding: 16px 24px; border-radius: var(--radius); border-left: 4px solid var(--pink); box-shadow: 0 10px 20px rgba(0,0,0,0.3); font-weight: 500; transition: all 0.3s ease; display: flex; align-items: center; gap: 12px;';
  toast.innerHTML = `<i class="fas fa-check-circle" style="color: var(--pink);"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// === PRODUCT SEARCH FILTER ===
function filterProductsByQuery(products, query) {
  const q = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
}

// === STAR RATING GENERATOR ===
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  return '<i class="fas fa-star"></i>'.repeat(fullStars) +
    (hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : '') +
    '<i class="far fa-star"></i>'.repeat(emptyStars);
}

// === NEWSLETTER SUBSCRIPTION ===
function subscribeNewsletter(event) {
  event.preventDefault();
  const input = event.target.querySelector('input');
  const email = input ? input.value.trim() : '';
  if (email) {
    alert(`Terima kasih! Email ${email} telah terdaftar untuk promo eksklusif.`);
    input.value = '';
  }
}

// === LOGIN / AUTH UTILITIES ===
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;

  if (!email || !password) return;

  try {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data.token) {
      localStorage.setItem('token', data.token);
      setStoredJSON('user', data.user);
      alert(`Login berhasil! Selamat datang ${data.user.name}`);
      window.location.href = data.user.role === 'admin' ? 'admin.html' : 'index.html';
    } else {
      alert('Login gagal: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const user = getStoredJSON('user');
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

// === WHATSAPP ===
function openWACS() {
  const text = encodeURIComponent('Halo AMBA GEAR! Saya ingin bertanya tentang produk kalian.');
  window.open(`https://wa.me/6283896431050?text=${text}`, '_blank');
}
