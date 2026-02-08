// Color mapping object
const colorMap = {
  'black': {
    image: 'product-black.png',
    label: 'Hitam'
  },
  'blue': {
    image: 'product-blue.png',
    label: 'Biru'
  },
  'white': {
    image: 'product-white.png',
    label: 'Putih'
  }
};

// Dark Mode State
let isDarkMode = localStorage.getItem('revorz_darkMode') !== 'light';

// State variables
let currentQty = 1;
let currentColor = 'white';
let currentPrice = 75000;

// DOM Elements
const productImage = document.getElementById('productImage');
const selectedColorLabel = document.getElementById('selectedColorLabel');
const priceElement = document.getElementById('price');
const qtyElement = document.getElementById('qty');
const decreaseQtyBtn = document.getElementById('decreaseQty');
const increaseQtyBtn = document.getElementById('increaseQty');
const addToCartBtn = document.getElementById('addToCartBtn');
const cartButton = document.getElementById('cartButton');
const cartDot = document.getElementById('cart-dot');
const loginButton = document.getElementById('loginButton');
const colorOptions = document.querySelectorAll('.color-option');
const heroWatch = document.getElementById('heroWatch');
const exploreBtn = document.getElementById('exploreBtn');
const learnMoreBtn = document.getElementById('learnMoreBtn');
const viewProductButtons = document.querySelectorAll('[id^="viewProduct"]');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const newsletterForm = document.querySelector('form');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  // Set up event listeners
  setupEventListeners();

  // Initialize UI
  updateUI();

  // Update cart indicator
  updateCartDot();

  // Preload all color images
  preloadImages();

  // Check if coming from index page with product data
  const selectedProduct = sessionStorage.getItem('selectedProduct');
  if (selectedProduct) {
    const product = JSON.parse(selectedProduct);
    updateProductDisplay(product);
    sessionStorage.removeItem('selectedProduct'); // Clear after use
  }

  // Initialize color selection
  initializeColorSelection('white');

  // Setup color selection logic
  setupColorLogic();

  // Initialize scroll reveal
  initScrollReveal();
  
  // Initialize theme
  initializeTheme();
}

function setupEventListeners() {
  // Quantity buttons
  if (decreaseQtyBtn) decreaseQtyBtn.addEventListener('click', () => updateQty(-1));
  if (increaseQtyBtn) increaseQtyBtn.addEventListener('click', () => updateQty(1));

  // Add to cart button
  if (addToCartBtn) addToCartBtn.addEventListener('click', addToCart);

  // Cart button
  if (cartButton) cartButton.addEventListener('click', goToCartOrLogin);

  // Login button
  if (loginButton) {
    loginButton.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }

  // Hero buttons
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      const collections = document.querySelector('#collections') || document.querySelector('.product-card');
      if (collections) {
        collections.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = 'product.html';
      }
    });
  }

  if (learnMoreBtn) {
    learnMoreBtn.addEventListener('click', () => {
      window.location.href = 'product.html';
    });
  }

  // View product buttons
  if (viewProductButtons.length > 0) {
    viewProductButtons.forEach(button => {
      button.addEventListener('click', redirectToProduct);
    });
  }

  // Dark Mode Toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleDarkMode);
  }
  
  // Newsletter form submission
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }
  
  // Social media links
  const socialLinks = document.querySelectorAll('footer a[href^="#"]');
  socialLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = this.getAttribute('href');
      if (target === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
  
  // Add event listeners for the view product buttons on index page
  const indexViewProductButtons = document.querySelectorAll('.view-product-btn');
  if (indexViewProductButtons.length > 0) {
    indexViewProductButtons.forEach(button => {
      button.addEventListener('click', function() {
        const product = this.getAttribute('data-product');
        const price = this.getAttribute('data-price');
        const image = this.getAttribute('data-image');
        
        // Store product details in session storage
        sessionStorage.setItem('selectedProduct', JSON.stringify({
          name: product,
          price: price,
          image: image
        }));
        
        // Redirect to product page
        window.location.href = 'product.html';
      });
    });
  }
}

