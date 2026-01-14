/* ================================
   JUTTA PASAL - PRODUCTS PAGE JS
   ================================ */

document.addEventListener("DOMContentLoaded", function () {
  const productsGrid = document.getElementById("products-grid");
  if (!productsGrid) return;

  // State
  let currentPage = 1;
  let productsPerPage = 12;
  let filteredProducts = getProducts();
  let currentView = "grid";

  // Initialize
  init();

  function init() {
    loadProducts();
    initFilters();
    initSorting();
    initViewToggle();
    initPagination();
    checkURLParams();
  }

  function checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");
    const sale = urlParams.get("sale");

    if (category) {
      const checkbox = document.querySelector(
        `input[name="category"][value="${category}"]`
      );
      if (checkbox) {
        checkbox.checked = true;
        applyFilters();
      }
    }

    if (sale === "true") {
      filteredProducts = getProducts().filter((p) => p.onSale);
      loadProducts();
    }
  }

  function loadProducts() {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Update count
    const showingCount = document.getElementById("showing-count");
    const totalCount = document.getElementById("total-count");

    if (showingCount) {
      showingCount.textContent =
        filteredProducts.length > 0
          ? `${startIndex + 1}-${Math.min(endIndex, filteredProducts.length)}`
          : "0";
    }
    if (totalCount) {
      totalCount.textContent = filteredProducts.length;
    }

    // Render products
    productsGrid.innerHTML = "";
    productsGrid.className = `products-grid ${
      currentView === "list" ? "list-view" : ""
    }`;

    if (paginatedProducts.length === 0) {
      productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem; display: block;"></i>
                    <h3>No products found</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">Try adjusting your filters</p>
                    <button class="btn btn-primary" id="reset-filters-btn">Clear All Filters</button>
                </div>
            `;

      document
        .getElementById("reset-filters-btn")
        ?.addEventListener("click", clearAllFilters);
      return;
    }

    renderProducts(productsGrid, paginatedProducts);
    updatePagination();
  }

  function initFilters() {
    // Category filters
    document.querySelectorAll('input[name="category"]').forEach((checkbox) => {
      checkbox.addEventListener("change", applyFilters);
    });

    // Brand filters
    document.querySelectorAll('input[name="brand"]').forEach((checkbox) => {
      checkbox.addEventListener("change", applyFilters);
    });

    // Size filters
    document.querySelectorAll(".size-filter").forEach((btn) => {
      btn.addEventListener("click", function () {
        this.classList.toggle("active");
        applyFilters();
      });
    });

    // Color filters
    document.querySelectorAll(".color-filter").forEach((btn) => {
      btn.addEventListener("click", function () {
        this.classList.toggle("active");
        applyFilters();
      });
    });

    // Price range
    const priceSlider = document.getElementById("price-slider");
    const minPriceInput = document.getElementById("min-price");
    const maxPriceInput = document.getElementById("max-price");

    if (priceSlider) {
      priceSlider.addEventListener("input", function () {
        if (maxPriceInput) maxPriceInput.value = this.value;
      });
      priceSlider.addEventListener("change", applyFilters);
    }

    if (minPriceInput) {
      minPriceInput.addEventListener("change", applyFilters);
    }

    if (maxPriceInput) {
      maxPriceInput.addEventListener("change", function () {
        if (priceSlider) priceSlider.value = this.value;
        applyFilters();
      });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById("clear-filters");
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", clearAllFilters);
    }

    // Mobile filter toggle
    const mobileFilterBtn = document.getElementById("mobile-filter-btn");
    const filtersSidebar = document.getElementById("filters-sidebar");

    if (mobileFilterBtn && filtersSidebar) {
      mobileFilterBtn.addEventListener("click", function () {
        filtersSidebar.classList.toggle("active");
        document.body.style.overflow = filtersSidebar.classList.contains(
          "active"
        )
          ? "hidden"
          : "";
      });
    }
  }

  function clearAllFilters() {
    // Reset checkboxes
    document
      .querySelectorAll('input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));

    // Reset size and color buttons
    document.querySelectorAll(".size-filter, .color-filter").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Reset price
    const priceSlider = document.getElementById("price-slider");
    const minPrice = document.getElementById("min-price");
    const maxPrice = document.getElementById("max-price");

    if (priceSlider) priceSlider.value = 50000;
    if (minPrice) minPrice.value = 0;
    if (maxPrice) maxPrice.value = 50000;

    // Reset sort
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) sortSelect.value = "default";

    // Reset products
    filteredProducts = getProducts();
    currentPage = 1;
    loadProducts();

    showToast("Success", "All filters cleared", "success");
  }

  function applyFilters() {
    let products = getProducts();

    // Category filter
    const selectedCategories = Array.from(
      document.querySelectorAll('input[name="category"]:checked')
    ).map((cb) => cb.value.toLowerCase());
    if (selectedCategories.length > 0) {
      products = products.filter((p) =>
        selectedCategories.includes(p.category.toLowerCase())
      );
    }

    // Brand filter
    const selectedBrands = Array.from(
      document.querySelectorAll('input[name="brand"]:checked')
    ).map((cb) => cb.value.toLowerCase());
    if (selectedBrands.length > 0) {
      products = products.filter((p) =>
        selectedBrands.includes(p.brand.toLowerCase())
      );
    }

    // Size filter
    const selectedSizes = Array.from(
      document.querySelectorAll(".size-filter.active")
    ).map((btn) => parseInt(btn.dataset.size));
    if (selectedSizes.length > 0) {
      products = products.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s))
      );
    }

    // Color filter
    const selectedColors = Array.from(
      document.querySelectorAll(".color-filter.active")
    ).map((btn) => btn.dataset.color);
    if (selectedColors.length > 0) {
      products = products.filter((p) =>
        p.colors.some((c) => selectedColors.includes(c))
      );
    }

    // Price filter
    const minPrice = parseInt(document.getElementById("min-price")?.value) || 0;
    const maxPrice =
      parseInt(document.getElementById("max-price")?.value) || 50000;
    products = products.filter(
      (p) => p.price >= minPrice && p.price <= maxPrice
    );

    filteredProducts = products;
    currentPage = 1;

    // Apply sorting
    const sortValue =
      document.getElementById("sort-select")?.value || "default";
    sortProducts(sortValue);
  }

  function initSorting() {
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        sortProducts(this.value);
      });
    }
  }

  function sortProducts(sortBy) {
    switch (sortBy) {
      case "price-low":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "name-az":
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-za":
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "rating":
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Default sorting (by id)
        filteredProducts.sort((a, b) => a.id - b.id);
    }

    loadProducts();
  }

  function initViewToggle() {
    const gridViewBtn = document.getElementById("grid-view");
    const listViewBtn = document.getElementById("list-view");

    if (gridViewBtn) {
      gridViewBtn.addEventListener("click", function () {
        currentView = "grid";
        gridViewBtn.classList.add("active");
        listViewBtn?.classList.remove("active");
        loadProducts();
      });
    }

    if (listViewBtn) {
      listViewBtn.addEventListener("click", function () {
        currentView = "list";
        listViewBtn.classList.add("active");
        gridViewBtn?.classList.remove("active");
        loadProducts();
      });
    }
  }

  function initPagination() {
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (currentPage > 1) {
          currentPage--;
          loadProducts();
          scrollToProducts();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        if (currentPage < totalPages) {
          currentPage++;
          loadProducts();
          scrollToProducts();
        }
      });
    }
  }

  function updatePagination() {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    if (totalPages <= 1) {
      pagination.style.display = "none";
      return;
    }

    pagination.style.display = "flex";

    // Generate pagination buttons
    let paginationHTML = `
            <button class="page-btn" id="prev-page" ${
              currentPage === 1 ? "disabled" : ""
            }>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

    // Calculate which pages to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    if (startPage > 1) {
      paginationHTML += `<button class="page-btn" data-page="1">1</button>`;
      if (startPage > 2) {
        paginationHTML += `<span style="padding: 0 0.5rem;">...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
                <button class="page-btn ${
                  i === currentPage ? "active" : ""
                }" data-page="${i}">${i}</button>
            `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span style="padding: 0 0.5rem;">...</span>`;
      }
      paginationHTML += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    paginationHTML += `
            <button class="page-btn" id="next-page" ${
              currentPage === totalPages ? "disabled" : ""
            }>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

    pagination.innerHTML = paginationHTML;

    // Add event listeners
    pagination.querySelectorAll(".page-btn[data-page]").forEach((btn) => {
      btn.addEventListener("click", function () {
        currentPage = parseInt(this.dataset.page);
        loadProducts();
        scrollToProducts();
      });
    });

    // Re-init prev/next buttons
    initPagination();
  }

  function scrollToProducts() {
    const productsSection = document.querySelector(".products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
});
// Sample Products Data
const PRODUCTS_DATA = [
  {
    id: 1,
    name: "Air Jordan 1 Retro High",
    category: "jordan",
    brand: "jordan",
    price: 18999,
    originalPrice: 24999,
    discount: 24,
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500",
    rating: 5,
    reviews: 128,
    sizes: [40, 41, 42, 43, 44],
    colors: ["black", "red", "white"],
    inStock: true,
    isNew: true,
    isSale: true,
    description:
      "The Air Jordan 1 Retro High remakes the classic sneaker, giving you a fresh look with a familiar feel.",
  },
  {
    id: 2,
    name: "Nike Air Max 270",
    category: "sneakers",
    brand: "nike",
    price: 15999,
    originalPrice: 19999,
    discount: 20,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    rating: 4,
    reviews: 89,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: ["black", "white", "blue"],
    inStock: true,
    isNew: false,
    isSale: true,
    description:
      "The Nike Air Max 270 delivers visible cushioning under every step.",
  },
  {
    id: 3,
    name: "Adidas Ultraboost 22",
    category: "running",
    brand: "adidas",
    price: 16999,
    originalPrice: 21999,
    discount: 23,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500",
    rating: 5,
    reviews: 156,
    sizes: [40, 41, 42, 43, 44],
    colors: ["black", "white", "blue", "green"],
    inStock: true,
    isNew: true,
    isSale: false,
    description:
      "Ultraboost 22 running shoes with responsive cushioning for energized runs.",
  },
  {
    id: 4,
    name: "Nike Blazer Mid '77",
    category: "casual",
    brand: "nike",
    price: 12999,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500",
    rating: 4,
    reviews: 73,
    sizes: [39, 40, 41, 42, 43],
    colors: ["white", "black", "red"],
    inStock: true,
    isNew: false,
    isSale: false,
    description:
      "Classic basketball style meets modern comfort in the Nike Blazer Mid '77.",
  },
  {
    id: 5,
    name: "Puma RS-X³",
    category: "sneakers",
    brand: "puma",
    price: 11999,
    originalPrice: 14999,
    discount: 20,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
    rating: 4,
    reviews: 45,
    sizes: [40, 41, 42, 43, 44],
    colors: ["white", "blue", "orange"],
    inStock: true,
    isNew: false,
    isSale: true,
    description:
      "Bold RS-X³ sneakers with chunky silhouette and vibrant colors.",
  },
  {
    id: 6,
    name: "Converse Chuck 70 High",
    category: "casual",
    brand: "converse",
    price: 8999,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500",
    rating: 5,
    reviews: 234,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    colors: ["black", "white"],
    inStock: true,
    isNew: false,
    isSale: false,
    description:
      "Iconic Chuck Taylor All Star with premium materials and enhanced comfort.",
  },
  {
    id: 7,
    name: "New Balance 574",
    category: "casual",
    brand: "newbalance",
    price: 10999,
    originalPrice: 13999,
    discount: 21,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=500",
    rating: 4,
    reviews: 91,
    sizes: [39, 40, 41, 42, 43, 44],
    colors: ["gray", "blue", "green"],
    inStock: true,
    isNew: false,
    isSale: true,
    description: "Classic New Balance 574 with ENCAP midsole cushioning.",
  },
  {
    id: 8,
    name: "Adidas Stan Smith",
    category: "casual",
    brand: "adidas",
    price: 9999,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1612902376001-6b763e7e7d3a?w=500",
    rating: 5,
    reviews: 312,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    colors: ["white", "green"],
    inStock: true,
    isNew: false,
    isSale: false,
    description: "The iconic tennis shoe that's stood the test of time.",
  },
  {
    id: 9,
    name: "Nike Dunk Low Retro",
    category: "sneakers",
    brand: "nike",
    price: 14999,
    originalPrice: 17999,
    discount: 17,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500",
    rating: 5,
    reviews: 167,
    sizes: [40, 41, 42, 43, 44],
    colors: ["black", "white", "blue", "red"],
    inStock: true,
    isNew: true,
    isSale: true,
    description:
      "Created for the hardwood but taken to the streets, the Nike Dunk Low Retro returns.",
  },
  {
    id: 10,
    name: "Vans Old Skool",
    category: "casual",
    brand: "vans",
    price: 7999,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=500",
    rating: 4,
    reviews: 198,
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: ["black", "white"],
    inStock: true,
    isNew: false,
    isSale: false,
    description: "The original classic side stripe shoe, the Vans Old Skool.",
  },
  {
    id: 11,
    name: "Jordan 4 Retro",
    category: "jordan",
    brand: "jordan",
    price: 22999,
    originalPrice: 28999,
    discount: 21,
    image: "https://images.unsplash.com/photo-1612015670817-0127d66d6977?w=500",
    rating: 5,
    reviews: 89,
    sizes: [40, 41, 42, 43, 44],
    colors: ["white", "red", "black"],
    inStock: true,
    isNew: true,
    isSale: true,
    isHot: true,
    description:
      "The Air Jordan 4 Retro brings back the iconic silhouette with premium materials.",
  },
  {
    id: 12,
    name: "Nike React Infinity Run",
    category: "running",
    brand: "nike",
    price: 17999,
    originalPrice: 21999,
    discount: 18,
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500",
    rating: 5,
    reviews: 124,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: ["black", "white", "blue"],
    inStock: true,
    isNew: false,
    isSale: true,
    description:
      "Designed to help reduce injury, the Nike React Infinity Run keeps you running.",
  },
  {
    id: 13,
    name: "Adidas Samba Classic",
    category: "casual",
    brand: "adidas",
    price: 9499,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=500",
    rating: 4,
    reviews: 156,
    sizes: [39, 40, 41, 42, 43, 44],
    colors: ["black", "white"],
    inStock: true,
    isNew: false,
    isSale: false,
    description:
      "A timeless indoor soccer shoe that's become a streetwear staple.",
  },
  {
    id: 14,
    name: "Puma Suede Classic",
    category: "casual",
    brand: "puma",
    price: 8999,
    originalPrice: 11999,
    discount: 25,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500",
    rating: 4,
    reviews: 87,
    sizes: [38, 39, 40, 41, 42, 43],
    colors: ["blue", "red", "black"],
    inStock: true,
    isNew: false,
    isSale: true,
    description: "The iconic Puma Suede Classic with premium suede upper.",
  },
  {
    id: 15,
    name: "Nike Air Force 1 '07",
    category: "sneakers",
    brand: "nike",
    price: 13999,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500",
    rating: 5,
    reviews: 445,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    colors: ["white", "black"],
    inStock: true,
    isNew: false,
    isSale: false,
    description:
      "The radiance lives on in the Nike Air Force 1 '07, the basketball original.",
  },
  {
    id: 16,
    name: "New Balance 990v5",
    category: "running",
    brand: "newbalance",
    price: 19999,
    originalPrice: 24999,
    discount: 20,
    image: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=500",
    rating: 5,
    reviews: 67,
    sizes: [40, 41, 42, 43, 44],
    colors: ["gray", "black"],
    inStock: true,
    isNew: true,
    isSale: true,
    description: "The 990v5 is a refined update to the classic running shoe.",
  },
  {
    id: 17,
    name: "Adidas Forum Low",
    category: "sneakers",
    brand: "adidas",
    price: 12999,
    originalPrice: 15999,
    discount: 19,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500",
    rating: 4,
    reviews: 78,
    sizes: [39, 40, 41, 42, 43, 44],
    colors: ["white", "blue"],
    inStock: true,
    isNew: false,
    isSale: true,
    description: "A basketball classic from the 80s, reinvented for today.",
  },
  {
    id: 18,
    name: "Nike Pegasus 39",
    category: "running",
    brand: "nike",
    price: 14999,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=500",
    rating: 5,
    reviews: 203,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: ["black", "white", "blue"],
    inStock: true,
    isNew: true,
    isSale: false,
    description:
      "Responsive cushioning in the Nike Pegasus 39 provides an energized ride.",
  },
  {
    id: 19,
    name: "Converse One Star Pro",
    category: "casual",
    brand: "converse",
    price: 7499,
    originalPrice: 9999,
    discount: 25,
    image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500",
    rating: 4,
    reviews: 56,
    sizes: [39, 40, 41, 42, 43],
    colors: ["black", "white", "blue"],
    inStock: true,
    isNew: false,
    isSale: true,
    description: "Classic One Star silhouette enhanced for skateboarding.",
  },
  {
    id: 20,
    name: "Jordan 11 Retro",
    category: "jordan",
    brand: "jordan",
    price: 24999,
    originalPrice: 29999,
    discount: 17,
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=500",
    rating: 5,
    reviews: 178,
    sizes: [40, 41, 42, 43, 44],
    colors: ["black", "white", "red"],
    inStock: true,
    isNew: true,
    isSale: true,
    isHot: true,
    description:
      "The Air Jordan 11 Retro brings back the legendary design with patent leather.",
  },
  {
    id: 21,
    name: "Vans Sk8-Hi",
    category: "casual",
    brand: "vans",
    price: 8499,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500",
    rating: 4,
    reviews: 134,
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: ["black", "white"],
    inStock: true,
    isNew: false,
    isSale: false,
    description: "The legendary high top inspired by the classic Old Skool.",
  },
  {
    id: 22,
    name: "Adidas Yeezy Boost 350 V2",
    category: "sneakers",
    brand: "adidas",
    price: 29999,
    originalPrice: 34999,
    discount: 14,
    image: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=500",
    rating: 5,
    reviews: 267,
    sizes: [40, 41, 42, 43, 44],
    colors: ["black", "white", "gray"],
    inStock: true,
    isNew: true,
    isSale: true,
    isHot: true,
    description:
      "The Yeezy Boost 350 V2 features an upper composed of re-engineered Primeknit.",
  },
  {
    id: 23,
    name: "Puma Clyde All-Pro",
    category: "sneakers",
    brand: "puma",
    price: 13999,
    originalPrice: 16999,
    discount: 18,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500",
    rating: 4,
    reviews: 45,
    sizes: [40, 41, 42, 43, 44],
    colors: ["blue", "red", "black"],
    inStock: true,
    isNew: false,
    isSale: true,
    description: "Basketball performance shoe with ProFoam cushioning.",
  },
  {
    id: 24,
    name: "Nike ZoomX Vaporfly",
    category: "running",
    brand: "nike",
    price: 27999,
    originalPrice: null,
    discount: 0,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
    rating: 5,
    reviews: 89,
    sizes: [39, 40, 41, 42, 43, 44],
    colors: ["white", "blue", "orange"],
    inStock: true,
    isNew: true,
    isSale: false,
    description:
      "Competition-level running shoe with carbon fiber plate for maximum speed.",
  },
];

// Product Manager Class
class ProductManager {
  constructor() {
    this.products = PRODUCTS_DATA;
    this.filteredProducts = [...this.products];
    this.currentPage = 1;
    this.productsPerPage = 12;
    this.currentView = "grid";
    this.sortBy = "default";

    this.init();
  }

  init() {
    this.renderProducts();
    this.setupEventListeners();
    this.updateCounts();
    this.hideLoading();
  }

  setupEventListeners() {
    // View toggle
    document.getElementById("grid-view")?.addEventListener("click", () => {
      this.changeView("grid");
    });

    document.getElementById("list-view")?.addEventListener("click", () => {
      this.changeView("list");
    });

    // Sort
    document.getElementById("sort-select")?.addEventListener("change", (e) => {
      this.sortProducts(e.target.value);
    });

    // Pagination
    document.getElementById("prev-page")?.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderProducts();
        this.scrollToTop();
      }
    });

    document.getElementById("next-page")?.addEventListener("click", () => {
      const totalPages = Math.ceil(
        this.filteredProducts.length / this.productsPerPage
      );
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderProducts();
        this.scrollToTop();
      }
    });

    // Page number clicks
    document.addEventListener("click", (e) => {
      if (e.target.matches(".page-btn[data-page]")) {
        this.currentPage = parseInt(e.target.dataset.page);
        this.renderProducts();
        this.scrollToTop();
      }
    });
  }

  filterProducts(filters) {
    this.showLoading();

    setTimeout(() => {
      this.filteredProducts = this.products.filter((product) => {
        // Category filter
        if (
          filters.categories.length > 0 &&
          !filters.categories.includes(product.category)
        ) {
          return false;
        }

        // Brand filter
        if (
          filters.brands.length > 0 &&
          !filters.brands.includes(product.brand)
        ) {
          return false;
        }

        // Size filter
        if (filters.sizes.length > 0) {
          const hasSize = filters.sizes.some((size) =>
            product.sizes.includes(parseInt(size))
          );
          if (!hasSize) return false;
        }

        // Color filter
        if (filters.colors.length > 0) {
          const hasColor = filters.colors.some((color) =>
            product.colors.includes(color)
          );
          if (!hasColor) return false;
        }

        // Price filter
        if (
          product.price < filters.price.min ||
          product.price > filters.price.max
        ) {
          return false;
        }

        // Rating filter
        if (filters.rating.length > 0) {
          const minRating = Math.min(...filters.rating.map((r) => parseInt(r)));
          if (product.rating < minRating) return false;
        }

        // Availability filter
        if (filters.availability.length > 0) {
          if (filters.availability.includes("in-stock") && !product.inStock)
            return false;
          if (filters.availability.includes("on-sale") && !product.isSale)
            return false;
        }

        // Search filter
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const searchableText =
            `${product.name} ${product.category} ${product.brand}`.toLowerCase();
          if (!searchableText.includes(searchTerm)) return false;
        }

        return true;
      });

      this.currentPage = 1;
      this.sortProducts(this.sortBy);
      this.renderProducts();
      this.updateCounts();
      this.hideLoading();
    }, 300);
  }

  sortProducts(sortBy) {
    this.sortBy = sortBy;

    switch (sortBy) {
      case "price-low":
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "name-az":
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-za":
        this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating":
        this.filteredProducts.sort(
          (a, b) => b.rating - a.rating || b.reviews - a.reviews
        );
        break;
      case "newest":
        this.filteredProducts.sort((a, b) => b.id - a.id);
        break;
      case "discount":
        this.filteredProducts.sort((a, b) => b.discount - a.discount);
        break;
      case "popularity":
        this.filteredProducts.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        // Default sorting
        this.filteredProducts = [...this.filteredProducts];
    }

    this.renderProducts();
  }

  renderProducts() {
    const grid = document.getElementById("products-grid");
    const noResults = document.getElementById("no-results");

    if (!grid) return;

    // Calculate pagination
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

    // Show no results if empty
    if (this.filteredProducts.length === 0) {
      grid.innerHTML = "";
      if (noResults) noResults.style.display = "block";
      this.updatePagination();
      return;
    }

    if (noResults) noResults.style.display = "none";

    // Render products
    grid.innerHTML = productsToShow
      .map((product) => this.createProductCard(product))
      .join("");

    // Update pagination
    this.updatePagination();

    // Setup product card interactions
    this.setupProductInteractions();
  }

  createProductCard(product) {
    const isInWishlist = this.checkWishlist(product.id);
    const badges = this.getProductBadges(product);

    return `
      <div class="product-card" role="listitem" data-product-id="${product.id}">
        ${badges ? `<div class="product-badges">${badges}</div>` : ""}
        
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <div class="product-actions">
            <button class="action-btn wishlist-btn ${
              isInWishlist ? "active" : ""
            }" 
                    data-product-id="${product.id}" 
                    aria-label="Add to wishlist">
              <i class="fas fa-heart"></i>
            </button>
            <button class="action-btn quick-view-btn" 
                    data-product-id="${product.id}"
                    aria-label="Quick view">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>

        <div class="product-info">
          <div class="product-category">${this.formatCategory(
            product.category
          )}</div>
          
          <h3 class="product-title">
            <a href="product-detail.html?id=${product.id}">${product.name}</a>
          </h3>

          <div class="product-rating">
            <div class="stars">
              ${this.createStars(product.rating)}
            </div>
            <span class="rating-count">(${product.reviews})</span>
          </div>

          ${
            this.currentView === "list"
              ? `
            <p class="product-description">${product.description}</p>
          `
              : ""
          }

          <div class="product-price">
            <span class="current-price">NPR ${product.price.toLocaleString()}</span>
            ${
              product.originalPrice
                ? `
              <span class="original-price">NPR ${product.originalPrice.toLocaleString()}</span>
              <span class="discount-percentage">-${product.discount}%</span>
            `
                : ""
            }
          </div>

          <div class="product-footer">
            <button class="btn-add-cart" data-product-id="${product.id}">
              <i class="fas fa-shopping-cart"></i>
              <span>Add to Cart</span>
            </button>
            <button class="btn-quick-view" data-product-id="${product.id}">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getProductBadges(product) {
    let badges = "";
    if (product.isNew)
      badges += '<span class="product-badge badge-new">New</span>';
    if (product.isSale)
      badges += '<span class="product-badge badge-sale">Sale</span>';
    if (product.isHot)
      badges += '<span class="product-badge badge-hot">Hot</span>';
    return badges;
  }

  createStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += `<i class="fas fa-star${i > rating ? " far" : ""}"></i>`;
    }
    return stars;
  }

  formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  setupProductInteractions() {
    // Add to cart
    document.querySelectorAll(".btn-add-cart").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const productId = parseInt(btn.dataset.productId);
        this.addToCart(productId);
      });
    });

    // Quick view
    document
      .querySelectorAll(".quick-view-btn, .btn-quick-view")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const productId = parseInt(btn.dataset.productId);
          this.showQuickView(productId);
        });
      });

    // Wishlist
    document.querySelectorAll(".wishlist-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const productId = parseInt(btn.dataset.productId);
        this.toggleWishlist(productId);
      });
    });
  }

  addToCart(productId) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return;

    // Add to cart (using cart.js if available)
    if (window.cart) {
      window.cart.addItem(product);
    } else {
      // Fallback: save to localStorage
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItem = cart.find((item) => item.id === productId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      this.updateCartCount();
    }

    this.showToast("Product added to cart!", "success");
  }

  toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const index = wishlist.indexOf(productId);

    if (index > -1) {
      wishlist.splice(index, 1);
      this.showToast("Removed from wishlist", "info");
    } else {
      wishlist.push(productId);
      this.showToast("Added to wishlist!", "success");
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    this.updateWishlistCount();

    // Update button state
    const btn = document.querySelector(
      `.wishlist-btn[data-product-id="${productId}"]`
    );
    if (btn) btn.classList.toggle("active");
  }

  checkWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    return wishlist.includes(productId);
  }

  showQuickView(productId) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return;

    const modal = document.getElementById("quick-view-modal");
    const content = document.getElementById("quick-view-content");

    if (!modal || !content) return;

    content.innerHTML = `
      <div class="quick-view-layout">
        <div class="quick-view-image">
          <img src="${product.image}" alt="${product.name}" />
        </div>
        <div class="quick-view-info">
          <div class="product-category">${this.formatCategory(
            product.category
          )}</div>
          <h2>${product.name}</h2>
          
          <div class="product-rating">
            <div class="stars">${this.createStars(product.rating)}</div>
            <span class="rating-count">(${product.reviews} reviews)</span>
          </div>

          <div class="product-price">
            <span class="current-price">NPR ${product.price.toLocaleString()}</span>
            ${
              product.originalPrice
                ? `
              <span class="original-price">NPR ${product.originalPrice.toLocaleString()}</span>
              <span class="discount-percentage">-${product.discount}%</span>
            `
                : ""
            }
          </div>

          <p class="product-description">${product.description}</p>

          <div class="product-options">
            <div class="option-group">
              <label>Size:</label>
              <div class="size-options">
                ${product.sizes
                  .map(
                    (size) => `
                  <button class="size-option" data-size="${size}">${size}</button>
                `
                  )
                  .join("")}
              </div>
            </div>

            <div class="option-group">
              <label>Color:</label>
              <div class="color-options">
                ${product.colors
                  .map(
                    (color) => `
                  <button class="color-option" data-color="${color}" 
                          style="background: ${this.getColorValue(color)}"
                          aria-label="${color}"></button>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <div class="quick-view-actions">
            <button class="btn btn-primary btn-add-cart" data-product-id="${
              product.id
            }">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
            <a href="product-detail.html?id=${
              product.id
            }" class="btn btn-outline">
              View Details
            </a>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Setup modal interactions
    this.setupQuickViewInteractions(modal, productId);
  }

  setupQuickViewInteractions(modal, productId) {
    // Close modal
    const closeBtn = modal.querySelector(".modal-close");
    const overlay = modal.querySelector(".modal-overlay");

    const closeModal = () => {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    };

    closeBtn?.addEventListener("click", closeModal);
    overlay?.addEventListener("click", closeModal);

    // Size selection
    modal.querySelectorAll(".size-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        modal
          .querySelectorAll(".size-option")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // Color selection
    modal.querySelectorAll(".color-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        modal
          .querySelectorAll(".color-option")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // Add to cart
    modal.querySelector(".btn-add-cart")?.addEventListener("click", () => {
      this.addToCart(productId);
      closeModal();
    });
  }

  getColorValue(colorName) {
    const colors = {
      black: "#000000",
      white: "#ffffff",
      red: "#e74c3c",
      blue: "#3498db",
      green: "#27ae60",
      orange: "#f39c12",
      yellow: "#f1c40f",
      gray: "#95a5a6",
    };
    return colors[colorName] || colorName;
  }

  changeView(view) {
    this.currentView = view;
    const grid = document.getElementById("products-grid");
    const gridBtn = document.getElementById("grid-view");
    const listBtn = document.getElementById("list-view");

    if (view === "grid") {
      grid?.classList.remove("list-view");
      gridBtn?.classList.add("active");
      listBtn?.classList.remove("active");
      gridBtn?.setAttribute("aria-pressed", "true");
      listBtn?.setAttribute("aria-pressed", "false");
    } else {
      grid?.classList.add("list-view");
      listBtn?.classList.add("active");
      gridBtn?.classList.remove("active");
      listBtn?.setAttribute("aria-pressed", "true");
      gridBtn?.setAttribute("aria-pressed", "false");
    }

    this.renderProducts();
  }

  updatePagination() {
    const totalPages = Math.ceil(
      this.filteredProducts.length / this.productsPerPage
    );
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");
    const pageNumbers = document.getElementById("page-numbers");

    // Update prev/next buttons
    if (prevBtn) {
      prevBtn.disabled = this.currentPage === 1;
    }
    if (nextBtn) {
      nextBtn.disabled = this.currentPage === totalPages;
    }

    // Update page numbers
    if (pageNumbers && totalPages > 0) {
      let pages = "";

      if (totalPages <= 7) {
        // Show all pages
        for (let i = 1; i <= totalPages; i++) {
          pages += `<button class="page-btn ${
            i === this.currentPage ? "active" : ""
          }" 
                           data-page="${i}" 
                           ${
                             i === this.currentPage ? 'aria-current="page"' : ""
                           }>${i}</button>`;
        }
      } else {
        // Show with ellipsis
        pages += `<button class="page-btn ${
          this.currentPage === 1 ? "active" : ""
        }" 
                         data-page="1" 
                         ${
                           this.currentPage === 1 ? 'aria-current="page"' : ""
                         }>1</button>`;

        if (this.currentPage > 3) {
          pages += '<span class="page-ellipsis">...</span>';
        }

        const start = Math.max(2, this.currentPage - 1);
        const end = Math.min(totalPages - 1, this.currentPage + 1);

        for (let i = start; i <= end; i++) {
          pages += `<button class="page-btn ${
            i === this.currentPage ? "active" : ""
          }" 
                           data-page="${i}"
                           ${
                             i === this.currentPage ? 'aria-current="page"' : ""
                           }>${i}</button>`;
        }

        if (this.currentPage < totalPages - 2) {
          pages += '<span class="page-ellipsis">...</span>';
        }

        pages += `<button class="page-btn ${
          this.currentPage === totalPages ? "active" : ""
        }" 
                         data-page="${totalPages}"
                         ${
                           this.currentPage === totalPages
                             ? 'aria-current="page"'
                             : ""
                         }>${totalPages}</button>`;
      }

      pageNumbers.innerHTML = pages;
    }
  }

  updateCounts() {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = Math.min(
      startIndex + this.productsPerPage,
      this.filteredProducts.length
    );

    const showingCount = document.getElementById("showing-count");
    const totalCount = document.getElementById("total-count");

    if (showingCount) {
      showingCount.textContent =
        this.filteredProducts.length > 0
          ? `${startIndex + 1}-${endIndex}`
          : "0";
    }
    if (totalCount) {
      totalCount.textContent = this.filteredProducts.length;
    }
  }

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById("cart-count");
    if (badge) badge.textContent = count;
  }

  updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const badge = document.getElementById("wishlist-count");
    if (badge) badge.textContent = wishlist.length;
  }

  showLoading() {
    const spinner = document.getElementById("loading-spinner");
    const grid = document.getElementById("products-grid");
    if (spinner) spinner.style.display = "flex";
    if (grid) grid.style.opacity = "0.5";
  }

  hideLoading() {
    const spinner = document.getElementById("loading-spinner");
    const grid = document.getElementById("products-grid");
    if (spinner) spinner.style.display = "none";
    if (grid) grid.style.opacity = "1";
  }

  scrollToTop() {
    const productsSection = document.querySelector(".products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  showToast(message, type = "info") {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      alert(message);
    }
  }
}

// Initialize Product Manager
if (document.querySelector(".products-section")) {
  window.productManager = new ProductManager();
}
/* ================================
   JUTTA PASAL - PRODUCTS PAGE JS
   ================================ */

document.addEventListener("DOMContentLoaded", function () {
  const productsGrid = document.getElementById("products-grid");
  if (!productsGrid) return;

  // State
  let currentPage = 1;
  const productsPerPage = 12;
  let filteredProducts = getProducts();
  let currentView = "grid";

  init();

  function init() {
    loadProducts();
    initFilters();
    initSorting();
    initViewToggle();
    initPagination();
    checkURLParams();

    // Basic "Add to Cart" handler (later connect to real cart.js)
    document.addEventListener("click", (e) => {
      if (e.target.closest(".btn-add-cart")) {
        const btn = e.target.closest(".btn-add-cart");
        const id = btn.dataset.productId;
        alert(`Added product #${id} to cart (demo)`);
      }
    });
  }

  function getProducts() {
    return [...PRODUCTS_DATA];
  }

  function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category")?.toLowerCase();
    const sale = params.get("sale");

    if (category) {
      const cb = document.querySelector(
        `input[name="category"][value="${category}"]`
      );
      if (cb) {
        cb.checked = true;
        applyFilters();
      }
    }

    if (sale === "true") {
      filteredProducts = getProducts().filter((p) => p.isSale === true);
      loadProducts();
    }
  }

  function loadProducts() {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const pageItems = filteredProducts.slice(start, end);

    // Update showing count
    document.getElementById("showing-count").textContent =
      filteredProducts.length > 0
        ? `${start + 1}-${Math.min(end, filteredProducts.length)}`
        : "0";

    document.getElementById("total-count").textContent =
      filteredProducts.length;

    productsGrid.innerHTML = "";
    productsGrid.className = `products-grid ${
      currentView === "list" ? "list-view" : ""
    }`;

    if (pageItems.length === 0) {
      productsGrid.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search fa-3x"></i>
          <h3>No products found</h3>
          <p>Try changing filters or search terms</p>
          <button id="reset-filters-btn" class="btn btn-primary">Clear Filters</button>
        </div>
      `;
      document
        .getElementById("reset-filters-btn")
        ?.addEventListener("click", clearAllFilters);
      updatePagination();
      return;
    }

    renderProducts(productsGrid, pageItems);
    updatePagination();
  }

  function renderProducts(container, products) {
    container.innerHTML = products
      .map((p) => {
        const discount = p.originalPrice
          ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
          : 0;

        let badgesHTML = "";
        if (p.isNew) badgesHTML += '<span class="badge new">New</span>';
        if (p.isSale) badgesHTML += '<span class="badge sale">Sale</span>';
        if (p.isHot) badgesHTML += '<span class="badge hot">Hot</span>';

        return `
        <div class="product-card" data-product-id="${p.id}">
          ${badgesHTML ? `<div class="product-badges">${badgesHTML}</div>` : ""}
          
          <div class="product-image">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
            <div class="product-actions">
              <button class="action-btn wishlist-btn" data-product-id="${p.id}">
                <i class="fas fa-heart"></i>
              </button>
              <button class="action-btn quick-view-btn" data-product-id="${
                p.id
              }">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>

          <div class="product-info">
            <div class="product-category">${p.category}</div>
            <h3 class="product-title">
              <a href="product-detail.html?id=${p.id}">${p.name}</a>
            </h3>

            <div class="product-rating">
              ${'<i class="fas fa-star"></i>'.repeat(
                p.rating
              )}${'<i class="far fa-star"></i>'.repeat(5 - p.rating)}
              <span>(${p.reviews})</span>
            </div>

            ${
              currentView === "list"
                ? `<p class="product-description">${p.description}</p>`
                : ""
            }

            <div class="product-price">
              <span class="current-price">NPR ${p.price.toLocaleString()}</span>
              ${
                p.originalPrice
                  ? `
                <span class="original-price">NPR ${p.originalPrice.toLocaleString()}</span>
                <span class="discount">-${discount}%</span>
              `
                  : ""
              }
            </div>

            <button class="btn-add-cart" data-product-id="${p.id}">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
          </div>
        </div>
      `;
      })
      .join("");
  }

  function initFilters() {
    // All filter changes trigger applyFilters
    document
      .querySelectorAll(
        'input[name="category"], input[name="brand"], .size-filter, .color-filter, #price-slider, #min-price, #max-price'
      )
      .forEach((el) => {
        if (
          el.type === "checkbox" ||
          el.classList.contains("size-filter") ||
          el.classList.contains("color-filter")
        ) {
          el.addEventListener("change", applyFilters);
          el.addEventListener("click", applyFilters); // for buttons
        } else {
          el.addEventListener("input", applyFilters);
          el.addEventListener("change", applyFilters);
        }
      });

    document
      .getElementById("clear-filters")
      ?.addEventListener("click", clearAllFilters);

    // Mobile filter toggle
    document
      .getElementById("mobile-filter-btn")
      ?.addEventListener("click", () => {
        document.getElementById("filters-sidebar")?.classList.toggle("active");
      });
  }

  function clearAllFilters() {
    document
      .querySelectorAll('input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));
    document
      .querySelectorAll(".size-filter, .color-filter")
      .forEach((b) => b.classList.remove("active"));

    const slider = document.getElementById("price-slider");
    if (slider) slider.value = 50000;
    document.getElementById("min-price").value = 0;
    document.getElementById("max-price").value = 50000;

    document.getElementById("sort-select").value = "default";

    filteredProducts = getProducts();
    currentPage = 1;
    loadProducts();
  }

  function applyFilters() {
    let items = getProducts();

    // Category
    const selectedCats = [
      ...document.querySelectorAll('input[name="category"]:checked'),
    ].map((cb) => cb.value.toLowerCase());
    if (selectedCats.length)
      items = items.filter((p) =>
        selectedCats.includes(p.category.toLowerCase())
      );

    // Brand
    const selectedBrands = [
      ...document.querySelectorAll('input[name="brand"]:checked'),
    ].map((cb) => cb.value.toLowerCase());
    if (selectedBrands.length)
      items = items.filter((p) =>
        selectedBrands.includes(p.brand.toLowerCase())
      );

    // Size
    const activeSizes = [
      ...document.querySelectorAll(".size-filter.active"),
    ].map((b) => Number(b.dataset.size));
    if (activeSizes.length)
      items = items.filter((p) => p.sizes.some((s) => activeSizes.includes(s)));

    // Color
    const activeColors = [
      ...document.querySelectorAll(".color-filter.active"),
    ].map((b) => b.dataset.color);
    if (activeColors.length)
      items = items.filter((p) =>
        p.colors.some((c) => activeColors.includes(c))
      );

    // Price
    const min = Number(document.getElementById("min-price")?.value) || 0;
    const max = Number(document.getElementById("max-price")?.value) || 50000;
    items = items.filter((p) => p.price >= min && p.price <= max);

    filteredProducts = items;
    currentPage = 1;
    sortProducts(document.getElementById("sort-select")?.value || "default");
  }

  function initSorting() {
    document.getElementById("sort-select")?.addEventListener("change", (e) => {
      sortProducts(e.target.value);
    });
  }

  function sortProducts(value) {
    if (value === "price-low")
      filteredProducts.sort((a, b) => a.price - b.price);
    else if (value === "price-high")
      filteredProducts.sort((a, b) => b.price - a.price);
    else if (value === "name-az")
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    else if (value === "name-za")
      filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
    else if (value === "newest")
      filteredProducts.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    else if (value === "rating")
      filteredProducts.sort((a, b) => b.rating - a.rating);
    else filteredProducts.sort((a, b) => a.id - b.id);

    loadProducts();
  }

  function initViewToggle() {
    document.getElementById("grid-view")?.addEventListener("click", () => {
      currentView = "grid";
      document.getElementById("grid-view").classList.add("active");
      document.getElementById("list-view")?.classList.remove("active");
      loadProducts();
    });

    document.getElementById("list-view")?.addEventListener("click", () => {
      currentView = "list";
      document.getElementById("list-view").classList.add("active");
      document.getElementById("grid-view")?.classList.remove("active");
      loadProducts();
    });
  }

  function initPagination() {
    document.addEventListener("click", (e) => {
      const t = e.target.closest("button");
      if (!t) return;

      if (t.id === "prev-page" && currentPage > 1) {
        currentPage--;
        loadProducts();
      } else if (t.id === "next-page") {
        const maxPage = Math.ceil(filteredProducts.length / productsPerPage);
        if (currentPage < maxPage) {
          currentPage++;
          loadProducts();
        }
      } else if (t.dataset.page) {
        currentPage = Number(t.dataset.page);
        loadProducts();
      }
    });
  }

  function updatePagination() {
    const container = document.getElementById("pagination");
    if (!container) return;

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    let html = `<button id="prev-page" ${
      currentPage === 1 ? "disabled" : ""
    }><i class="fas fa-chevron-left"></i></button>`;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (startPage > 1) {
      html += `<button data-page="1">1</button>`;
      if (startPage > 2) html += "<span>...</span>";
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `<button data-page="${i}" ${
        i === currentPage ? 'class="active"' : ""
      }>${i}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) html += "<span>...</span>";
      html += `<button data-page="${totalPages}">${totalPages}</button>`;
    }

    html += `<button id="next-page" ${
      currentPage === totalPages ? "disabled" : ""
    }><i class="fas fa-chevron-right"></i></button>`;

    container.innerHTML = html;
  }
});

// ────────────────────────────────────────────────
// PRODUCTS DATA (your original 24 + 6 new ones)
// ────────────────────────────────────────────────
