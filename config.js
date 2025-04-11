// Update the config.js file to ensure it's properly defined
// Game configuration
const config = {
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
