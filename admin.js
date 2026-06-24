// ============================================================
//  AMBA GEAR — Admin Dashboard JavaScript
//  Handles: SPA navigation, API calls, CRUD, analytics
// ============================================================

const API = 'http://localhost:5000/api';

// ── Product local data (real images + descriptions matching website) ──
const PRODUCT_ASSETS = {
  'Logitech G403 HERO': {
    image_url: 'assets/logitech_g403_hero_tampak_atas-removebg.png',
    description: 'Didesain untuk kenyamanan, G403 dibuat berkontur dengan pegangan karet untuk kontrol tambahan. Sensor HERO 25K memungkinkanmu untuk menelusuri dengan sangat akurat. Full-spectrum LIGHTSYNC RGB dan 6 tombol yang dapat diprogram membuatmu memegang kendali.',
    brand: 'Logitech', category: 'mouse', price: 699000, badge: 'HOT', stok: 15, jumlah_view: 312
  },
  'DAXA Air IV Pro Wireless Gen 2': {
    image_url: 'assets/rexus_daxa_air_3_tampak_atas-removebg.png',
    description: 'Mouse gaming Wireless Gen 2 dengan sensor Pixart PAW3395 26.000 DPI. Dilengkapi switch Kailh GM 8.0, baterai tahan lama ±44 jam, dan 4 pilihan casing eksklusif.',
    brand: 'Rexus', category: 'mouse', price: 599000, badge: null, stok: 8, jumlah_view: 198
  },
  'HyperX Pulsefire Dart': {
    image_url: 'assets/hyperx_pulsefire_dart_top_view-removebg.png',
    description: 'Mouse gaming wireless premium dengan koneksi 2.4GHz RF (1ms response) dan daya tahan baterai hingga 50 jam. Didesain ergonomis dengan side grips leatherette empuk.',
    brand: 'HyperX', category: 'mouse', price: 1399000, badge: 'SALE', stok: 5, jumlah_view: 241
  },
  'Logitech G915 TKL': {
    image_url: 'assets/Logitech_g915_tkl-removebg-preview.png',
    description: 'Keyboard mekanikal wireless premium ultra-tipis dengan teknologi Lightspeed Wireless 1ms dan RGB LIGHTSYNC. Material aircraft-grade aluminum alloy, baterai hingga 40 jam.',
    brand: 'Logitech', category: 'keyboard', price: 2499000, badge: 'HOT', stok: 10, jumlah_view: 489
  },
  'Rexus Daiva': {
    image_url: 'assets/Rexus_daiva-removebg-preview.png',
    description: 'Keyboard mekanikal TKL yang kokoh dengan switch Outemu dan pencahayaan RGB yang bisa dikustomisasi. Layout TKL 87 Keys, koneksi wired braided cable.',
    brand: 'Rexus', category: 'keyboard', price: 799000, badge: null, stok: 12, jumlah_view: 134
  },
  'HyperX Alloy Origins': {
    image_url: 'assets/HyperX_Alloy_Origins-removebg-preview.png',
    description: 'Keyboard gaming ringkas dengan switch mekanikal HyperX kustom dan bodi full aluminum. Software HyperX NGENUITY, kabel detachable USB-C.',
    brand: 'HyperX', category: 'keyboard', price: 1299000, badge: null, stok: 7, jumlah_view: 267
  },
  'Logitech G Pro X': {
    image_url: 'assets/Logitech G Refurbished PRO X 2 LIGHTSPEED.png',
    description: 'Headset gaming kelas profesional dengan teknologi mikrofon Blue VO!CE untuk komunikasi yang jernih. Driver PRO-G 50mm, DTS Headphone:X 2.0 surround sound.',
    brand: 'Logitech', category: 'headset', price: 1499000, badge: null, stok: 6, jumlah_view: 378
  },
  'Rexus Thundervox HX25': {
    image_url: 'assets/Rexus Thundervox HX25.png',
    description: 'Headset gaming virtual 7.1 dengan driver 50mm yang menghasilkan suara bass mendalam dan detail. Earpad Protein Leather nyaman, LED RGB Breathing effect.',
    brand: 'Rexus', category: 'headset', price: 499000, badge: 'SALE', stok: 20, jumlah_view: 156
  },
  'HyperX Cloud II': {
    image_url: 'assets/HyperX Cloud II Gaming Headset.png',
    description: 'Headset gaming legendaris dengan busa memory foam yang sangat nyaman untuk sesi gaming lama. Virtual 7.1 surround sound, noise-cancelling detachable mic, frame solid aluminum.',
    brand: 'HyperX', category: 'headset', price: 999000, badge: 'HOT', stok: 9, jumlah_view: 521
  }
};

