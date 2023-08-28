/* 
Project ageGuess
CSC 337
Developers: Rohan O'Malley,Daniel Peabody

This file contains the logic for the community game mode. Each time the user makes a guess
this file makes a request to the server to check if the guess was right. Depending on the outcome
it takes a guess away from the user and adds to the score. Once the user is out of guesses the file
restarts the game with a fresh set of guesses. This game mode also allows for users to upload 
an image to add to the community which is handled by this file. It sends the image file and information
about the image to the server to be stored in the db.
*/
window.onload = function(){
    getNewImage();
}


    function uploadPhoto(){
        let file = document.getElementById('imageFile').files[0];
        let ageInPhoto = document.getElementById('ageInPhoto').value;
        let datePhotoTaken = document.getElementById('datePhotoTaken').value;
        let name = document.getElementById('namePerson').value;
        data = {
            file: file,
            ageInPhoto: ageInPhoto,
            datePhotoTaken: datePhotoTaken
        }
        // write me code that takes the file variable and converts it to a base64 string
        // then send it to the server
        // console.log(file);
        let newFile = new FileReader();
        newFile.readAsDataURL(file);
        newFile.onload = function(){
            let data = {
                file: newFile.result,
                name: name,
                ageInPhoto: ageInPhoto,
                datePhotoTaken: datePhotoTaken
            }
            fetch('/upload/image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(function(response){
                console.log(response);
                response.text().then(function(data){
                    console.log(data);
                    if(data == "success"){
                        console.log("success");
                    }
                    else{
                        console.log("fail");
                    }
                });
            });
        }
    }

    let guessesLeft = 25;
    /*This function checkGuess(event) checks the event code to see if it is the enter key.
    then it checks to see if the guess is correct by sending a request using fetch to the server with
    the images id and the users guess. Then it checks the response from the server to see
    if the guess was correct or not. If it was correct it displays a message saying correct*/
    function checkGuess(event){
        if(event.keyCode == 13){
            if (guessesLeft == 0){
                fetch('/save/score/comm', {
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
            fetch('/check/guess/comm', {
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
                        document.getElementById('guessesLeft').innerText = guessesLeft;
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
        fetch('/get/image/comm')
        .then(function(response){
            response.json().then(function(data){
                document.getElementById('celebPic').src = data.pic;
                document.getElementById('celebPic').alt = data.filename;
                document.getElementById('celebName').innerText = data.name;
                document.getElementById('dateTaken').innerText = "This photo was taken in "+ data.dateTaken;
            });
        });
    }

    let curScorev = 0;    
    function updateScore(){
        curScorev += 1;
    }

