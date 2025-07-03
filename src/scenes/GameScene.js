import { ASSETS } from '../config/constants.js';
import { Player } from '../entities/Player.js';
import { FireballManager } from '../entities/FireballManager.js';
import { WorldManager } from '../entities/WorldManager.js';
import { UIManager } from '../ui/UIManager.js';
import { InputManager } from '../core/InputManager.js';
import { CollisionManager } from '../core/CollisionManager.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.loadAssets();
    }

    loadAssets() {
        // Load all game assets
        Object.entries(ASSETS).forEach(([key, path]) => {
            this.load.image(key, path);
        });
    }

    create() {
        this.initializeManagers();
        this.setupCamera();
        this.setupPhysics();
    }

    initializeManagers() {
        // Initialize all managers in the correct order
        this.uiManager = new UIManager(this);
        this.worldManager = new WorldManager(this);
        this.fireballManager = new FireballManager(this);
        this.player = new Player(this, 100, 300);
        this.inputManager = new InputManager(this, this.uiManager);
        this.collisionManager = new CollisionManager(
            this,
            this.player,
            this.worldManager,
            this.fireballManager,
            this.uiManager
        );
    }

    setupCamera() {
        // Setup camera to follow player
        this.cameras.main.startFollow(this.player.sprite);
        this.cameras.main.setLerp(0.1, 0.1);
        this.cameras.main.setDeadzone(200, 100);
        this.cameras.main.setBounds(0, 0, 1280, 720);
    }

    setupPhysics() {
        // Set world bounds
        this.physics.world.setBounds(0, 0, 1280, 720);
    }

    update(time, delta) {
        const deltaSeconds = delta / 1000;

        // Skip update if game is paused
        if (this.uiManager.isGamePaused()) {
            return;
        }

        // Update all systems
        this.inputManager.update();
        const inputState = this.inputManager.getInputState();
        
        this.player.update(deltaSeconds, inputState);
        this.fireballManager.update();
        this.collisionManager.update();
        
        this.updateUI();
    }

    updateUI() {
        // Update UI displays
        this.uiManager.updateHealthDisplay(this.player.health);
        this.uiManager.updateShieldDisplay(this.player.shieldHealth, this.player.isShielding);
    }

    restartGame() {
        // Reset all game systems
        this.uiManager.hideAllOverlays();
        this.player.reset(100, 300);
        this.worldManager.reset();
        this.fireballManager.reset();
        this.inputManager.reset();
        this.collisionManager.reset();
        
        // Resume physics if paused
        if (!this.physics.world.isPaused) {
            this.physics.resume();
        }
        
        // Reset camera
        this.cameras.main.stopFollow();
        this.cameras.main.startFollow(this.player.sprite);
    }

    // Pause/Resume functionality
    pauseGame() {
        this.uiManager.showGameInfo();
    }

    resumeGame() {
        this.uiManager.hideGameInfo();
    }

    // Get references to managers (useful for debugging or external access)
    getPlayer() {
        return this.player;
    }

    getWorldManager() {
        return this.worldManager;
    }

    getFireballManager() {
        return this.fireballManager;
    }

    getUIManager() {
        return this.uiManager;
    }

    getInputManager() {
        return this.inputManager;
    }

    getCollisionManager() {
        return this.collisionManager;
    }
}