let adminToken = null;
let adminUser = null;
let allProducts = [];
let allCategories = [];
let allInquiries = [];
let currentEditId = null;
let currentSection = 'dashboard';

// ─────────────────────────────────────
//  INIT
// ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initNavigation();
  initSidebar();
});

function checkAuth() {
  adminToken = localStorage.getItem('token');
  adminUser = JSON.parse(localStorage.getItem('user') || 'null');
  if (!adminToken || !adminUser || adminUser.role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }
  renderAdminInfo();
  loadSection('dashboard');
}

function renderAdminInfo() {
  const nameEl = document.getElementById('adminName');
  const avatarEl = document.getElementById('adminAvatar');
  const initials = (adminUser.name || adminUser.email).split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  if (nameEl) nameEl.textContent = adminUser.name || adminUser.email;
  if (avatarEl) avatarEl.textContent = initials;
}

// ─────────────────────────────────────
//  NAVIGATION (SPA)
// ─────────────────────────────────────
function initNavigation() {
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      navigateTo(section);
      closeSidebar();
    });
  });
}

function navigateTo(section) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const activeNav = document.querySelector(`.nav-item[data-section="${section}"]`);
  if (activeNav) activeNav.classList.add('active');

  document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`section-${section}`);
  if (panel) panel.classList.add('active');

  const titles = {
    dashboard: 'Dashboard', products: 'Manajemen Produk',
    categories: 'Manajemen Kategori', inquiries: 'Customer Inquiry',
    analytics: 'Analytics', settings: 'Pengaturan'
  };
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = titles[section] || section;

  currentSection = section;
  loadSection(section);
}

function loadSection(section) {
  switch (section) {
    case 'dashboard': loadDashboard(); break;
    case 'products': loadProducts(); break;
    case 'categories': loadCategories(); break;
    case 'inquiries': loadInquiries(); break;
    case 'analytics': loadAnalytics(); break;
  }
}

// ─────────────────────────────────────
//  SIDEBAR (mobile toggle)
// ─────────────────────────────────────
function initSidebar() {
  const overlay = document.getElementById('sidebarOverlay');
  if (overlay) overlay.addEventListener('click', closeSidebar);
}

function toggleSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar?.classList.toggle('open');
  overlay?.classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('adminSidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('open');
}

