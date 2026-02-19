/**
 * Account Page Handler
 * Displays user account information and scores
 */

window.addEventListener('DOMContentLoaded', async () => {
  await loadAccountInfo();
});

/**
 * Loads and displays account information
 */
async function loadAccountInfo() {
  try {
    const response = await fetch('/get/account');
    
    if (!response.ok) {
      if (response.status === 401) {
        document.getElementById('username').innerHTML = 'Username: Not logged in';
        return;
      }
      throw new Error('Failed to load account info');
    }

    const data = await response.json();
    
    // Extract username from cookie if available
    const username = getUsernameFromCookie() || 'Guest';
    document.getElementById('username').innerHTML = `Username: ${username}`;
    
    document.getElementById('celebscore').innerHTML = `Celebrity Highscore: ${data.topCelebScore || 0}`;
    document.getElementById('athletescore').innerHTML = `Athlete Highscore: ${data.topAthleteScore || 0}`;
    document.getElementById('comunscore').innerHTML = `Community Highscore: ${data.topCommunityScore || 0}`;
  } catch (error) {
    console.error('Account load error:', error);
    document.getElementById('username').innerHTML = 'Username: Error loading account';
  }
}

/**
 * Helper function to get username from cookie
 */
function getUsernameFromCookie() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'user') {
      // Cookie format: username;expires=...;path=/
      return value.split(';')[0];
    }
  }
  return null;
}
