// Visual effects manager for Shape Invaders
class EffectsManager {
    constructor(scene) {
        this.scene = scene;
        this.particles = {};
        this.animations = {};
        
        // Initialize particle systems
        this.initializeParticles();
    }
    
    initializeParticles() {
        // Create particle textures if they don't exist
        if (!this.scene.textures.exists('particle')) {
            const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0xFFFFFF, 1);
            graphics.fillCircle(4, 4, 4);
            graphics.generateTexture('particle', 8, 8);
        }
        
        // Create star particle
        if (!this.scene.textures.exists('star_particle')) {
            const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0xFFFFFF, 1);
            
            // Draw a simple star shape
            const points = [];
            for (let i = 0; i < 5; i++) {
                const angle = (i * 72) * Math.PI / 180;
                points.push({
                    x: 4 + 4 * Math.cos(angle),
                    y: 4 + 4 * Math.sin(angle)
                });
                
                const innerAngle = ((i * 72) + 36) * Math.PI / 180;
                points.push({
                    x: 4 + 2 * Math.cos(innerAngle),
                    y: 4 + 2 * Math.sin(innerAngle)
                });
            }
            
            graphics.beginPath();
            graphics.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                graphics.lineTo(points[i].x, points[i].y);
            }
            graphics.closePath();
            graphics.fill();
            
            graphics.generateTexture('star_particle', 8, 8);
        }
    }
    
    createExplosion(x, y, color = 0xFFFFFF, size = 50) {
        // Create particle emitter for explosion
        const particles = this.scene.add.particles(x, y, 'particle', {
            speed: { min: 50, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            lifespan: 500,
            blendMode: 'ADD',
            tint: color,
            quantity: 20
        });
        
        // Add a flash effect
        const flash = this.scene.add.circle(x, y, size / 2, color, 0.7);
        
        // Fade out flash
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Auto-destroy particles after animation completes
        this.scene.time.delayedCall(500, () => {
            particles.destroy();
        });
        
        return particles;
    }
    
    createBossExplosion(x, y) {
        // Create multiple explosions for boss
        for (let i = 0; i < 5; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                const offsetX = Phaser.Math.Between(-30, 30);
                const offsetY = Phaser.Math.Between(-30, 30);
                const color = Phaser.Utils.Array.GetRandom([0xFF0000, 0xFFFF00, 0xFF00FF, 0x00FFFF]);
                this.createExplosion(x + offsetX, y + offsetY, color, 40);
            });
        }
        
        // Final large explosion
        this.scene.time.delayedCall(1000, () => {
            this.createExplosion(x, y, 0xFFFFFF, 100);
        });
    }
    
    createPowerUpEffect(x, y, color) {
        // Create particle effect for power-up collection
        const particles = this.scene.add.particles(x, y, 'star_particle', {
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            blendMode: 'ADD',
            tint: color,
            quantity: 15
        });
        
        // Add a flash effect
        const flash = this.scene.add.circle(x, y, 30, color, 0.7);
        
        // Fade out flash
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Auto-destroy after animation completes
        this.scene.time.delayedCall(300, () => {
            particles.destroy();
        });
        
        return particles;
    }
    
    createTractorBeam(startX, startY, endX, endY, color = 0x800080) {
        // Create tractor beam graphics
        const beam = this.scene.add.graphics();
        beam.lineStyle(4, color, 0.8);
        beam.lineBetween(startX, startY, endX, endY);
        
        // Add pulsing effect
        this.scene.tweens.add({
            targets: beam,
            alpha: 0.2,
            duration: 200,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                beam.destroy();
            }
        });
        
        // Add particle effect along the beam
        const particles = this.scene.add.particles(startX, startY, 'particle', {
            speed: 100,
            lifespan: 300,
            blendMode: 'ADD',
            tint: color,
            scale: { start: 0.5, end: 0 },
            emitting: true,
            quantity: 2,
            emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Line(startX, startY, endX, endY),
                quantity: 10
            }
        });
        
        // Auto-destroy particles after beam is gone
        this.scene.time.delayedCall(1200, () => {
            particles.destroy();
        });
        
        return beam;
    }
    
    createMissileTrail(missile) {
        // Create particle emitter for missile trail
        const particles = this.scene.add.particles(missile.x, missile.y, 'particle', {
            follow: missile,
            followOffset: { y: 10 },
            speed: { min: 10, max: 30 },
            angle: { min: 80, max: 100 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            blendMode: 'ADD',
            tint: 0xFFFF00,
            frequency: 10
        });
        
        // Destroy particles when missile is destroyed
        missile.on('destroy', () => {
            particles.destroy();
        });
        
        return particles;
    }
    
    createStarfield(count = 100) {
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;
        const stars = [];
        
        for (let i = 0; i < count; i++) {
            const star = this.scene.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(1, 3),
                0xFFFFFF,
                Phaser.Math.Between(0.3, 1)
            );
            star.speed = Phaser.Math.Between(1, 3);
            stars.push(star);
        }
        
        return stars;
    }
    
    updateStarfield(stars) {
        const height = this.scene.game.config.height;
        const width = this.scene.game.config.width;
        
        stars.forEach(star => {
            star.y += star.speed;
            if (star.y > height) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, width);
            }
        });
    }
    
    createWaveAnnouncement(text) {
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;
        
        const announcement = this.scene.add.text(width / 2, height / 2, text, {
            fontFamily: 'Arial',
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 5,
                stroke: true,
                fill: true
            }
        });
        announcement.setOrigin(0.5);
        
        // Add scale effect
        this.scene.tweens.add({
            targets: announcement,
            scale: { from: 0.5, to: 1 },
            duration: 500,
            ease: 'Back.out'
        });
        
        // Fade out announcement
        this.scene.tweens.add({
            targets: announcement,
            alpha: 0,
            y: height / 2 - 50,
            delay: 1500,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                announcement.destroy();
            }
        });
        
        return announcement;
    }
    
    createUnlockMessage(message) {
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;
        
        const unlockText = this.scene.add.text(width / 2, height / 3, message, {
            fontFamily: 'Arial',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#FFFF00',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 5,
                stroke: true,
                fill: true
            }
        });
        unlockText.setOrigin(0.5);
        
        // Add scale effect
        this.scene.tweens.add({
            targets: unlockText,
            scale: { from: 0.5, to: 1 },
            duration: 500,
            ease: 'Back.out'
        });
        
        // Fade out message
        this.scene.tweens.add({
            targets: unlockText,
            alpha: 0,
            y: height / 3 - 50,
            delay: 1500,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                unlockText.destroy();
            }
        });
        
        return unlockText;
    }
}
