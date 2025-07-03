import { GAME_CONFIG, ASSETS } from '../config/constants.js';

export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
        this.gameState = 'playing'; // playing, paused, gameOver, levelComplete
        this.createUI();
    }

    createUI() {
        this.createBackground();
        this.createHealthDisplay();
        this.createShieldDisplay();
        this.createControls();
        this.createOverlays();
    }

    createBackground() {
        this.elements.background = this.scene.add.image(640, 360, 'background-blurred');
        this.elements.background.setDisplaySize(1280, 720);
    }

    createHealthDisplay() {
        this.elements.healthIcons = [];
        for (let i = 0; i < 3; i++) {
            const healthIcon = this.scene.add.image(50 + i * 40, 50, 'health-full');
            healthIcon.setDisplaySize(32, 32);
            healthIcon.setScrollFactor(0);
            this.elements.healthIcons.push(healthIcon);
        }
    }

    createShieldDisplay() {
        this.elements.shieldIcons = [];
        for (let i = 0; i < 3; i++) {
            const shieldIcon = this.scene.add.image(200 + i * 40, 50, 'shield-full');
            shieldIcon.setDisplaySize(32, 32);
            shieldIcon.setScrollFactor(0);
            this.elements.shieldIcons.push(shieldIcon);
        }
    }

    createControls() {
        // Create virtual joystick and shield button
        this.elements.joystick = this.scene.add.image(150, 600, 'joystick-base');
        this.elements.joystick.setDisplaySize(120, 120);
        this.elements.joystick.setScrollFactor(0);
        this.elements.joystick.setInteractive();

        this.elements.joystickKnob = this.scene.add.image(150, 600, 'joystick-knob');
        this.elements.joystickKnob.setDisplaySize(60, 60);
        this.elements.joystickKnob.setScrollFactor(0);

        this.elements.shieldButton = this.scene.add.image(1150, 600, 'shield-button');
        this.elements.shieldButton.setDisplaySize(80, 80);
        this.elements.shieldButton.setScrollFactor(0);
        this.elements.shieldButton.setInteractive();
    }

    createOverlays() {
        // Game Info overlay
        this.elements.gameInfo = this.scene.add.image(640, 360, 'game-info');
        this.elements.gameInfo.setDisplaySize(400, 300);
        this.elements.gameInfo.setScrollFactor(0);
        this.elements.gameInfo.setVisible(false);

        // Game Over overlay
        this.elements.gameOver = this.scene.add.image(640, 360, 'game-over');
        this.elements.gameOver.setDisplaySize(400, 300);
        this.elements.gameOver.setScrollFactor(0);
        this.elements.gameOver.setVisible(false);

        // Level Complete overlay
        this.elements.levelComplete = this.scene.add.image(640, 360, 'level-complete');
        this.elements.levelComplete.setDisplaySize(400, 300);
        this.elements.levelComplete.setScrollFactor(0);
        this.elements.levelComplete.setVisible(false);
    }

    updateHealthDisplay(health) {
        this.elements.healthIcons.forEach((icon, index) => {
            if (index < health) {
                icon.setTexture('health-full');
                icon.setAlpha(1);
            } else {
                icon.setTexture('health-empty');
                icon.setAlpha(0.5);
            }
        });
    }

    updateShieldDisplay(shieldHealth, isShielding) {
        this.elements.shieldIcons.forEach((icon, index) => {
            if (index < shieldHealth) {
                icon.setTexture('shield-full');
                icon.setAlpha(isShielding ? 1 : 0.7);
            } else {
                icon.setTexture('shield-empty');
                icon.setAlpha(0.3);
            }
        });

        // Highlight shield button when active
        if (isShielding) {
            this.elements.shieldButton.setTint(0x00ff00);
        } else {
            this.elements.shieldButton.clearTint();
        }
    }

    updateJoystick(inputX, inputY) {
        const baseX = 150;
        const baseY = 600;
        const maxDistance = 30;
        
        const distance = Math.min(maxDistance, Math.sqrt(inputX * inputX + inputY * inputY) * 30);
        const angle = Math.atan2(inputY, inputX);
        
        this.elements.joystickKnob.setPosition(
            baseX + Math.cos(angle) * distance,
            baseY + Math.sin(angle) * distance
        );
    }

    showGameInfo() {
        this.gameState = 'paused';
        this.elements.gameInfo.setVisible(true);
    }

    hideGameInfo() {
        this.gameState = 'playing';
        this.elements.gameInfo.setVisible(false);
    }

    showGameOver() {
        this.gameState = 'gameOver';
        this.elements.gameOver.setVisible(true);
    }

    hideGameOver() {
        this.gameState = 'playing';
        this.elements.gameOver.setVisible(false);
    }

    showLevelComplete() {
        this.gameState = 'levelComplete';
        this.elements.levelComplete.setVisible(true);
    }

    hideLevelComplete() {
        this.gameState = 'playing';
        this.elements.levelComplete.setVisible(false);
    }

    hideAllOverlays() {
        this.elements.gameInfo.setVisible(false);
        this.elements.gameOver.setVisible(false);
        this.elements.levelComplete.setVisible(false);
        this.gameState = 'playing';
    }

    isGamePaused() {
        return this.gameState !== 'playing';
    }

    getGameState() {
        return this.gameState;
    }

    // Get UI elements for interaction
    getJoystick() {
        return this.elements.joystick;
    }

    getShieldButton() {
        return this.elements.shieldButton;
    }

    getOverlays() {
        return {
            gameInfo: this.elements.gameInfo,
            gameOver: this.elements.gameOver,
            levelComplete: this.elements.levelComplete
        };
    }
}
