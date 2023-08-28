/* 
Project ageGuess
CSC 337
Developers: Rohan O'Malley,Daniel Peabody

This file contains the logic for the creating an account. The user enters the information on the form and then
this file makes a request to the server to see if that account already exists. If not it creates the new account 
and redirects the user to the login page.
*/
let createbutton = document.getElementById("createbutton")
createbutton.addEventListener("submit",(event) => {
    event.preventDefault();
    console.log('click');
    createAccount();
})
function createAccount() {
    console.log('clicked')
    let us = document.getElementById('usernameCreate').value;
    let pw = document.getElementById('passwordCreate').value;
    let p = fetch('/account/create/' + us + '/' + pw);
    p.then((response) => {
      window.location.href = "login.html";
      return response.text();
    }).then((text) => { 
      alert(text);
    });
  }
  