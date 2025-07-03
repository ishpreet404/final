import { GAME_CONFIG } from '../config/constants.js';

export class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.setupPhysics();
        this.setupProperties();
    }

    setupPhysics() {
        this.sprite.setDisplaySize(48, 72);
        this.sprite.body.setSize(36, 66);
        this.sprite.setCollideWorldBounds(false);
        this.sprite.body.setGravityY(GAME_CONFIG.GRAVITY);
        this.sprite.body.setMaxVelocityY(GAME_CONFIG.TERMINAL_VELOCITY);
    }

    setupProperties() {
        this.sprite.isGrounded = false;
        this.health = 3;
        this.shieldHealth = 3;
        this.maxShieldHealth = 3;
        this.isShielding = false;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
    }

    update(deltaSeconds, input) {
        this.updateInvulnerability(deltaSeconds);
        this.handleMovement(deltaSeconds, input);
    }

    updateInvulnerability(deltaSeconds) {
        if (this.invulnerable) {
            this.invulnerabilityTimer -= deltaSeconds;
            this.sprite.setAlpha(Math.sin(this.scene.time.now * 0.01) * 0.5 + 0.5);
            
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
                this.sprite.setAlpha(1);
            }
        }
    }

    handleMovement(deltaSeconds, input) {
        const { inputX, inputY, shieldInput } = input;

        // Handle shield activation
        if (shieldInput && this.shieldHealth > 0 && !this.isShielding) {
            this.isShielding = true;
        } else if (!shieldInput) {
            this.isShielding = false;
        }

        // Movement (disabled when shielding)
        if (!this.isShielding) {
            this.handleHorizontalMovement(deltaSeconds, inputX);
            this.handleJumping(inputY);
        } else {
            // Stop all movement when shielding
            this.sprite.body.setVelocity(0, 0);
        }
    }

    handleHorizontalMovement(deltaSeconds, inputX) {
        if (inputX !== 0) {
            const targetVelocityX = inputX * GAME_CONFIG.PLAYER_SPEED;
            const currentVelocityX = this.sprite.body.velocity.x;
            const acceleration = 1000;
            
            if (Math.abs(targetVelocityX - currentVelocityX) > acceleration * deltaSeconds) {
                const direction = Math.sign(targetVelocityX - currentVelocityX);
                this.sprite.body.setVelocityX(currentVelocityX + direction * acceleration * deltaSeconds);
            } else {
                this.sprite.body.setVelocityX(targetVelocityX);
            }
        } else {
            // Deceleration
            const currentVelocityX = this.sprite.body.velocity.x;
            const deceleration = 500;
            
            if (Math.abs(currentVelocityX) > deceleration * deltaSeconds) {
                const direction = -Math.sign(currentVelocityX);
                this.sprite.body.setVelocityX(currentVelocityX + direction * deceleration * deltaSeconds);
            } else {
                this.sprite.body.setVelocityX(0);
            }
        }
    }

    handleJumping(inputY) {
        if (inputY < -0.5 && this.sprite.isGrounded) {
            this.sprite.body.setVelocityY(GAME_CONFIG.JUMP_VELOCITY);
            this.sprite.isGrounded = false;
        }
    }

    setPosition(x, y) {
        this.sprite.setPosition(x, y);
    }

    setVelocity(x, y) {
        this.sprite.body.setVelocity(x, y);
    }

    setVisible(visible) {
        this.sprite.setVisible(visible);
    }

    takeDamage() {
        this.health--;
        this.invulnerable = true;
        this.invulnerabilityTimer = 2;
        return this.health <= 0;
    }

    damageShield() {
        this.shieldHealth--;
        if (this.shieldHealth <= 0) {
            this.isShielding = false;
        }
    }

    restoreShield() {
        this.shieldHealth = this.maxShieldHealth;
    }

    reset(x, y) {
        this.setPosition(x, y);
        this.setVelocity(0, 0);
        this.health = 3;
        this.shieldHealth = this.maxShieldHealth;
        this.isShielding = false;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.sprite.setAlpha(1);
    }

    // Getters for easy access
    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get body() { return this.sprite.body; }
    get isGrounded() { return this.sprite.isGrounded; }
    set isGrounded(value) { this.sprite.isGrounded = value; }
}
