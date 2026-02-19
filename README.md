# ageGuess 🤔

A fun and engaging web-based age guessing game where players test their skills by guessing the ages of celebrities, athletes, and community-submitted photos. Compete with friends, track your high scores, and climb the leaderboards!

![ageGuess Logo](public-html/images/logo.png)

## 🎮 Features

- **Three Game Modes:**
  - **Celebrities**: Guess the age of famous celebrities
  - **Athletes**: Test your knowledge of sports stars
  - **Community**: Play with user-submitted photos

- **User Accounts:**
  - Create an account to track your progress
  - Save your high scores across all game modes
  - View your personal statistics

- **Leaderboards:**
  - Compete for the top spots
  - Separate leaderboards for each game mode
  - See the top 10 players globally

- **Gameplay:**
  - 25 guesses per round
  - Visual feedback (correct, close, incorrect)
  - Score tracking
  - Automatic new image loading

- **Community Features:**
  - Upload your own photos to the community collection
  - Play with photos submitted by other users

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn
- MongoDB database (local or cloud)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ageGuess.git
   cd ageGuess
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   HOSTNAME=localhost
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your-secret-key-here
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
ageGuess/
├── server.js              # Express server and API routes
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── public-html/          # Frontend files
    ├── index.html        # Home page
    ├── login.html        # Login page
    ├── createaccount.html # Account creation
    ├── gamemodes.html    # Game mode selection
    ├── celeb.html        # Celebrity game
    ├── athlete.html      # Athlete game
    ├── community.html    # Community game
    ├── leaderboard.html  # Leaderboard page
    ├── account.html      # User account page
    ├── *.js             # JavaScript files
    ├── *.css            # Stylesheets
    └── images/          # Image assets
```

## 🛠️ Technology Stack

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - bcrypt for password hashing
  - cookie-parser for session management

- **Frontend:**
  - Vanilla JavaScript (ES6+)
  - HTML5
  - CSS3 with modern animations
  - Responsive design

## 📡 API Endpoints

### Authentication
- `POST /account/login/` - User login
- `POST /account/create` - Create new account
- `GET /get/account` - Get user account info

### Game
- `GET /get/image/:mode` - Get random image (celeb/athlete/comm)
- `POST /check/guess/:mode` - Check user's guess
- `POST /save/score/:mode` - Save user's score

### Community
- `POST /upload/image` - Upload community photo

### Leaderboard
- `GET /get/leaderboard/:mode` - Get top 10 scores

## 🎯 How to Play

1. **Start Playing:**
   - Click "Play Anonymously" to play without an account
   - Or create an account to track your scores

2. **Choose a Game Mode:**
   - Select Celebrities, Athletes, or Community

3. **Make Your Guess:**
   - Look at the photo
   - Enter your age guess
   - Press Enter to submit

4. **Scoring:**
   - **Correct**: Exact match - +1 point, new image
   - **Close**: Within 5 years - Try again
   - **Incorrect**: Wrong guess - Lose a guess

5. **Game Over:**
   - When you run out of guesses (25 total)
   - Your score is saved (if logged in)
   - A new round begins automatically

## 🔒 Security Features

- Password hashing with bcrypt
- Secure cookie handling
- Input validation
- Error handling

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Rohan O'Malley**
- **Daniel Peabody**

## 🙏 Acknowledgments

- Built as a web development project
- Thanks to all contributors and players!

## 📧 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Have fun guessing ages! 🎉**
