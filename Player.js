// Update Player.js to enhance mouse controls
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        // Player properties
        this.baseSpeed = 5;
        this.speed = this.baseSpeed;
        this.health = 100;
        this.maxHealth = 100;
        this.score = 0;
        this.lives = 3;
        
        // Shooting properties
        this.projectiles = this.scene.physics.add.group();
        this.shootCooldown = 0;
        this.baseShootCooldown = 15;
        this.damageMultiplier = 1.0;
        this.autoFire = false;
        this.autoFireTimer = null;
        
        // Missile properties
        this.missiles = 3;
        this.missileReady = true;
        this.missileCooldown = 0;
        
        // Shape properties
        this.shape = 'triangle';
        this.unlocked = ['triangle'];
        this.bulletPatterns = {
            'triangle': { spread: 0, bullets: 1 },
            'circle': { spread: 15, bullets: 3 },
            'square': { spread: 0, bullets: 4 }
        };
        
        // Power-up properties
        this.powerUpTimer = 0;
        this.powerUpType = null;
        
        // Dual fighter properties
        this.dualFighter = false;
        this.dualFighterOffset = 20;
        
        // Invincibility frames
        this.iframes = 0;
        
        // Create graphics for player shape
        this.graphics = this.scene.add.graphics();
        this.drawShape();
        
        // Set body size
        this.setSize(40, 40);
        this.setCollideWorldBounds(true);
        
        // Setup mouse controls
        this.setupMouseControls();
    }
    
    setupMouseControls() {
        // Setup continuous fire on mouse hold
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.autoFire = true;
                this.shoot();
                
                // Setup auto-fire timer
                this.autoFireTimer = this.scene.time.addEvent({
                    delay: this.baseShootCooldown * 16.67, // Convert frames to ms (60fps)
                    callback: this.shoot,
                    callbackScope: this,
                    loop: true
                });
            }
        });
        
        this.scene.input.on('pointerup', (pointer) => {
            if (!pointer.leftButtonDown()) {
                this.autoFire = false;
                if (this.autoFireTimer) {
                    this.autoFireTimer.remove();
                    this.autoFireTimer = null;
                }
            }
        });
        
        // Add keyboard controls for shape switching
        this.scene.input.keyboard.on('keydown-ONE', () => {
            if (this.unlocked.includes('triangle')) {
                this.shape = 'triangle';
            }
        });
        
        this.scene.input.keyboard.on('keydown-TWO', () => {
            if (this.unlocked.includes('circle')) {
                this.shape = 'circle';
            }
        });
        
        this.scene.input.keyboard.on('keydown-THREE', () => {
            if (this.unlocked.includes('square')) {
                this.shape = 'square';
            }
        });
    }
    
    drawShape() {
        this.graphics.clear();
        
        // Determine color based on state
        let color = 0xFFFFFF; // Default white
        
        if (this.iframes > 0 && this.scene.time.now % 200 < 100) {
            color = 0x00FF00; // Flash green when invincible
        } else if (this.powerUpType) {
            // Color based on power-up
            if (this.powerUpType === 'rapid') color = 0xFFFF00;
            else if (this.powerUpType === 'spread') color = 0x0000FF;
            else if (this.powerUpType === 'shield') color = 0x800080;
            else if (this.powerUpType === 'damage') color = 0xFF0000;
            else if (this.powerUpType === 'speed') color = 0x00FF00;
            else if (this.powerUpType === 'dual') color = 0xFFA500;
        }
        
        this.graphics.lineStyle(2, color, 1);
        
        // Draw main ship
        this.drawShipShape(this.x, this.y, this.shape, color);
        
        // Draw dual fighter if active
        if (this.dualFighter) {
            this.drawShipShape(this.x - this.dualFighterOffset, this.y, this.shape, color);
        }
        
        // Draw health bar
        const healthWidth = 40 * (this.health / this.maxHealth);
        this.graphics.fillStyle(0xFF0000, 1);
        this.graphics.fillRect(this.x - 20, this.y - 30, 40, 5);
        this.graphics.fillStyle(0x00FF00, 1);
        this.graphics.fillRect(this.x - 20, this.y - 30, healthWidth, 5);
        
        // Draw power-up timer if active
        if (this.powerUpTimer > 0) {
            const timerWidth = 40 * (this.powerUpTimer / 300);
            this.graphics.fillStyle(0xFFA500, 1);
            this.graphics.fillRect(this.x - 20, this.y - 25, timerWidth, 3);
        }
    }
    
    drawShipShape(x, y, shape, color) {
        // Draw shape based on current form
        if (shape === 'triangle') {
            this.graphics.strokeTriangle(
                x, y - 20,
                x - 15, y + 10,
                x + 15, y + 10
            );
        } else if (shape === 'circle') {
            this.graphics.strokeCircle(x, y, 20);
        } else if (shape === 'square') {
            this.graphics.strokeRect(x - 15, y - 15, 30, 30);
        }
    }
    
    update() {
        // Update cooldowns
        if (this.shootCooldown > 0) this.shootCooldown--;
        if (this.missileCooldown > 0) this.missileCooldown--;
        if (this.iframes > 0) this.iframes--;
        if (this.powerUpTimer > 0) {
            this.powerUpTimer--;
            if (this.powerUpTimer <= 0) {
                // Reset power-up effects
                this.powerUpType = null;
                this.shootCooldown = this.baseShootCooldown;
                this.speed = this.baseSpeed;
                this.damageMultiplier = 1.0;
                
                // Reset dual fighter if it was from a power-up
                if (this.powerUpType === 'dual') {
                    this.dualFighter = false;
                }
            }
        }
        
        // Update position based on mouse with smooth movement
        const pointer = this.scene.input.activePointer;
        const targetX = Phaser.Math.Clamp(pointer.x, 20, this.scene.game.config.width - 20);
        
        // Smooth movement with acceleration/deceleration
        const distance = targetX - this.x;
        const absDistance = Math.abs(distance);
        
        if (absDistance > 1) {
            // Calculate speed based on distance (faster when further away)
            const moveSpeed = Math.min(this.speed * 2, Math.max(this.speed, absDistance * 0.1));
            
            // Move towards target
            this.x += (distance / absDistance) * moveSpeed;
        } else {
            // Close enough, snap to position
            this.x = targetX;
        }
        
        // Redraw shape
        this.drawShape();
        
        // Auto-fire if button is held down
        if (this.autoFire && this.shootCooldown <= 0) {
            this.shoot();
        }
    }
    
    shoot() {
        if (this.shootCooldown <= 0) {
            const pattern = this.bulletPatterns[this.shape];
            const baseDamage = 10 * this.damageMultiplier;
            
            // Main ship shooting
            this.fireFromPosition(this.x, this.y, pattern, baseDamage);
            
            // Dual fighter shooting
            if (this.dualFighter) {
                this.fireFromPosition(this.x - this.dualFighterOffset, this.y, pattern, baseDamage);
            }
            
            this.shootCooldown = this.baseShootCooldown;
        }
    }
    
    fireFromPosition(x, y, pattern, baseDamage) {
        if (pattern.bullets === 1) {
            this.fireProjectile(x, y, 0, baseDamage);
        } else {
            const spread = pattern.spread;
            for (let i = 0; i < pattern.bullets; i++) {
                let angleOffset;
                if (pattern.bullets > 2) {
                    angleOffset = i * (360 / pattern.bullets);
                } else {
                    angleOffset = i === 0 ? -spread : (i === 1 ? 0 : spread);
                }
                this.fireProjectile(x, y, angleOffset, baseDamage * 0.8);
            }
        }
    }
    
    fireMissile() {
        if (this.missiles > 0 && this.missileReady) {
            // Create missile projectile
            const missile = this.scene.physics.add.sprite(this.x, this.y - 20, 'missile');
            missile.setVelocity(0, -300);
            missile.damage = 50 * this.damageMultiplier;
            missile.isMissile = true;
            
            // Add to projectiles group
            this.projectiles.add(missile);
            
            // Reduce missile count and set cooldown
            this.missiles--;
            this.missileReady = false;
            this.missileCooldown = 60;
            
            // Reset missile ready state after cooldown
            this.scene.time.delayedCall(1000, () => {
                this.missileReady = true;
            });
            
            // Create missile trail effect
            this.createMissileTrail(missile);
        }
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
    }
    
    fireProjectile(x, y, angleOffset, damage) {
        const angle = -90 + angleOffset; // -90 is up
        const radians = Phaser.Math.DegToRad(angle);
        
        const projectile = this.scene.physics.add.sprite(
            x + 20 * Math.cos(radians),
            y + 20 * Math.sin(radians),
            'projectile'
        );
        
        const speed = 10;
        projectile.setVelocity(
            speed * Math.cos(radians) * 10,
            speed * Math.sin(radians) * 10
        );
        
        projectile.damage = damage;
        projectile.angle = angle;
        
        this.projectiles.add(projectile);
    }
    
    takeDamage(amount) {
        if (this.iframes <= 0) {
            this.health -= amount;
            this.iframes = 60; // 1 second of invincibility
            
            // Create hit effect
            this.scene.createExplosion(this.x, this.y, 0xFF0000, 30);
            
            if (this.health <= 0) {
                this.die();
            }
        }
    }
    
    die() {
        // Create explosion effect
        this.scene.createExplosion(this.x, this.y, 0xFF0000, 50);
        
        this.lives--;
        
        if (this.lives > 0) {
            // Reset player for next life
            this.health = this.maxHealth;
            this.x = this.scene.game.config.width / 2;
            this.y = this.scene.game.config.height - 100;
            this.iframes = 180; // 3 seconds of invincibility on respawn
            
            // Reset power-ups
            this.powerUpType = null;
            this.powerUpTimer = 0;
            this.speed = this.baseSpeed;
            this.damageMultiplier = 1.0;
            this.dualFighter = false;
        } else {
            // Game over
            this.scene.gameOver();
        }
    }
    
    applyPowerUp(type) {
        this.powerUpType = type;
        this.powerUpTimer = 300; // 5 seconds
        
        switch (type) {
            case 'rapid':
                this.shootCooldown = 5;
                break;
            case 'spread':
                // Temporarily change to circle shape for spread shots
                this.previousShape = this.shape;
                this.shape = 'circle';
                break;
            case 'shield':
                this.iframes = 300;
                break;
            case 'damage':
                this.damageMultiplier = 2.0;
                break;
            case 'speed':
                this.speed = this.baseSpeed * 1.5;
                break;
            case 'dual':
                this.dualFighter = true;
                // Dual fighter is permanent until player dies
                this.powerUpTimer = 9999;
                break;
        }
        
        // Create power-up effect
        this.scene.createPowerUpEffect(this.x, this.y, 0xFFFFFF);
    }
}
