// Background service worker for the extension
// Load configuration (note: in service workers, we inline the config)
const CONFIG = {
  API_URL: 'http://pegasusbingo.leo.rd.hpicorp.net/',
  BINGO_APP_URL: 'http://pegasusbingo.leo.rd.hpicorp.net/',
  STORAGE_KEYS: {
    AUTH_TOKEN: 'authToken',
    USER_INFO: 'userInfo',
    LAST_ACTION: 'lastAction'
  }
};

// Extension installation/startup
chrome.runtime.onInstalled.addListener(function (details) {
  console.log('Ping ID Bingo Extension installed:', details);

  // Set default storage values
  chrome.storage.local.set({
    extensionEnabled: true
  });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Background received message:', request);

  switch (request.action) {
    case 'pingNumberDetected':
      handlePingNumberDetected(request.number, sender, sendResponse);
      return true; // Keep channel open for async response

    case 'login':
      handleLogin(request.username, request.password, sendResponse);
      return true;

    case 'logout':
      handleLogout(sendResponse);
      return true;

    case 'getAuthStatus':
      getAuthStatus(sendResponse);
      return true;

    case 'getLastAction':
      getLastAction(sendResponse);
      return true;

    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Handle detected PingID number
async function handlePingNumberDetected(number, sender, sendResponse) {
  console.log('Processing detected PingID number:', number);

  try {
    // Check if user is logged in
    const authData = await getStoredAuthData();

    if (!authData || !authData.token) {
      console.log('User not logged in, skipping auto-submission');
      await saveLastAction({
        type: 'number_detected',
        number: number,
        status: 'not_logged_in',
        message: 'Número detectado pero no has iniciado sesión. Por favor, inicia sesión en la extensión.',
        timestamp: new Date().toISOString()
      });
      sendResponse({ success: false, reason: 'not_logged_in' });
      return;
    }

    // Check if number already added today
    const isDayNumberAdded = await checkDayNumberAdded(authData.token);

    if (isDayNumberAdded) {
      console.log('Number already added today, skipping submission');
      await saveLastAction({
        type: 'number_detected',
        number: number,
        status: 'already_added',
        message: 'Ya has añadido un número hoy.',
        timestamp: new Date().toISOString()
      });
      sendResponse({ success: false, reason: 'already_added' });
      return;
    }

    // Submit the number
    console.log('Submitting number automatically:', number);
    const submitResult = await submitNumber(number, authData.token);

    if (submitResult.success) {
      console.log('Number submitted successfully');

      // Open bingo app in background tab
      chrome.tabs.create({
        url: CONFIG.BINGO_APP_URL,
        active: false // Don't focus on the new tab
      }, function (tab) {
        console.log('Opened bingo app in background tab:', tab.id);
      });

      await saveLastAction({
        type: 'number_submitted',
        number: number,
        status: 'success',
        message: `Número ${number} añadido automáticamente. ¡Bingo abierto!`,
        timestamp: new Date().toISOString()
      });

      sendResponse({ success: true, number: number });
    } else {
      console.error('Failed to submit number:', submitResult.error);
      await saveLastAction({
        type: 'number_submission_failed',
        number: number,
        status: 'error',
        message: `Error al añadir el número: ${submitResult.error}`,
        timestamp: new Date().toISOString()
      });
      sendResponse({ success: false, reason: 'submission_failed', error: submitResult.error });
    }

  } catch (error) {
    console.error('Error processing PingID number:', error);
    await saveLastAction({
      type: 'error',
      status: 'error',
      message: `Error: ${error.message}`,
      timestamp: new Date().toISOString()
    });
    sendResponse({ success: false, reason: 'error', error: error.message });
  }
}

// Handle login
async function handleLogin(username, password, sendResponse) {
  try {
    const response = await fetch(CONFIG.API_URL + 'user/login/extension', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      // Store token
      await chrome.storage.local.set({
        [CONFIG.STORAGE_KEYS.AUTH_TOKEN]: data.token,
        [CONFIG.STORAGE_KEYS.USER_INFO]: { username }
      });

      console.log('Login successful with permanent token');
      sendResponse({ success: true, token: data.token });
    } else {
      console.error('Login failed:', data.error);
      sendResponse({ success: false, error: data.error || 'Error de autenticación' });
    }
  } catch (error) {
    console.error('Login error:', error);
    sendResponse({ success: false, error: 'Error de conexión' });
  }
}

// Handle logout
async function handleLogout(sendResponse) {
  try {
    await chrome.storage.local.remove([
      CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      CONFIG.STORAGE_KEYS.USER_INFO,
      CONFIG.STORAGE_KEYS.LAST_ACTION
    ]);

    console.log('Logout successful');
    sendResponse({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Get authentication status
async function getAuthStatus(sendResponse) {
  try {
    const authData = await getStoredAuthData();
    sendResponse({
      success: true,
      isLoggedIn: !!(authData && authData.token),
      userInfo: authData ? authData.userInfo : null
    });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Get last action
async function getLastAction(sendResponse) {
  try {
    const result = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.LAST_ACTION]);
    sendResponse({
      success: true,
      lastAction: result[CONFIG.STORAGE_KEYS.LAST_ACTION] || null
    });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Helper: Get stored auth data
function getStoredAuthData() {
  return new Promise((resolve) => {
    chrome.storage.local.get([
      CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      CONFIG.STORAGE_KEYS.USER_INFO
    ], function (result) {
      resolve({
        token: result[CONFIG.STORAGE_KEYS.AUTH_TOKEN],
        userInfo: result[CONFIG.STORAGE_KEYS.USER_INFO]
      });
    });
  });
}

// Helper: Check if number already added today
async function checkDayNumberAdded(token) {
  try {
    const response = await fetch(CONFIG.API_URL + 'user/isDayNumberAdded', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data.hasNumber === true;
  } catch (error) {
    console.error('Error checking day number:', error);
    return false;
  }
}

// Helper: Submit number
async function submitNumber(number, token) {
  try {
    const response = await fetch(CONFIG.API_URL + `number/add?number=${number}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || data.error || 'Error desconocido' };
    }
  } catch (error) {
    console.error('Error submitting number:', error);
    return { success: false, error: error.message };
  }
}

// Helper: Save last action
function saveLastAction(action) {
  return chrome.storage.local.set({
    [CONFIG.STORAGE_KEYS.LAST_ACTION]: action
  });
}