/**
 * Community Game Mode Handler
 * Handles the community age guessing game logic and photo uploads
 */

let guessesLeft = 25;
let curScorev = 0;

window.addEventListener('DOMContentLoaded', () => {
  getNewImage();
});

/**
 * Uploads a photo to the community collection
 */
async function uploadPhoto() {
  const fileInput = document.getElementById('imageFile');
  const ageInPhoto = document.getElementById('ageInPhoto').value;
  const datePhotoTaken = document.getElementById('datePhotoTaken').value;
  const name = document.getElementById('namePerson').value.trim();

  if (!fileInput?.files[0]) {
    alert('Please select an image file');
    return;
  }

  if (!name || !ageInPhoto || !datePhotoTaken) {
    alert('Please fill in all fields');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function() {
    try {
      const data = {
        file: reader.result,
        name: name,
        ageInPhoto: parseInt(ageInPhoto),
        datePhotoTaken: parseInt(datePhotoTaken)
      };

      const response = await fetch('/upload/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.text();
      
      if (result === 'success') {
        alert('Photo uploaded successfully!');
        // Clear form
        fileInput.value = '';
        document.getElementById('ageInPhoto').value = '';
        document.getElementById('datePhotoTaken').value = '';
        document.getElementById('namePerson').value = '';
      } else {
        alert('Failed to upload photo. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred while uploading. Please try again.');
    }
  };

  reader.readAsDataURL(file);
}

/**
 * Checks the user's guess when Enter is pressed
 */
async function checkGuess(event) {
  if (event.keyCode !== 13) return;

  if (guessesLeft === 0) {
    await saveScore('comm');
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
    const response = await fetch('/check/guess/comm', {
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
      const guessElement = document.getElementById('guessNumber') || document.getElementById('guessesLeft');
      if (guessElement) {
        guessElement.innerText = guessesLeft;
      }
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
 * Fetches a new random community image
 */
async function getNewImage() {
  try {
    const response = await fetch('/get/image/comm');
    const data = await response.json();

    if (data.pic) {
      // Community images are stored as base64 strings, not buffers
      document.getElementById('celebPic').src = data.pic;
      document.getElementById('celebPic').alt = data.filename;
      document.getElementById('celebName').innerText = data.name;
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
  const guessElement = document.getElementById('guessNumber') || document.getElementById('guessesLeft');
  if (guessElement) {
    guessElement.innerText = 25;
  }
  getNewImage();
}
