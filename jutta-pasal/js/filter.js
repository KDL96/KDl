// Filter Management System
class FilterManager {
  constructor() {
    this.activeFilters = {
      categories: [],
      brands: [],
      sizes: [],
      colors: [],
      rating: [],
      price: { min: 0, max: 50000 },
      availability: [],
      search: "",
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadFiltersFromURL();
    this.initPriceSlider();
    this.setupMobileFilters();
  }

  setupEventListeners() {
    // Category filters
    document.querySelectorAll('input[name="category"]').forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        this.handleFilterChange("categories", e.target.value, e.target.checked);
      });
    });

    // Brand filters
    document.querySelectorAll('input[name="brand"]').forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        this.handleFilterChange("brands", e.target.value, e.target.checked);
      });
    });

    // Size filters
    document.querySelectorAll('input[name="size"]').forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        this.handleFilterChange("sizes", e.target.value, e.target.checked);
      });
    });

    // Color filters
    document.querySelectorAll('input[name="color"]').forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        this.handleFilterChange("colors", e.target.value, e.target.checked);
      });
    });

    // Rating filters
    document.querySelectorAll('input[name="rating"]').forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        this.handleFilterChange("rating", e.target.value, e.target.checked);
      });
    });

    // Availability filters
    document
      .querySelectorAll('input[name="availability"]')
      .forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
          this.handleFilterChange(
            "availability",
            e.target.value,
            e.target.checked
          );
        });
      });

    // Search filter
    const searchInput = document.getElementById("product-search");
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.activeFilters.search = e.target.value;
          this.applyFilters();
        }, 500);
      });
    }

    // Brand search
    const brandSearch = document.getElementById("brand-search");
    if (brandSearch) {
      brandSearch.addEventListener("input", (e) => {
        this.filterBrandList(e.target.value);
      });
    }

    // Price inputs
    const minPrice = document.getElementById("min-price");
    const maxPrice = document.getElementById("max-price");

    if (minPrice && maxPrice) {
      minPrice.addEventListener("change", () => {
        this.activeFilters.price.min = parseInt(minPrice.value) || 0;
        this.updatePriceSlider();
        this.applyFilters();
      });

      maxPrice.addEventListener("change", () => {
        this.activeFilters.price.max = parseInt(maxPrice.value) || 50000;
        this.updatePriceSlider();
        this.applyFilters();
      });
    }

    // Clear filters
    document.getElementById("clear-filters")?.addEventListener("click", () => {
      this.clearAllFilters();
    });

    document
      .getElementById("clear-all-filters")
      ?.addEventListener("click", () => {
        this.clearAllFilters();
      });

    document.getElementById("reset-filters")?.addEventListener("click", () => {
      this.clearAllFilters();
    });
  }

  initPriceSlider() {
    const sliderMin = document.getElementById("price-slider-min");
    const sliderMax = document.getElementById("price-slider-max");
    const minPrice = document.getElementById("min-price");
    const maxPrice = document.getElementById("max-price");
    const track = document.getElementById("slider-track");

    if (!sliderMin || !sliderMax) return;

    const updateSlider = () => {
      const min = parseInt(sliderMin.value);
      const max = parseInt(sliderMax.value);

      if (min > max - 1000) {
        sliderMin.value = max - 1000;
      }
      if (max < min + 1000) {
        sliderMax.value = min + 1000;
      }

      minPrice.value = sliderMin.value;
      maxPrice.value = sliderMax.value;

      // Update track visual
      const percent1 = (sliderMin.value / sliderMin.max) * 100;
      const percent2 = (sliderMax.value / sliderMax.max) * 100;

      if (track) {
        track.style.background = `linear-gradient(to right, 
          #ddd ${percent1}%, 
          var(--primary-color) ${percent1}%, 
          var(--primary-color) ${percent2}%, 
          #ddd ${percent2}%)`;
      }
    };

    sliderMin.addEventListener("input", updateSlider);
    sliderMax.addEventListener("input", updateSlider);

    sliderMin.addEventListener("change", () => {
      this.activeFilters.price.min = parseInt(sliderMin.value);
      this.applyFilters();
    });

    sliderMax.addEventListener("change", () => {
      this.activeFilters.price.max = parseInt(sliderMax.value);
      this.applyFilters();
    });

    updateSlider();
  }

  updatePriceSlider() {
    const sliderMin = document.getElementById("price-slider-min");
    const sliderMax = document.getElementById("price-slider-max");

    if (sliderMin && sliderMax) {
      sliderMin.value = this.activeFilters.price.min;
      sliderMax.value = this.activeFilters.price.max;
      sliderMin.dispatchEvent(new Event("input"));
    }
  }

  handleFilterChange(filterType, value, isChecked) {
    if (isChecked) {
      if (!this.activeFilters[filterType].includes(value)) {
        this.activeFilters[filterType].push(value);
      }
    } else {
      this.activeFilters[filterType] = this.activeFilters[filterType].filter(
        (item) => item !== value
      );
    }

    this.applyFilters();
  }

  applyFilters() {
    // Update URL
    this.updateURL();

    // Show active filters
    this.displayActiveFilters();

    // Filter products
    if (window.productManager) {
      window.productManager.filterProducts(this.activeFilters);
    }
  }

  displayActiveFilters() {
    const container = document.getElementById("active-filters");
    const list = document.getElementById("active-filters-list");

    if (!container || !list) return;

    const hasFilters = this.hasActiveFilters();
    container.style.display = hasFilters ? "block" : "none";

    if (!hasFilters) return;

    list.innerHTML = "";

    // Add filter tags
    Object.entries(this.activeFilters).forEach(([key, value]) => {
      if (key === "price") {
        if (value.min > 0 || value.max < 50000) {
          this.addFilterTag(
            list,
            "Price",
            `NPR ${value.min} - ${value.max}`,
            () => {
              this.activeFilters.price = { min: 0, max: 50000 };
              document.getElementById("min-price").value = 0;
              document.getElementById("max-price").value = 50000;
              this.updatePriceSlider();
              this.applyFilters();
            }
          );
        }
      } else if (key === "search" && value) {
        this.addFilterTag(list, "Search", value, () => {
          this.activeFilters.search = "";
          document.getElementById("product-search").value = "";
          this.applyFilters();
        });
      } else if (Array.isArray(value) && value.length > 0) {
        value.forEach((item) => {
          this.addFilterTag(list, key, item, () => {
            this.activeFilters[key] = this.activeFilters[key].filter(
              (i) => i !== item
            );
            const checkbox = document.querySelector(
              `input[name="${key.slice(0, -1)}"][value="${item}"]`
            );
            if (checkbox) checkbox.checked = false;
            this.applyFilters();
          });
        });
      }
    });
  }

  addFilterTag(container, type, value, onRemove) {
    const tag = document.createElement("div");
    tag.className = "filter-tag";
    tag.innerHTML = `
      <span>${this.formatFilterLabel(type)}: ${value}</span>
      <button type="button" aria-label="Remove filter">
        <i class="fas fa-times"></i>
      </button>
    `;

    tag.querySelector("button").addEventListener("click", onRemove);
    container.appendChild(tag);
  }

  formatFilterLabel(key) {
    const labels = {
      categories: "Category",
      brands: "Brand",
      sizes: "Size",
      colors: "Color",
      rating: "Rating",
      availability: "Availability",
      search: "Search",
    };
    return labels[key] || key;
  }

  hasActiveFilters() {
    return (
      this.activeFilters.categories.length > 0 ||
      this.activeFilters.brands.length > 0 ||
      this.activeFilters.sizes.length > 0 ||
      this.activeFilters.colors.length > 0 ||
      this.activeFilters.rating.length > 0 ||
      this.activeFilters.availability.length > 0 ||
      this.activeFilters.search !== "" ||
      this.activeFilters.price.min > 0 ||
      this.activeFilters.price.max < 50000
    );
  }

  clearAllFilters() {
    // Reset all filters
    this.activeFilters = {
      categories: [],
      brands: [],
      sizes: [],
      colors: [],
      rating: [],
      price: { min: 0, max: 50000 },
      availability: [],
      search: "",
    };

    // Uncheck all checkboxes
    document
      .querySelectorAll('.filter-checkbox input[type="checkbox"]')
      .forEach((cb) => {
        cb.checked = false;
      });

    document.querySelectorAll(".size-input").forEach((input) => {
      input.checked = false;
    });

    document.querySelectorAll(".color-input").forEach((input) => {
      input.checked = false;
    });

    // Reset price
    document.getElementById("min-price").value = 0;
    document.getElementById("max-price").value = 50000;
    this.updatePriceSlider();

    // Reset search
    const searchInput = document.getElementById("product-search");
    if (searchInput) searchInput.value = "";

    this.applyFilters();
  }

  filterBrandList(searchTerm) {
    const brandList = document.getElementById("brand-filters");
    if (!brandList) return;

    const items = brandList.querySelectorAll("li");
    const term = searchTerm.toLowerCase();

    items.forEach((item) => {
      const label = item.querySelector(".label-text").textContent.toLowerCase();
      item.style.display = label.includes(term) ? "block" : "none";
    });
  }

  updateURL() {
    const params = new URLSearchParams();

    Object.entries(this.activeFilters).forEach(([key, value]) => {
      if (key === "price") {
        if (value.min > 0) params.append("minPrice", value.min);
        if (value.max < 50000) params.append("maxPrice", value.max);
      } else if (key === "search" && value) {
        params.append("q", value);
      } else if (Array.isArray(value) && value.length > 0) {
        params.append(key, value.join(","));
      }
    });

    const newURL = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, "", newURL);
  }

  loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);

    // Load categories
    if (params.has("categories")) {
      this.activeFilters.categories = params.get("categories").split(",");
      this.activeFilters.categories.forEach((cat) => {
        const checkbox = document.querySelector(
          `input[name="category"][value="${cat}"]`
        );
        if (checkbox) checkbox.checked = true;
      });
    }

    // Load brands
    if (params.has("brands")) {
      this.activeFilters.brands = params.get("brands").split(",");
      this.activeFilters.brands.forEach((brand) => {
        const checkbox = document.querySelector(
          `input[name="brand"][value="${brand}"]`
        );
        if (checkbox) checkbox.checked = true;
      });
    }

    // Load sizes
    if (params.has("sizes")) {
      this.activeFilters.sizes = params.get("sizes").split(",");
      this.activeFilters.sizes.forEach((size) => {
        const checkbox = document.querySelector(
          `input[name="size"][value="${size}"]`
        );
        if (checkbox) checkbox.checked = true;
      });
    }

    // Load colors
    if (params.has("colors")) {
      this.activeFilters.colors = params.get("colors").split(",");
      this.activeFilters.colors.forEach((color) => {
        const checkbox = document.querySelector(
          `input[name="color"][value="${color}"]`
        );
        if (checkbox) checkbox.checked = true;
      });
    }

    // Load rating
    if (params.has("rating")) {
      this.activeFilters.rating = params.get("rating").split(",");
      this.activeFilters.rating.forEach((rating) => {
        const checkbox = document.querySelector(
          `input[name="rating"][value="${rating}"]`
        );
        if (checkbox) checkbox.checked = true;
      });
    }

    // Load availability
    if (params.has("availability")) {
      this.activeFilters.availability = params.get("availability").split(",");
      this.activeFilters.availability.forEach((avail) => {
        const checkbox = document.querySelector(
          `input[name="availability"][value="${avail}"]`
        );
        if (checkbox) checkbox.checked = true;
      });
    }

    // Load price
    if (params.has("minPrice")) {
      this.activeFilters.price.min = parseInt(params.get("minPrice"));
      document.getElementById("min-price").value = this.activeFilters.price.min;
    }
    if (params.has("maxPrice")) {
      this.activeFilters.price.max = parseInt(params.get("maxPrice"));
      document.getElementById("max-price").value = this.activeFilters.price.max;
    }
    this.updatePriceSlider();

    // Load search
    if (params.has("q")) {
      this.activeFilters.search = params.get("q");
      const searchInput = document.getElementById("product-search");
      if (searchInput) searchInput.value = this.activeFilters.search;
    }

    if (this.hasActiveFilters()) {
      this.applyFilters();
    }
  }

  setupMobileFilters() {
    const mobileBtn = document.getElementById("mobile-filter-btn");
    const filterModal = document.getElementById("filter-modal");
    const closeBtn = document.getElementById("filter-modal-close");
    const overlay = filterModal?.querySelector(".filter-modal-overlay");
    const applyBtn = document.getElementById("apply-filters");
    const clearBtn = document.getElementById("clear-mobile-filters");

    if (!mobileBtn || !filterModal) return;

    // Clone filters to modal
    const sidebar = document.querySelector(".products-sidebar");
    const modalBody = document.getElementById("filter-modal-body");
    if (sidebar && modalBody) {
      modalBody.innerHTML = sidebar.innerHTML;
    }

    mobileBtn.addEventListener("click", () => {
      filterModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });

    const closeModal = () => {
      filterModal.classList.remove("active");
      document.body.style.overflow = "";
    };

    closeBtn?.addEventListener("click", closeModal);
    overlay?.addEventListener("click", closeModal);
    applyBtn?.addEventListener("click", closeModal);

    clearBtn?.addEventListener("click", () => {
      this.clearAllFilters();
    });
  }

  getActiveFilters() {
    return this.activeFilters;
  }
}

// Initialize filter manager
if (document.querySelector(".products-section")) {
  window.filterManager = new FilterManager();
}
