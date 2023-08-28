/* 
Project ageGuess
CSC 337
Developers: Rohan O'Malley,Daniel Peabody

This file is the server for out project. It uses express to connect the static files with the correct
host and port name. The server also uses mongoose to connect with a mongo db database. The cookie-parser
module is also used to access cookies used in the project. There are 4 schemas used for the database; 
user, celebimage, athleteimage, and communityimage. There are 5 get paths 4 post paths that all deal with either
creating new instances of the schemas mentioned, or getting information from existing instances. The main function of 
the server is allowing users to login/create an account, send image files to the gamemodes on the site, and checking
if users made the correct guess. 
*/


const mongoose = require("mongoose");
const express = require('express');
const path = require('path');
const app = express(); 
var qs = require('querystring');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { copyFileSync } = require("fs");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const hostname = '206.189.198.23';
const port = 3000;



mongoose.set('strictQuery', false);

const mongoDB ='mongodb+srv://doadmin:REDACTED_PASSWORD@finalproj-beb76a02.mongo.ondigitalocean.com/admin?tls=true&authSource=admin&replicaSet=finalproj';

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    topCelebScore: Number,
    topAthleteScore: Number,
    topCommunityScore: Number,
});

const celebimageSchema = new mongoose.Schema({
    person: String,
    birthYear: Number,
    datePhotoTaken: Number,
    filename: String,
    data: Buffer,
});

const athleteimageSchema = new mongoose.Schema({
  person: String,
  birthYear: Number,
  datePhotoTaken: Number,
  filename: String,
  data: Buffer,
});

const communityimageSchema = new mongoose.Schema({
  person: String,
  age: Number,
  datePhotoTaken: Number,
  filename: String,
  data: String,
});

const celebImage = mongoose.model('celebImage', celebimageSchema);
const athleteImage = mongoose.model('athleteImage', athleteimageSchema);
const communityImage = mongoose.model('communityImage', communityimageSchema);
const users  = mongoose.model('user', userSchema);


app.use(express.static(path.join(__dirname, '/public-html')));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(cookieParser());

app.get('/', function(req, res){
    res.statusCode = 200;
    res.redirect('index.html');
})

// This app.get(/login/user) logs a user in based on the username and password
// sent in the body of the request. The function calls checkUser() to see if
// the user exists in the database. If the user exists then the function 

app.post('/account/login/', async function(req, res){
  let username = req.body.username;
  let password = req.body.password;
  let curUser = users.find({username: username}).exec();
  curUser.then((result) =>{
    if(result.length > 0){
      if((bcrypt.compareSync(password,result[0].password))){
        let cookie = createCookie(username);
        res.cookie('user', cookie);
        res.send("success");
      }
      else{
        res.send("failure")
      }
    }
    else{
      res.send("failure");
    }
  })
});

app.get('/account/create/:username/:password', (req, res) => {
  let p1 = users.find({username: req.params.username}).exec();
  p1.then( (results) => { 
    if (results.length > 0) {
      res.end('That username is already taken.');
    } else {
      let hashpass = saltAndHash(req.params.password)
      var newUser = new users({ 
        username: req.params.username,
        password: hashpass,
        topCelebScore: 0,
        topAthleteScore: 0,
        topCommunityScore: 0
      });
      newUser.save().then( (doc) => { 
          res.end('Created new account!');
        }).catch( (err) => { 
          console.log(err);
          res.end('Failed to create new account.');
        });
    }
  });
  p1.catch( (error) => {
    res.end('Failed to create new account.');
  });
});


function saltAndHash(password){
/*This function takes in the passed in password then salts and hashes it and returns
the new salted and hashed password*/ 
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(password, salt);
  return hash;
}


/*This function creates a cookie based on the currrent user.
 Then it sets a expiration date for the cookie that is 20 minutes from the current time
 then returns the cookie*/
function createCookie(username){
  let cookie = username;  
  let date = new Date();
  date.setTime(date.getTime() + (20 * 60 * 1000));
  let expires = "expires=" + date.toUTCString();
  return cookie + ";" + expires + ";path=/";
}



//---------------------------------------------------------------------------------------




