// Game constants and configuration
export const GAME_CONFIG = {
    // Physics constants
    GRAVITY: 1000,
    FIREBALL_GRAVITY: 500,
    PLAYER_SPEED: 200,
    JUMP_VELOCITY: -650,
    TERMINAL_VELOCITY: 800,
    FIREBALL_TERMINAL: 600,
    
    // Game mechanics
    MAX_PLAYER_HEALTH: 3,
    MAX_SHIELD_HEALTH: 3,
    FIREBALL_INTERVAL: 0.4,
    INVULNERABILITY_DURATION: 2,
    CLOUD_DISAPPEAR_TIME: 5,
    
    // UI constants
    JOYSTICK_RADIUS: 60,
    COLLISION_DISTANCE: 40,
    
    // Screen dimensions
    SCREEN_WIDTH: 1920,
    SCREEN_HEIGHT: 1080,
    
    // Game states
    STATES: {
        START: 'START',
        PLAYING: 'PLAYING',
        GAME_OVER: 'GAME_OVER',
        LEVEL_COMPLETE: 'LEVEL_COMPLETE',
        DYING: 'DYING'
    }
};

// Cloud layout data
export const CLOUD_DATA = [
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

// Gem positions
export const GEM_POSITIONS = [
    { x: 450, y: 720 },  // On second cloud
    { x: 700, y: 620 },  // On third cloud
    { x: 1000, y: 420 }, // On fifth cloud
];

// Fireball target positions
export const FIREBALL_TARGETS = [
    { x: 200, y: 850 },   // Starting cloud
    { x: 450, y: 750 },   // Second cloud
    { x: 700, y: 650 },   // Third cloud
    { x: 800, y: 550 },   // Fourth cloud (key)
    { x: 1000, y: 450 },  // Fifth cloud
    { x: 1200, y: 350 },  // Sixth cloud
    { x: 1350, y: 280 },  // Seventh cloud
    { x: 1500, y: 250 }   // Final cloud (gate)
];

// Asset paths
export const ASSETS = {
    IMAGES: {
        BG_FULL: 'BG full.png',
        BLURRED_BG: 'Blurred BG.png',
        PLAYER: 'Psyger-0.png',
        SUN: 'Suhn.png',
        FIREBALL: 'Fireball.png',
        CLOUD_1: 'Cloud 1.png',
        CLOUD_2: 'Cloud 2.png',
        CLOUD_3: 'Cloud 3.png',
        GEM: 'Gem.png',
        KEY: 'Key.png',
        GATE_CLOSE: 'Gate close.png',
        GATE_OPEN: 'Gate open.png',
        SHIELD: 'Shield.png',
        SHIELD_BUTTON: 'Shield button.png',
        GAME_INFO: 'Game Info.png',
        GAME_OVER: 'Game over.png',
        LEVEL_COMPLETED: 'Level completed.png',
        HEALTH_1: 'Health 1.png',
        HEALTH_2: 'health 2.png',
        HEALTH_3: 'Health 3.png',
        SHIELD_1: 'Shield 1.png',
        SHIELD_2: 'Shield 2.png',
        SHIELD_3: 'Shield 3.png',
        JOYSTICK_1: 'Joystick 1.png',
        JOYSTICK_2: 'Joystick 2.png',
        JOYSTICK_3: 'Joystick 3.png'
    }
};
