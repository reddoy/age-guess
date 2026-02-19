/**
 * ageGuess Server
 * A modern age guessing game featuring celebrities, athletes, and community-submitted photos
 * 
 * @author Rohan O'Malley, Daniel Peabody
 * @version 2.0.0
 */

require('dotenv').config();
const mongoose = require("mongoose");
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const app = express();

// Configuration
const port = process.env.PORT || 3000;
const mongoDB = process.env.MONGODB_URI || 'mongodb://localhost:27017/ageguess';

// Middleware
app.use(express.static(path.join(__dirname, '/public-html')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose.set('strictQuery', false);

async function connectDB() {
  try {
    await mongoose.connect(mongoDB);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

connectDB();

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  topCelebScore: { type: Number, default: 0 },
  topAthleteScore: { type: Number, default: 0 },
  topCommunityScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const celebimageSchema = new mongoose.Schema({
  person: { type: String, required: true },
  birthYear: { type: Number, required: true },
  datePhotoTaken: { type: Number, required: true },
  filename: { type: String, required: true, unique: true },
  data: { type: Buffer, required: true }
});

const athleteimageSchema = new mongoose.Schema({
  person: { type: String, required: true },
  birthYear: { type: Number, required: true },
  datePhotoTaken: { type: Number, required: true },
  filename: { type: String, required: true, unique: true },
  data: { type: Buffer, required: true }
});

const communityimageSchema = new mongoose.Schema({
  person: { type: String, required: true },
  age: { type: Number, required: true },
  datePhotoTaken: { type: Number, required: true },
  filename: { type: String, required: true, unique: true },
  data: { type: String, required: true }
});

// Models
const celebImage = mongoose.model('celebImage', celebimageSchema);
const athleteImage = mongoose.model('athleteImage', athleteimageSchema);
const communityImage = mongoose.model('communityImage', communityimageSchema);
const User = mongoose.model('user', userSchema);

// Utility Functions
function saltAndHash(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

function createCookie(username) {
  const date = new Date();
  date.setTime(date.getTime() + (20 * 60 * 1000)); // 20 minutes
  const expires = `expires=${date.toUTCString()}`;
  return `${username};${expires};path=/`;
}

function genRandStr() {
  let result = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLen = chars.length;
  
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLen));
  }
  
  return result;
}

function getUsernameFromCookie(req) {
  if (!req.cookies?.user) return null;
  const cookieArr = req.cookies.user.split(';');
  return cookieArr[0];
}

// Routes
app.get('/', (req, res) => {
  res.redirect('index.html');
});

// Authentication Routes
app.post('/account/login/', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).send('failure');
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    
    if (isValidPassword) {
      const cookie = createCookie(username);
      res.cookie('user', cookie, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.send('success');
    } else {
      res.status(401).send('failure');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('failure');
  }
});

app.post('/account/create', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      return res.status(409).send('That username is already taken.');
    }

    const hashpass = saltAndHash(password);
    const newUser = new User({
      username,
      password: hashpass,
      topCelebScore: 0,
      topAthleteScore: 0,
      topCommunityScore: 0
    });

    await newUser.save();
    res.send('Created new account!');
  } catch (error) {
    console.error('Account creation error:', error);
    res.status(500).send('Failed to create new account.');
  }
});

