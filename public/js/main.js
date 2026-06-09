// Main JavaScript for TechStore

document.addEventListener('DOMContentLoaded', function() {
  // Initialize cart count from navbar
  updateCartCount();
});

function updateCartCount() {
  // Cart count is automatically updated on page load from EJS
  console.log('Cart initialized');
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Add to Cart with animation
async function addToCart(productId, quantity = 1) {
  try {
    const response = await axios.post('/cart/add', {
      productId: productId,
      quantity: quantity
    });
    if (response.data.success) {
      // Show notification
      showNotification('Product added to cart!', 'success');
      // Update cart count in navbar
      await updateNavbarCartCount();
    }
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error adding to cart', 'error');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-bold z-50 ${
    type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' :
    'bg-blue-500'
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Update cart count in navbar
async function updateNavbarCartCount() {
  const cartCount = document.querySelector('[data-cart-count]');
  if (cartCount) {
    try {
      const response = await axios.get('/cart/count');
      cartCount.textContent = response.data.count;
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  }
}

// Format price
function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

// Lazy load images
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img.lazy').forEach(img => imageObserver.observe(img));
}
