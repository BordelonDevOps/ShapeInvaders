// Projectile entity class
class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, angle, speed = 10, damage = 10, size = 5, color = 0xFFFFFF, isPlayerProjectile = true) {
        super(scene, x, y, isPlayerProjectile ? 'projectile' : 'enemy_projectile');
        
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        // Projectile properties
        this.damage = damage;
        this.size = size;
        this.color = color;
        this.isPlayerProjectile = isPlayerProjectile;
        
        // Set velocity based on angle and speed
        const radians = Phaser.Math.DegToRad(angle);
        this.setVelocity(
            speed * Math.cos(radians) * 10,
            speed * Math.sin(radians) * 10
        );
        
        // Set rotation to match angle
        this.setRotation(radians);
        
        // Create graphics for projectile
        this.graphics = this.scene.add.graphics();
        this.drawProjectile();
        
        // Set body size
        this.setSize(size * 2, size * 2);
    }
    
    drawProjectile() {
        this.graphics.clear();
        this.graphics.fillStyle(this.color, 1);
        this.graphics.fillCircle(this.x, this.y, this.size);
    }
    
    update() {
        // Update position of graphics
        this.drawProjectile();
        
        // Check if projectile is out of bounds
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;
        
        if (this.x < -50 || this.x > width + 50 || this.y < -50 || this.y > height + 50) {
            this.destroy();
        }
    }
    
    destroy() {
        if (this.graphics) {
            this.graphics.clear();
        }
        super.destroy();
    }
}