// ─────────────────────────────────────
//  API HELPER
// ─────────────────────────────────────
async function apiGet(endpoint) {
  try {
    const res = await fetch(`${API}${endpoint}`, {
      headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`API GET ${endpoint} failed:`, e.message);
    return null;
  }
}

async function apiPost(endpoint, body) {
  try {
    const res = await fetch(`${API}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (e) {
    console.warn(`API POST ${endpoint} failed:`, e.message);
    return null;
  }
}

async function apiPut(endpoint, body) {
  try {
    const res = await fetch(`${API}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (e) {
    console.warn(`API PUT ${endpoint} failed:`, e.message);
    return null;
  }
}

async function apiDelete(endpoint) {
  try {
    const res = await fetch(`${API}${endpoint}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    return await res.json();
  } catch (e) {
    console.warn(`API DELETE ${endpoint} failed:`, e.message);
    return null;
  }
}

// ─────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────
async function loadDashboard() {
  const summary = await apiGet('/analytics/summary') || { total_products: 9, total_categories: 3, total_views: 2696, total_wa_clicks: 160, available_products: 9, out_of_stock: 0 };
  const weekly = await apiGet('/analytics/weekly') || [];
  const topProducts = await apiGet('/analytics/top-products') || [];

  document.getElementById('statTotalProducts').textContent = summary.total_products || 0;
  document.getElementById('statTotalCategories').textContent = summary.total_categories || 0;
  document.getElementById('statTotalViews').textContent = (summary.total_views || 0).toLocaleString('id-ID');
  document.getElementById('statWAClicks').textContent = summary.total_wa_clicks || 0;
  document.getElementById('statAvailable').textContent = summary.available_products || 0;
  document.getElementById('statOutOfStock').textContent = summary.out_of_stock || 0;

  renderWeeklyChart(weekly);
  renderTopProducts(topProducts);
  renderRecentActivity();
}

function renderWeeklyChart(data) {
  const container = document.getElementById('weeklyChart');
  if (!container || !data.length) return;

  const maxVal = Math.max(...data.map(d => d.jumlah_pengunjung || 0), 1);
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  container.innerHTML = data.map(d => {
    const date = new Date(d.tanggal);
    const dayName = days[date.getDay()];
    const heightPct = Math.max(4, Math.round((d.jumlah_pengunjung / maxVal) * 100));
    return `
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="height: ${heightPct}%">
          <div class="tooltip">${d.jumlah_pengunjung} visitor</div>
        </div>
        <span class="chart-label">${dayName}</span>
      </div>`;
  }).join('');
}

function renderTopProducts(data) {
  const container = document.getElementById('topProductsList');
  if (!container) return;
  const rankClasses = ['gold', 'silver', 'bronze', '', ''];
  container.innerHTML = data.slice(0,5).map((p, i) => {
    const asset = PRODUCT_ASSETS[p.name] || {};
    return `
      <div class="top-product-item">
        <div class="rank ${rankClasses[i]}">${i+1}</div>
        <span class="top-product-name">${p.name}</span>
        <span class="badge badge-${p.category}">${p.category}</span>
        <span class="top-product-views"><i class="fas fa-eye"></i> ${(asset.jumlah_view || p.jumlah_view || 0).toLocaleString('id-ID')}</span>
      </div>`;
  }).join('');
}

function renderRecentActivity() {
  const container = document.getElementById('recentActivity');
  if (!container) return;
  const activities = [
    { text: 'Customer Aisyah Nurul bertanya tentang <strong>HyperX Cloud II</strong>', time: '3 jam lalu' },
    { text: 'Stok <strong>HyperX Pulsefire Dart</strong> diperbarui (5 unit)', time: '6 jam lalu' },
    { text: 'Produk <strong>Logitech G915 TKL</strong> mendapat 12 views baru', time: '1 hari lalu' },
    { text: 'Customer Bagas Eko menanyakan diskon <strong>Rexus Thundervox</strong>', time: '1 hari lalu' },
    { text: 'Admin mengupdate deskripsi <strong>Rexus Daiva</strong>', time: '2 hari lalu' }
  ];
  container.innerHTML = activities.map(a => `
    <div class="activity-item">
      <div class="activity-dot"></div>
      <div>
        <p class="activity-text">${a.text}</p>
        <p class="activity-time">${a.time}</p>
      </div>
    </div>`).join('');
}

// ─────────────────────────────────────
//  PRODUCTS
// ─────────────────────────────────────
async function loadProducts() {
  const grid = document.getElementById('productsTableBody');
  if (!grid) return;
  grid.innerHTML = `<tr><td colspan="7" class="loading"><i class="fas fa-spinner fa-spin"></i> Memuat produk...</td></tr>`;
  let data = await apiGet('/products');
  if (!data) {
    // try localStorage fallback
    const local = localStorage.getItem('adminProducts');
    if (local) {
      try { data = JSON.parse(local); } catch (e) { data = null; }
    }
  }

  // If still no data, build from PRODUCT_ASSETS as fallback
  if (!data || !Array.isArray(data) || data.length === 0) {
    data = Object.keys(PRODUCT_ASSETS).map((name, idx) => {
      const a = PRODUCT_ASSETS[name];
      return {
        id: 'local-' + (Date.now() + idx),
        name,
        brand: a.brand,
        category: a.category,
        price: a.price,
        old_price: null,
        stok: a.stok || 0,
        badge: a.badge || null,
        status_produk: 'tersedia',
        image_url: a.image_url,
        description: a.description,
        jumlah_view: a.jumlah_view || 0
      };
    });
    // persist fallback for admin editing session
    localStorage.setItem('adminProducts', JSON.stringify(data));
  }

  // Enrich with local assets if image missing
  allProducts = data.map(p => {
    const asset = PRODUCT_ASSETS[p.name] || {};
    return {
      id: p.id ?? ('local-' + (Date.now() + Math.floor(Math.random()*10000))),
      ...p,
      image_url: p.image_url || asset.image_url || '',
      description: p.description || asset.description || '',
      stok: p.stok !== undefined ? p.stok : (asset.stok || 0),
      jumlah_view: p.jumlah_view || asset.jumlah_view || 0,
      status_produk: p.status_produk || 'tersedia'
    };
  });

  renderProductsTable(allProducts);
  updateProductStats(allProducts);
}

function updateProductStats(products) {
  const totalEl = document.getElementById('productCount');
  const availEl = document.getElementById('availableCount');
  const emptyEl = document.getElementById('outOfStockCount');
  if (totalEl) totalEl.textContent = products.length;
  if (availEl) availEl.textContent = products.filter(p => (p.stok || 0) > 0).length;
  if (emptyEl) emptyEl.textContent = products.filter(p => (p.stok || 0) === 0).length;
}

function renderProductsTable(products) {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;
  if (!products.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-box-open"></i><h4>Belum ada produk</h4><p>Tambahkan produk pertamamu!</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = products.map(p => {
    const badgeHtml = p.badge ? `<span class="badge badge-${p.badge.toLowerCase()}">${p.badge}</span>` : `<span style="color:var(--text-dim);font-size:0.8rem;">—</span>`;
    const stokColor = p.stok > 5 ? 'var(--green)' : p.stok > 0 ? 'var(--orange)' : 'var(--red)';
    return `
      <tr>
        <td>
          <div class="product-thumb">
            <img src="${p.image_url || 'assets/logitech logo.png'}" alt="${p.name}" onerror="this.src='assets/logitech logo.png'" />
            <div class="info">
              <h4>${p.name}</h4>
              <span>${p.brand || '—'}</span>
            </div>
          </div>
        </td>
        <td><span class="badge badge-${p.category}">${p.category}</span></td>
        <td style="font-weight:700;">Rp${parseInt(p.price).toLocaleString('id-ID')}</td>
        <td style="color:${stokColor};font-weight:600;">${p.stok ?? 0} unit</td>
        <td>${badgeHtml}</td>
        <td>
          <span class="badge badge-${p.status_produk || 'tersedia'}">${p.status_produk || 'tersedia'}</span>
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-secondary btn-sm btn-icon" onclick="viewProduct('${p.id}')" title="Detail"><i class="fas fa-eye"></i></button>
            <button class="btn btn-secondary btn-sm btn-icon" onclick="editProduct('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="deleteProduct('${p.id}', '${p.name.replace(/'/g,"\\'")}')"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function filterProducts() {
  const searchVal = document.getElementById('productSearch')?.value.toLowerCase() || '';
  const catVal = document.getElementById('productCatFilter')?.value || '';
  const filtered = allProducts.filter(p => {
    const matchSearch = !searchVal || p.name.toLowerCase().includes(searchVal) || (p.brand || '').toLowerCase().includes(searchVal);
    const matchCat = !catVal || p.category === catVal;
    return matchSearch && matchCat;
  });
  renderProductsTable(filtered);
}

function openAddProductModal() {
  currentEditId = null;
  document.getElementById('productModalTitle').textContent = 'Tambah Produk Baru';
  document.getElementById('productForm').reset();
  const img = document.getElementById('imgPreviewImg');
  const ph = document.getElementById('imgPreviewPlaceholder');
  if (img) img.style.display = 'none';
  if (ph) ph.style.display = 'flex';
  const fileInput = document.getElementById('prodImageFile'); if (fileInput) fileInput.value = '';
  const urlInput = document.getElementById('prodImageUrl'); if (urlInput) urlInput.value = '';
  openModal('productModal');
}

function viewProduct(id) {
  const p = allProducts.find(x => x.id == id);
  if (!p) return;
  const modal = document.getElementById('viewProductModal');
  if (!modal) return;
  document.getElementById('viewProductName').textContent = p.name;
  document.getElementById('viewProductBrand').textContent = p.brand;
  document.getElementById('viewProductCategory').innerHTML = `<span class="badge badge-${p.category}">${p.category}</span>`;
  document.getElementById('viewProductPrice').textContent = `Rp${parseInt(p.price).toLocaleString('id-ID')}`;
  document.getElementById('viewProductStok').textContent = `${p.stok ?? 0} unit`;
  document.getElementById('viewProductViews').textContent = `${p.jumlah_view || 0} views`;
  document.getElementById('viewProductBadge').innerHTML = p.badge ? `<span class="badge badge-${p.badge.toLowerCase()}">${p.badge}</span>` : '—';
  document.getElementById('viewProductStatus').innerHTML = `<span class="badge badge-${p.status_produk || 'tersedia'}">${p.status_produk || 'tersedia'}</span>`;
  document.getElementById('viewProductDesc').textContent = p.description || '—';
  const img = document.getElementById('viewProductImg');
  img.src = p.image_url || '';
  img.onerror = () => img.style.display = 'none';
  openModal('viewProductModal');
}

function editProduct(id) {
  const p = allProducts.find(x => x.id == id);
  if (!p) return;
  currentEditId = id;
  document.getElementById('productModalTitle').textContent = 'Edit Produk';
  document.getElementById('prodName').value = p.name || '';
  document.getElementById('prodBrand').value = p.brand || '';
  document.getElementById('prodCategory').value = p.category || 'mouse';
  document.getElementById('prodPrice').value = p.price || '';
  document.getElementById('prodOldPrice').value = p.old_price || '';
  document.getElementById('prodStok').value = p.stok ?? 0;
  document.getElementById('prodBadge').value = p.badge || '';
  document.getElementById('prodStatus').value = p.status_produk || 'tersedia';
  document.getElementById('prodImageUrl').value = p.image_url || '';
  const fileInput = document.getElementById('prodImageFile'); if (fileInput) fileInput.value = '';
  document.getElementById('prodDescription').value = p.description || '';
  previewImage(p.image_url);
  openModal('productModal');
}

function previewImage(url) {
  const img = document.getElementById('imgPreviewImg');
  const placeholder = document.getElementById('imgPreviewPlaceholder');
  if (!url) {
    if (img) img.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
    return;
  }
  if (img) { img.src = url; img.style.display = 'block'; }
  if (placeholder) placeholder.style.display = 'none';
  if (img) img.onerror = () => { img.style.display = 'none'; if (placeholder) placeholder.style.display = 'flex'; };
}

function previewFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Format file bukan gambar', 'error'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    // set the image URL field so saveProduct will pick it up
    const urlInput = document.getElementById('prodImageUrl');
    if (urlInput) urlInput.value = dataUrl;
    previewImage(dataUrl);
  };
  reader.readAsDataURL(file);
}

async function saveProduct(e) {
  e.preventDefault();
  const formData = {
    name: document.getElementById('prodName').value.trim(),
    brand: document.getElementById('prodBrand').value.trim(),
    category: document.getElementById('prodCategory').value,
    price: parseInt(document.getElementById('prodPrice').value),
    old_price: document.getElementById('prodOldPrice').value ? parseInt(document.getElementById('prodOldPrice').value) : null,
    stok: parseInt(document.getElementById('prodStok').value) || 0,
    badge: document.getElementById('prodBadge').value || null,
    status_produk: document.getElementById('prodStatus').value,
    image_url: document.getElementById('prodImageUrl').value.trim(),
    description: document.getElementById('prodDescription').value.trim()
  };

  if (!formData.name || !formData.category || !formData.price) {
    showToast('Nama, kategori, dan harga wajib diisi', 'error'); return;
  }

  // try API first
  let result = null;
  if (currentEditId) {
    result = await apiPut(`/products/${currentEditId}`, formData);
    if (result && !result.error) {
      showToast(`Produk "${formData.name}" berhasil diupdate!`, 'success');
      closeModal('productModal');
      loadProducts();
      return;
    }
  } else {
    result = await apiPost('/products', formData);
    if (result && !result.error) {
      showToast(`Produk "${formData.name}" berhasil ditambahkan!`, 'success');
      closeModal('productModal');
      loadProducts();
      return;
    }
  }

  // If API failed, fallback to localStorage modifications
  const local = JSON.parse(localStorage.getItem('adminProducts') || '[]');
  if (currentEditId) {
    const idx = local.findIndex(x => x.id == currentEditId);
    if (idx > -1) {
      local[idx] = { id: currentEditId, ...formData };
      localStorage.setItem('adminProducts', JSON.stringify(local));
      showToast(`Produk "${formData.name}" disimpan lokal (offline).`, 'success');
      closeModal('productModal');
      loadProducts();
      return;
    }
    showToast('Gagal update produk (tidak ditemukan lokal).', 'error');
    return;
  } else {
    const newId = 'local-' + Date.now();
    const newProd = { id: newId, ...formData };
    local.push(newProd);
    localStorage.setItem('adminProducts', JSON.stringify(local));
    showToast(`Produk "${formData.name}" ditambahkan secara lokal (offline).`, 'success');
    closeModal('productModal');
    loadProducts();
    return;
  }
}

async function deleteProduct(id, name) {
  if (!confirm(`Hapus produk "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
  const result = await apiDelete(`/products/${id}`);
  if (result && !result.error) {
    showToast(`Produk "${name}" berhasil dihapus`, 'warning');
    loadProducts();
    return;
  }
  // fallback local delete
  const local = JSON.parse(localStorage.getItem('adminProducts') || '[]');
  const idx = local.findIndex(x => x.id == id);
  if (idx > -1) {
    local.splice(idx, 1);
    localStorage.setItem('adminProducts', JSON.stringify(local));
    showToast(`Produk "${name}" dihapus secara lokal (offline).`, 'warning');
    loadProducts();
    return;
  }
  showToast(result?.error || 'Gagal menghapus produk', 'error');
}

// ─────────────────────────────────────
//  CATEGORIES
// ─────────────────────────────────────
async function loadCategories() {
  const tbody = document.getElementById('categoriesTableBody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="4" class="loading"><i class="fas fa-spinner fa-spin"></i></td></tr>`;
  const data = await apiGet('/categories') || [];
  allCategories = data;
  renderCategoriesTable(allCategories);
}

function renderCategoriesTable(cats) {
  const tbody = document.getElementById('categoriesTableBody');
  if (!tbody) return;
  if (!cats.length) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="fas fa-tags"></i><h4>Belum ada kategori</h4></div></td></tr>`;
    return;
  }
  const icons = { mouse: 'fa-mouse', keyboard: 'fa-keyboard', headset: 'fa-headphones' };
  const productCounts = { mouse: 3, keyboard: 3, headset: 3 };
  tbody.innerHTML = cats.map(c => {
    const count = allProducts.filter(p => p.category === c.nama_kategori).length || productCounts[c.nama_kategori] || 0;
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="stat-icon" style="width:36px;height:36px;border-radius:10px;background:rgba(0,212,255,0.08);">
              <i class="fas ${icons[c.nama_kategori] || 'fa-tag'}"></i>
            </div>
            <strong>${c.nama_kategori}</strong>
          </div>
        </td>
        <td style="color:var(--text-muted);font-size:0.85rem;">${c.deskripsi || '—'}</td>
        <td><strong style="color:var(--cyan);">${count} produk</strong></td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-secondary btn-sm btn-icon" onclick="editCategory('${c.id}', '${c.nama_kategori}', '${(c.deskripsi||'').replace(/'/g,"\\'")}')"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="deleteCategory('${c.id}', '${c.nama_kategori}')"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function openAddCategoryModal() {
  currentEditId = null;
  document.getElementById('categoryModalTitle').textContent = 'Tambah Kategori';
  document.getElementById('categoryForm').reset();
  openModal('categoryModal');
}

function editCategory(id, nama, deskripsi) {
  currentEditId = id;
  document.getElementById('categoryModalTitle').textContent = 'Edit Kategori';
  document.getElementById('catNama').value = nama;
  document.getElementById('catDeskripsi').value = deskripsi;
  openModal('categoryModal');
}

async function saveCategory(e) {
  e.preventDefault();
  const formData = {
    nama_kategori: document.getElementById('catNama').value.trim(),
    deskripsi: document.getElementById('catDeskripsi').value.trim()
  };
  if (!formData.nama_kategori) { showToast('Nama kategori wajib diisi', 'error'); return; }
  let result;
  if (currentEditId) {
    result = await apiPut(`/categories/${currentEditId}`, formData);
  } else {
    result = await apiPost('/categories', formData);
  }
  if (result && !result.error) {
    showToast(currentEditId ? 'Kategori diupdate!' : 'Kategori ditambahkan!', 'success');
    closeModal('categoryModal');
    loadCategories();
  } else {
    showToast(result?.error || 'Gagal menyimpan kategori', 'error');
  }
}

async function deleteCategory(id, nama) {
  if (!confirm(`Hapus kategori "${nama}"?`)) return;
  const result = await apiDelete(`/categories/${id}`);
  if (result && !result.error) {
    showToast(`Kategori "${nama}" dihapus`, 'warning');
    loadCategories();
  } else {
    showToast(result?.error || 'Gagal hapus kategori', 'error');
  }
}

// ─────────────────────────────────────
//  INQUIRIES
// ─────────────────────────────────────
async function loadInquiries() {
  const tbody = document.getElementById('inquiriesTableBody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" class="loading"><i class="fas fa-spinner fa-spin"></i></td></tr>`;
  const data = await apiGet('/inquiries') || [];
  allInquiries = data;
  renderInquiriesTable(allInquiries);
  updateInquiryStats(allInquiries);
}

function updateInquiryStats(data) {
  const pending = data.filter(i => i.status_follow_up === 'pending').length;
  const diproses = data.filter(i => i.status_follow_up === 'diproses').length;
  const selesai = data.filter(i => i.status_follow_up === 'selesai').length;
  const el = id => document.getElementById(id);
  if (el('inquiryTotal')) el('inquiryTotal').textContent = data.length;
  if (el('inquiryPending')) el('inquiryPending').textContent = pending;
  if (el('inquiryDiproses')) el('inquiryDiproses').textContent = diproses;
  if (el('inquirySelesai')) el('inquirySelesai').textContent = selesai;
}

function renderInquiriesTable(data) {
  const tbody = document.getElementById('inquiriesTableBody');
  if (!tbody) return;
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fab fa-whatsapp"></i><h4>Belum ada inquiry</h4></div></td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(i => {
    const date = new Date(i.tanggal_interaksi).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    return `
      <tr>
        <td>
          <div style="display:flex;flex-direction:column;gap:2px;">
            <strong>${i.nama_customer}</strong>
            <a href="https://wa.me/${i.nomor_wa.replace(/[^0-9]/g,'')}" target="_blank" style="color:var(--green);font-size:0.8rem;">
              <i class="fab fa-whatsapp"></i> ${i.nomor_wa}
            </a>
          </div>
        </td>
        <td style="font-size:0.85rem;">${i.produk_diminati || '—'}</td>
        <td style="font-size:0.82rem;color:var(--text-muted);max-width:200px;">${i.pesan || '—'}</td>
        <td style="font-size:0.8rem;color:var(--text-dim);">${date}</td>
        <td><span class="badge badge-${i.status_follow_up}">${i.status_follow_up}</span></td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${i.status_follow_up !== 'diproses' ? `<button class="btn btn-secondary btn-sm" onclick="updateInquiryStatus('${i.id}','diproses')" title="Tandai Diproses"><i class="fas fa-clock"></i></button>` : ''}
            ${i.status_follow_up !== 'selesai' ? `<button class="btn btn-secondary btn-sm" onclick="updateInquiryStatus('${i.id}','selesai')" title="Tandai Selesai" style="color:var(--green)"><i class="fas fa-check"></i></button>` : ''}
            <button class="btn btn-danger btn-sm btn-icon" onclick="deleteInquiry('${i.id}')"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function filterInquiries() {
  const statusVal = document.getElementById('inquiryStatusFilter')?.value || '';
  const searchVal = document.getElementById('inquirySearch')?.value.toLowerCase() || '';
  const filtered = allInquiries.filter(i => {
    const matchStatus = !statusVal || i.status_follow_up === statusVal;
    const matchSearch = !searchVal || i.nama_customer.toLowerCase().includes(searchVal) || (i.produk_diminati || '').toLowerCase().includes(searchVal);
    return matchStatus && matchSearch;
  });
  renderInquiriesTable(filtered);
}

async function updateInquiryStatus(id, status) {
  const result = await apiPut(`/inquiries/${id}`, { status_follow_up: status });
  if (result && !result.error) {
    showToast(`Status diupdate ke "${status}"`, 'success');
    loadInquiries();
  } else {
    showToast(result?.error || 'Gagal update status', 'error');
  }
}

async function deleteInquiry(id) {
  if (!confirm('Hapus inquiry ini?')) return;
  const result = await apiDelete(`/inquiries/${id}`);
  if (result && !result.error) {
    showToast('Inquiry dihapus', 'warning');
    loadInquiries();
  } else {
    showToast(result?.error || 'Gagal hapus inquiry', 'error');
  }
}

function openAddInquiryModal() {
  document.getElementById('inquiryForm').reset();
  openModal('inquiryModal');
}

async function saveInquiry(e) {
  e.preventDefault();
  const formData = {
    nama_customer: document.getElementById('iqNama').value.trim(),
    nomor_wa: document.getElementById('iqWA').value.trim(),
    produk_diminati: document.getElementById('iqProduk').value.trim(),
    pesan: document.getElementById('iqPesan').value.trim()
  };
  if (!formData.nama_customer || !formData.nomor_wa) { showToast('Nama dan nomor WA wajib diisi', 'error'); return; }
  const result = await apiPost('/inquiries', formData);
  if (result && !result.error) {
    showToast('Inquiry berhasil dicatat!', 'success');
    closeModal('inquiryModal');
    loadInquiries();
  } else {
    showToast(result?.error || 'Gagal mencatat inquiry', 'error');
  }
}

// ─────────────────────────────────────
//  ANALYTICS
// ─────────────────────────────────────
async function loadAnalytics() {
  const summary = await apiGet('/analytics/summary') || { total_views: 2696, total_wa_clicks: 160 };
  const weekly = await apiGet('/analytics/weekly') || [];
  const topProducts = await apiGet('/analytics/top-products') || [];

  const el = id => document.getElementById(id);
  if (el('analyticsTotalViews')) el('analyticsTotalViews').textContent = (summary.total_views || 0).toLocaleString('id-ID');
  if (el('analyticsWAClicks')) el('analyticsWAClicks').textContent = summary.total_wa_clicks || 0;

  const weeklyVisitors = weekly.reduce((s, d) => s + (d.jumlah_pengunjung || 0), 0);
  if (el('analyticsWeeklyVisitors')) el('analyticsWeeklyVisitors').textContent = weeklyVisitors.toLocaleString('id-ID');

  renderAnalyticsChart(weekly);
  renderAnalyticsTopProducts(topProducts);
}

function renderAnalyticsChart(data) {
  const container = document.getElementById('analyticsChart');
  if (!container || !data.length) return;

  const maxVal = Math.max(...data.map(d => d.jumlah_pengunjung || 0), 1);
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  container.innerHTML = data.map(d => {
    const date = new Date(d.tanggal);
    const dayName = days[date.getDay()];
    const dateStr = `${date.getDate()}/${date.getMonth()+1}`;
    const heightPct = Math.max(4, Math.round((d.jumlah_pengunjung / maxVal) * 100));
    return `
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="height: ${heightPct}%">
          <div class="tooltip">${d.jumlah_pengunjung} visitor | ${d.klik_wa} WA</div>
        </div>
        <span class="chart-label">${dayName}<br><small>${dateStr}</small></span>
      </div>`;
  }).join('');
}

function renderAnalyticsTopProducts(data) {
  const container = document.getElementById('analyticsTopList');
  if (!container) return;
  const maxViews = Math.max(...data.map(p => p.jumlah_view || 0), 1);
  container.innerHTML = data.slice(0, 5).map((p, i) => {
    const views = p.jumlah_view || PRODUCT_ASSETS[p.name]?.jumlah_view || 0;
    const pct = Math.round((views / maxViews) * 100);
    return `
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
          <span style="font-size:0.88rem;font-weight:500;">${p.name}</span>
          <span style="font-size:0.82rem;color:var(--cyan);font-weight:600;">${views.toLocaleString('id-ID')} views</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.05);border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--cyan),var(--pink));border-radius:999px;transition:width 0.8s ease;"></div>
        </div>
      </div>`;
  }).join('');
}

// ─────────────────────────────────────
//  MODAL HELPERS
// ─────────────────────────────────────
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
  // cleanup product modal inputs when closed
  if (id === 'productModal') {
    const form = document.getElementById('productForm'); if (form) form.reset();
    const fileInput = document.getElementById('prodImageFile'); if (fileInput) fileInput.value = '';
    const urlInput = document.getElementById('prodImageUrl'); if (urlInput) urlInput.value = '';
    const img = document.getElementById('imgPreviewImg'); const ph = document.getElementById('imgPreviewPlaceholder');
    if (img) { img.src = ''; img.style.display = 'none'; }
    if (ph) ph.style.display = 'flex';
    currentEditId = null;
  }
}

// ─────────────────────────────────────
//  TOAST
// ─────────────────────────────────────
function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ─────────────────────────────────────
//  LOGOUT
// ─────────────────────────────────────
function logout() {
  if (!confirm('Yakin ingin logout?')) return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}
