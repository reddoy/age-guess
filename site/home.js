import { MODES, getBest, formatPoints } from './modes.js';

const list = document.getElementById('modes');

for (const [mode, { label, emoji, blurb }] of Object.entries(MODES)) {
  const best = getBest(mode);
  const card = document.createElement('a');
  card.className = `mode-card mode-${mode}`;
  card.href = `play.html?mode=${mode}`;
  card.innerHTML = `
    <span class="mode-emoji">${emoji}</span>
    <span class="mode-label">${label}</span>
    <span class="mode-blurb">${blurb}</span>
    <span class="mode-best">${best ? `Your best: ${formatPoints(best)}` : 'No games yet'}</span>
  `;
  list.append(card);
}
