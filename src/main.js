import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Game state
        this.player = null;
        this.sun = null;
        this.clouds = [];
        this.fireballs = [];
        this.gems = [];
        this.key = null;
        this.gate = null;
        
        // UI elements
        this.joystick = null;
        this.shieldButton = null;
        this.healthBars = null;
        
        // Game mechanics
        this.playerHealth = 3; // Player dies after 3 unshielded hits
        this.shieldHealth = 3; // Shield blocks 3 hits before breaking
        this.maxShieldHealth = 3; // Maximum shield health
        this.isShielding = false;
        this.hasKey = false;
        this.gateOpen = false;
        this.levelComplete = false;
        this.invulnerable = false;
        this.lastCloudPosition = { x: 200, y: 850 }; // Updated to match new start position
        
        // Timers
        this.fireballTimer = 0;
        this.fireballInterval = 0.6; // Increased spawn rate from 0.8 to 0.6 seconds for more varied angles
        this.invulnerabilityTimer = 0;
        
        // Input
        this.joystickInput = { x: 0, y: 0 };
        this.shieldPressed = false;
        
        // Constants
        this.GRAVITY = 1000;
        this.FIREBALL_GRAVITY = 500;
        this.PLAYER_SPEED = 200;
        this.JUMP_VELOCITY = -650; // Increased from -500 for longer jumps
        this.TERMINAL_VELOCITY = 800;
        this.FIREBALL_TERMINAL = 600;
    }
    
    preload() {
        // Load all assets from the assets folder - using exact names
        this.load.image('bgFull', 'assets/BG full.png');
        this.load.image('player', 'assets/Psyger-0.png');
        this.load.image('sun', 'assets/Suhn.png');
        this.load.image('fireball', 'assets/Fireball.png');
        this.load.image('cloud1', 'assets/Cloud 1.png');
        this.load.image('cloud2', 'assets/Cloud 2.png');
        this.load.image('cloud3', 'assets/Cloud 3.png');
        this.load.image('gem', 'assets/Gem.png');
        this.load.image('key', 'assets/Key.png');
        this.load.image('gateClose', 'assets/Gate close.png');
        this.load.image('gateOpen', 'assets/Gate open.png');
        this.load.image('shield', 'assets/Shield.png');
        this.load.image('shieldButton', 'assets/Shield button.png');
        
        // Health UI assets - exact names
        this.load.image('health1', 'assets/Health 1.png');
        this.load.image('health2', 'assets/health 2.png');
        this.load.image('health3', 'assets/Health 3.png');
        this.load.image('shield1', 'assets/Shield 1.png');
        this.load.image('shield2', 'assets/Shield 2.png');
        this.load.image('shield3', 'assets/Shield 3.png');
        
        // Joystick assets
        this.load.image('joystick1', 'assets/Joystick 1.png');
        this.load.image('joystick2', 'assets/Joystick 2.png');
        this.load.image('joystick3', 'assets/Joystick 3.png');
    }
    
    create() {
        // Create background using 'BG full' - stretch to cover entire 1920x1080 screen
        this.add.image(960, 540, 'bgFull').setDisplaySize(1920, 1080);
        
        // Create sun enemy at top-right corner
        this.sun = this.add.image(1700, 100, 'sun');
        this.sun.setScale(0.8);
        
        // Create player at bottom-left cloud start position
        this.player = this.physics.add.sprite(200, 820, 'player');
        this.player.setDisplaySize(48, 72); // Increased from 32x48
        this.player.body.setSize(36, 66); // Increased hitbox proportionally
        this.player.setCollideWorldBounds(false);
        this.player.body.setGravityY(this.GRAVITY);
        this.player.body.setMaxVelocityY(this.TERMINAL_VELOCITY);
        this.player.isGrounded = false;
        
        // Create clouds with physics using exact positions and cloud types
        this.createClouds();
        
        // Create gems on specific clouds
        this.createGems();
        
        // Create key on center cloud - positioned above the center middle cloud
        this.key = this.physics.add.sprite(800, 520, 'key');
        this.key.setDisplaySize(32, 32); // Increased size for better visibility
        this.key.body.setImmovable(true);
        this.key.body.setGravityY(0);
        this.key.floatDirection = 1;
        this.key.originalY = 520;
        
        // Create gate on final platform - topmost/rightmost position
        this.gate = this.physics.add.sprite(1500, 220, 'gateClose');
        this.gate.body.setImmovable(true);
        this.gate.body.setGravityY(0);
        // Set collision box to be wider and at the base of the gate for better platform collision
        this.gate.body.setSize(120, 40); // Width and height of collision box
        this.gate.body.setOffset(20, 60); // Position collision box at the base
        
        // Create UI
        this.createUI();
        
        // Create input handling
        this.createInput();
        
        // Initialize fireballs group
        this.fireballs = this.physics.add.group();
        
        // Create shield effect (initially hidden)
        this.shieldEffect = this.add.image(0, 0, 'shield');
        this.shieldEffect.setVisible(false);
        this.shieldEffect.setAlpha(0.7);
    }
    
    createClouds() {
        // Simplified cloud layout - 8 large clouds forming clear upward path from bottom-left to top-right
        const cloudData = [
            // Starting cloud - bottom left
            { x: 200, y: 850, type: 'cloud1', size: { w: 180, h: 60 } },
            
            // Second cloud - step up and right
            { x: 450, y: 750, type: 'cloud2', size: { w: 170, h: 55 } },
            
            // Third cloud - continue upward path
            { x: 700, y: 650, type: 'cloud3', size: { w: 175, h: 60 } },
            
            // Fourth cloud - center area with key
            { x: 800, y: 550, type: 'cloud1', size: { w: 180, h: 65 } },
            
            // Fifth cloud - continue climbing
            { x: 1000, y: 450, type: 'cloud2', size: { w: 170, h: 55 } },
            
            // Sixth cloud - approach final area
            { x: 1200, y: 350, type: 'cloud3', size: { w: 175, h: 60 } },
            
            // Seventh cloud - pre-final platform
            { x: 1350, y: 280, type: 'cloud1', size: { w: 160, h: 55 } },
            
            // Final cloud - top right with gate
            { x: 1500, y: 250, type: 'cloud2', size: { w: 180, h: 65 } }
        ];
        
        cloudData.forEach(data => {
            const cloud = this.physics.add.sprite(data.x, data.y, data.type);
            cloud.setImmovable(true);
            cloud.body.setGravityY(0);
            cloud.setDisplaySize(data.size.w, data.size.h);
            cloud.body.setSize(data.size.w, data.size.h);
            cloud.disappearTimer = -1; // -1 means not activated
            cloud.originalAlpha = 1;
            cloud.isSolid = true;
            this.clouds.push(cloud);
        });
    }
    
    createGems() {
        // Place gems on top of clouds - clean positioning
        const gemPositions = [
            { x: 450, y: 720 },  // On second cloud (450, 750)
            { x: 700, y: 620 },  // On third cloud (700, 650) 
            { x: 1000, y: 420 }, // On fifth cloud (1000, 450)
        ];
        
        gemPositions.forEach(pos => {
            const gem = this.physics.add.sprite(pos.x, pos.y, 'gem');
            gem.setDisplaySize(24, 24); // Clean size
            gem.body.setImmovable(true);
            gem.body.setGravityY(0);
            gem.floatDirection = 1;
            gem.originalY = pos.y;
            this.gems.push(gem);
        });
    }
    
    createUI() {
        // Create shield health display (top-left)
        this.shieldHealthDisplay = this.add.image(20, 20, 'shield3');
        this.shieldHealthDisplay.setOrigin(0, 0);
        this.shieldHealthDisplay.setScale(0.8);
        
        // Create player health display (below shield) - initially hidden
        this.playerHealthDisplay = this.add.image(20, 80, 'health3');
        this.playerHealthDisplay.setOrigin(0, 0);
        this.playerHealthDisplay.setScale(0.8);
        this.playerHealthDisplay.setVisible(false); // Only visible after shield breaks
        
        // Create joystick using joystick assets
        this.joystickBase = this.add.image(100, 980, 'joystick1');
        this.joystickBase.setScale(0.8);
        this.joystickBase.setAlpha(0.7);
        
        this.joystickKnob = this.add.circle(100, 980, 20, 0xffffff, 0.8);
        this.joystickCenter = { x: 100, y: 980 };
        
        // Create shield button
        this.shieldButton = this.add.image(1820, 980, 'shieldButton');
        this.shieldButton.setScale(0.8);
        this.shieldButton.setInteractive();
        this.shieldButton.setAlpha(0.8);
        
        this.updateHealthUI();
    }
    
    createInput() {
        // Mouse/touch input for joystick
        this.input.on('pointerdown', (pointer) => {
            const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.joystickCenter.x, this.joystickCenter.y);
            if (distance <= 60) { // Adjusted for joystick asset size
                this.joystickActive = true;
                this.updateJoystick(pointer);
            }
            
            // Shield button
            const shieldDistance = Phaser.Math.Distance.Between(pointer.x, pointer.y, 1820, 980);
            if (shieldDistance <= 60) {
                this.shieldPressed = true;
                this.shieldButton.setTint(0x888888);
            }
        });
        
        this.input.on('pointermove', (pointer) => {
            if (this.joystickActive) {
                this.updateJoystick(pointer);
            }
        });
        
        this.input.on('pointerup', () => {
            this.joystickActive = false;
            this.joystickInput = { x: 0, y: 0 };
            this.joystickKnob.setPosition(this.joystickCenter.x, this.joystickCenter.y);
            
            this.shieldPressed = false;
            this.shieldButton.clearTint();
        });
        
        // Keyboard fallback
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    updateJoystick(pointer) {
        const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.joystickCenter.x, this.joystickCenter.y);
        const angle = Phaser.Math.Angle.Between(this.joystickCenter.x, this.joystickCenter.y, pointer.x, pointer.y);
        
        if (distance <= 60) { // Adjusted for joystick asset size
            this.joystickKnob.setPosition(pointer.x, pointer.y);
            this.joystickInput.x = (pointer.x - this.joystickCenter.x) / 60;
            this.joystickInput.y = (pointer.y - this.joystickCenter.y) / 60;
        } else {
            const maxX = this.joystickCenter.x + Math.cos(angle) * 60;
            const maxY = this.joystickCenter.y + Math.sin(angle) * 60;
            this.joystickKnob.setPosition(maxX, maxY);
            this.joystickInput.x = Math.cos(angle);
            this.joystickInput.y = Math.sin(angle);
        }
    }
    
    createParticles() {
        // Particle effects will be added here if needed
    }
    
    update(time, delta) {
        const deltaSeconds = delta / 1000;
        
        if (this.levelComplete) return;
        
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTimer -= deltaSeconds;
            this.player.setAlpha(Math.sin(time * 0.01) * 0.5 + 0.5);
            
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
                this.player.setAlpha(1);
            }
        }
        
        // Handle input and movement
        this.handleInput(deltaSeconds);
        
        // Update shield state
        this.updateShield();
        
        // Update player physics
        this.updatePlayer(deltaSeconds);
        
        // Update gems floating animation
        this.updateGems(deltaSeconds);
        
        // Update key floating animation
        this.updateKey(deltaSeconds);
        
        // Update clouds
        this.updateClouds(deltaSeconds);
        
        // Update fireballs
        this.updateFireballs(deltaSeconds);
        
        // Spawn fireballs
        this.updateFireballSpawning(deltaSeconds);
        
        // Check collisions
        this.checkCollisions();
        
        // Check death conditions
        this.checkDeath();
        
        // Rotate sun
        if (this.sun.visible) {
            this.sun.rotation += deltaSeconds * 0.5;
        }
    }
    
    handleInput(deltaSeconds) {
        // Get input from joystick or keyboard
        let inputX = this.joystickInput.x;
        let inputY = this.joystickInput.y;
        
        // Keyboard fallback
        if (this.cursors.left.isDown || this.wasd.A.isDown) inputX = -1;
        if (this.cursors.right.isDown || this.wasd.D.isDown) inputX = 1;
        if (this.cursors.up.isDown || this.wasd.W.isDown) inputY = -1;
        
        // Shield input
        const shieldInput = this.shieldPressed || this.spaceKey.isDown;
        
        // Handle shield activation
        if (shieldInput && this.shieldHealth > 0 && !this.isShielding) {
            this.isShielding = true;
        } else if (!shieldInput) {
            this.isShielding = false;
        }
        
        // Movement (disabled when shielding)
        if (!this.isShielding) {
            // Horizontal movement
            if (inputX !== 0) {
                const targetVelocityX = inputX * this.PLAYER_SPEED;
                const currentVelocityX = this.player.body.velocity.x;
                const acceleration = 1000; // pixels/s²
                
                if (Math.abs(targetVelocityX - currentVelocityX) > acceleration * deltaSeconds) {
                    const direction = Math.sign(targetVelocityX - currentVelocityX);
                    this.player.body.setVelocityX(currentVelocityX + direction * acceleration * deltaSeconds);
                } else {
                    this.player.body.setVelocityX(targetVelocityX);
                }
            } else {
                // Deceleration
                const currentVelocityX = this.player.body.velocity.x;
                const deceleration = 500; // pixels/s²
                
                if (Math.abs(currentVelocityX) > deceleration * deltaSeconds) {
                    const direction = -Math.sign(currentVelocityX);
                    this.player.body.setVelocityX(currentVelocityX + direction * deceleration * deltaSeconds);
                } else {
                    this.player.body.setVelocityX(0);
                }
            }
            
            // Jumping
            if (inputY < -0.5 && this.player.isGrounded) {
                this.player.body.setVelocityY(this.JUMP_VELOCITY);
                this.player.isGrounded = false;
            }
        } else {
            // Stop all movement when shielding
            this.player.body.setVelocity(0, 0);
        }
    }
    
    updateShield() {
        if (this.isShielding && this.shieldHealth > 0) {
            this.shieldEffect.setPosition(this.player.x, this.player.y);
            this.shieldEffect.setVisible(true);
            this.shieldButton.setTint(0x00ff00);
        } else {
            this.shieldEffect.setVisible(false);
            if (!this.shieldPressed) {
                this.shieldButton.clearTint();
            }
        }
    }
    
    updatePlayer(deltaSeconds) {
        // Check if player is grounded
        this.player.isGrounded = false;
        
        // Check collision with clouds
        this.clouds.forEach(cloud => {
            if (cloud.isSolid && this.physics.overlap(this.player, cloud)) {
                const playerBottom = this.player.y + this.player.body.height / 2;
                const cloudTop = cloud.y - cloud.body.height / 2;
                
                if (playerBottom <= cloudTop + 10 && this.player.body.velocity.y >= 0) {
                    this.player.isGrounded = true;
                    this.player.y = cloudTop - this.player.body.height / 2;
                    this.player.body.setVelocityY(0);
                    
                    // Start cloud disappearing timer
                    if (cloud.disappearTimer === -1) {
                        cloud.disappearTimer = 5; // 5 seconds
                        this.lastCloudPosition = { x: cloud.x, y: cloud.y };
                    }
                }
            }
        });
        
        // Check collision with gate (player can stand on it)
        if (this.gate && this.physics.overlap(this.player, this.gate)) {
            const playerBottom = this.player.y + this.player.body.height / 2;
            const gateTop = this.gate.y - this.gate.body.height / 2;
            
            if (playerBottom <= gateTop + 10 && this.player.body.velocity.y >= 0) {
                this.player.isGrounded = true;
                this.player.y = gateTop - this.player.body.height / 2;
                this.player.body.setVelocityY(0);
                
                // Update last position when standing on gate
                this.lastCloudPosition = { x: this.gate.x, y: this.gate.y };
            }
        }
        
        // Check collision with ground (bottom of screen area)
        if (this.player.y >= 1000 && this.player.body.velocity.y >= 0) {
            this.player.isGrounded = true;
            this.player.y = 1000;
            this.player.body.setVelocityY(0);
            // Update last cloud position when touching ground
            this.lastCloudPosition = { x: this.player.x, y: 1000 };
        }
    }
    
    updateGems(deltaSeconds) {
        this.gems.forEach(gem => {
            // Floating animation
            gem.floatDirection = gem.y <= gem.originalY - 10 ? 1 : gem.y >= gem.originalY + 10 ? -1 : gem.floatDirection;
            gem.y += gem.floatDirection * 20 * deltaSeconds;
        });
    }
    
    updateKey(deltaSeconds) {
        if (this.key && this.key.active) {
            // Floating animation around the key position
            this.key.floatDirection = this.key.y <= this.key.originalY - 10 ? 1 : this.key.y >= this.key.originalY + 10 ? -1 : this.key.floatDirection;
            this.key.y += this.key.floatDirection * 20 * deltaSeconds;
        }
    }
    
    updateClouds(deltaSeconds) {
        this.clouds.forEach(cloud => {
            if (cloud.disappearTimer > 0) {
                cloud.disappearTimer -= deltaSeconds;
                
                // Update opacity based on timer
                if (cloud.disappearTimer > 4) {
                    cloud.setAlpha(1);
                } else if (cloud.disappearTimer > 2) {
                    cloud.setAlpha(0.6);
                } else if (cloud.disappearTimer > 0) {
                    cloud.setAlpha(0.2);
                } else {
                    cloud.setAlpha(0.2);
                    cloud.isSolid = false;
                }
            }
        });
    }
    
    updateFireballs(deltaSeconds) {
        this.fireballs.children.entries.forEach(fireball => {
            // Apply gravity
            fireball.body.setAccelerationY(this.FIREBALL_GRAVITY);
            
            // Limit terminal velocity
            if (fireball.body.velocity.y > this.FIREBALL_TERMINAL) {
                fireball.body.setVelocityY(this.FIREBALL_TERMINAL);
            }
            
            // Fireballs now pass through clouds - no collision with clouds
            
            // Remove fireballs that fall off screen
            if (fireball.y > 1100) {
                fireball.destroy();
            }
        });
    }
    
    updateFireballSpawning(deltaSeconds) {
        if (!this.sun.visible) return;
        
        this.fireballTimer += deltaSeconds;
        
        if (this.fireballTimer >= this.fireballInterval) {
            this.spawnFireball();
            this.fireballTimer = 0;
        }
    }
    
    spawnFireball() {
        // Spawn fireballs at sun position, aimed directly at cloud positions with physics prediction
        const sunX = 1700;
        const sunY = 100;
        
        // Target random cloud positions to threaten the climbing path
        const cloudTargets = [
            { x: 200, y: 850 },   // Starting cloud
            { x: 450, y: 750 },   // Second cloud
            { x: 700, y: 650 },   // Third cloud
            { x: 800, y: 550 },   // Fourth cloud (key)
            { x: 1000, y: 450 },  // Fifth cloud
            { x: 1200, y: 350 },  // Sixth cloud
            { x: 1350, y: 280 },  // Seventh cloud
            { x: 1500, y: 250 }   // Final cloud (gate)
        ];
        
        // Randomly select a cloud to target
        const target = cloudTargets[Math.floor(Math.random() * cloudTargets.length)];
        
        // Calculate distance to target
        const deltaX = target.x - sunX;
        const deltaY = target.y - sunY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Calculate time to reach target (accounting for gravity)
        const initialSpeed = 400;
        const timeToTarget = distance / initialSpeed;
        
        // Calculate initial velocity components to hit the target
        // Account for gravity affecting Y trajectory
        const velocityX = deltaX / timeToTarget;
        const velocityY = (deltaY - 0.5 * this.FIREBALL_GRAVITY * timeToTarget * timeToTarget) / timeToTarget;
        
        // Add small random spread (±10% of velocity for slight inaccuracy)
        const spreadFactor = 0.1;
        const finalVelocityX = velocityX + (Math.random() - 0.5) * Math.abs(velocityX) * spreadFactor;
        const finalVelocityY = velocityY + (Math.random() - 0.5) * Math.abs(velocityY) * spreadFactor;
        
        // Spawn at sun position with small offset
        const offsetX = Phaser.Math.Between(-20, 20);
        const offsetY = Phaser.Math.Between(-10, 10);
        const fireball = this.fireballs.create(sunX + offsetX, sunY + offsetY, 'fireball');
        
        // Set calculated velocity
        fireball.body.setVelocity(finalVelocityX, finalVelocityY);
        fireball.body.setGravityY(0); // We'll handle gravity manually
        fireball.setScale(0.8);
        fireball.setDisplaySize(32, 32);
        
        // Rotate fireball to match trajectory
        const angle = Math.atan2(finalVelocityY, finalVelocityX);
        fireball.setRotation(angle);
    }
    
    checkCollisions() {
        // Gem collection
        this.gems = this.gems.filter(gem => {
            if (this.physics.overlap(this.player, gem)) {
                this.collectGem(gem);
                // Don't destroy immediately - let the animation handle it
                this.time.delayedCall(300, () => {
                    if (gem && gem.active) {
                        gem.destroy();
                    }
                });
                return false;
            }
            return true;
        });
        
        // Key collection
        if (this.key && this.key.active && this.physics.overlap(this.player, this.key)) {
            this.collectKey();
        }
        
        // Gate entry - only works if player has the key
        if (this.hasKey && this.gateOpen && this.physics.overlap(this.player, this.gate)) {
            this.completeLevel();
        }
        
        // Fireball collisions
        this.fireballs.children.entries.forEach(fireball => {
            const distance = Phaser.Math.Distance.Between(fireball.x, fireball.y, this.player.x, this.player.y);
            
            if (distance < 40) {
                if (this.isShielding && this.shieldHealth > 0) {
                    // Shield is actively being used and has health - blocks fireball and damages shield
                    this.damageShield();
                    fireball.destroy();
                } else if (!this.invulnerable) {
                    // Player is not shielding or shield is broken - takes health damage
                    this.damagePlayer();
                    fireball.destroy();
                }
            }
        });
    }
    
    collectGem(gem) {
        // Gems fully restore shield health
        this.shieldHealth = this.maxShieldHealth;
        this.updateHealthUI();
        
        // Add brief scale/fade animation using the gem sprite
        this.tweens.add({
            targets: gem,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 300,
            ease: 'Power2'
        });
        
        // Add visual effect
        this.add.text(gem.x, gem.y - 30, 'Shield Restored!', {
            fontSize: '16px',
            color: '#00ff00'
        }).setOrigin(0.5).setDepth(100);
    }
    
    collectKey() {
        this.hasKey = true;
        
        // Key disappears with animation
        this.tweens.add({
            targets: this.key,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 300,
            onComplete: () => {
                this.key.destroy();
            }
        });
        
        // Remove sun and stop fireballs when key is collected
        this.removeSunAndFireballs();
        
        // Open the gate
        this.openGate();
        
        // Show message
        this.add.text(960, 300, 'Key Collected! Reach the Gate!', {
            fontSize: '32px',
            color: '#ffff00'
        }).setOrigin(0.5).setDepth(100);
    }
    
    openGate() {
        this.gateOpen = true;
        // Switch from 'Gate close' to 'Gate open' sprite
        this.gate.setTexture('gateOpen');
    }
    
    removeSunAndFireballs() {
        // Make the sun vanish when key is collected
        this.tweens.add({
            targets: this.sun,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 500,
            onComplete: () => {
                this.sun.setVisible(false);
            }
        });
        
        // Clear all existing fireballs
        this.fireballs.clear(true, true);
    }
    
    damageShield() {
        // Damage the shield when blocking a fireball
        this.shieldHealth--;
        this.updateHealthUI();
        
        // Stop shielding if shield is broken
        if (this.shieldHealth <= 0) {
            this.isShielding = false;
        }
    }
    
    damagePlayer() {
        this.playerHealth--;
        this.updateHealthUI();
        
        // Start invulnerability
        this.invulnerable = true;
        this.invulnerabilityTimer = 2;
        
        if (this.playerHealth <= 0) {
            this.playerDeath();
        }
    }
    
    checkDeath() {
        // Check if player fell off screen
        if (this.player.y > 1180) {
            this.playerDeath();
        }
    }
    
    playerDeath() {
        // Fade to black
        const blackScreen = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0);
        blackScreen.setDepth(1000);
        
        this.tweens.add({
            targets: blackScreen,
            alpha: 1,
            duration: 300,
            onComplete: () => {
                this.respawnPlayer();
                
                this.tweens.add({
                    targets: blackScreen,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => blackScreen.destroy()
                });
            }
        });
    }
    
    respawnPlayer() {
        // Reset player position to the first cloud (starting position)
        // Place player on top of the first cloud at (200, 850)
        this.player.setPosition(200, 820); // 820 = cloud y (850) - cloud height/2 (30) + 10 buffer
        this.player.body.setVelocity(0, 0);
        
        // Reset health and shield to full
        this.shieldHealth = this.maxShieldHealth;
        this.playerHealth = 3;
        this.updateHealthUI();
        
        // Reset all cloud timers and make them solid again
        this.clouds.forEach(cloud => {
            cloud.disappearTimer = -1; // Reset to not activated
            cloud.setAlpha(1); // Reset to full opacity
            cloud.isSolid = true; // Make solid again
        });
        
        // Reset game state if key was collected
        if (this.hasKey) {
            this.hasKey = false;
            this.gateOpen = false;
            this.gate.setTexture('gateClose');
            
            // Respawn the key
            this.key = this.physics.add.sprite(800, 520, 'key');
            this.key.setDisplaySize(32, 32);
            this.key.body.setImmovable(true);
            this.key.body.setGravityY(0);
            this.key.floatDirection = 1;
            this.key.originalY = 520;
            
            // Respawn the sun
            this.sun.setVisible(true);
            this.sun.setAlpha(1);
            this.sun.setScale(0.8);
        }
        
        // Clear fireballs
        this.fireballs.clear(true, true);
        
        // Start invulnerability
        this.invulnerable = true;
        this.invulnerabilityTimer = 2;
    }
    
    completeLevel() {
        this.levelComplete = true;
        
        // Clear any remaining fireballs (should already be cleared)
        this.fireballs.clear(true, true);
        
        // Show completion message
        const completeText = this.add.text(960, 540, 'LEVEL COMPLETE', {
            fontSize: '48px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);
        
        // Transition after 3 seconds
        this.time.delayedCall(3000, () => {
            // Reset game or go to next level
            this.scene.restart();
        });
    }
    
    updateHealthUI() {
        // Update shield health display based on shield health
        if (this.shieldHealth === 3) {
            this.shieldHealthDisplay.setTexture('shield3');
            this.shieldHealthDisplay.setVisible(true);
        } else if (this.shieldHealth === 2) {
            this.shieldHealthDisplay.setTexture('shield2');
            this.shieldHealthDisplay.setVisible(true);
        } else if (this.shieldHealth === 1) {
            this.shieldHealthDisplay.setTexture('shield1');
            this.shieldHealthDisplay.setVisible(true);
        } else {
            this.shieldHealthDisplay.setVisible(false);
        }
        
        // Player health display is always visible
        this.playerHealthDisplay.setVisible(true);
        if (this.playerHealth === 3) {
            this.playerHealthDisplay.setTexture('health3');
        } else if (this.playerHealth === 2) {
            this.playerHealthDisplay.setTexture('health2');
        } else if (this.playerHealth === 1) {
            this.playerHealthDisplay.setTexture('health1');
        } else {
            this.playerHealthDisplay.setVisible(false);
        }
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'app',
    backgroundColor: '#87CEEB',
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

// Start the game
const game = new Phaser.Game(config);