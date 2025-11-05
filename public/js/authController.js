/**
 * Authentication Controller (MVC Pattern)
 * 
 * Manages authentication state with strong separation of concerns:
 * - Model: authModel (data/state management)
 * - View: authView (UI rendering)
 * - Controller: authController (business logic)
 * 
 * Session Management:
 * - Server maintains session via HttpOnly cookies (secure, not accessible to JS)
 * - All HTTP requests automatically include credentials: 'include'
 * - No manual token management needed
 */

// ==================== MODEL ====================
const authModel = {
  // Private state
  _state: {
    isAuthenticated: false,
    currentUser: null,
    pkp: null,
    sessionSigs: null,
    authMethod: null,
    isLoading: false,
    error: null,
    lastSync: null
  },

  // Observers for reactive updates
  _observers: [],

  // Get current state (immutable copy)
  getState() {
    return { ...this._state };
  },

  // Update state and notify observers
  setState(updates) {
    this._state = { ...this._state, ...updates, lastSync: new Date() };
    this._notifyObservers();
  },

  // Subscribe to state changes
  subscribe(observer) {
    this._observers.push(observer);
    return () => {
      this._observers = this._observers.filter(obs => obs !== observer);
    };
  },

  _notifyObservers() {
    this._observers.forEach(observer => observer(this.getState()));
  },

  // Clear all state
  clear() {
    this.setState({
      isAuthenticated: false,
      currentUser: null,
      pkp: null,
      sessionSigs: null,
      authMethod: null,
      error: null
    });
  }
};

