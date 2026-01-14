/* ================================
   JUTTA PASAL - CART JAVASCRIPT
   ================================ */

// ===== Get Cart =====
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

// ===== Save Cart =====
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// ===== Add to Cart =====
function addToCart(productId, size = "42", quantity = 1) {
  const products = getProducts();
  const product = products.find((p) => p.id === productId);

  if (!product) {
    showToast("Error", "Product not found", "error");
    return;
  }

  const cart = getCart();
  const existingItem = cart.find(
    (item) => item.id === productId && item.size === size
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size,
      quantity: quantity,
    });
  }

  saveCart(cart);
  showToast("Success", `${product.name} added to cart!`, "success");
}

// ===== Remove from Cart =====
function removeFromCart(productId, size) {
  let cart = getCart();
  cart = cart.filter((item) => !(item.id === productId && item.size === size));
  saveCart(cart);
  showToast("Success", "Item removed from cart", "success");

  if (typeof renderCart === "function") {
    renderCart();
  }
}

// ===== Update Cart Quantity =====
function updateCartQuantity(productId, size, quantity) {
  const cart = getCart();
  const item = cart.find((item) => item.id === productId && item.size === size);

  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId, size);
    } else {
      item.quantity = Math.min(quantity, 10);
      saveCart(cart);

      if (typeof renderCart === "function") {
        renderCart();
      }
    }
  }
}

// ===== Clear Cart =====
function clearCart() {
  localStorage.removeItem("cart");
  updateCartCount();

  if (typeof renderCart === "function") {
    renderCart();
  }

  showToast("Success", "Cart cleared", "success");
}

// ===== Get Cart Total =====
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ===== Get Cart Item Count =====
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ===== Render Cart Page =====
function renderCart() {
  const cart = getCart();
  const cartContent = document.getElementById("cart-content");
  const cartEmpty = document.getElementById("cart-empty");
  const cartItemsList = document.getElementById("cart-items-list");

  if (!cartContent || !cartEmpty) return;

  if (cart.length === 0) {
    cartContent.style.display = "none";
    cartEmpty.style.display = "block";
    return;
  }

  cartContent.style.display = "grid";
  cartEmpty.style.display = "none";

  if (cartItemsList) {
    cartItemsList.innerHTML = cart
      .map(
        (item) => `
            <div class="cart-item" data-id="${item.id}" data-size="${
          item.size
        }">
                <div class="cart-product">
                    <div class="cart-product-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-product-info">
                        <h3><a href="product.html?id=${item.id}">${
          item.name
        }</a></h3>
                        <p class="cart-product-meta">Size: ${item.size}</p>
                    </div>
                </div>
                <div class="cart-price">Rs. ${item.price.toLocaleString()}</div>
                <div class="cart-quantity">
                    <button class="quantity-btn minus" onclick="updateCartQuantity(${
                      item.id
                    }, '${item.size}', ${item.quantity - 1})">-</button>
                    <input type="number" class="quantity-input" value="${
                      item.quantity
                    }" min="1" max="10" 
                        onchange="updateCartQuantity(${item.id}, '${
          item.size
        }', parseInt(this.value))">
                    <button class="quantity-btn plus" onclick="updateCartQuantity(${
                      item.id
                    }, '${item.size}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-total">Rs. ${(
                  item.price * item.quantity
                ).toLocaleString()}</div>
                <button class="cart-remove" onclick="removeFromCart(${
                  item.id
                }, '${item.size}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `
      )
      .join("");
  }

  // Update summary
  const subtotal = getCartTotal();
  const shipping = subtotal >= 5000 ? 0 : 150;
  const tax = subtotal * 0.13;
  const total = subtotal + shipping + tax;

  const subtotalEl = document.getElementById("cart-subtotal");
  const shippingEl = document.getElementById("cart-shipping");
  const taxEl = document.getElementById("cart-tax");
  const totalEl = document.getElementById("cart-total");

  if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toLocaleString()}`;
  if (shippingEl)
    shippingEl.textContent = shipping === 0 ? "FREE" : `Rs. ${shipping}`;
  if (taxEl) taxEl.textContent = `Rs. ${Math.round(tax).toLocaleString()}`;
  if (totalEl)
    totalEl.textContent = `Rs. ${Math.round(total).toLocaleString()}`;
}

// ===== Apply Coupon =====
function applyCoupon(code) {
  const coupons = {
    SAVE10: 10,
    SAVE20: 20,
    JUTTA50: 50,
    NEWUSER: 15,
  };

  const discount = coupons[code.toUpperCase()];

  if (discount) {
    showToast("Success", `Coupon applied! ${discount}% off`, "success");
    return discount;
  } else {
    showToast("Error", "Invalid coupon code", "error");
    return 0;
  }
}

// ===== Wishlist Functions =====
function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function toggleWishlist(productId) {
  let wishlist = getWishlist();
  const index = wishlist.indexOf(productId);

  if (index === -1) {
    wishlist.push(productId);
    showToast("Success", "Added to wishlist", "success");
  } else {
    wishlist.splice(index, 1);
    showToast("Success", "Removed from wishlist", "success");
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistCount();
}

function isInWishlist(productId) {
  const wishlist = getWishlist();
  return wishlist.includes(productId);
}

// ===== Clear Cart Button Event =====
document.addEventListener("DOMContentLoaded", function () {
  const clearCartBtn = document.getElementById("clear-cart");
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", function () {
      if (confirm("Are you sure you want to clear your cart?")) {
        clearCart();
      }
    });
  }

  // Coupon form
  const couponForm = document.getElementById("coupon-form");
  if (couponForm) {
    couponForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const code = document.getElementById("coupon-input").value;
      applyCoupon(code);
    });
  }

  // Checkout button
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function (e) {
      const cart = getCart();
      if (cart.length === 0) {
        e.preventDefault();
        showToast("Error", "Your cart is empty", "error");
      }
    });
  }
});

// Make functions globally available
window.getCart = getCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.clearCart = clearCart;
window.getCartTotal = getCartTotal;
window.renderCart = renderCart;
window.toggleWishlist = toggleWishlist;
window.isInWishlist = isInWishlist;
window.getWishlist = getWishlist;
