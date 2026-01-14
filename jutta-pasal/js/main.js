/* =============================================
   JUTTA PASAL - MAIN JAVASCRIPT
   ============================================= */

document.addEventListener("DOMContentLoaded", function () {
  initHeader();
  initMobileNav();
  initTheme();
  initBackToTop();
  initCountdown();
  loadFeaturedProducts();
  initNewsletter();
  updateCounts();
});

// ===== Header Scroll =====
function initHeader() {
  const header = document.getElementById("header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 50);
  });
}

// ===== Mobile Navigation =====
function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const close = document.getElementById("nav-close");
  const menu = document.getElementById("nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  if (close && menu) {
    close.addEventListener("click", () => {
      menu.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (
      menu?.classList.contains("active") &&
      !menu.contains(e.target) &&
      !toggle?.contains(e.target)
    ) {
      menu.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}

// ===== Theme Toggle =====
function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  const icon = document.getElementById("theme-icon");
  const html = document.documentElement;

  const savedTheme = localStorage.getItem("theme") || "light";
  html.setAttribute("data-theme", savedTheme);
  if (icon)
    icon.className = savedTheme === "light" ? "fas fa-moon" : "fas fa-sun";

  if (toggle) {
    toggle.addEventListener("click", () => {
      const current = html.getAttribute("data-theme");
      const next = current === "light" ? "dark" : "light";
      html.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      if (icon)
        icon.className = next === "light" ? "fas fa-moon" : "fas fa-sun";
      showToast("Theme", `Switched to ${next} mode`, "info");
    });
  }
}

// ===== Back to Top =====
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 400);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ===== Countdown Timer =====
function initCountdown() {
  const days = document.getElementById("days");
  const hours = document.getElementById("hours");
  const mins = document.getElementById("minutes");
  const secs = document.getElementById("seconds");
  if (!days) return;

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);

  const update = () => {
    const now = new Date();
    const diff = endDate - now;
    if (diff <= 0) return;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    days.textContent = String(d).padStart(2, "0");
    hours.textContent = String(h).padStart(2, "0");
    mins.textContent = String(m).padStart(2, "0");
    secs.textContent = String(s).padStart(2, "0");
  };

  update();
  setInterval(update, 1000);
}

// ===== Load Featured Products =====
function loadFeaturedProducts() {
  const grid = document.getElementById("featured-products");
  if (!grid) return;

  const products = getProducts().slice(0, 8);
  grid.innerHTML = products.map((p) => createProductCard(p)).join("");
  attachProductEvents(grid);
}

// ===== Create Product Card =====
function createProductCard(product) {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const isWished = wishlist.includes(product.id);

  return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${
    product.name
  }" onerror="this.src='https://via.placeholder.com/260x220?text=Shoe'">
                <div class="product-badges">
                    ${
                      product.isNew
                        ? '<span class="product-badge new">New</span>'
                        : ""
                    }
                    ${
                      product.onSale
                        ? `<span class="product-badge sale">-${product.discount}%</span>`
                        : ""
                    }
                    ${
                      product.isBestseller
                        ? '<span class="product-badge hot">Hot</span>'
                        : ""
                    }
                </div>
                <div class="product-actions">
                    <button class="product-action-btn wishlist-btn ${
                      isWished ? "active" : ""
                    }" data-id="${product.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="product-action-btn quick-view-btn" data-id="${
                      product.id
                    }">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">
                    <a href="product.html?id=${product.id}">${product.name}</a>
                </h3>
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span>(${product.reviews})</span>
                </div>
                <div class="product-price">
                    <span class="current-price">Rs. ${product.price.toLocaleString()}</span>
                    ${
                      product.originalPrice
                        ? `<span class="original-price">Rs. ${product.originalPrice.toLocaleString()}</span>`
                        : ""
                    }
                </div>
            </div>
            <div class="product-footer">
                <button class="add-to-cart-btn" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
}

function generateStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) stars += '<i class="fas fa-star"></i>';
    else if (i - 0.5 <= rating) stars += '<i class="fas fa-star-half-alt"></i>';
    else stars += '<i class="far fa-star"></i>';
  }
  return stars;
}

function attachProductEvents(container) {
  container.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(parseInt(btn.dataset.id)));
  });

  container.querySelectorAll(".wishlist-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleWishlist(parseInt(btn.dataset.id));
      btn.classList.toggle("active");
    });
  });

  container.querySelectorAll(".quick-view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const product = getProducts().find(
        (p) => p.id === parseInt(btn.dataset.id)
      );
      if (product) {
        showToast("Quick View", product.name, "info");
      }
    });
  });
}

// ===== Newsletter =====
function initNewsletter() {
  const form = document.getElementById("newsletter-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Success", "Thank you for subscribing!", "success");
      form.reset();
    });
  }
}