// ==================== API CLIENT ====================
const authAPI = {
  // Base configuration
  baseURL: '/lit',
  defaultOptions: {
    credentials: 'include', // CRITICAL: Include session cookies
    headers: {
      'Content-Type': 'application/json',
    }
  },

  // Helper to make authenticated requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers,
      }
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse JSON response
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
      return { success: false, error: error.message };
    }
  },

  // GET: Fetch current session status
  async getSessionStatus() {
    return this.request('/session/status', { method: 'GET' });
  },

  // GET: Fetch user profile
  async getUserProfile() {
    return this.request('/user/profile', { method: 'GET' });
  },

  // GET: Fetch PKP dashboard
  async getPKPDashboard() {
    return this.request('/pkp/dashboard', { method: 'GET' });
  },

  // POST: Create new registration
  async registerUser(username) {
    const lit = window.useLit();
    try {
      await lit.registerWebAuthn(username);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // POST: Authenticate user
  async loginUser(username) {
    const lit = window.useLit();
    try {
      await lit.authenticateWebAuthn(username);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // POST: Logout (destroy session)
  async logoutUser() {
    return this.request('/session/logout', { method: 'POST' });
  },

  // POST: Mint new sub-PKP
  async mintSubPKP(purpose, description = '') {
    return this.request('/pkp/mint', {
      method: 'POST',
      body: JSON.stringify({ purpose, description })
    });
  },

  // PUT: Update user profile (if implemented on backend)
  async updateUserProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // DELETE: Delete user session
  async deleteSession() {
    return this.request('/session/logout', { method: 'DELETE' });
  }
};

// ==================== VIEW ====================
const authView = {
  // Render authentication UI based on state
  render(state, containerElement) {
    if (!containerElement) {
      console.warn('No container element provided to authView.render()');
      return;
    }

    // Show loading state
    if (state.isLoading) {
      containerElement.innerHTML = `
        <div class="flex items-center justify-center p-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span class="ml-3 text-lg">Loading...</span>
        </div>
      `;
      return;
    }

    // Show error state
    if (state.error) {
      containerElement.innerHTML = `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong class="font-bold">Error: </strong>
          <span class="block sm:inline">${state.error}</span>
        </div>
      `;
      return;
    }

    // Authenticated state
    if (state.isAuthenticated && state.currentUser) {
      this.renderAuthenticatedView(state, containerElement);
    } else {
      // Unauthenticated state
      this.renderUnauthenticatedView(containerElement);
    }
  },

  renderAuthenticatedView(state, container) {
    container.innerHTML = `
      <div class="flex flex-col items-center space-y-4">
        <!-- User Info -->
        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 max-w-xl w-full">
          <h3 class="text-2xl font-bold text-white mb-4">👋 Welcome, ${state.currentUser}!</h3>
          
          <!-- PKP Wallet Info -->
          <div id="pkpInfo" class="space-y-3 text-left">
            <div class="flex justify-between items-center">
              <span class="text-indigo-200 font-medium">Status:</span>
              <span class="text-green-400 font-semibold">✅ Authenticated</span>
            </div>
            ${state.pkp ? `
              <div class="flex justify-between items-center">
                <span class="text-indigo-200 font-medium">Primary PKP:</span>
                <code class="text-white bg-black bg-opacity-30 px-3 py-1 rounded text-sm font-mono" title="${state.pkp.ethAddress}">
                  ${state.pkp.ethAddress.slice(0, 6)}...${state.pkp.ethAddress.slice(-4)}
                </code>
              </div>
              ${state.pkp.subPKPs ? `
                <div class="flex justify-between items-center">
                  <span class="text-indigo-200 font-medium">Sub-PKPs:</span>
                  <span class="text-white font-semibold">${state.pkp.subPKPs.length}</span>
                </div>
              ` : ''}
            ` : '<p class="text-indigo-200">Loading PKP info...</p>'}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4">
          <button 
            id="btnVisitParadise" 
            class="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200">
            🌴 Visit Paradise
          </button>
          <button 
            id="btnRefreshSession" 
            class="bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200">
            🔄 Refresh
          </button>
          <button 
            id="btnSignOut" 
            class="bg-red-500 text-white px-6 py-3 rounded-lg font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200">
            🚪 Sign Out
          </button>
        </div>

        <div class="text-xs text-indigo-200">
          Last synced: ${state.lastSync ? new Date(state.lastSync).toLocaleTimeString() : 'Never'}
        </div>
      </div>
    `;

    // Attach event listeners
    this.attachAuthenticatedListeners(container);
  },

  renderUnauthenticatedView(container) {
    container.innerHTML = `
      <div class="flex flex-col items-center space-y-6">
        <div class="text-center mb-4">
          <h3 class="text-2xl font-bold text-white mb-2">Welcome to The Beach</h3>
          <p class="text-indigo-200">Secure authentication powered by WebAuthn</p>
        </div>

        <!-- Registration Form -->
        <div id="registerForm" class="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 w-full max-w-md" style="display: none;">
          <h4 class="text-xl font-bold text-white mb-4">Create Account</h4>
          <div class="space-y-4">
            <div>
              <label for="registerUsername" class="block text-indigo-200 font-medium mb-2">Username</label>
              <input
                type="text"
                id="registerUsername"
                placeholder="Enter username (min 3 characters)"
                class="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-indigo-300 border border-indigo-300 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                minlength="3"
                autocomplete="username webauthn"
              />
            </div>
            <div class="flex gap-3">
              <button
                id="btnConfirmRegister"
                class="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200">
                ✅ Register
              </button>
              <button
                id="btnCancelRegister"
                class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200">
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Login Form -->
        <div id="loginForm" class="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 w-full max-w-md" style="display: none;">
          <h4 class="text-xl font-bold text-white mb-4">Sign In</h4>
          <div class="space-y-4">
            <div>
              <label for="loginUsername" class="block text-indigo-200 font-medium mb-2">Username (optional)</label>
              <input
                type="text"
                id="loginUsername"
                placeholder="Leave empty for auto-detect"
                class="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-indigo-300 border border-indigo-300 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                autocomplete="username webauthn"
              />
            </div>
            <div class="flex gap-3">
              <button
                id="btnConfirmLogin"
                class="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200">
                ✅ Login
              </button>
              <button
                id="btnCancelLogin"
                class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200">
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Main Buttons -->
        <div id="mainButtons" class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            id="btnRegister"
            class="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200">
            🔐 Register
          </button>
          <button
            id="btnLogin"
            class="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200">
            🔐 Login
          </button>
          <button
            id="btnCheckSession"
            class="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200">
            🔍 Check Session
          </button>
        </div>

        <div id="authStatus" class="mt-4 text-indigo-100 font-medium min-h-[2rem]"></div>
      </div>
    `;

    // Attach event listeners
    this.attachUnauthenticatedListeners(container);
  },

  attachAuthenticatedListeners(container) {
    const btnVisitParadise = container.querySelector('#btnVisitParadise');
    const btnRefreshSession = container.querySelector('#btnRefreshSession');
    const btnSignOut = container.querySelector('#btnSignOut');

    if (btnVisitParadise) {
      btnVisitParadise.addEventListener('click', () => {
        window.location.href = '/paradise';
      });
    }

    if (btnRefreshSession) {
      btnRefreshSession.addEventListener('click', async () => {
        await authController.refreshSession();
      });
    }

    if (btnSignOut) {
      btnSignOut.addEventListener('click', async () => {
        await authController.logout();
      });
    }
  },

  attachUnauthenticatedListeners(container) {
    const btnRegister = container.querySelector('#btnRegister');
    const btnLogin = container.querySelector('#btnLogin');
    const btnCheckSession = container.querySelector('#btnCheckSession');
    const statusDiv = container.querySelector('#authStatus');

    // Form elements
    const registerForm = container.querySelector('#registerForm');
    const loginForm = container.querySelector('#loginForm');
    const mainButtons = container.querySelector('#mainButtons');
    
    const btnConfirmRegister = container.querySelector('#btnConfirmRegister');
    const btnCancelRegister = container.querySelector('#btnCancelRegister');
    const registerUsernameInput = container.querySelector('#registerUsername');
    
    const btnConfirmLogin = container.querySelector('#btnConfirmLogin');
    const btnCancelLogin = container.querySelector('#btnCancelLogin');
    const loginUsernameInput = container.querySelector('#loginUsername');

    // Show/hide helpers
    const showRegisterForm = () => {
      mainButtons.style.display = 'none';
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      statusDiv.textContent = '';
      setTimeout(() => registerUsernameInput?.focus(), 100);
    };

    const showLoginForm = () => {
      mainButtons.style.display = 'none';
      registerForm.style.display = 'none';
      loginForm.style.display = 'block';
      statusDiv.textContent = '';
      setTimeout(() => loginUsernameInput?.focus(), 100);
    };

    const showMainButtons = () => {
      registerForm.style.display = 'none';
      loginForm.style.display = 'none';
      mainButtons.style.display = 'flex';
      statusDiv.textContent = '';
    };

    // Main Register button - shows form
    if (btnRegister) {
      btnRegister.addEventListener('click', () => {
        showRegisterForm();
      });
    }

    // Confirm Register button - CRITICAL: Direct call without async delay
    if (btnConfirmRegister && registerUsernameInput) {
      btnConfirmRegister.addEventListener('click', async () => {
        const username = registerUsernameInput.value.trim();
        
        if (!username || username.length < 3) {
          statusDiv.textContent = '❌ Username must be at least 3 characters';
          return;
        }

        // Disable button to prevent double-clicks
        btnConfirmRegister.disabled = true;
        btnConfirmRegister.textContent = '⏳ Processing...';

        try {
          // CRITICAL: Call register immediately within the click handler
          // This preserves the user gesture for WebAuthn
          statusDiv.textContent = '🔄 Preparing WebAuthn registration...';
          await authController.register(username);
          statusDiv.textContent = '✅ Registration successful!';
          
          // Small delay to show success message
          setTimeout(() => {
            showMainButtons();
            registerUsernameInput.value = '';
          }, 1500);
        } catch (error) {
          statusDiv.textContent = `❌ ${error.message || 'Registration failed'}`;
          btnConfirmRegister.disabled = false;
          btnConfirmRegister.textContent = '✅ Register';
        }
      });

      // Allow Enter key to submit
      registerUsernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          btnConfirmRegister.click();
        }
      });
    }

    // Cancel Register button
    if (btnCancelRegister) {
      btnCancelRegister.addEventListener('click', () => {
        showMainButtons();
      });
    }

    // Main Login button - shows form
    if (btnLogin) {
      btnLogin.addEventListener('click', () => {
        showLoginForm();
      });
    }

    // Confirm Login button - CRITICAL: Direct call without async delay
    if (btnConfirmLogin) {
      btnConfirmLogin.addEventListener('click', async () => {
        const username = loginUsernameInput?.value.trim() || null;
        
        // Disable button to prevent double-clicks
        btnConfirmLogin.disabled = true;
        btnConfirmLogin.textContent = '⏳ Processing...';

        try {
          // CRITICAL: Call login immediately within the click handler
          // This preserves the user gesture for WebAuthn
          statusDiv.textContent = '🔄 Preparing WebAuthn authentication...';
          await authController.login(username);
          statusDiv.textContent = '✅ Authentication successful!';
          
          // Small delay to show success message
          setTimeout(() => {
            showMainButtons();
            if (loginUsernameInput) loginUsernameInput.value = '';
          }, 1500);
        } catch (error) {
          statusDiv.textContent = `❌ ${error.message || 'Authentication failed'}`;
          btnConfirmLogin.disabled = false;
          btnConfirmLogin.textContent = '✅ Login';
        }
      });

      // Allow Enter key to submit
      if (loginUsernameInput) {
        loginUsernameInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            btnConfirmLogin.click();
          }
        });
      }
    }

    // Cancel Login button
    if (btnCancelLogin) {
      btnCancelLogin.addEventListener('click', () => {
        showMainButtons();
      });
    }

    if (btnCheckSession) {
      btnCheckSession.addEventListener('click', async () => {
        await authController.checkSession();
        const state = authModel.getState();
        if (state.isAuthenticated) {
          statusDiv.textContent = `✅ Session active: ${state.currentUser}`;
        } else {
          statusDiv.textContent = '❌ No active session';
        }
      });
    }
  }
};

