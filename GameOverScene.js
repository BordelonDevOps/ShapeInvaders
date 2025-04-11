// Game Over Scene
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
        this.score = 0;
    }

    init(data) {
        this.score = data.score || 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create starfield background
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(1, 3),
                0xFFFFFF,
                Phaser.Math.Between(0.3, 1)
            );
            star.speed = Phaser.Math.Between(1, 3);
            this.stars.push(star);
        }
        
        // Game over text
        this.add.text(width / 2, height / 3, 'GAME OVER', {
            fontFamily: 'Arial',
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#FF0000',
            align: 'center'
        }).setOrigin(0.5);
        
        // Score text
        this.add.text(width / 2, height / 2, `Final Score: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Check for high score
        let highScore = localStorage.getItem('shapeInvadersHighScore') || 0;
        highScore = parseInt(highScore);
        
        if (this.score > highScore) {
            // New high score
            localStorage.setItem('shapeInvadersHighScore', this.score);
            highScore = this.score;
            
            this.add.text(width / 2, height / 2 + 50, 'NEW HIGH SCORE!', {
                fontFamily: 'Arial',
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#FFFF00',
                align: 'center'
            }).setOrigin(0.5);
        }
        
        // Display high score
        this.add.text(width / 2, height / 2 + 100, `High Score: ${highScore}`, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Restart button
        const restartButton = this.add.text(width / 2, height * 0.7, 'PLAY AGAIN', {
            fontFamily: 'Arial',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            backgroundColor: '#222222',
            padding: { x: 20, y: 10 }
        });
        restartButton.setOrigin(0.5);
        restartButton.setInteractive({ useHandCursor: true });
        
        // Button hover effect
        restartButton.on('pointerover', () => {
            restartButton.setStyle({ color: '#FFFF00' });
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setStyle({ color: '#FFFFFF' });
        });
        
        // Restart game on button click
        restartButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        
        // Main menu button
        const menuButton = this.add.text(width / 2, height * 0.8, 'MAIN MENU', {
            fontFamily: 'Arial',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            backgroundColor: '#222222',
            padding: { x: 20, y: 10 }
        });
        menuButton.setOrigin(0.5);
        menuButton.setInteractive({ useHandCursor: true });
        
        // Button hover effect
        menuButton.on('pointerover', () => {
            menuButton.setStyle({ color: '#FFFF00' });
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setStyle({ color: '#FFFFFF' });
        });
        
        // Return to title screen on button click
        menuButton.on('pointerdown', () => {
            this.scene.start('TitleScene');
        });
    }
    
    update() {
        // Animate stars
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.cameras.main.height) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, this.cameras.main.width);
            }
        });
    }
}
