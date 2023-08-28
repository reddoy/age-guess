/* 
Project ageGuess
CSC 337
Developers: Rohan O'Malley,Daniel Peabody

This file contains the logic for the logging in. The user enters the information on the form and then
this file makes a request to the server to see if the username and password match and exist. If they do the 
server creates a cookie for the user and redirects to the game modes page.
*/

let loginbutton = document.getElementById("loginbutton")
loginbutton.addEventListener("submit",(event) => {
    event.preventDefault();
    console.log('click');
    login();
})

function login() {
    console.log("logging in")
    let us = document.getElementById('usernameLogin').value;
    let pw = document.getElementById('passwordLogin').value;
    let data = {username: us, password: pw};
    let p = fetch( '/account/login/', {
      method: 'POST', 
      body: JSON.stringify(data),
      headers: {"Content-Type": "application/json"}
    });
    p.then((response) => {
      return response.text();
    }).then((text) => { 
      if (text.startsWith('s')) {
        alert(text);
        window.location.href = "gamemodes.html";
      } else {
        alert('failed');
      }
    });
  }
  