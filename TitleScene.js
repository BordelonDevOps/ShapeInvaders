// Title Scene - Game start menu
class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
        this.titleText = null;
        this.startButton = null;
        this.stars = [];
        this.introMusic = null;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Play intro music
        this.introMusic = this.sound.add('intro', { 
            volume: 0.7,
            loop: true
        });
        
        // Play intro music with a try-catch to handle any errors
        try {
            this.introMusic.play();
            console.log('Intro music started playing');
        } catch (error) {
            console.error('Error playing intro music:', error);
        }
        
        // Create starfield background
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
        
        // Title text with animation
        this.titleText = this.add.text(width / 2, height / 3, 'SHAPE INVADERS', {
            fontFamily: 'Arial',
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#FFFF00',
            align: 'center'
        });
        this.titleText.setOrigin(0.5);
        
        // Pulsing animation for title
        this.tweens.add({
            targets: this.titleText,
            scale: { from: 1, to: 1.1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Enemy showcase with point values
        const enemyTypes = [
            { shape: 'triangle', color: 0xFF0000, points: 100, y: height / 2 },
            { shape: 'circle', color: 0xFFFF00, points: 150, y: height / 2 + 50 },
            { shape: 'square', color: 0x0000FF, points: 200, y: height / 2 + 100 },
            { shape: 'hexagon', color: 0x800080, points: 1000, y: height / 2 + 150 }
        ];
        
        enemyTypes.forEach(enemy => {
            // Draw enemy shape
            const graphics = this.add.graphics();
            graphics.lineStyle(2, enemy.color, 1);
            
            if (enemy.shape === 'triangle') {
                graphics.strokeTriangle(width / 2 - 100, enemy.y, width / 2 - 80, enemy.y - 20, width / 2 - 60, enemy.y);
            } else if (enemy.shape === 'circle') {
                graphics.strokeCircle(width / 2 - 80, enemy.y, 10);
            } else if (enemy.shape === 'square') {
                graphics.strokeRect(width / 2 - 90, enemy.y - 10, 20, 20);
            } else if (enemy.shape === 'hexagon') {
                const hexagonPoints = [];
                for (let i = 0; i < 6; i++) {
                    const angle = Phaser.Math.TAU * i / 6;
                    hexagonPoints.push({
                        x: width / 2 - 80 + 15 * Math.cos(angle),
                        y: enemy.y + 15 * Math.sin(angle)
                    });
                }
                graphics.beginPath();
                graphics.moveTo(hexagonPoints[0].x, hexagonPoints[0].y);
                for (let i = 1; i < 6; i++) {
                    graphics.lineTo(hexagonPoints[i].x, hexagonPoints[i].y);
                }
                graphics.closePath();
                graphics.strokePath();
            }
            
            // Add point value text
            this.add.text(width / 2, enemy.y, `= ${enemy.points} PTS`, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#FFFFFF'
            }).setOrigin(0, 0.5);
        });
        
        // Start button
        this.startButton = this.add.text(width / 2, height * 0.75, 'START', {
            fontFamily: 'Arial',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            backgroundColor: '#222222',
            padding: { x: 20, y: 10 }
        });
        this.startButton.setOrigin(0.5);
        this.startButton.setInteractive({ useHandCursor: true });
        
        // Button hover effect
        this.startButton.on('pointerover', () => {
            this.startButton.setStyle({ color: '#FFFF00' });
            // Play sound on hover
            this.sound.play('score_up');
        });
        
        this.startButton.on('pointerout', () => {
            this.startButton.setStyle({ color: '#FFFFFF' });
        });
        
        // Start game on button click
        this.startButton.on('pointerdown', () => {
            // Play sound on click
            this.sound.play('shoot');
            
            // Stop intro music
            if (this.introMusic && this.introMusic.isPlaying) {
                this.introMusic.stop();
            }
            
            this.scene.start('GameScene');
        });
        
        // Copyright and controls text
        this.add.text(width / 2, height - 80, 'Copyright © 2025 Christopher Bordelon', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, height - 50, 'CONTROLS: MOUSE to move, LEFT CLICK to shoot, RIGHT CLICK for missile', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Add 1UP and HIGH SCORE display
        this.add.text(width / 4, 20, '1UP', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.add.text(width / 4, 50, '00000', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.add.text(width * 3/4, 20, 'HIGH SCORE', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.add.text(width * 3/4, 50, '00000', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
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
    
    shutdown() {
        // Clean up resources when leaving this scene
        if (this.introMusic && this.introMusic.isPlaying) {
            this.introMusic.stop();
        }
    }
}
