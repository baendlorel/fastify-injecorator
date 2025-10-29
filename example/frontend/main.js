// Global state
let authToken = localStorage.getItem('authToken') || '';

// Update token display on load
updateTokenDisplay();

// Fetch wrapper to reduce boilerplate
async function fetchAPI(endpoint, options = {}) {
  const baseURL = window.location.origin;
  const url = `${baseURL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  if (authToken) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Helper to display results
function displayResult(elementId, data) {
  const element = document.getElementById(elementId);
  element.textContent = JSON.stringify(data, null, 2);
  element.className = 'result success';
}

function displayError(elementId, error) {
  const element = document.getElementById(elementId);
  element.textContent = `Error: ${error.message}`;
  element.className = 'result error';
}

function updateTokenDisplay() {
  const display = document.getElementById('token-display');
  if (authToken) {
    display.textContent = authToken.substring(0, 20) + '...';
  } else {
    display.textContent = 'Not logged in';
  }
}

// ============= Authentication =============

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const data = await fetchAPI('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    authToken = data.data.access_token;
    localStorage.setItem('authToken', authToken);
    updateTokenDisplay();

    displayResult('auth-result', data);
  } catch (error) {
    displayError('auth-result', error);
  }
}

async function getProfile() {
  try {
    const data = await fetchAPI('/api/auth/profile/');
    displayResult('auth-result', data);
  } catch (error) {
    displayError('auth-result', error);
  }
}

async function verifyToken() {
  try {
    const data = await fetchAPI('/api/auth/verify/', {
      method: 'POST',
      body: JSON.stringify({ token: authToken }),
    });
    displayResult('auth-result', data);
  } catch (error) {
    displayError('auth-result', error);
  }
}

function logout() {
  authToken = '';
  localStorage.removeItem('authToken');
  updateTokenDisplay();
  displayResult('auth-result', { message: 'Logged out successfully' });
}

// ============= User Management =============

async function getAllUsers() {
  try {
    const data = await fetchAPI('/api/users/');
    displayResult('user-result', data);
  } catch (error) {
    displayError('user-result', error);
  }
}

async function getUserById() {
  try {
    const data = await fetchAPI('/api/users/1/');
    displayResult('user-result', data);
  } catch (error) {
    displayError('user-result', error);
  }
}

async function getUsersByRole() {
  try {
    const data = await fetchAPI('/api/users/?role=admin');
    displayResult('user-result', data);
  } catch (error) {
    displayError('user-result', error);
  }
}

async function createUser() {
  const username = document.getElementById('new-username').value;
  const email = document.getElementById('new-email').value;
  const role = document.getElementById('new-role').value;

  if (!username || !email) {
    displayError('user-result', new Error('Username and email are required'));
    return;
  }

  try {
    const data = await fetchAPI('/api/users/', {
      method: 'POST',
      body: JSON.stringify({ username, email, role }),
    });
    displayResult('user-result', data);
  } catch (error) {
    displayError('user-result', error);
  }
}

async function updateUser() {
  try {
    const data = await fetchAPI('/api/users/2/', {
      method: 'PATCH',
      body: JSON.stringify({ email: 'updated@example.com' }),
    });
    displayResult('user-result', data);
  } catch (error) {
    displayError('user-result', error);
  }
}

async function deleteUser() {
  try {
    const data = await fetchAPI('/api/users/3/', {
      method: 'DELETE',
    });
    displayResult('user-result', data);
  } catch (error) {
    displayError('user-result', error);
  }
}

// ============= File Upload =============

async function uploadSingle() {
  const fileInput = document.getElementById('single-file');
  const file = fileInput.files[0];

  if (!file) {
    displayError('upload-result', new Error('Please select a file'));
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload/single/', {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    displayResult('upload-result', data);
  } catch (error) {
    displayError('upload-result', error);
  }
}

async function uploadMultiple() {
  const fileInput = document.getElementById('multiple-files');
  const files = fileInput.files;

  if (files.length === 0) {
    displayError('upload-result', new Error('Please select at least one file'));
    return;
  }

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  try {
    const response = await fetch('/api/upload/multiple/', {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    displayResult('upload-result', data);
  } catch (error) {
    displayError('upload-result', error);
  }
}

// ============= Logging =============

async function getLogs() {
  try {
    const data = await fetchAPI('/api/logs/');
    displayResult('logs-result', data);
  } catch (error) {
    displayError('logs-result', error);
  }
}

async function clearLogs() {
  try {
    const data = await fetchAPI('/api/logs/clear/');
    displayResult('logs-result', data);
  } catch (error) {
    displayError('logs-result', error);
  }
}
