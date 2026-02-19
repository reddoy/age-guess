/**
 * Celebrity Game Mode Handler
 * Handles the celebrity age guessing game logic
 */

let guessesLeft = 25;
let curScorev = 0;

window.addEventListener('DOMContentLoaded', () => {
  getNewImage();
});

/**
 * Checks the user's guess when Enter is pressed
 */
async function checkGuess(event) {
  if (event.keyCode !== 13) return;

  if (guessesLeft === 0) {
    await saveScore('celeb');
    alert("You have no guesses left. Bringing up a new image.");
    resetGame();
    return;
  }

  const guess = document.getElementById('guessInput').value.trim();
  const filename = document.getElementById('celebPic').alt;
  const score = parseInt(document.getElementById('scorenumber').innerText) || 0;

  if (!guess || isNaN(parseInt(guess))) {
    alert('Please enter a valid age');
    return;
  }

  try {
    const response = await fetch('/check/guess/celeb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filename, guess: parseInt(guess), score })
    });

    const data = await response.json();

    if (data.checkedGuess === 'correct') {
      setClass('correct');
      updateScore();
      document.getElementById('scorenumber').innerText = curScorev;
      await getNewImage();
    } else if (data.checkedGuess === 'close') {
      setClass('close');
    } else {
      setClass('incorrect');
      guessesLeft -= 1;
      document.getElementById('guessNumber').innerText = guessesLeft;
    }

    document.getElementById('guessInput').value = '';
  } catch (error) {
    console.error('Check guess error:', error);
    alert('An error occurred. Please try again.');
  }
}

/**
 * Sets visual feedback class on the input field
 */
function setClass(answer) {
  const input = document.getElementById('guessInput');
  input.classList.add(answer);
  
  setTimeout(() => {
    input.classList.remove(answer);
  }, 1000);
}

/**
 * Fetches a new random celebrity image
 */
async function getNewImage() {
  try {
    const response = await fetch('/get/image/celeb');
    const data = await response.json();

    if (data.pic) {
      const dataUrl = `data:image/jpeg;base64,${data.pic.toString('base64')}`;
      document.getElementById('celebPic').src = dataUrl;
      document.getElementById('celebPic').alt = data.filename;
      document.getElementById('celebName').innerText = decodeURIComponent(data.name.split('_').join(' '));
      document.getElementById('dateTaken').innerText = `This photo was taken in ${data.dateTaken}`;
    }
  } catch (error) {
    console.error('Get image error:', error);
    alert('Failed to load image. Please try again.');
  }
}

/**
 * Updates the current score
 */
function updateScore() {
  curScorev += 1;
}

/**
 * Saves the current score to the server
 */
async function saveScore(mode) {
  try {
    await fetch(`/save/score/${mode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ score: curScorev })
    });
  } catch (error) {
    console.error('Save score error:', error);
  }
}

/**
 * Resets the game state
 */
function resetGame() {
  guessesLeft = 25;
  curScorev = 0;
  document.getElementById('guessInput').value = '';
  document.getElementById('scorenumber').innerText = 0;
  document.getElementById('guessNumber').innerText = 25;
  getNewImage();
}
