import { FIREBALL_LAYOUT, GAME_CONFIG } from '../config/constants.js';

export class FireballManager {
    constructor(scene) {
        this.scene = scene;
        this.fireballs = scene.physics.add.group();
        this.createFireballs();
    }

    createFireballs() {
        // Clear existing fireballs
        this.fireballs.clear(true, true);

        FIREBALL_LAYOUT.forEach(fireballData => {
            for (let j = 0; j < fireballData.count; j++) {
                const fireball = this.scene.physics.add.sprite(
                    fireballData.x, 
                    fireballData.y + j * fireballData.spacing, 
                    'fireball'
                );
                
                this.setupFireball(fireball, fireballData);
                this.fireballs.add(fireball);
            }
        });
    }

    setupFireball(fireball, fireballData) {
        fireball.setDisplaySize(36, 36);
        fireball.body.setSize(32, 32);
        fireball.body.setImmovable(true);
        fireball.body.setVelocityY(fireballData.speed);
        
        // Store original properties for reset
        fireball.originalX = fireball.x;
        fireball.originalY = fireball.y;
        fireball.speed = fireballData.speed;
        fireball.minY = fireballData.minY;
        fireball.maxY = fireballData.maxY;
    }

    update() {
        this.fireballs.children.entries.forEach(fireball => {
            this.updateFireballMovement(fireball);
        });
    }

    updateFireballMovement(fireball) {
        // Reverse direction when hitting boundaries
        if (fireball.body.velocity.y > 0 && fireball.y >= fireball.maxY) {
            fireball.body.setVelocityY(-fireball.speed);
        } else if (fireball.body.velocity.y < 0 && fireball.y <= fireball.minY) {
            fireball.body.setVelocityY(fireball.speed);
        }
    }

    reset() {
        // Reset all fireballs to original positions
        this.fireballs.children.entries.forEach(fireball => {
            fireball.setPosition(fireball.originalX, fireball.originalY);
            fireball.body.setVelocityY(fireball.speed);
        });
    }

    getGroup() {
        return this.fireballs;
    }
}
