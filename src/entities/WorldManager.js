import { CLOUD_LAYOUT, GEM_LAYOUT, GAME_CONFIG } from '../config/constants.js';

export class WorldManager {
    constructor(scene) {
        this.scene = scene;
        this.clouds = scene.physics.add.staticGroup();
        this.gems = scene.physics.add.group();
        this.collectedGems = 0;
        this.key = null;
        this.gate = null;
        this.createWorld();
    }

    createWorld() {
        this.createClouds();
        this.createGems();
        this.createKey();
        this.createGate();
    }

    createClouds() {
        this.clouds.clear(true, true);
        
        CLOUD_LAYOUT.forEach(cloudData => {
            const cloud = this.scene.physics.add.staticSprite(cloudData.x, cloudData.y, cloudData.texture);
            cloud.setDisplaySize(cloudData.width, cloudData.height);
            cloud.body.setSize(cloudData.width, cloudData.height);
            this.clouds.add(cloud);
        });
    }

    createGems() {
        this.gems.clear(true, true);
        this.collectedGems = 0;
        
        GEM_LAYOUT.forEach(gemData => {
            const gem = this.scene.physics.add.sprite(gemData.x, gemData.y, 'gem');
            gem.setDisplaySize(24, 24);
            gem.body.setSize(20, 20);
            gem.body.setImmovable(true);
            this.gems.add(gem);
        });
    }

    createKey() {
        this.key = this.scene.physics.add.sprite(420, 400, 'key');
        this.key.setDisplaySize(24, 24);
        this.key.body.setSize(20, 20);
        this.key.body.setImmovable(true);
        this.key.setVisible(false);
    }

    createGate() {
        this.gate = this.scene.physics.add.staticSprite(1240, 200, 'gate-closed');
        this.gate.setDisplaySize(120, 120);
        this.gate.body.setSize(120, 120);
    }

    collectGem(gem) {
        gem.destroy();
        this.collectedGems++;
        
        // Show key when all gems are collected
        if (this.collectedGems >= GEM_LAYOUT.length) {
            this.key.setVisible(true);
        }
    }

    collectKey() {
        this.key.destroy();
        this.key = null;
        this.openGate();
    }

    openGate() {
        this.gate.setTexture('gate-open');
        this.gate.body.setSize(0, 0); // Remove collision
    }

    closeGate() {
        this.gate.setTexture('gate-closed');
        this.gate.body.setSize(120, 120); // Restore collision
    }

    reset() {
        this.createGems();
        this.createKey();
        this.closeGate();
        this.collectedGems = 0;
    }

    // Getters for collision groups
    getClouds() {
        return this.clouds;
    }

    getGems() {
        return this.gems;
    }

    getKey() {
        return this.key;
    }

    getGate() {
        return this.gate;
    }

    // Check if all gems are collected
    areAllGemsCollected() {
        return this.collectedGems >= GEM_LAYOUT.length;
    }

    // Check if key is collected
    isKeyCollected() {
        return this.key === null;
    }
}
