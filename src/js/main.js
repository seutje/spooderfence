import { TowerDefenseGame } from './game.js';

// Start the game and expose it for inline handlers in HTML
const game = new TowerDefenseGame();
// Expose to window for onclick handlers in index.html
// eslint-disable-next-line no-undef
window.game = game;
