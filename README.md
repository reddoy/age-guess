# Age Guess

A web game where you guess how old celebrities and athletes were when their photo was taken. Each game is five photos, and the closer your guess, the more points you score, up to 25,000.

![Age Guess logo](site/images/logo.png)

**Play it:** [reddoy.github.io/age-guess](https://reddoy.github.io/age-guess/)

**Status:** Finished class project, rebuilt in 2026 as a static site.

**Original demo video:** [youtu.be/myUy1EDBYhE](https://youtu.be/myUy1EDBYhE)

## Background

I made this for one of my CS classes in college. Wikipedia usually notes when a person's photo was taken, so I scraped the photos from Wikipedia and worked out how old each person was in their picture. That age is what you're trying to guess.

The original version ran on Node.js, Express and MongoDB, with accounts, leaderboards and community photo uploads. In 2026 I rebuilt it as a static site: the photos now come straight from Wikimedia Commons, ages are worked out to the exact day, and scoring is based on how close you get instead of exact-or-nothing. The original code is in the git history.

## How to play

1. Pick **Celebrities** or **Athletes**.
2. You see a photo, who it is and the year it was taken. Drag the slider (or use the arrow keys) to your guess and press **Guess** or Enter.
3. An exact guess scores 5,000 points. You get about half that at 5 years off, and under 1,000 once you're 12 or more years off.
4. After five photos you get your total and a recap. Your best score for each mode is saved in your browser.

## Tech stack

- **Frontend:** vanilla JavaScript (ES modules), HTML and CSS, with no build step
- **Data:** a Python script that pulls photos and dates from Wikipedia, Wikidata and Wikimedia Commons
- **Hosting:** GitHub Pages, deployed by a GitHub Actions workflow on every push to `main`

## Running it locally

The site is plain static files, so any local web server works:

```bash
git clone https://github.com/reddoy/age-guess.git
cd age-guess
python3 -m http.server 8000 --directory site   # http://localhost:8000
```

## Updating the photos

The people in each mode are listed by Wikipedia page title in `scripts/people/celebrities.txt` and `scripts/people/athletes.txt`. To rebuild the game data after editing those lists:

```bash
pip install requests
python3 scripts/build_photos.py               # or --mode athletes, --limit 50 to test
```

For each page, the script:

1. Finds the page's main photo, keeping only freely licensed ones.
2. Gets the person's birth date from Wikidata and checks the year against the page's "births" category, since Wikidata is sometimes vandalized.
3. Keeps the photo only if Wikimedia Commons records the exact day it was taken, then works out the person's age on that day.

It writes the results, including photo credits, to `site/data/<mode>.json`.

## Project structure

| Path | What's in it |
|---|---|
| `site/` | The game: `index.html` (mode picker), `play.html` and `game.js` (the game), `style.css`, the font and logo |
| `site/data/` | Generated photo data for each mode |
| `scripts/build_photos.py` | Builds the photo data from Wikipedia, Wikidata and Wikimedia Commons |
| `scripts/people/` | Wikipedia pages to pull people from |
| `.github/workflows/pages.yml` | Deploys `site/` to GitHub Pages |

## Credits

Photos are from [Wikimedia Commons](https://commons.wikimedia.org) and are credited to their photographers in the game. Birth dates are from [Wikidata](https://www.wikidata.org).

## Authors

Rohan O'Malley and Daniel Peabody
