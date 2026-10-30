import { MODES, ROUNDS, MAX_POINTS, saveBest, formatPoints } from './modes.js';

const mode = new URLSearchParams(location.search).get('mode');

const $ = (id) => document.getElementById(id);
const slider = $('slider');

let people = [];
let pool = [];
let upcoming = null;
let current = null;
let results = [];
let total = 0;
let guessed = false;

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** 5,000 for an exact guess, about half at 5 years off, under 1,000 at 12+ off. */
function pointsFor(guess, age) {
  return Math.round(MAX_POINTS * Math.exp(-Math.abs(guess - age) / 7));
}

function verdictFor(off) {
  if (off === 0) return ['Perfect!', 'perfect'];
  if (off <= 2) return ['So close!', 'great'];
  if (off <= 5) return ['Nice!', 'good'];
  if (off <= 10) return ['Not bad', 'ok'];
  return ['Way off', 'miss'];
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  });
}

/** The next person whose photo actually loads, so it's cached before it's shown. */
async function nextPerson() {
  while (true) {
    if (!pool.length) pool = shuffle([...people]);
    const person = pool.pop();
    try {
      await loadImage(person.photo);
      return person;
    } catch {
      people = people.filter((p) => p !== person);
      if (!people.length) throw new Error('No photos could be loaded');
    }
  }
}

function animateNumber(el, from, to, duration, format) {
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - t) ** 3;
    el.textContent = format(Math.round(from + (to - from) * eased));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const percentOf = (age) => `${((age - 1) / 99) * 100}%`;

function setSlider(value) {
  slider.value = value;
  $('guess-number').textContent = value;
  slider.style.setProperty('--fill', percentOf(value));
}

async function startRound() {
  current = null;
  const person = await upcoming;
  upcoming = results.length + 1 < ROUNDS ? nextPerson() : null;

  $('round-label').textContent = `Photo ${results.length + 1} / ${ROUNDS}`;
  $('photo').src = person.photo;
  $('photo').alt = person.name;
  $('photo-frame').className = 'photo-frame';
  $('age-badge').hidden = true;
  $('person').textContent = person.name;
  $('taken').textContent = `Photo taken in ${person.year}`;
  $('credit').textContent = `Photo: ${person.credit.author} · ${person.credit.license}`;
  $('credit').href = person.credit.source;

  setSlider(40);
  $('guess-controls').hidden = false;
  $('result').hidden = true;
  $('result').className = '';
  $('points-fill').style.width = '0';

  current = person;
  guessed = false;
  window.scrollTo({ top: 0 });
  slider.focus({ preventScroll: true });
}

function submitGuess() {
  if (!current || guessed) return;
  guessed = true;

  const guess = Number(slider.value);
  const { age, name } = current;
  const off = Math.abs(guess - age);
  const points = pointsFor(guess, age);
  const [verdict, tier] = verdictFor(off);
  results.push({ person: current, guess, points });
  total += points;

  $('guess-controls').hidden = true;
  $('result').hidden = false;
  $('result').className = `tier-${tier}`;
  $('verdict').textContent = verdict;

  $('marker-guess').style.left = percentOf(guess);
  $('marker-guess').querySelector('span').textContent = guess;
  $('marker-actual').style.left = percentOf(age);
  $('marker-actual').querySelector('span').textContent = age;
  $('track-gap').style.left = percentOf(Math.min(guess, age));
  $('track-gap').style.width = `${(off / 99) * 100}%`;

  $('result-line').textContent = off === 0
    ? `${name} was exactly ${age}.`
    : `You guessed ${guess}. ${name} was ${age}, so you were ${off} year${off === 1 ? '' : 's'} off.`;

  $('photo-frame').className = `photo-frame revealed tier-${tier}`;
  $('age-badge').hidden = false;
  animateNumber($('age-badge'), guess, age, 700, (n) => n);
  animateNumber($('points'), 0, points, 900, (n) => `+${formatPoints(n)} pts`);
  animateNumber($('total-label'), total - points, total, 900, (n) => `${formatPoints(n)} pts`);
  requestAnimationFrame(() => {
    $('points-fill').style.width = `${(points / MAX_POINTS) * 100}%`;
  });

  $('next').textContent = results.length === ROUNDS ? 'See results' : 'Next photo';
  $('next').focus({ preventScroll: true });
  // On phones the Next button ends up below the fold. Waits for the reveal
  // animations, which shrink the page height while they run.
  const round = results.length;
  setTimeout(() => {
    if (guessed && results.length === round && !$('game').hidden) {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  }, 500);
}

function next() {
  if (!guessed) return;
  if (results.length === ROUNDS) showSummary();
  else startRound().catch(showLoadError);
}

function showSummary() {
  $('game').hidden = true;
  $('summary').hidden = false;
  $('round-label').textContent = 'Results';
  $('summary-total').textContent = formatPoints(total);
  $('new-best').hidden = !saveBest(mode, total);

  $('recap').replaceChildren(
    ...results.map(({ person, guess, points }) => {
      const item = document.createElement('li');
      const [, tier] = verdictFor(Math.abs(guess - person.age));
      item.className = `tier-${tier}`;
      item.innerHTML = `
        <img src="${person.photo}" alt="">
        <span class="recap-name"></span>
        <span class="recap-ages">Guessed ${guess} · Actually ${person.age}</span>
        <span class="recap-points">+${formatPoints(points)}</span>
      `;
      item.querySelector('.recap-name').textContent = person.name;
      return item;
    }),
  );
  window.scrollTo({ top: 0 });
  $('again').focus({ preventScroll: true });
}

function newGame() {
  results = [];
  total = 0;
  $('total-label').textContent = '0 pts';
  $('summary').hidden = true;
  $('game').hidden = false;
  upcoming = nextPerson();
  startRound().catch(showLoadError);
}

function showLoadError() {
  $('game').hidden = true;
  $('load-error').hidden = false;
}

function init() {
  slider.addEventListener('input', () => setSlider(slider.value));
  $('submit').addEventListener('click', submitGuess);
  $('next').addEventListener('click', next);
  $('again').addEventListener('click', newGame);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || ['BUTTON', 'A'].includes(event.target.tagName)) return;
    if ($('game').hidden) return;
    // Otherwise the same keypress also clicks the button that just got focus.
    event.preventDefault();
    guessed ? next() : submitGuess();
  });

  const { label, emoji } = MODES[mode];
  $('mode-label').textContent = `${emoji} ${label}`;
  $('summary-mode').textContent = `${emoji} ${label}`;

  fetch(`data/${mode}.json`)
    .then((response) => response.json())
    .then((data) => {
      people = data;
      newGame();
    })
    .catch(showLoadError);
}

if (MODES[mode]) init();
else location.replace('./');
