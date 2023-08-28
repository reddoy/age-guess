/* 
Project ageGuess
CSC 337
Developers: Rohan O'Malley,Daniel Peabody

This file contains the logic for the celebrity game mode. Each time the user makes a guess
this file makes a request to the server to check if the guess was right. Depending on the outcome
it takes a guess away from the user and adds to the score. Once the user is out of guesses the file
restarts the game with a fresh set of guesses.
*/
window.onload = function(){
    getNewImage();
}
    let guessesLeft = 25;
    /*This function checkGuess(event) checks the event code to see if it is the enter key.
    then it checks to see if the guess is correct by sending a request using fetch to the server with
    the images id and the users guess. Then it checks the response from the server to see
    if the guess was correct or not. If it was correct it displays a message saying correct*/
    function checkGuess(event){
        if(event.keyCode == 13){
            if (guessesLeft == 0){
                fetch('/save/score/celeb', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({score: curScorev})
                        });
                alert("You have no guesses left. Bringing up a new Image.");
                getNewImage();
                guessesLeft = 25;
                document.getElementById('guessInput').value = "";
                curScorev = 0;
                document.getElementById('scorenumber').innerText = 0;
                return;
            }
            let guess = document.getElementById('guessInput').value;
            let filename = document.getElementById('celebPic').alt;
            let score = document.getElementById('scorenumber').innerText;
            let data = {filename: filename, guess: guess, score: score};
            fetch('/check/guess/celeb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(function(response){
                console.log(response);
                response.json().then(function(data){
                    if(data.checkedGuess == "correct"){
                        setClass('correct');
                        getNewImage();
                        updateScore();
                        document.getElementById('scorenumber').innerText = curScorev;
                    }
                    else if(data.checkedGuess == "close"){
                        setClass('close');
                    }
                    else{
                        setClass('incorrect');
                        guessesLeft -= 1;
                        document.getElementById('guessNumber').innerText = guessesLeft;
                        document.getElementById('scorenumber').innerText = curScorev;
                    }
                });
            });
        }
    }
    function setClass(answer){
        document.getElementById('guessInput').classList.add(answer);
        setTimeout(function(){
            document.getElementById('guessInput').classList.remove(answer);
        }, 1000); // Remove the class after 1 second
        document.getElementById('guessInput').value = "";
    }

    function getNewImage(){
        fetch('/get/image/celeb')
        .then(function(response){
            response.json().then(function(data){
                const dataUrl = `data:image/jpeg;base64,${data.pic.toString('base64')}`;
                document.getElementById('celebPic').src = dataUrl;
                document.getElementById('celebPic').alt = data.filename;
                document.getElementById('celebName').innerText = decodeURIComponent(data.name.split('_').join(' '));
                document.getElementById('dateTaken').innerText = "This photo was taken in "+ data.dateTaken;
            });
        });
    }

    let curScorev = 0;    
    function updateScore(){
        curScorev += 1;
    }

