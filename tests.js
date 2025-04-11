// Create a test script to verify game functionality
// This will help identify and fix any issues before final deployment

// Test cases for Shape Invaders
const tests = {
    // Test basic game initialization
    testGameInitialization: function(game) {
        console.log("Testing game initialization...");
        
        // Check if Phaser is loaded
        if (typeof Phaser === 'undefined') {
            console.error("❌ Phaser library not loaded");
            return false;
        }
        
        // Check if game instance exists
        if (!game) {
            console.error("❌ Game instance not available");
            return false;
        }
        
        // Check if game config exists
        if (!game.config) {
            console.error("❌ Game config not defined");
            return false;
        }
        
        // Check if required scenes are included
        const requiredScenes = ['BootScene', 'TitleScene', 'GameScene', 'GameOverScene'];
        const gameScenes = game.scene.scenes.map(scene => scene.constructor.name);
        
        for (const scene of requiredScenes) {
            if (!gameScenes.includes(scene)) {
                console.error(`❌ Required scene ${scene} not included in game`);
                return false;
            }
        }
        
        console.log("✅ Game initialization tests passed");
        return true;
    },
    
    // Test player functionality
    testPlayerFunctionality: function() {
        console.log("Testing player functionality...");
        
        // Check if Player class is defined
        if (typeof Player === 'undefined') {
            console.error("❌ Player class not defined");
            return false;
        }
        
        // Check if required methods exist on Player prototype
        const requiredMethods = ['update', 'shoot', 'fireMissile', 'takeDamage', 'applyPowerUp'];
        
        for (const method of requiredMethods) {
            if (typeof Player.prototype[method] !== 'function') {
                console.error(`❌ Required method ${method} not defined on Player`);
                return false;
            }
        }
        
        console.log("✅ Player functionality tests passed");
        return true;
    },
    
    // Test enemy functionality
    testEnemyFunctionality: function() {
        console.log("Testing enemy functionality...");
        
        // Check if Enemy class is defined
        if (typeof Enemy === 'undefined') {
            console.error("❌ Enemy class not defined");
            return false;
        }
        
        // Check if required methods exist on Enemy prototype
        const requiredMethods = ['update', 'takeDamage', 'startDiving', 'followDivePattern'];
        
        for (const method of requiredMethods) {
            if (typeof Enemy.prototype[method] !== 'function') {
                console.error(`❌ Required method ${method} not defined on Enemy`);
                return false;
            }
        }
        
        console.log("✅ Enemy functionality tests passed");
        return true;
    },
    
    // Test enemy patterns
    testEnemyPatterns: function() {
        console.log("Testing enemy patterns...");
        
        // Check if EnemyPatterns class is defined
        if (typeof EnemyPatterns === 'undefined') {
            console.error("❌ EnemyPatterns class not defined");
            return false;
        }
        
        // Check if required methods exist on EnemyPatterns prototype
        const requiredMethods = [
            'directDive', 'loopAttack', 'sCurveAttack', 
            'groupAttack', 'formationEntry', 'bossAttack', 'capturePattern'
        ];
        
        for (const method of requiredMethods) {
            if (typeof EnemyPatterns.prototype[method] !== 'function') {
                console.error(`❌ Required method ${method} not defined on EnemyPatterns`);
                return false;
            }
        }
        
        console.log("✅ Enemy patterns tests passed");
        return true;
    },
    
    // Test visual effects
    testVisualEffects: function() {
        console.log("Testing visual effects...");
        
        // Check if EffectsManager class is defined
        if (typeof EffectsManager === 'undefined') {
            console.error("❌ EffectsManager class not defined");
            return false;
        }
        
        // Check if required methods exist on EffectsManager prototype
        const requiredMethods = [
            'createExplosion', 'createPowerUpEffect', 'createTractorBeam',
            'createMissileTrail', 'createStarfield', 'updateStarfield'
        ];
        
        for (const method of requiredMethods) {
            if (typeof EffectsManager.prototype[method] !== 'function') {
                console.error(`❌ Required method ${method} not defined on EffectsManager`);
                return false;
            }
        }
        
        console.log("✅ Visual effects tests passed");
        return true;
    },
    
    // Test game scene functionality
    testGameScene: function() {
        console.log("Testing game scene functionality...");
        
        // Check if GameScene class is defined
        if (typeof GameScene === 'undefined') {
            console.error("❌ GameScene class not defined");
            return false;
        }
        
        // Check if required methods exist on GameScene prototype
        const requiredMethods = [
            'create', 'update', 'spawnWave', 'spawnEnemies',
            'triggerEnemyAttack', 'checkCollisions', 'createExplosion'
        ];
        
        for (const method of requiredMethods) {
            if (typeof GameScene.prototype[method] !== 'function') {
                console.error(`❌ Required method ${method} not defined on GameScene`);
                return false;
            }
        }
        
        console.log("✅ Game scene functionality tests passed");
        return true;
    },
    
    // Run all tests
    runAllTests: function(game) {
        console.log("Running all tests for Shape Invaders...");
        
        let allPassed = true;
        
        // Run each test and track results
        allPassed = this.testGameInitialization(game) && allPassed;
        allPassed = this.testPlayerFunctionality() && allPassed;
        allPassed = this.testEnemyFunctionality() && allPassed;
        allPassed = this.testEnemyPatterns() && allPassed;
        allPassed = this.testVisualEffects() && allPassed;
        allPassed = this.testGameScene() && allPassed;
        
        if (allPassed) {
            console.log("🎮 All tests passed! The game is ready for deployment.");
        } else {
            console.error("❌ Some tests failed. Please fix the issues before deployment.");
        }
        
        return allPassed;
    }
};

// Modified main.js to include test integration
window.onload = function() {
    // Create Phaser game instance with config
    let gameInstance = null;
    
    // Function to initialize game after tests
    function initGame() {
        try {
            // Create Phaser game instance
            gameInstance = new Phaser.Game(config);
            
            // Run tests after game is created
            setTimeout(function() {
                if (gameInstance) {
                    tests.runAllTests(gameInstance);
                }
            }, 2000); // Wait longer to ensure all components are loaded
            
        } catch (error) {
            console.error("Error initializing game:", error);
        }
    }
    
    // Start game initialization
    if (typeof config !== 'undefined') {
        initGame();
    } else {
        console.error("Game config not available. Tests cannot run.");
    }
};
