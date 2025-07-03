import './style.css'
import { GameScene } from './scenes/GameScene.js'
import { GAME_CONFIG } from './config/constants.js'

// Clear the default Vite content and setup game canvas
document.querySelector('#app').innerHTML = `
  <div id="game-container">
    <canvas id="game-canvas"></canvas>
  </div>
`

// Create and configure the game canvas
const canvas = document.getElementById('game-canvas');
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '1000';

// Phaser game configuration
const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.GAME_WIDTH,
    height: GAME_CONFIG.GAME_HEIGHT,
    canvas: canvas,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: GameScene,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Initialize the game
const game = new Phaser.Game(config);