function handleNewsletterSubmit(e) {
  e.preventDefault();
  const emailInput = e.target.querySelector('input[type="email"]');
  if (emailInput && emailInput.value) {
    showNotification('Terima kasih! Email Anda telah terdaftar.', 'success');
    e.target.reset();
  }
}

function preloadImages() {
  Object.values(colorMap).forEach(colorData => {
    const img = new Image();
    img.src = colorData.image;
  });
}

function initializeColorSelection(color) {
  // Remove selected class from all options
  if (colorOptions.length > 0) {
    colorOptions.forEach(option => {
      option.classList.remove('selected');
      option.setAttribute('aria-pressed', 'false');
    });

    // Find the option with the specified color
    const targetOption = Array.from(colorOptions).find(
      option => option.getAttribute('data-color') === color
    );

    if (targetOption) {
      // Add selected class and mark pressed state
      targetOption.classList.add('selected');
      targetOption.setAttribute('aria-pressed', 'true');

      // Update the image and price
      const imgPath = targetOption.getAttribute('data-image');
      const colorLabel = targetOption.getAttribute('data-label');

      if (productImage) {
        productImage.src = imgPath;
      }
      currentColor = color;

      // Update label
      if (selectedColorLabel) {
        selectedColorLabel.textContent = `Warna: ${colorLabel}`;
      }
    }
  }
}

function setupColorLogic() {
  if (colorOptions.length > 0) {
    colorOptions.forEach(option => {
      // Make keyboard accessible
      option.setAttribute('tabindex', option.getAttribute('tabindex') || '0');
      option.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });

      option.addEventListener('click', function() {
        // Update UI and accessibility states
        colorOptions.forEach(opt => {
          opt.classList.remove('selected');
          opt.setAttribute('aria-pressed', 'false');
        });

        this.classList.add('selected');
        this.setAttribute('aria-pressed', 'true');

        // Get data from attributes
        const imgPath = this.getAttribute('data-image');
        const colorName = this.getAttribute('data-color');
        const colorLabel = this.getAttribute('data-label');

        // Change image
        if (productImage) {
          productImage.src = imgPath;
        }

        currentColor = colorName;

        // Update label
        if (selectedColorLabel) {
          selectedColorLabel.textContent = `Warna: ${colorLabel}`;
        }
      });
    });
  }
}

function updateQty(change) {
  currentQty = Math.max(1, currentQty + change);
  if (qtyElement) {
    qtyElement.innerText = currentQty;
  }
}

function addToCart() {
  if (!sessionStorage.getItem('isLoggedIn')) {
    showNotification('Harap login untuk belanja.', 'warning');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }

  const productNameElement = document.getElementById('productName');
  const productName = productNameElement ? productNameElement.textContent : 'Smart Watch Pro';

  const cart = JSON.parse(localStorage.getItem('revorz_cart')) || [];
  const existingIndex = cart.findIndex(item =>
    item.nama === productName && item.warna === currentColor
  );

  if (existingIndex > -1) {
    cart[existingIndex].qty += currentQty;
  } else {
    cart.push({
      id: Date.now(),
      nama: productName,
      harga: currentPrice,
      img: productImage ? productImage.src : '',
      qty: currentQty,
      warna: currentColor
    });
  }

  localStorage.setItem('revorz_cart', JSON.stringify(cart));
  updateCartDot();
  showNotification(`Berhasil! ${currentQty} ${productName} ${colorMap[currentColor].label} masuk keranjang.`, 'success');
}

function updateCartDot() {
  const cart = JSON.parse(localStorage.getItem('revorz_cart')) || [];
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartDot) {
    count > 0 ? cartDot.classList.remove('hidden') : cartDot.classList.add('hidden');
  }
}

function updateProductDisplay(product) {
  const productNameElement = document.getElementById('productName');
  const productImageElement = document.getElementById('productImage');
  const priceElement = document.getElementById('price');
  
  if (productNameElement && product.name) {
    productNameElement.textContent = product.name;
  }
  
  if (productImageElement && product.image) {
    productImageElement.src = product.image;
    // Update the color options to reflect the selected image
    const colorFromImage = product.image.includes('black') ? 'black' : 
                          product.image.includes('blue') ? 'blue' : 'white';
    initializeColorSelection(colorFromImage);
  }
  
  if (priceElement && product.price) {
    // Format the price with dots as thousands separators
    const numericPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const formattedPrice = new Intl.NumberFormat('id-ID').format(Math.round(numericPrice / 1000)) + 'J';
    priceElement.textContent = formattedPrice;
    currentPrice = Math.round(numericPrice / 1000); // Update current price
  }
}

