# Age Guess

A web game where you guess how old celebrities, athletes, and community-submitted people are. Make an account to save high scores and climb the leaderboards.

![Age Guess logo](public-html/images/logo.png)

**Status:** Finished class project.

**Demo video:** [youtu.be/myUy1EDBYhE](https://youtu.be/myUy1EDBYhE)

## Background

I made this for one of my CS classes in college. Wikipedia usually notes the year a person's photo was taken, so I scraped the photos from Wikipedia and worked out how old each person was in their picture. That age is what you're trying to guess.

## Features

- **Three game modes:** celebrities, athletes, and community photos uploaded by players
- **Rounds of 25 guesses:** an exact guess scores a point and loads the next photo, a guess within 5 years lets you try again, and anything else costs a guess
- **Accounts:** sign up to save high scores per mode, or play anonymously
- **Leaderboards:** the top 10 players for each mode

## Tech stack

- **Backend:** Node.js, Express, MongoDB with Mongoose, bcrypt for password hashing, and cookie-based sessions
- **Frontend:** vanilla JavaScript, HTML, and CSS
- **Data tooling:** Python scripts that scrape photos of celebrities and athletes from Wikipedia

## Getting started

You need Node.js 18 or later and a MongoDB database (local or Atlas).

```bash
git clone https://github.com/reddoy/age-guess.git
cd age-guess
npm install
cp .env.example .env   # set HOSTNAME, PORT, MONGODB_URI, SESSION_SECRET
npm run dev            # http://localhost:3000
```

Use `npm start` to run it without auto-reload. Deployment steps for Render or Railway are in [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Project structure

| Path | What's in it |
|---|---|
| `server.js` | Express server and API routes |
| `public-html/` | Frontend pages, scripts, styles, fonts, and images |
| `scripts/wikipics/` | Scripts for scraping photos from Wikipedia and loading them into MongoDB (uses `MONGODB_URI` from `.env`) |

## API

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/account/create` | Create an account |
| `POST` | `/account/login/` | Log in |
| `GET` | `/get/account` | Current user's info and high scores |
| `GET` | `/get/image/:mode` | Random photo for a mode (`celeb`, `athlete`, or `comm`) |
| `POST` | `/check/guess/:mode` | Check a guess |
| `POST` | `/save/score/:mode` | Save a score |
| `POST` | `/upload/image` | Upload a community photo |
| `GET` | `/get/leaderboard/:mode` | Top 10 scores for a mode |

## Authors

Rohan O'Malley and Daniel Peabody