// ===== Update Counts =====
function updateCounts() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  document.querySelectorAll("#cart-count").forEach((el) => {
    el.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  });

  document.querySelectorAll("#wishlist-count").forEach((el) => {
    el.textContent = wishlist.length;
  });
}

// ===== Toast Notifications =====
function showToast(title, message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icons = {
    success: "fa-check-circle",
    error: "fa-times-circle",
    warning: "fa-exclamation-circle",
    info: "fa-info-circle",
  };

  toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icons[type]}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

  container.appendChild(toast);

  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  });

  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add("hide");
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

// ===== Products Data =====
function getProducts() {
  return [
    {
      id: 1,
      name: "Nike Air Jordan 1 Retro High OG",
      category: "Jordan",
      brand: "Nike",
      price: 18500,
      originalPrice: 22000,
      discount: 16,
      image: "img/jordan.png",
      rating: 4.8,
      reviews: 245,
      sizes: [38, 39, 40, 41, 42, 43, 44, 45],
      colors: ["black", "red", "white"],
      isNew: false,
      isBestseller: true,
      onSale: true,
    },
    {
      id: 2,
      name: "Nike Space Hippie 04",
      category: "Sneakers",
      brand: "Nike",
      price: 14999,
      image: "img/hippie2.png",
      rating: 4.6,
      reviews: 128,
      sizes: [39, 40, 41, 42, 43, 44],
      colors: ["blue", "green"],
      isNew: true,
      isBestseller: false,
      onSale: false,
    },
    {
      id: 3,
      name: "Nike Air Max 270 React",
      category: "Running",
      brand: "Nike",
      price: 16500,
      originalPrice: 19000,
      discount: 13,
      image: "img/Hippie.png",
      rating: 4.7,
      reviews: 189,
      sizes: [38, 39, 40, 41, 42, 43],
      colors: ["white", "black", "blue"],
      isNew: false,
      isBestseller: true,
      onSale: true,
    },
    {
      id: 4,
      name: "Air Jordan 4 Retro",
      category: "Jordan",
      brand: "Nike",
      price: 21000,
      image: "img/jontan2.png",
      rating: 4.9,
      reviews: 312,
      sizes: [40, 41, 42, 43, 44, 45],
      colors: ["white", "red"],
      isNew: true,
      isBestseller: true,
      onSale: false,
    },
    {
      id: 5,
      name: "Nike Crater Impact",
      category: "Casual",
      brand: "Nike",
      price: 11999,
      image: "img/crater.png",
      rating: 4.4,
      reviews: 87,
      sizes: [38, 39, 40, 41, 42],
      colors: ["black", "white"],
      isNew: true,
      isBestseller: false,
      onSale: false,
    },
    {
      id: 6,
      name: "Nike Air Force 1 Master",
      category: "Sneakers",
      brand: "Nike",
      price: 13500,
      originalPrice: 15000,
      discount: 10,
      image: "img/masten.png",
      rating: 4.5,
      reviews: 156,
      sizes: [39, 40, 41, 42, 43, 44],
      colors: ["white", "black"],
      isNew: false,
      isBestseller: false,
      onSale: true,
    },
    {
      id: 7,
      name: "Classic Street Sneakers",
      category: "Sneakers",
      brand: "Nike",
      price: 9999,
      image: "img/sneakers.png",
      rating: 4.3,
      reviews: 98,
      sizes: [38, 39, 40, 41, 42, 43],
      colors: ["white", "blue", "red"],
      isNew: false,
      isBestseller: false,
      onSale: false,
    },
    {
      id: 8,
      name: "Air Jordan 1 Low",
      category: "Jordan",
      brand: "Nike",
      price: 12500,
      originalPrice: 14000,
      discount: 11,
      image: "img/jordan.png",
      rating: 4.6,
      reviews: 203,
      sizes: [39, 40, 41, 42, 43, 44, 45],
      colors: ["black", "white", "red"],
      isNew: false,
      isBestseller: true,
      onSale: true,
    },
    {
      id: 9,
      name: "Air Jordan 3 Retro El Vuelo",
      category: "Jordan",
      brand: "Nike",
      price: 25000,
      image: "img/basic9.avif",
      rating: 4.6,
      reviews: 203,
      sizes: [39, 40, 41, 42, 43, 44, 45],
      colors: ["black", "white", "red"],
      isNew: false,
      isBestseller: true,
      onSale: true,
    },
  ];
}

// ===== Global Exports =====
window.getProducts = getProducts;
window.showToast = showToast;
window.updateCounts = updateCounts;
window.createProductCard = createProductCard;
window.attachProductEvents = attachProductEvents;
window.generateStars = generateStars;
