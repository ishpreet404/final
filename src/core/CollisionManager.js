export class CollisionManager {
    constructor(scene, player, worldManager, fireballManager, uiManager) {
        this.scene = scene;
        this.player = player;
        this.worldManager = worldManager;
        this.fireballManager = fireballManager;
        this.uiManager = uiManager;
        this.setupCollisions();
    }

    setupCollisions() {
        this.setupPlayerCloudCollisions();
        this.setupPlayerGemCollisions();
        this.setupPlayerKeyCollision();
        this.setupPlayerFireballCollisions();
        this.setupPlayerGateCollision();
    }

    setupPlayerCloudCollisions() {
        this.scene.physics.add.collider(
            this.player.sprite,
            this.worldManager.getClouds(),
            this.handlePlayerCloudCollision.bind(this)
        );
    }

    setupPlayerGemCollisions() {
        this.scene.physics.add.overlap(
            this.player.sprite,
            this.worldManager.getGems(),
            this.handlePlayerGemCollision.bind(this)
        );
    }

    setupPlayerKeyCollision() {
        this.scene.physics.add.overlap(
            this.player.sprite,
            this.worldManager.getKey(),
            this.handlePlayerKeyCollision.bind(this)
        );
    }

    setupPlayerFireballCollisions() {
        this.scene.physics.add.overlap(
            this.player.sprite,
            this.fireballManager.getGroup(),
            this.handlePlayerFireballCollision.bind(this)
        );
    }

    setupPlayerGateCollision() {
        this.scene.physics.add.overlap(
            this.player.sprite,
            this.worldManager.getGate(),
            this.handlePlayerGateCollision.bind(this)
        );
    }

    handlePlayerCloudCollision(player, cloud) {
        // Set player as grounded when touching cloud from above
        if (player.body.touching.down && cloud.body.touching.up) {
            player.isGrounded = true;
        }
    }

    handlePlayerGemCollision(player, gem) {
        if (!this.player.invulnerable) {
            this.worldManager.collectGem(gem);
            
            // Restore shield when collecting gem
            this.player.restoreShield();
            
            // Play collection sound effect (if implemented)
            // this.scene.sound.play('gem-collect');
        }
    }

    handlePlayerKeyCollision(player, key) {
        if (!this.player.invulnerable && this.worldManager.areAllGemsCollected()) {
            this.worldManager.collectKey();
            
            // Play key collection sound (if implemented)
            // this.scene.sound.play('key-collect');
        }
    }

    handlePlayerFireballCollision(player, fireball) {
        if (this.player.invulnerable) {
            return;
        }

        if (this.player.isShielding && this.player.shieldHealth > 0) {
            // Shield blocks the fireball
            this.player.damageShield();
            
            // Visual feedback for shield hit
            this.scene.cameras.main.shake(100, 0.01);
            
            // Play shield hit sound (if implemented)
            // this.scene.sound.play('shield-hit');
        } else {
            // Player takes damage
            const isDead = this.player.takeDamage();
            
            // Visual feedback for damage
            this.scene.cameras.main.shake(200, 0.02);
            
            if (isDead) {
                this.handlePlayerDeath();
            } else {
                // Play damage sound (if implemented)
                // this.scene.sound.play('player-hurt');
            }
        }
    }

    handlePlayerGateCollision(player, gate) {
        // Check if player has collected the key and can pass through
        if (this.worldManager.isKeyCollected()) {
            this.handleLevelComplete();
        }
    }

    handlePlayerDeath() {
        // Show game over screen
        this.uiManager.showGameOver();
        
        // Play death sound (if implemented)
        // this.scene.sound.play('player-death');
        
        // Optionally pause physics or game logic
        this.scene.physics.pause();
    }

    handleLevelComplete() {
        // Show level complete screen
        this.uiManager.showLevelComplete();
        
        // Play victory sound (if implemented)
        // this.scene.sound.play('level-complete');
        
        // Optionally pause physics or game logic
        this.scene.physics.pause();
    }

    // Check if player is falling off the world
    checkWorldBounds() {
        if (this.player.y > 1000) { // Below the visible area
            const isDead = this.player.takeDamage();
            
            if (isDead) {
                this.handlePlayerDeath();
            } else {
                // Reset player to a safe position
                this.player.setPosition(100, 300);
                this.player.setVelocity(0, 0);
            }
        }
        
        // Also check if player goes too far left or right
        if (this.player.x < -100) {
            this.player.setPosition(100, this.player.y);
        } else if (this.player.x > 1380) {
            this.player.setPosition(1200, this.player.y);
        }
    }

    update() {
        this.checkWorldBounds();
    }

    // Reset collision system (useful for game restart)
    reset() {
        // Reset any collision-related state if needed
        // Most collision handling is automatic through Phaser's physics system
    }
}
