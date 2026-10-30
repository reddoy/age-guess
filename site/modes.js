export const MODES = {
  celebrities: {
    label: 'Celebrities',
    emoji: '🎬',
    blurb: 'Actors, musicians, comedians and presidents',
  },
  athletes: {
    label: 'Athletes',
    emoji: '🏀',
    blurb: 'NBA players and coaches, from high school to the pros',
  },
};

export const ROUNDS = 5;
export const MAX_POINTS = 5000;

const bestKey = (mode) => `ageguess:best:${mode}`;

export function getBest(mode) {
  return Number(localStorage.getItem(bestKey(mode))) || 0;
}

/** Saves the score if it beats the current best. Returns true if it did. */
export function saveBest(mode, score) {
  if (score <= getBest(mode)) return false;
  localStorage.setItem(bestKey(mode), String(score));
  return true;
}

export const formatPoints = (points) => points.toLocaleString('en-US');
