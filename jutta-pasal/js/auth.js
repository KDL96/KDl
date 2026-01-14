/* =============================================
   JUTTA PASAL - AUTHENTICATION SYSTEM
   Mandatory Login for All Pages
   ============================================= */

(function () {
  "use strict";

  // ===== CONFIGURATION =====
  const AUTH_CONFIG = {
    publicPages: ["login.html", "register.html", ""],
    loginPage: "login.html",
    homePage: "index.html",
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  };

  // ===== RUN AUTH CHECK IMMEDIATELY =====
  checkAuth();

  function checkAuth() {
    const currentPage = getCurrentPage();
    const isPublicPage = AUTH_CONFIG.publicPages.includes(currentPage);
    const isLoggedIn = isAuthenticated();

    // If on login/register and already logged in, go to home
    if (
      isPublicPage &&
      isLoggedIn &&
      (currentPage === "login.html" || currentPage === "register.html")
    ) {
      window.location.replace(AUTH_CONFIG.homePage);
      return;
    }

    // If not on public page and not logged in, show login required
    if (!isPublicPage && !isLoggedIn) {
      sessionStorage.setItem("redirectAfterLogin", window.location.href);
      showLoginRequired();
      return;
    }

    // Check session timeout
    if (isLoggedIn) {
      const user = getCurrentUser();
      if (user && user.loginTime) {
        const elapsed = Date.now() - user.loginTime;
        if (elapsed > AUTH_CONFIG.sessionTimeout) {
          logoutUser();
          showLoginRequired();
          return;
        }
      }
    }
  }

  function getCurrentPage() {
    const path = window.location.pathname;
    return path.split("/").pop() || "index.html";
  }

  function isAuthenticated() {
    const user = localStorage.getItem("currentUser");
    return (
      user !== null && user !== "null" && user !== "" && user !== "undefined"
    );
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch (e) {
      return null;
    }
  }

  function showLoginRequired() {
    // Hide page content
    document.documentElement.style.visibility = "hidden";

    const showModal = function () {
      document.body.innerHTML = `
                <div id="login-required-overlay">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Segoe UI', Tahoma, sans-serif; }
                        #login-required-overlay {
                            position: fixed;
                            inset: 0;
                            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 999999;
                            padding: 1rem;
                        }
                        .modal {
                            background: white;
                            padding: 2.5rem;
                            border-radius: 20px;
                            max-width: 420px;
                            width: 100%;
                            text-align: center;
                            box-shadow: 0 25px 80px rgba(0,0,0,0.5);
                            animation: slideUp 0.4s ease;
                        }
                        @keyframes slideUp {
                            from { opacity: 0; transform: translateY(30px) scale(0.95); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                        .modal .logo { font-size: 3.5rem; margin-bottom: 0.5rem; }
                        .modal .brand { font-size: 1.75rem; font-weight: 700; color: #333; margin-bottom: 1.5rem; }
                        .modal .brand span { color: #ff6b35; }
                        .modal .icon {
                            width: 80px; height: 80px;
                            background: linear-gradient(135deg, #ff6b35, #e55a2b);
                            border-radius: 50%;
                            display: flex; align-items: center; justify-content: center;
                            margin: 0 auto 1.5rem;
                            box-shadow: 0 10px 30px rgba(255,107,53,0.3);
                        }
                        .modal .icon svg { width: 36px; height: 36px; fill: white; }
                        .modal h2 { font-size: 1.5rem; color: #333; margin-bottom: 0.5rem; }
                        .modal p { color: #666; margin-bottom: 2rem; line-height: 1.6; }
                        .btn {
                            display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                            width: 100%; padding: 1rem; border-radius: 12px; font-size: 1rem;
                            font-weight: 600; text-decoration: none; transition: all 0.3s; cursor: pointer;
                            border: none; margin-bottom: 0.75rem;
                        }
                        .btn-primary { background: linear-gradient(135deg, #ff6b35, #e55a2b); color: white; }
                        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255,107,53,0.4); }
                        .btn-secondary { background: #f5f5f5; color: #333; border: 2px solid #e0e0e0; }
                        .btn-secondary:hover { background: #eee; }
                        .features { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eee; text-align: left; }
                        .features h4 { font-size: 0.8rem; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.75rem; }
                        .features ul { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
                        .features li { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: #555; }
                        .features li::before { content: '✓'; color: #00b894; font-weight: bold; }
                    </style>
                    <div class="modal">
                        <div class="logo">👟</div>
                        <div class="brand">Jutta<span>Pasal</span></div>
                        <div class="icon">
                            <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                        </div>
                        <h2>Login Required</h2>
                        <p>Please sign in to access Jutta Pasal and explore our premium footwear collection.</p>
                        <a href="login.html" class="btn btn-primary">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>
                            Sign In
                        </a>
                        <a href="register.html" class="btn btn-secondary">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            Create Account
                        </a>
                        <div class="features">
                            <h4>Why Join?</h4>
                            <ul>
                                <li>Track Orders</li>
                                <li>Save Wishlist</li>
                                <li>Exclusive Deals</li>
                                <li>Fast Checkout</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
      document.documentElement.style.visibility = "visible";
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", showModal);
    } else {
      showModal();
    }
  }

  // ===== AUTH FUNCTIONS =====
  function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      user.loginTime = Date.now();
      localStorage.setItem("currentUser", JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: "Invalid email or password" };
  }

  function socialLogin(userData) {
    const user = { ...userData, loginTime: Date.now() };
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const existingIndex = users.findIndex((u) => u.email === user.email);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(user));
    return { success: true, user };
  }

  function registerUser(userData) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find((u) => u.email === userData.email)) {
      return { success: false, message: "Email already registered" };
    }
    const newUser = {
      id: Date.now(),
      ...userData,
      provider: "email",
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    return { success: true, user: newUser };
  }

  function logoutUser() {
    localStorage.removeItem("currentUser");
    return { success: true };
  }

  function handleLogout() {
    logoutUser();
    window.location.href = AUTH_CONFIG.loginPage;
  }

  function updateUser(updates) {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false };
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const idx = users.findIndex((u) => u.email === currentUser.email);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updates };
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(users[idx]));
      return { success: true, user: users[idx] };
    }
    return { success: false };
  }

  function updateAuthUI() {
    const user = getCurrentUser();
    const header = document.getElementById("user-menu-header");
    const list = document.getElementById("user-menu-list");
    if (!header || !list) return;

    if (user) {
      const name = user.firstName || user.email.split("@")[0];
      const initials =
        (
          (user.firstName?.[0] || "") + (user.lastName?.[0] || "")
        ).toUpperCase() || "U";
      header.innerHTML = `
                <div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0;">
                    <div style="width:40px;height:40px;background:linear-gradient(135deg,#ff6b35,#e55a2b);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;">
                        ${
                          user.picture
                            ? `<img src="${user.picture}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
                            : initials
                        }
                    </div>
                    <div>
                        <p style="font-weight:600;margin:0;">Hi, ${name}</p>
                        <p style="font-size:0.75rem;color:var(--text-secondary);margin:0;">${
                          user.email
                        }</p>
                    </div>
                </div>
            `;
      list.innerHTML = `
                <li><a href="profile.html"><i class="fas fa-user"></i> My Profile</a></li>
                <li><a href="wishlist.html"><i class="fas fa-heart"></i> Wishlist</a></li>
                <li><a href="cart.html"><i class="fas fa-shopping-cart"></i> Cart</a></li>
                <li style="border-top:1px solid var(--border-color);margin-top:0.5rem;padding-top:0.5rem;">
                    <a href="#" onclick="handleLogout();return false;" style="color:#e74c3c;"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </li>
            `;
    }
  }

  // Initialize UI on DOM ready
  document.addEventListener("DOMContentLoaded", function () {
    if (isAuthenticated()) {
      updateAuthUI();
    }
  });

  // ===== GLOBAL EXPORTS =====
  window.isAuthenticated = isAuthenticated;
  window.getCurrentUser = getCurrentUser;
  window.loginUser = loginUser;
  window.socialLogin = socialLogin;
  window.registerUser = registerUser;
  window.logoutUser = logoutUser;
  window.handleLogout = handleLogout;
  window.updateUser = updateUser;
  window.updateAuthUI = updateAuthUI;
})();
