// Popup script for the PingID Bingo extension
document.addEventListener('DOMContentLoaded', function () {
  // UI Elements
  const loadingSection = document.getElementById('loadingSection');
  const loginSection = document.getElementById('loginSection');
  const loggedInSection = document.getElementById('loggedInSection');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const messageDiv = document.getElementById('message');
  const displayUsername = document.getElementById('displayUsername');
  const lastActionBox = document.getElementById('lastActionBox');
  const lastActionText = document.getElementById('lastActionText');

  // Initialize popup
  init();

  async function init() {
    // Check authentication status
    const authStatus = await getAuthStatus();

    loadingSection.classList.add('hidden');

    if (authStatus.isLoggedIn) {
      showLoggedInView(authStatus.userInfo);
      loadLastAction();
    } else {
      showLoginView();
    }
  }

  // Show login view
  function showLoginView() {
    loginSection.classList.remove('hidden');
    loggedInSection.classList.add('hidden');
    messageDiv.style.display = 'none';
  }

  // Show logged in view
  function showLoggedInView(userInfo) {
    loginSection.classList.add('hidden');
    loggedInSection.classList.remove('hidden');

    if (userInfo && userInfo.username) {
      displayUsername.textContent = userInfo.username;
    }
  }

  // Login button click
  loginBtn.addEventListener('click', async function () {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showMessage('Por favor, ingresa usuario y contraseña', 'error');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Iniciando sesión...';

    try {
      const result = await sendMessage({
        action: 'login',
        username,
        password
      });

      if (result.success) {
        showMessage('¡Login exitoso!', 'success');
        setTimeout(() => {
          showLoggedInView({ username });
          loadLastAction();
        }, 500);
      } else {
        showMessage(result.error || 'Error de autenticación', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Iniciar Sesión';
    }
  });

  // Logout button click
  logoutBtn.addEventListener('click', async function () {
    logoutBtn.disabled = true;
    logoutBtn.textContent = 'Cerrando sesión...';

    try {
      await sendMessage({ action: 'logout' });
      showLoginView();
      usernameInput.value = '';
      passwordInput.value = '';
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logoutBtn.disabled = false;
      logoutBtn.textContent = 'Cerrar Sesión';
    }
  });

  // Enter key to login
  passwordInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      loginBtn.click();
    }
  });

  usernameInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      passwordInput.focus();
    }
  });

  // Load last action
  async function loadLastAction() {
    try {
      const result = await sendMessage({ action: 'getLastAction' });

      if (result.success && result.lastAction) {
        displayLastAction(result.lastAction);
      } else {
        lastActionText.textContent = 'Sin acciones recientes';
        lastActionBox.className = 'status-box info';
      }
    } catch (error) {
      console.error('Error loading last action:', error);
    }
  }

  // Display last action
  function displayLastAction(action) {
    const timestamp = new Date(action.timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let statusClass = 'info';
    if (action.status === 'success') {
      statusClass = 'success';
    } else if (action.status === 'error') {
      statusClass = 'error';
    } else if (action.status === 'not_logged_in' || action.status === 'already_added') {
      statusClass = 'warning';
    }

    lastActionBox.className = `status-box ${statusClass}`;

    let actionHtml = `<strong>${timestamp}</strong><br>`;

    if (action.number) {
      actionHtml += `<strong>Número:</strong> ${action.number}<br>`;
    }

    actionHtml += action.message;

    lastActionText.innerHTML = actionHtml;
  }

  // Show message
  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.style.display = 'block';
  }

  // Get auth status
  function getAuthStatus() {
    return sendMessage({ action: 'getAuthStatus' });
  }

  // Send message to background script
  function sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, function (response) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }
});