function updateUI() {
  const loggedIn = sessionStorage.getItem('isLoggedIn');
  if (loginButton) {
    loginButton.textContent = loggedIn ? 'Akun Saya' : 'Login';
  }
}

function showNotification(msg, type) {
  const colors = {
    success: '#10b981',
    warning: '#f59e0b',
    info: '#2563eb',
    error: '#ef4444'
  };

  // Remove existing notification if present
  const existingNotification = document.getElementById('web-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const div = document.createElement('div');
  div.id = 'web-notification';
  div.className = 'fixed top-6 right-6 px-6 py-4 rounded-2xl shadow-lg z-[100] font-bold text-sm flex items-center gap-3';
  div.style.backgroundColor = colors[type];
  div.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${getNotificationIcon(type)}
    </svg>
    ${msg}
  `;

  document.body.appendChild(div);

  setTimeout(() => {
    if (div.parentNode) {
      div.remove();
    }
  }, 3000);
}

function getNotificationIcon(type) {
  switch(type) {
    case 'success':
      return '<circle cx="12" cy="12" r="10"/><path d="m5 12 3 3 7-7"/>';
    case 'warning':
      return '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><circle cx="12" cy="16" r="1"/>';
    case 'error':
      return '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>';
    default:
      return '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>';
  }
}

function goToCartOrLogin() {
  if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
  } else {
    window.location.href = 'cart.html';
  }
}

function redirectToProduct() {
  window.location.href = 'product.html';
}

// Scroll Reveal
function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  reveals.forEach(el => {
    let windowHeight = window.innerHeight;
    let elementTop = el.getBoundingClientRect().top;
    if (elementTop < windowHeight - 50) el.classList.add("active");
  });
}

window.addEventListener("scroll", initScrollReveal);

// Dark Mode Functions
function initializeTheme() {
  const savedTheme = localStorage.getItem('revorz_darkMode');
  if (savedTheme) {
    isDarkMode = savedTheme === 'dark';
  }
  
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  updateThemeIcon();
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  localStorage.setItem('revorz_darkMode', isDarkMode ? 'dark' : 'light');

  document.body.classList.toggle('dark-mode');
  updateThemeIcon();

  // Add animation
  if (themeToggle) {
    themeToggle.style.animation = 'none';
    setTimeout(() => {
      themeToggle.style.animation = '';
    }, 10);
  }
}

function updateThemeIcon() {
  if (themeIcon) {
    themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
  }
}

// Handle form submissions
document.addEventListener('submit', function(e) {
  if (e.target.closest('form')) {
    e.preventDefault();
  }
});

// Countdown Timer Function
function initCountdown() {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 5); // 5 days from now
  endDate.setHours(endDate.getHours() + 12); // Add 12 hours

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = endDate.getTime() - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
      if (distance < 0) {
        countdownElement.textContent = 'Penawaran Berakhir';
      } else {
        countdownElement.textContent = `${days} hari ${hours} jam ${minutes} menit`;
      }
    }
  }

  // Update countdown immediately
  updateCountdown();
  
  // Update every second
  setInterval(updateCountdown, 1000);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add scroll event for parallax effects on hero
window.addEventListener('scroll', function() {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  parallaxElements.forEach(el => {
    const speed = el.getAttribute('data-parallax') || 0.5;
    el.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// Enhanced scroll reveal with intersection observer
function setupEnhancedScrollReveal() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

// Call enhanced scroll reveal on DOMContentLoaded
document.addEventListener('DOMContentLoaded', setupEnhancedScrollReveal);

// Newsletter form handler
if (newsletterForm) {
  newsletterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    
    if (email) {
      showNotification('Terima kasih! Anda telah subscribe ke newsletter kami.', 'success');
      this.reset();
    }
  });
}