app.get("/get/account",function(req,res) {
  if (req.cookies.user == undefined) {
    console.log("failure");
    return;
  }
  let cookieArr = req.cookies.user.split(';');
  let username = cookieArr[0];
  let score = parseInt(req.body.score);
  let curUser = users.find({username: username}).exec()
  .then( (response) =>{
    const user = {
      username : response[0].username,
      topCelebScore: response[0].topCelebScore,
      topAthleteScore: response[0].topAthleteScore,
      topCommunityScore: response[0].topCommunityScore

    }
    console.log(user)
    res.end(JSON.stringify(user));
  })

})
/*This function gets a random image from the mongoDB database collection called
Images. Then it send the image back to the client*/
app.get('/get/image/:mode', function(req, res){
  let image = null;
  if(req.params.mode == "celeb"){
    image = celebImage.aggregate([{ $sample: { size: 1 } }]);
  }
  else if(req.params.mode == "athlete"){
    image = athleteImage.aggregate([{ $sample: { size: 1 } }]);
  }
  else{
    image = communityImage.aggregate([{ $sample: { size: 1 } }]);
  }
  image.then(function(docs){
    
    const data = {
      filename: docs[0].filename,
      pic: docs[0].data,
      name: docs[0].person,
      dateTaken: docs[0].datePhotoTaken,
    }

    res.end(JSON.stringify(data));
  });
})

app.post('/upload/image', function(req, res){
  data = req.body;
  let file = data.file;
  let name = data.name;
  let ageInPhoto = data.ageInPhoto;
  console.log(ageInPhoto);
  let datePhotoTaken = data.datePhotoTaken;
  // upload image to mongoDB
  let newImage = new communityImage({
    person: name,
    age: ageInPhoto,
    datePhotoTaken: datePhotoTaken,
    filename: genRandStr(),
    data:file
  });
  newImage.save().then(function(doc){
    res.end("success");
  }).catch(function(err){
    res.end("fail");
  });
});

function genRandStr() {
  let result = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLen = chars.length;
  
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLen));
  }
  
  return result;
}


app.post('/save/score/:mode', function(req, res){
  if (req.cookies.user == undefined) {
    console.log("failure");
    return;
  }
  let cookieArr = req.cookies.user.split(';');
  let username = cookieArr[0];
  let score = parseInt(req.body.score);
  let curUser = users.find({username: username}).exec();
  curUser.then((result) =>{
    console.log(result[0])
    console.log('made it');
    if(req.params.mode == "celeb"){
      if(result[0].topCelebScore < score){
        users.updateOne({username: username}, {topCelebScore: score}).exec();
      }
    }
    else if(req.params.mode == "athlete"){
      if(result[0].topAthleteScore < score){
        users.updateOne({username: username}, {topAthleteScore: score}).exec();
      }
    }
    else{
      if(result[0].topCommunityScore < score){
        users.updateOne({username: username}, {topCommunityScore: score}).exec();
      }
    }
  });
});

/*This function searches for the image by the object id passed in then it checks the users
guess passed in against the age in the database*/
app.post('/check/guess/:mode', function(req, res){
  let filename = req.body.filename;
  let guess = parseInt(req.body.guess);
  let curScore = parseInt(req.body.score);
  let image;
  if (req.params.mode == "celeb") {
    image = celebImage.findOne({filename: filename}).exec();
  }
  else if (req.params.mode == "athlete") {
    image = athleteImage.findOne({ filename: filename }).exec();
  }
  else {
    image = communityImage.findOne({ filename: filename }).exec();
  }
  image.then(function (doc) {
    let age;
    if (req.params.mode == "comm") {
      age = parseInt(doc.age);
    }
    else {
      age = parseInt(doc.datePhotoTaken - doc.birthYear);
    }
    console.log(age, guess);
    if (guess == age) {
      console.log("correct");
      data = {checkedGuess: "correct", curScore: curScore + 1};
      res.end(JSON.stringify(data));
    }
    else if ((age - 5) <= guess && guess <= (age + 5)) {
      data = { checkedGuess: "close"};
      res.end(JSON.stringify(data));
    }
    else{
      res.end(JSON.stringify({ checkedGuess: "incorrect" }));
    }
  });
});

app.get('/get/leaderboard/:mode', function(req, res){
  let leaderboard;
  if(req.params.mode == "celeb"){
    leaderboard = users.find({}).sort({topCelebScore: -1}).limit(10).exec();
  }
  else if(req.params.mode == "athlete"){
    leaderboard = users.find({}).sort({ topAthleteScore: -1 }).limit(10).exec();
  }
  else{
    leaderboard = users.find({}).sort({ topCommunityScore: -1 }).limit(10).exec();
  }
  leaderboard.then(function(docs){
    retArr = [];
    for (doc of docs){
      if(req.params.mode == "celeb"){
        retArr.push({username: doc.username, score: doc.topCelebScore});
      }
      else if(req.params.mode == "athlete"){
        retArr.push({ username: doc.username, score: doc.topAthleteScore });
      }
      else{
        retArr.push({ username: doc.username, score: doc.topCommunityScore });
      }
    }
    res.end(JSON.stringify(retArr));
  });
});


app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});