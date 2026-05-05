// ============================================
//   AMBA GEAR - Main JavaScript
// ============================================

// === HERO SLIDER ===
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const dotsContainer = document.getElementById('slideDots');
let slideInterval;

function initSlider() {
  if (!slides.length) return;
  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });
  startAutoSlide();
}

function goToSlide(n) {
  slides[currentSlide].classList.remove('active');
  document.querySelectorAll('.slide-dot')[currentSlide].classList.remove('active');
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  document.querySelectorAll('.slide-dot')[currentSlide].classList.add('active');
}

function changeSlide(dir) {
  goToSlide(currentSlide + dir);
  resetAutoSlide();
}

function startAutoSlide() {
  slideInterval = setInterval(() => changeSlide(1), 5000);
}
function resetAutoSlide() {
  clearInterval(slideInterval);
  startAutoSlide();
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
  const productCards = document.querySelectorAll('.product-card[data-cat]');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      productCards.forEach(card => {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.style.display = '';
          setTimeout(() => card.style.opacity = '1', 10);
        } else {
          card.style.opacity = '0';
          setTimeout(() => card.style.display = 'none', 300);
        }
      });
    });
  });

  // Auto-filter from URL param
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  if (catParam) {
    const targetBtn = document.querySelector(`.filter-btn[data-filter="${catParam}"]`);
    if (targetBtn) targetBtn.click();
  }
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
  initFilter();
  initOrderForm();
});
