/* 
Project ageGuess
CSC 337
Developers: Rohan O'Malley,Daniel Peabody

This file contains the logic for the athlete leaderboard. Each time the page is loaded it makes 
a request to the server to find the top 10 scores for the athlete game mode. Then it loops through
the high scores and adds them to the page for the user to see.
*/

window.onload = function(){
    fetch('/get/leaderboard/athlete')
    .then(function(response){
        response.json().then(function(data){
            console.log(data);
            let table = document.getElementById('leaderboard');
            for(let i = 0; i < data.length; i++){
                let row = table.insertRow(i+1);
                let rank = row.insertCell(0);
                let username = row.insertCell(1);
                let score = row.insertCell(2);
                rank.innerHTML = i+1;
                username.innerHTML = data[i].username;
                score.innerHTML = data[i].score;
            }
        });
    });
}