// ==================== CONTROLLER ====================
const authController = {
  // Initialize authentication system
  async init(containerElement) {
    console.log('🚀 Initializing Auth Controller...');

    // Subscribe to state changes for automatic re-rendering
    authModel.subscribe((state) => {
      if (containerElement) {
        authView.render(state, containerElement);
      }
    });

    // Check for existing session on startup
    await this.checkSession();

    // Initial render
    if (containerElement) {
      authView.render(authModel.getState(), containerElement);
    }

    console.log('✅ Auth Controller initialized');
  },

  // POST: Register new user
  async register(username) {
    console.log(`📝 Registering user: ${username}`);
    authModel.setState({ isLoading: true, error: null });

    const result = await authAPI.registerUser(username);

    if (result.success) {
      console.log('✅ Registration successful');
      // After registration, check session to update state
      await this.checkSession();
    } else {
      console.error('❌ Registration failed:', result.error);
      authModel.setState({ isLoading: false, error: result.error });
    }
  },

  // POST: Authenticate user
  async login(username = null) {
    console.log('🔐 Logging in...');
    authModel.setState({ isLoading: true, error: null });

    const result = username 
      ? await authAPI.loginUser(username)
      : await authAPI.loginUser('testuser'); // Default

    if (result.success) {
      console.log('✅ Login successful');
      // After login, check session to update state
      await this.checkSession();
    } else {
      console.error('❌ Login failed:', result.error);
      authModel.setState({ isLoading: false, error: result.error });
    }
  },

  // POST: Logout user (DELETE session)
  async logout() {
    console.log('🚪 Logging out...');
    authModel.setState({ isLoading: true, error: null });

    const result = await authAPI.logoutUser();

    if (result.success) {
      console.log('✅ Logout successful');
      authModel.clear();
      authModel.setState({ isLoading: false });
      
      // Clear localStorage
      localStorage.removeItem('webauthn_username');
      localStorage.removeItem('pkp_primary_address');
      localStorage.removeItem('pkp_sub_count');
    } else {
      console.error('❌ Logout failed:', result.error);
      authModel.setState({ isLoading: false, error: result.error });
    }
  },

  // GET: Check current session status
  async checkSession() {
    console.log('🔍 Checking session status...');
    
    const result = await authAPI.getSessionStatus();

    if (result.success && result.data.authenticated) {
      console.log('✅ Active session found:', result.data.username);
      
      // Update model with session data
      authModel.setState({
        isAuthenticated: true,
        currentUser: result.data.username,
        pkp: result.data.pkp || null,
        authMethod: { authMethodType: 'webauthn' },
        isLoading: false,
        error: null
      });

      // Fetch additional PKP dashboard data
      await this.fetchPKPDashboard();
    } else {
      console.log('ℹ️ No active session');
      authModel.setState({
        isAuthenticated: false,
        currentUser: null,
        pkp: null,
        isLoading: false,
        error: null
      });
    }

    return authModel.getState();
  },

  // GET: Fetch PKP dashboard info
  async fetchPKPDashboard() {
    console.log('📊 Fetching PKP dashboard...');
    
    const result = await authAPI.getPKPDashboard();

    if (result.success && result.data.primaryPKP) {
      console.log('✅ PKP dashboard loaded');
      
      // Update model with PKP data
      authModel.setState({
        pkp: {
          ethAddress: result.data.primaryPKP.ethAddress,
          publicKey: result.data.primaryPKP.publicKey,
          subPKPs: result.data.primaryPKP.subPKPs || [],
          canMint: result.data.primaryPKP.canMint || false
        }
      });

      // Update localStorage
      localStorage.setItem('pkp_primary_address', result.data.primaryPKP.ethAddress);
      localStorage.setItem('pkp_sub_count', (result.data.primaryPKP.subPKPs?.length || 0).toString());
    } else {
      console.warn('⚠️ Could not fetch PKP dashboard:', result.error);
    }
  },

  // POST: Mint new sub-PKP
  async mintSubPKP(purpose, description = '') {
    console.log(`🔧 Minting sub-PKP for: ${purpose}`);
    authModel.setState({ isLoading: true, error: null });

    const result = await authAPI.mintSubPKP(purpose, description);

    if (result.success) {
      console.log('✅ Sub-PKP minted successfully');
      // Refresh PKP dashboard to get updated count
      await this.fetchPKPDashboard();
      authModel.setState({ isLoading: false });
    } else {
      console.error('❌ Failed to mint sub-PKP:', result.error);
      authModel.setState({ isLoading: false, error: result.error });
    }

    return result;
  },

  // Refresh session (re-check and update state)
  async refreshSession() {
    console.log('🔄 Refreshing session...');
    await this.checkSession();
  },

  // Get current authentication state
  getCurrentUser() {
    return authModel.getState().currentUser;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return authModel.getState().isAuthenticated;
  }
};

// Export to global scope
window.authController = authController;
window.authModel = authModel;
window.authAPI = authAPI;
window.authView = authView;

console.log('🎯 Auth MVC System loaded! Available globally:');
console.log('  - authController - Main controller for auth operations');
console.log('  - authModel - State management');
console.log('  - authAPI - HTTP API client');
console.log('  - authView - UI rendering');
console.log('');
console.log('📘 Usage:');
console.log('  authController.init(document.getElementById("authContainer"))');
console.log('  authController.login()');
console.log('  authController.register("username")');
console.log('  authController.logout()');
console.log('  authController.getCurrentUser()');
