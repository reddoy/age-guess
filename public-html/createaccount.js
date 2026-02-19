/**
 * Account Creation Handler
 * Handles user account creation with modern async/await syntax
 */

const createButton = document.getElementById("createbutton");

if (createButton) {
  createButton.addEventListener("submit", async (event) => {
    event.preventDefault();
    await createAccount();
  });
}

async function createAccount() {
  const username = document.getElementById('usernameCreate').value.trim();
  const password = document.getElementById('passwordCreate').value;

  if (!username || !password) {
    alert('Please enter both username and password');
    return;
  }

  try {
    const response = await fetch('/account/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const text = await response.text();
    
    if (response.ok && text.includes('Created')) {
      alert('Account created successfully!');
      window.location.href = "login.html";
    } else {
      alert(text || 'Failed to create account. Please try again.');
    }
  } catch (error) {
    console.error('Account creation error:', error);
    alert('An error occurred. Please try again.');
  }
}
