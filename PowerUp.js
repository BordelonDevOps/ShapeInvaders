// PowerUp entity class
class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        super(scene, x, y, 'powerup');
        
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        // PowerUp properties
        this.powerUpType = type;
        this.size = 15;
        
        // Color mapping for different power-up types
        this.colors = {
            'rapid': 0xFFFF00,    // Yellow
            'spread': 0x0000FF,   // Blue
            'shield': 0x800080,   // Purple
            'damage': 0xFF0000,   // Red
            'speed': 0x00FF00     // Green
        };
        
        // Create graphics for power-up
        this.graphics = this.scene.add.graphics();
        this.drawPowerUp();
        
        // Set body size
        this.setSize(this.size * 2, this.size * 2);
        
        // Add floating animation
        this.scene.tweens.add({
            targets: this,
            y: y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    drawPowerUp() {
        this.graphics.clear();
        
        // Draw power-up as a circle with the appropriate color
        this.graphics.fillStyle(this.colors[this.powerUpType], 1);
        this.graphics.fillCircle(this.x, this.y, this.size);
        
        // Add inner circle with white color
        this.graphics.fillStyle(0xFFFFFF, 0.7);
        this.graphics.fillCircle(this.x, this.y, this.size / 2);
    }
    
    update() {
        // Update position of graphics
        this.drawPowerUp();
    }
    
    collect(player) {
        // Apply power-up effect to player
        player.applyPowerUp(this.powerUpType);
        
        // Create collection effect
        this.scene.createPowerUpEffect(this.x, this.y, this.colors[this.powerUpType]);
        
        // Remove from scene
        this.graphics.clear();
        this.destroy();
    }
    
    destroy() {
        if (this.graphics) {
            this.graphics.clear();
        }
        super.destroy();
    }
}
