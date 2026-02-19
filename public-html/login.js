/**
 * Login Handler
 * Handles user authentication with modern async/await syntax
 */

const loginButton = document.getElementById("loginbutton");

if (loginButton) {
  loginButton.addEventListener("submit", async (event) => {
    event.preventDefault();
    await login();
  });
}

async function login() {
  const username = document.getElementById('usernameLogin').value.trim();
  const password = document.getElementById('passwordLogin').value;

  if (!username || !password) {
    alert('Please enter both username and password');
    return;
  }

  try {
    const response = await fetch('/account/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const text = await response.text();
    
    if (text === 'success') {
      alert('Login successful!');
      window.location.href = "gamemodes.html";
    } else {
      alert('Login failed. Please check your username and password.');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('An error occurred. Please try again.');
  }
}
