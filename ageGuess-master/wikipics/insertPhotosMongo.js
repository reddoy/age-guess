const mongoose = require("mongoose");
const express = require('express');
const path = require('path');
const app = express(); 
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const hostname = '127.0.0.1';
const port = 5000;


app.use(express.static(path.join(__dirname, '/public_html')));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(cookieParser());

mongoose.set('strictQuery', false);

const mongoDB = 'mongodb+srv://doadmin:REDACTED_PASSWORD@finalproj-beb76a02.mongo.ondigitalocean.com/admin?tls=true&authSource=admin&replicaSet=finalproj';

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

const athleteSchema = new mongoose.Schema({
    person: String,
    birthYear: Number,
    datePhotoTaken: Number,
    filename: String,
    data: Buffer,
  });
  
  const athleteImage = mongoose.model('athleteImage', athleteSchema);
  
  const folderPath = "C:/Users/rohanomalley/Desktop/CS_projects_work/ageGuess/ageGuess-master/wikipics/wikiphotos";
  
  fs.readdir(folderPath, (err, files) => {
    if (err) throw err;
  
    files.forEach(file => {
      const filePath = path.join(folderPath, file);
      fs.readFile(filePath, (err, data) => {
        if (err) throw err;
        console.log(file);

        let fileArr = file.split('-');

        const image = new athleteImage({
          person: fileArr[0],
          birthYear: parseInt(fileArr[1]),
          datePhotoTaken: parseInt(fileArr[2]),
          filename: genRandStr() + ".jpeg",
          data: data
        });

        image.save().catch(err =>{
            if (err) return console.log(err);
            console.log(`Inserted ${file} into database.`);
          });
      
          
      });
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
  
  