// Account Routes
app.get('/get/account', async (req, res) => {
  try {
    const username = getUsernameFromCookie(req);
    
    if (!username) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      username: user.username,
      topCelebScore: user.topCelebScore,
      topAthleteScore: user.topAthleteScore,
      topCommunityScore: user.topCommunityScore
    });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Image Routes
app.get('/get/image/:mode', async (req, res) => {
  try {
    const { mode } = req.params;
    let imageModel;

    switch (mode) {
      case 'celeb':
        imageModel = celebImage;
        break;
      case 'athlete':
        imageModel = athleteImage;
        break;
      case 'comm':
      case 'community':
        imageModel = communityImage;
        break;
      default:
        return res.status(400).json({ error: 'Invalid mode' });
    }

    const images = await imageModel.aggregate([{ $sample: { size: 1 } }]);
    
    if (!images || images.length === 0) {
      return res.status(404).json({ error: 'No images found' });
    }

    const image = images[0];
    const data = {
      filename: image.filename,
      pic: image.data,
      name: image.person,
      dateTaken: image.datePhotoTaken
    };

    res.json(data);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/upload/image', async (req, res) => {
  try {
    const { file, name, ageInPhoto, datePhotoTaken } = req.body;

    if (!file || !name || !ageInPhoto || !datePhotoTaken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newImage = new communityImage({
      person: name,
      age: parseInt(ageInPhoto),
      datePhotoTaken: parseInt(datePhotoTaken),
      filename: genRandStr(),
      data: file
    });

    await newImage.save();
    res.send('success');
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).send('fail');
  }
});

// Game Routes
app.post('/check/guess/:mode', async (req, res) => {
  try {
    const { mode } = req.params;
    const { filename, guess, score } = req.body;

    if (!filename || guess === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let imageModel;
    switch (mode) {
      case 'celeb':
        imageModel = celebImage;
        break;
      case 'athlete':
        imageModel = athleteImage;
        break;
      case 'comm':
      case 'community':
        imageModel = communityImage;
        break;
      default:
        return res.status(400).json({ error: 'Invalid mode' });
    }

    const doc = await imageModel.findOne({ filename });
    
    if (!doc) {
      return res.status(404).json({ error: 'Image not found' });
    }

    let age;
    if (mode === 'comm' || mode === 'community') {
      age = parseInt(doc.age);
    } else {
      age = parseInt(doc.datePhotoTaken - doc.birthYear);
    }

    const userGuess = parseInt(guess);
    const curScore = parseInt(score) || 0;

    if (userGuess === age) {
      res.json({ checkedGuess: 'correct', curScore: curScore + 1 });
    } else if ((age - 5) <= userGuess && userGuess <= (age + 5)) {
      res.json({ checkedGuess: 'close' });
    } else {
      res.json({ checkedGuess: 'incorrect' });
    }
  } catch (error) {
    console.error('Check guess error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/save/score/:mode', async (req, res) => {
  try {
    const username = getUsernameFromCookie(req);
    
    if (!username) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { mode } = req.params;
    const score = parseInt(req.body.score);

    if (isNaN(score)) {
      return res.status(400).json({ error: 'Invalid score' });
    }

    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let updateField;
    let currentScore;
    
    switch (mode) {
      case 'celeb':
        updateField = 'topCelebScore';
        currentScore = user.topCelebScore;
        break;
      case 'athlete':
        updateField = 'topAthleteScore';
        currentScore = user.topAthleteScore;
        break;
      case 'comm':
      case 'community':
        updateField = 'topCommunityScore';
        currentScore = user.topCommunityScore;
        break;
      default:
        return res.status(400).json({ error: 'Invalid mode' });
    }

    if (score > currentScore) {
      await User.updateOne({ username }, { [updateField]: score });
      res.json({ success: true, newScore: score });
    } else {
      res.json({ success: true, message: 'Score not higher than current best' });
    }
  } catch (error) {
    console.error('Save score error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Leaderboard Routes
app.get('/get/leaderboard/:mode', async (req, res) => {
  try {
    const { mode } = req.params;
    let sortField;

    switch (mode) {
      case 'celeb':
        sortField = 'topCelebScore';
        break;
      case 'athlete':
        sortField = 'topAthleteScore';
        break;
      case 'comm':
      case 'community':
        sortField = 'topCommunityScore';
        break;
      default:
        return res.status(400).json({ error: 'Invalid mode' });
    }

    const leaderboard = await User.find({})
      .sort({ [sortField]: -1 })
      .limit(10)
      .select(`username ${sortField}`)
      .exec();

    const retArr = leaderboard.map(doc => ({
      username: doc.username,
      score: doc[sortField]
    }));

    res.json(retArr);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Error Handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 Access your app at: ${process.env.RAILWAY_PUBLIC_DOMAIN || `http://localhost:${port}`}`);
});
