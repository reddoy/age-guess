/**
 * Celebrity Leaderboard Handler
 * Displays the top 10 celebrity game scores
 */

window.addEventListener('DOMContentLoaded', async () => {
  await loadLeaderboard();
});

/**
 * Loads and displays the leaderboard
 */
async function loadLeaderboard() {
  try {
    const response = await fetch('/get/leaderboard/celeb');
    
    if (!response.ok) {
      throw new Error('Failed to load leaderboard');
    }

    const data = await response.json();
    const table = document.getElementById('leaderboard');
    
    if (!table) {
      console.error('Leaderboard table not found');
      return;
    }

    // Clear existing rows (except header)
    while (table.rows.length > 1) {
      table.deleteRow(1);
    }

    // Add leaderboard entries
    data.forEach((entry, index) => {
      const row = table.insertRow(index + 1);
      const rank = row.insertCell(0);
      const username = row.insertCell(1);
      const score = row.insertCell(2);
      
      rank.innerHTML = index + 1;
      username.innerHTML = entry.username || 'Anonymous';
      score.innerHTML = entry.score || 0;
    });

    if (data.length === 0) {
      const row = table.insertRow(1);
      const cell = row.insertCell(0);
      cell.colSpan = 3;
      cell.innerHTML = 'No scores yet. Be the first!';
      cell.style.textAlign = 'center';
    }
  } catch (error) {
    console.error('Leaderboard load error:', error);
    alert('Failed to load leaderboard. Please try again.');
  }
}
