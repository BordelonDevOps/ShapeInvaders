// Boot Scene - Handles asset loading and initial setup
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load assets here
        this.load.setBaseURL('./assets/');
        
        // Load authentic Galaga sound effects
        this.load.audio('shoot', 'sounds/bullet.wav');
        this.load.audio('explosion', 'sounds/rocketexp.wav');
        this.load.audio('enemy_hit', 'sounds/crabDestroy.wav');
        this.load.audio('boss_hit', 'sounds/bossDestroy_1.wav');
        this.load.audio('boss_destroy', 'sounds/bossDestroy_2.wav');
        this.load.audio('missile', 'sounds/attack.wav');
        this.load.audio('level_up', 'sounds/levelup.wav');
        this.load.audio('game_over', 'sounds/gameOver.wav');
        this.load.audio('intro', 'sounds/intro.wav');
        this.load.audio('capture', 'sounds/captive.wav');
        this.load.audio('score_up', 'sounds/scoreUp.wav');
        this.load.audio('tractor_beam', 'sounds/pullRocket.wav');
        
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        const percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        
        // Update loading bar as assets load
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
            percentText.setText(parseInt(value * 100) + '%');
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
    }

    create() {
        // Initialize sound system
        console.log('Initializing sound system...');
        
        // Explicitly unlock audio context for browsers that require user interaction
        this.sound.once('unlocked', () => {
            console.log('Audio unlocked successfully');
        });
        
        // Test sound playback
        this.sound.add('intro').once('decoded', () => {
            console.log('Intro sound decoded successfully');
        });
        
        // Start title scene
        this.scene.start('TitleScene');
    }
}
