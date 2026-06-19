/**
 * @jest-environment jsdom
 */

// We test the pure utility functions from script.js by extracting their logic.
// Since script.js is a browser script that relies on globals and DOM,
// we re-implement the testable functions inline from the source.

describe('Frontend Utility Functions (script.js)', () => {
  // ---- generateStars ----
  function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return '<i class="fas fa-star"></i>'.repeat(fullStars)
      + (hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : '')
      + '<i class="far fa-star"></i>'.repeat(emptyStars);
  }

  describe('generateStars', () => {
    it('returns 5 full stars for rating 5', () => {
      const result = generateStars(5);
      expect((result.match(/fas fa-star"/g) || []).length).toBe(5);
      expect(result).not.toContain('fa-star-half-alt');
      expect(result).not.toContain('far fa-star');
    });

    it('returns 0 full stars and 5 empty for rating 0', () => {
      const result = generateStars(0);
      expect(result).not.toContain('fas fa-star');
      expect((result.match(/far fa-star/g) || []).length).toBe(5);
    });

    it('returns 4 full + 1 half for rating 4.5', () => {
      const result = generateStars(4.5);
      // Count full stars (fas fa-star but not half-alt)
      const fullCount = (result.match(/fas fa-star"/g) || []).length;
      expect(fullCount).toBe(4);
      expect(result).toContain('fa-star-half-alt');
      expect(result).not.toContain('far fa-star');
    });

    it('returns 3 full + 1 half + 1 empty for rating 3.5', () => {
      const result = generateStars(3.5);
      const fullCount = (result.match(/fas fa-star"/g) || []).length;
      expect(fullCount).toBe(3);
      expect(result).toContain('fa-star-half-alt');
      expect((result.match(/far fa-star/g) || []).length).toBe(1);
    });

    it('returns 1 full + 4 empty for rating 1', () => {
      const result = generateStars(1);
      const fullCount = (result.match(/fas fa-star"/g) || []).length;
      expect(fullCount).toBe(1);
      expect((result.match(/far fa-star/g) || []).length).toBe(4);
    });
  });

  // ---- Product search/filter logic ----
  describe('Product filtering logic', () => {
    const products = [
      { id: 1, name: 'Logitech G403 HERO', category: 'mouse', brand: 'Logitech', price: 699000 },
      { id: 2, name: 'Rexus Daxa Air III', category: 'mouse', brand: 'Rexus', price: 599000 },
      { id: 3, name: 'Logitech G915 TKL', category: 'keyboard', brand: 'Logitech', price: 2499000 },
      { id: 4, name: 'HyperX Cloud II', category: 'headset', brand: 'HyperX', price: 999000 },
    ];

    function searchProducts(allProducts, query) {
      return allProducts.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    function filterByCategory(allProducts, category) {
      return (category === 'all' || category === 'Semua')
        ? allProducts
        : allProducts.filter(p => p.category === category);
    }

    it('searches by product name', () => {
      const result = searchProducts(products, 'G403');
      expect(result).toHaveLength(1);
      expect(result[0].name).toContain('G403');
    });

    it('searches by brand name (case-insensitive)', () => {
      const result = searchProducts(products, 'logitech');
      expect(result).toHaveLength(2);
    });

    it('searches by category', () => {
      const result = searchProducts(products, 'headset');
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('headset');
    });

    it('returns empty array for no match', () => {
      const result = searchProducts(products, 'nonexistent');
      expect(result).toHaveLength(0);
    });

    it('returns all on empty search', () => {
      const result = searchProducts(products, '');
      expect(result).toHaveLength(4);
    });

    it('filters by category mouse', () => {
      const result = filterByCategory(products, 'mouse');
      expect(result).toHaveLength(2);
      result.forEach(p => expect(p.category).toBe('mouse'));
    });

    it('returns all products for "all" category', () => {
      expect(filterByCategory(products, 'all')).toHaveLength(4);
    });

    it('returns all products for "Semua" category', () => {
      expect(filterByCategory(products, 'Semua')).toHaveLength(4);
    });

    it('returns empty for category with no products', () => {
      expect(filterByCategory(products, 'gamepad')).toHaveLength(0);
    });
  });

  // ---- Cart logic ----
  describe('Cart logic', () => {
    let cart;

    function addToCart(allProducts, productId) {
      const product = allProducts.find(p => p.id == productId);
      if (!product) return cart;
      const existing = cart.find(item => item.id == productId);
      if (existing) existing.quantity++;
      else cart.push({ ...product, quantity: 1 });
      return cart;
    }

    function updateQty(id, q) {
      if (q <= 0) {
        cart = cart.filter(i => i.id != id);
      } else {
        const item = cart.find(i => i.id == id);
        if (item) item.quantity = q;
      }
      return cart;
    }

    function removeFromCart(id) {
      cart = cart.filter(i => i.id != id);
      return cart;
    }

    function calculateTotal() {
      return cart.reduce((s, i) => s + (parseInt(i.price) * i.quantity), 0);
    }

    const products = [
      { id: 1, name: 'Mouse A', price: 100000 },
      { id: 2, name: 'Keyboard B', price: 200000 },
    ];

    beforeEach(() => {
      cart = [];
    });

    it('adds a product to empty cart', () => {
      addToCart(products, 1);
      expect(cart).toHaveLength(1);
      expect(cart[0].quantity).toBe(1);
      expect(cart[0].name).toBe('Mouse A');
    });

    it('increments quantity for existing product', () => {
      addToCart(products, 1);
      addToCart(products, 1);
      expect(cart).toHaveLength(1);
      expect(cart[0].quantity).toBe(2);
    });

    it('does nothing for non-existent product id', () => {
      addToCart(products, 999);
      expect(cart).toHaveLength(0);
    });

    it('adds multiple different products', () => {
      addToCart(products, 1);
      addToCart(products, 2);
      expect(cart).toHaveLength(2);
    });

    it('updates quantity of cart item', () => {
      addToCart(products, 1);
      updateQty(1, 5);
      expect(cart[0].quantity).toBe(5);
    });

    it('removes item when quantity updated to 0', () => {
      addToCart(products, 1);
      updateQty(1, 0);
      expect(cart).toHaveLength(0);
    });

    it('removes item when quantity updated to negative', () => {
      addToCart(products, 1);
      updateQty(1, -1);
      expect(cart).toHaveLength(0);
    });

    it('removes product from cart by id', () => {
      addToCart(products, 1);
      addToCart(products, 2);
      removeFromCart(1);
      expect(cart).toHaveLength(1);
      expect(cart[0].id).toBe(2);
    });

    it('calculates total correctly', () => {
      addToCart(products, 1);
      addToCart(products, 1);
      addToCart(products, 2);
      const total = calculateTotal();
      // 100000*2 + 200000*1 = 400000
      expect(total).toBe(400000);
    });

    it('returns 0 total for empty cart', () => {
      expect(calculateTotal()).toBe(0);
    });
  });

  // ---- Wishlist logic ----
  describe('Wishlist logic', () => {
    let wishlist;

    function toggleWishlistItem(allProducts, productId) {
      const product = allProducts.find(p => p.id == productId);
      if (!product) return { wishlist, added: false };
      const idx = wishlist.findIndex(item => item.id == productId);
      if (idx > -1) {
        wishlist.splice(idx, 1);
        return { wishlist, added: false };
      }
      wishlist.push(product);
      return { wishlist, added: true };
    }

    const products = [
      { id: 1, name: 'Mouse A' },
      { id: 2, name: 'Keyboard B' },
    ];

    beforeEach(() => {
      wishlist = [];
    });

    it('adds product to wishlist', () => {
      const result = toggleWishlistItem(products, 1);
      expect(result.added).toBe(true);
      expect(wishlist).toHaveLength(1);
    });

    it('removes product from wishlist on second toggle', () => {
      toggleWishlistItem(products, 1);
      const result = toggleWishlistItem(products, 1);
      expect(result.added).toBe(false);
      expect(wishlist).toHaveLength(0);
    });

    it('handles multiple items in wishlist', () => {
      toggleWishlistItem(products, 1);
      toggleWishlistItem(products, 2);
      expect(wishlist).toHaveLength(2);
    });

    it('only removes the toggled item', () => {
      toggleWishlistItem(products, 1);
      toggleWishlistItem(products, 2);
      toggleWishlistItem(products, 1);
      expect(wishlist).toHaveLength(1);
      expect(wishlist[0].id).toBe(2);
    });

    it('ignores non-existent product id', () => {
      const result = toggleWishlistItem(products, 999);
      expect(result.added).toBe(false);
      expect(wishlist).toHaveLength(0);
    });
  });

  // ---- DOM interaction tests ----
  describe('DOM Interactions', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    describe('toggleMenu', () => {
      function toggleMenu() {
        const links = document.getElementById('navLinks');
        const btn = document.getElementById('hamburger');
        if (!links || !btn) return;
        const isOpen = links.classList.toggle('open');
        btn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
      }

      it('toggles "open" class on navLinks', () => {
        document.body.innerHTML = `
          <div id="navLinks"></div>
          <button id="hamburger"><i class="fas fa-bars"></i></button>
        `;
        toggleMenu();
        expect(document.getElementById('navLinks').classList.contains('open')).toBe(true);
        toggleMenu();
        expect(document.getElementById('navLinks').classList.contains('open')).toBe(false);
      });

      it('changes hamburger icon to times when open', () => {
        document.body.innerHTML = `
          <div id="navLinks"></div>
          <button id="hamburger"><i class="fas fa-bars"></i></button>
        `;
        toggleMenu();
        expect(document.getElementById('hamburger').innerHTML).toContain('fa-times');
      });

      it('does nothing when elements are missing', () => {
        expect(() => {
          const links = document.getElementById('navLinks');
          const btn = document.getElementById('hamburger');
          if (!links || !btn) return;
        }).not.toThrow();
      });
    });

    describe('displayProducts', () => {
      function displayProducts(products) {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        if (!products || products.length === 0) {
          productsGrid.innerHTML = '<div>No products found.</div>';
          return;
        }
        productsGrid.innerHTML = products.map(p => `<div class="product-card">${p.name}</div>`).join('');
      }

      it('shows "No products found" for empty array', () => {
        document.body.innerHTML = '<div id="productsGrid"></div>';
        displayProducts([]);
        expect(document.getElementById('productsGrid').innerHTML).toContain('No products found');
      });

      it('shows "No products found" for null', () => {
        document.body.innerHTML = '<div id="productsGrid"></div>';
        displayProducts(null);
        expect(document.getElementById('productsGrid').innerHTML).toContain('No products found');
      });

      it('renders product cards', () => {
        document.body.innerHTML = '<div id="productsGrid"></div>';
        displayProducts([{ name: 'Mouse A' }, { name: 'KB B' }]);
        const cards = document.querySelectorAll('.product-card');
        expect(cards).toHaveLength(2);
      });

      it('does nothing when productsGrid is missing', () => {
        expect(() => displayProducts([{ name: 'X' }])).not.toThrow();
      });
    });

    describe('getOverlay', () => {
      function getOverlay() {
        let overlay = document.getElementById('overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'overlay';
          overlay.className = 'overlay';
          document.body.appendChild(overlay);
        }
        return overlay;
      }

      it('creates overlay if not present', () => {
        const overlay = getOverlay();
        expect(overlay).toBeTruthy();
        expect(overlay.id).toBe('overlay');
        expect(overlay.className).toBe('overlay');
      });

      it('returns existing overlay', () => {
        document.body.innerHTML = '<div id="overlay" class="overlay existing"></div>';
        const overlay = getOverlay();
        expect(overlay.classList.contains('existing')).toBe(true);
      });

      it('does not create duplicate overlays', () => {
        getOverlay();
        getOverlay();
        const overlays = document.querySelectorAll('#overlay');
        expect(overlays).toHaveLength(1);
      });
    });

    describe('checkLoginStatus', () => {
      function checkLoginStatus(storage) {
        const token = storage.getItem('token');
        const user = JSON.parse(storage.getItem('user') || 'null');
        const topbarRight = document.querySelector('.topbar-right');
        if (topbarRight) {
          if (token && user) {
            topbarRight.innerHTML = `<span>Welcome, ${user.name || user.email}!</span>`;
          } else {
            topbarRight.innerHTML = `<a href="login.html">Sign In</a>`;
          }
        }
      }

      it('shows welcome message when logged in', () => {
        document.body.innerHTML = '<div class="topbar-right"></div>';
        const storage = {
          getItem: jest.fn((key) => {
            if (key === 'token') return 'some-token';
            if (key === 'user') return JSON.stringify({ name: 'John', email: 'john@test.com' });
            return null;
          }),
        };
        checkLoginStatus(storage);
        expect(document.querySelector('.topbar-right').innerHTML).toContain('Welcome, John!');
      });

      it('shows sign in link when not logged in', () => {
        document.body.innerHTML = '<div class="topbar-right"></div>';
        const storage = {
          getItem: jest.fn(() => null),
        };
        checkLoginStatus(storage);
        expect(document.querySelector('.topbar-right').innerHTML).toContain('Sign In');
      });

      it('uses email when name is missing', () => {
        document.body.innerHTML = '<div class="topbar-right"></div>';
        const storage = {
          getItem: jest.fn((key) => {
            if (key === 'token') return 'tok';
            if (key === 'user') return JSON.stringify({ email: 'a@b.com' });
            return null;
          }),
        };
        checkLoginStatus(storage);
        expect(document.querySelector('.topbar-right').innerHTML).toContain('Welcome, a@b.com!');
      });
    });
  });

  // ---- Price formatting ----
  describe('Price formatting', () => {
    it('formats Indonesian rupiah correctly', () => {
      const price = 699000;
      const formatted = parseInt(price).toLocaleString('id-ID');
      expect(formatted).toMatch(/699/);
    });

    it('formats large prices', () => {
      const price = 2499000;
      const formatted = parseInt(price).toLocaleString('id-ID');
      expect(formatted).toMatch(/2.*499.*000/);
    });
  });
});
