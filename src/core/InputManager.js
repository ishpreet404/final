export class InputManager {
    constructor(scene, uiManager) {
        this.scene = scene;
        this.uiManager = uiManager;
        this.inputState = {
            inputX: 0,
            inputY: 0,
            shieldInput: false
        };
        this.setupInput();
    }

    setupInput() {
        this.setupKeyboardInput();
        this.setupTouchInput();
        this.setupUIInteractions();
    }

    setupKeyboardInput() {
        // Create cursor keys
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        
        // Create WASD keys
        this.wasd = this.scene.input.keyboard.addKeys('W,S,A,D');
        
        // Create additional keys
        this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shiftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.escKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.enterKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    setupTouchInput() {
        // Touch input will be handled through UI interactions
        this.scene.input.on('pointerdown', this.handlePointerDown.bind(this));
        this.scene.input.on('pointerup', this.handlePointerUp.bind(this));
        this.scene.input.on('pointermove', this.handlePointerMove.bind(this));
        
        this.touchData = {
            joystickActive: false,
            joystickPointerId: null,
            shieldActive: false,
            shieldPointerId: null
        };
    }

    setupUIInteractions() {
        const overlays = this.uiManager.getOverlays();
        
        // Make overlays interactive for dismissing
        overlays.gameInfo.setInteractive().on('pointerdown', () => {
            this.uiManager.hideGameInfo();
        });
        
        overlays.gameOver.setInteractive().on('pointerdown', () => {
            this.scene.restartGame();
        });
        
        overlays.levelComplete.setInteractive().on('pointerdown', () => {
            this.scene.restartGame();
        });
    }

    handlePointerDown(pointer) {
        const joystick = this.uiManager.getJoystick();
        const shieldButton = this.uiManager.getShieldButton();
        
        // Check if touching joystick area
        const joystickDistance = Phaser.Math.Distance.Between(
            pointer.x, pointer.y, joystick.x, joystick.y
        );
        
        if (joystickDistance <= 60 && !this.touchData.joystickActive) {
            this.touchData.joystickActive = true;
            this.touchData.joystickPointerId = pointer.id;
        }
        
        // Check if touching shield button
        const shieldDistance = Phaser.Math.Distance.Between(
            pointer.x, pointer.y, shieldButton.x, shieldButton.y
        );
        
        if (shieldDistance <= 40 && !this.touchData.shieldActive) {
            this.touchData.shieldActive = true;
            this.touchData.shieldPointerId = pointer.id;
            this.inputState.shieldInput = true;
        }
    }

    handlePointerUp(pointer) {
        // Release joystick
        if (this.touchData.joystickPointerId === pointer.id) {
            this.touchData.joystickActive = false;
            this.touchData.joystickPointerId = null;
            this.inputState.inputX = 0;
            this.inputState.inputY = 0;
        }
        
        // Release shield button
        if (this.touchData.shieldPointerId === pointer.id) {
            this.touchData.shieldActive = false;
            this.touchData.shieldPointerId = null;
            this.inputState.shieldInput = false;
        }
    }

    handlePointerMove(pointer) {
        // Handle joystick movement
        if (this.touchData.joystickActive && this.touchData.joystickPointerId === pointer.id) {
            const joystick = this.uiManager.getJoystick();
            const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, joystick.x, joystick.y);
            const maxDistance = 60;
            
            if (distance <= maxDistance) {
                this.inputState.inputX = (pointer.x - joystick.x) / maxDistance;
                this.inputState.inputY = (pointer.y - joystick.y) / maxDistance;
            } else {
                const angle = Phaser.Math.Angle.Between(joystick.x, joystick.y, pointer.x, pointer.y);
                this.inputState.inputX = Math.cos(angle);
                this.inputState.inputY = Math.sin(angle);
            }
        }
    }

    update() {
        this.updateKeyboardInput();
        this.updateUIDisplay();
        this.handleSpecialKeys();
    }

    updateKeyboardInput() {
        // Keyboard movement input
        let keyboardX = 0;
        let keyboardY = 0;
        let keyboardShield = false;

        // Horizontal movement
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            keyboardX = -1;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            keyboardX = 1;
        }

        // Vertical movement (jumping)
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            keyboardY = -1;
        }

        // Shield input
        if (this.spaceKey.isDown || this.shiftKey.isDown) {
            keyboardShield = true;
        }

        // Combine keyboard and touch input (keyboard overrides touch if active)
        if (keyboardX !== 0 || keyboardY !== 0 || keyboardShield) {
            this.inputState.inputX = keyboardX;
            this.inputState.inputY = keyboardY;
            this.inputState.shieldInput = keyboardShield;
        }
    }

    updateUIDisplay() {
        // Update joystick visual
        this.uiManager.updateJoystick(this.inputState.inputX, this.inputState.inputY);
    }

    handleSpecialKeys() {
        // ESC key to show/hide game info
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            if (this.uiManager.getGameState() === 'paused') {
                this.uiManager.hideGameInfo();
            } else if (this.uiManager.getGameState() === 'playing') {
                this.uiManager.showGameInfo();
            }
        }

        // Enter key to restart game (when game over or level complete)
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            const gameState = this.uiManager.getGameState();
            if (gameState === 'gameOver' || gameState === 'levelComplete') {
                this.scene.restartGame();
            }
        }
    }

    getInputState() {
        return { ...this.inputState };
    }

    reset() {
        this.inputState.inputX = 0;
        this.inputState.inputY = 0;
        this.inputState.shieldInput = false;
        this.touchData.joystickActive = false;
        this.touchData.joystickPointerId = null;
        this.touchData.shieldActive = false;
        this.touchData.shieldPointerId = null;
    }
}
