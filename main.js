// Main game entry point - Fixed version
// Define config first to ensure it's available globally
const gameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#000000',
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        TitleScene,
        GameScene,
        GameOverScene
    ]
};

// Make config available globally
window.config = gameConfig;

// Main initialization function
window.onload = function() {
    // Create Phaser game instance with config
    let gameInstance = null;
    
    // Function to initialize game
    function initGame() {
        try {
            console.log('Initializing Shape Invaders game...');
            
            // Create Phaser game instance
            gameInstance = new Phaser.Game(gameConfig);
            
            // Run tests after game is created if tests are available
            if (typeof tests !== 'undefined') {
                setTimeout(function() {
                    if (gameInstance) {
                        console.log('Running tests...');
                        tests.runAllTests(gameInstance);
                    }
                }, 2000); // Wait longer to ensure all components are loaded
            }
            
        } catch (error) {
            console.error("Error initializing game:", error);
        }
    }
    
    // Start game initialization
    initGame();
    
    // Add favicon to prevent 404 error
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGwSURBVFhH7ZY9TsNAEIUdKfwTKWgQBUUkCnquwBE4AEeg5wLQcQXOQEFFRwMFFBSIAilCCCUCvzeeddZre+1kHSHxpJHt3Zl5M7uzY6ejlZSUlJQMjYHv+/dN0xzgPMSO2TRwfyzeR/mK2TXO4RsZ7zBdnNPoFc5pnFP8+Q3X8Qv3ucL1hmM/6rp+xTmDc4xrGtczrufwHsY1bLQQgh3oBGcD5zTOBc4DnGucG5w7OPcQ7wnXJs4Jzj7OCc5tnKs4F3AeI9wLnFucB5wnODdxTuEc4xw1WghBBnSCcwPnNM4FnIc41zjFe4dzH+ER4trEOcE5wbmNcxXnAs5jhHuBcxvnAc4TnJs4p3COcY4aLYTQdwLGONdxTuNcwHmIc41TvHc49xEeIa5NnBOcE5zbOFdxLuA8RrgXOLdxHuA8wbmJcwrnGOeo0UIIPSdgjHMd5zTOBZyHONc4xXuHcx/hEeLaxDnBOcG5jXMV5wLOY4R7gXMb5wHOE5ybOKdwjnGOGi2E0HMCxjjXcU7jXMB5iHONU7x3OPcRHiGuTZwTnBOc2zhXcS7gPEa4Fzi3cR7gPMG5iXMK5xjnqNFCCCUlJSX/nU7nB3A87xgslDu3AAAAAElFTkSuQmCC';
    document.head.appendChild(link);
};
