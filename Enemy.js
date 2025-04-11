class Enemy extends Phaser.GameObjects.Container {
    constructor(scene, x, y, enemyType = 'normal') {
        super(scene, x, y);
        this.scene = scene;
        this.enemyType = enemyType;
        
        // Set properties based on enemy type
        this.setEnemyProperties();
        
        // Create graphics for the enemy
        this.createGraphics();
        
        // Add to scene
        scene.add.existing(this);
        
        // Create collision body
        this.body = new Phaser.Geom.Rectangle(x - this.width/2, y - this.height/2, this.width, this.height);
        
        // Path following variables
        this.path = null;
        this.pathIndex = 0;
        this.pathSpeed = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        // Formation position
        this.formationX = 0;
        this.formationY = 0;
        
        // State machine
        this.state = 'spawning';
        this.stateTime = 0;
        
        // Add debug text
        this.debugText = this.scene.add.text(0, 0, '', { 
            fontSize: '10px', 
            fill: '#ffffff',
            backgroundColor: '#000000'
        });
        this.debugText.visible = false;
        
        // Shooting variables
        this.shootTimer = 0;
        this.shootDelay = Phaser.Math.Between(1000, 3000);
        
        // Tractor beam variables
        this.tractorBeamGraphics = null;
        this.tractorBeamActive = false;
        this.tractorBeamTime = 0;
        
        // Return path variables
        this.returnPath = null;
        this.returnPathIndex = 0;
    }
    
    setEnemyProperties() {
        // Default properties
        this.width = 30;
        this.height = 30;
        this.health = 1;
        this.score = 100;
        this.damage = 1;
        this.color = 0xffffff;
        
        // Adjust properties based on enemy type
        switch(this.enemyType) {
            case 'fast':
                this.color = 0x00ffff; // Cyan
                this.score = 150;
                this.pathSpeed = 3;
                this.shape = 'circle';
                break;
                
            case 'shooter':
                this.color = 0xff00ff; // Magenta
                this.health = 2;
                this.score = 200;
                this.pathSpeed = 2;
                this.shape = 'square';
                break;
                
            case 'boss':
                this.color = 0xff0000; // Red
                this.width = 40;
                this.height = 40;
                this.health = 5;
                this.score = 500;
                this.damage = 2;
                this.pathSpeed = 1.5;
                this.shape = 'square';
                break;
                
            default: // normal
                this.color = 0x00ff00; // Green
                this.pathSpeed = 2;
                this.shape = 'triangle';
                break;
        }
    }
    
    createGraphics() {
        // Create graphics object
        this.graphics = this.scene.add.graphics();
        this.add(this.graphics);
        
        // Draw shape based on enemy type
        this.redrawGraphics();
    }
    
    redrawGraphics() {
        this.graphics.clear();
        
        // Fill style
        this.graphics.fillStyle(this.color, 1);
        
        // Draw shape based on enemy type
        switch(this.shape) {
            case 'circle':
                this.graphics.fillCircle(0, 0, this.width/2);
                this.graphics.lineStyle(2, 0xffffff, 1);
                this.graphics.strokeCircle(0, 0, this.width/2);
                break;
                
            case 'square':
                this.graphics.fillRect(-this.width/2, -this.height/2, this.width, this.height);
                this.graphics.lineStyle(2, 0xffffff, 1);
                this.graphics.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
                break;
                
            default: // triangle
                this.graphics.fillTriangle(
                    0, -this.height/2,
                    -this.width/2, this.height/2,
                    this.width/2, this.height/2
                );
                this.graphics.lineStyle(2, 0xffffff, 1);
                this.graphics.strokeTriangle(
                    0, -this.height/2,
                    -this.width/2, this.height/2,
                    this.width/2, this.height/2
                );
                break;
        }
    }
    
    update(time, delta) {
        // Update body position
        this.body.x = this.x - this.width/2;
        this.body.y = this.y - this.height/2;
        
        // Update debug text
        if (this.debugText.visible) {
            this.debugText.x = this.x - 15;
            this.debugText.y = this.y - 30;
            this.debugText.setText(this.state);
        }
        
        // Update state
        this.stateTime += delta;
        
        // Execute current state
        switch(this.state) {
            case 'spawning':
                this.updateSpawning(time, delta);
                break;
                
            case 'inFormation':
                this.updateInFormation(time, delta);
                break;
                
            case 'diving':
                this.updateDiving(time, delta);
                break;
                
            case 'returning':
                this.updateReturning(time, delta);
                break;
                
            case 'tractorBeam':
                this.updateTractorBeam(time, delta);
                break;
        }
    }
    
    updateSpawning(time, delta) {
        // Determine spawn position based on enemy type
        let entryPath;
        
        // Use different entry paths based on enemy type (authentic Galaga behavior)
        switch(this.enemyType) {
            case 'fast':
                entryPath = this.scene.enemyPatterns.getCircleEntryPath();
                break;
                
            case 'shooter':
                entryPath = this.scene.enemyPatterns.getSquareEntryPath();
                break;
                
            case 'boss':
                entryPath = this.scene.enemyPatterns.getBossEntryPath();
                break;
                
            default: // normal
                entryPath = this.scene.enemyPatterns.getTriangleEntryPath();
                break;
        }
        
        // Initialize path if not already set
        if (!this.path) {
            this.path = entryPath;
            this.pathIndex = 0;
            
            // Set initial position to first point in path
            if (this.path.length > 0) {
                this.x = this.path[0].x;
                this.y = this.path[0].y;
            }
        }
        
        // Follow path
        this.followPath(delta);
        
        // Check if reached end of path
        if (this.pathIndex >= this.path.length) {
            // Transition to formation
            this.setState('inFormation');
        }
    }
    
    updateInFormation(time, delta) {
        // Position is managed by GameScene's updateFormation method
        
        // Check if should dive
        if (this.scene.shouldEnemyDive(this)) {
            this.setState('diving');
        }
        
        // Shooter enemies can shoot while in formation
        if (this.enemyType === 'shooter' || this.enemyType === 'boss') {
            this.shootTimer -= delta;
            
            if (this.shootTimer <= 0) {
                this.shoot();
                this.shootTimer = Phaser.Math.Between(2000, 5000);
            }
        }
    }
    
    updateDiving(time, delta) {
        // Initialize dive path if not already set
        if (!this.path) {
            // Get dive path based on enemy type - using authentic Galaga patterns
            switch(this.enemyType) {
                case 'fast':
                    // Fast enemies (like Galaga Bees/Zako) use swooping patterns
                    this.path = this.scene.enemyPatterns.beeSwoop(this.x, this.y);
                    // Play attack sound when starting dive
                    this.scene.sound.play('attack');
                    break;
                    
                case 'shooter':
                    // Shooter enemies (like Galaga Butterflies/Goei) use butterfly patterns
                    this.path = this.scene.enemyPatterns.butterflyPattern(this.x, this.y);
                    // Play attack sound when starting dive
                    this.scene.sound.play('attack');
                    break;
                    
                case 'boss':
                    // Boss enemies use phase-based patterns depending on health
                    if (this.health > 3) {
                        this.path = this.scene.enemyPatterns.bossSimpleDive(this.x, this.y);
                    } else if (this.health > 1) {
                        this.path = this.scene.enemyPatterns.bossAggressiveDive(this.x, this.y);
                    } else {
                        this.path = this.scene.enemyPatterns.bossDesperate(this.x, this.y);
                    }
                    // Play boss attack sound
                    this.scene.sound.play('attack');
                    break;
                    
                default: // normal
                    // Normal enemies (like Galaga normal enemies) use direct patterns
                    this.path = this.scene.enemyPatterns.directDive(this.x, this.y);
                    break;
            }
            
            this.pathIndex = 0;
        }
        
        // Follow path - authentic Galaga fixed path movement
        this.followPath(delta);
        
        // Shoot while diving (except for normal enemies)
        if (this.enemyType !== 'normal') {
            this.shootTimer -= delta;
            
            if (this.shootTimer <= 0) {
                this.shoot();
                this.shootTimer = Phaser.Math.Between(500, 1500);
            }
        }
        
        // Check if reached end of path
        if (this.pathIndex >= this.path.length) {
            // Different behavior based on enemy type - authentic Galaga behavior
            switch(this.enemyType) {
                case 'fast':
                    // Fast enemies (Bees) always return to formation
                    this.setState('returning');
                    break;
                    
                case 'shooter':
                    // Shooter enemies (Butterflies) have 50% chance to continue diving or return
                    if (Math.random() < 0.5) {
                        this.setState('returning');
                    } else {
                        // Continue diving with a new path
                        this.path = this.scene.enemyPatterns.butterflyPattern(this.x, this.y);
                        this.pathIndex = 0;
                    }
                    break;
                    
                case 'boss':
                    // Boss enemies always return to formation
                    this.setState('returning');
                    break;
                    
                default: // normal
                    // Normal enemies always return to formation
                    this.setState('returning');
                    break;
            }
        }
        
        // Check if off screen (safety check)
        const height = this.scene.cameras.main.height;
        if (this.y > height + 50) {
            this.setState('returning');
        }
    }
    
    updateReturning(time, delta) {
        // Initialize return path if not already set
        if (!this.returnPath) {
            // Get return path based on enemy type
            switch(this.enemyType) {
                case 'fast':
                    this.returnPath = this.scene.enemyPatterns.getCircleReturnPath(
                        this.x, this.y, 
                        this.formationX + this.scene.formationX, 
                        this.formationY
                    );
                    break;
                    
                case 'shooter':
                    this.returnPath = this.scene.enemyPatterns.getSquareReturnPath(
                        this.x, this.y, 
                        this.formationX + this.scene.formationX, 
                        this.formationY
                    );
                    break;
                    
                case 'boss':
                    this.returnPath = this.scene.enemyPatterns.getBossReturnPath(
                        this.x, this.y, 
                        this.formationX + this.scene.formationX, 
                        this.formationY
                    );
                    break;
                    
                default: // normal
                    this.returnPath = this.scene.enemyPatterns.getTriangleReturnPath(
                        this.x, this.y, 
                        this.formationX + this.scene.formationX, 
                        this.formationY
                    );
                    break;
            }
            
            this.returnPathIndex = 0;
        }
        
        // Follow return path
        if (this.returnPath && this.returnPath.length > 0) {
            // Get current target point
            const targetPoint = this.returnPath[this.returnPathIndex];
            
            // Calculate direction to target
            const dx = targetPoint.x - this.x;
            const dy = targetPoint.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Move towards target
            if (distance > 5) {
                this.x += (dx / distance) * this.pathSpeed * 2;
                this.y += (dy / distance) * this.pathSpeed * 2;
            } else {
                // Reached current point, move to next
                this.returnPathIndex++;
                
                // Check if reached end of path
                if (this.returnPathIndex >= this.returnPath.length) {
                    // Transition back to formation
                    this.setState('inFormation');
                }
            }
        }
    }
    
    updateTractorBeam(time, delta) {
        // Initialize tractor beam path if not already set
        if (!this.path) {
            this.path = this.scene.enemyPatterns.capturePattern(this.x, this.y, this.scene.player.x, this.scene.player.y);
            this.pathIndex = 0;
            this.tractorBeamActive = false;
            this.tractorBeamTime = 0;
            
            // Play tractor beam sound when starting
            this.scene.sound.play('tractor_beam');
        }
        
        // Follow path until reaching tractor beam position
        if (!this.tractorBeamActive) {
            this.followPath(delta);
            
            // Check if reached tractor beam position
            if (this.pathIndex >= this.path.length) {
                this.tractorBeamActive = true;
                
                // Create tractor beam graphics
                if (!this.tractorBeamGraphics) {
                    this.tractorBeamGraphics = this.scene.add.graphics();
                }
            }
        } else {
            // Update tractor beam time
            this.tractorBeamTime += delta;
            
            // Draw tractor beam
            this.drawTractorBeam();
            
            // Check if player is in tractor beam
            if (this.scene.player && !this.scene.player.captured) {
                const playerX = this.scene.player.x;
                const playerY = this.scene.player.y;
                
                // Check if player is in tractor beam range
                if (Math.abs(playerX - this.x) < 50 && 
                    playerY > this.y && 
                    playerY < this.y + 200) {
                    
                    // Capture player
                    this.scene.capturePlayer();
                    
                    // Play capture sound
                    this.scene.sound.play('capture');
                }
            }
            
            // End tractor beam after a certain time
            if (this.tractorBeamTime > 3000) {
                // Clean up tractor beam
                if (this.tractorBeamGraphics) {
                    this.tractorBeamGraphics.clear();
                    this.tractorBeamGraphics.destroy();
                    this.tractorBeamGraphics = null;
                }
                
                // Return to formation
                this.setState('returning');
            }
        }
    }
    
    drawTractorBeam() {
        if (!this.tractorBeamGraphics) return;
        
        // Clear previous drawing
        this.tractorBeamGraphics.clear();
        
        // Pulsing effect
        const pulseRate = 500; // ms
        const pulsePhase = (this.tractorBeamTime % pulseRate) / pulseRate;
        const pulseWidth = 30 + Math.sin(pulsePhase * Math.PI * 2) * 10;
        
        // Draw tractor beam
        this.tractorBeamGraphics.lineStyle(2, 0xffff00, 0.8);
        this.tractorBeamGraphics.beginPath();
        this.tractorBeamGraphics.moveTo(this.x - pulseWidth, this.y);
        this.tractorBeamGraphics.lineTo(this.x - pulseWidth - 20, this.y + 200);
        this.tractorBeamGraphics.lineTo(this.x + pulseWidth + 20, this.y + 200);
        this.tractorBeamGraphics.lineTo(this.x + pulseWidth, this.y);
        this.tractorBeamGraphics.closePath();
        this.tractorBeamGraphics.strokePath();
        
        // Fill with semi-transparent color
        this.tractorBeamGraphics.fillStyle(0xffff00, 0.3);
        this.tractorBeamGraphics.fillPath();
    }
    
    followPath(delta) {
        if (!this.path || this.path.length === 0 || this.pathIndex >= this.path.length) return;
        
        // Get current target point
        const targetPoint = this.path[this.pathIndex];
        
        // Calculate direction to target
        const dx = targetPoint.x - this.x;
        const dy = targetPoint.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Move towards target
        if (distance > 5) {
            this.x += (dx / distance) * this.pathSpeed * 2;
            this.y += (dy / distance) * this.pathSpeed * 2;
        } else {
            // Reached current point, move to next
            this.pathIndex++;
        }
    }
    
    setState(newState) {
        // Exit current state
        switch(this.state) {
            case 'diving':
                this.path = null;
                break;
                
            case 'returning':
                this.returnPath = null;
                break;
                
            case 'tractorBeam':
                if (this.tractorBeamGraphics) {
                    this.tractorBeamGraphics.clear();
                    this.tractorBeamGraphics.destroy();
                    this.tractorBeamGraphics = null;
                }
                break;
        }
        
        // Set new state
        this.state = newState;
        this.stateTime = 0;
        
        // Enter new state
        switch(newState) {
            case 'inFormation':
                // Reset path
                this.path = null;
                this.returnPath = null;
                
                // Position in formation
                this.x = this.formationX + this.scene.formationX;
                this.y = this.formationY;
                break;
                
            case 'diving':
                // Reset path (will be initialized in updateDiving)
                this.path = null;
                
                // Reset shoot timer
                this.shootTimer = Phaser.Math.Between(500, 1000);
                break;
                
            case 'returning':
                // Reset return path (will be initialized in updateReturning)
                this.returnPath = null;
                break;
                
            case 'tractorBeam':
                // Reset path (will be initialized in updateTractorBeam)
                this.path = null;
                this.tractorBeamActive = false;
                this.tractorBeamTime = 0;
                break;
        }
    }
    
    shoot() {
        if (!this.scene.player) return;
        
        // Calculate angle to player
        const dx = this.scene.player.x - this.x;
        const dy = this.scene.player.y - this.y;
        const angle = Math.atan2(dy, dx);
        
        // Add projectile
        this.scene.addEnemyProjectile(this.x, this.y, angle);
    }
    
    damage(amount) {
        this.health -= amount;
        
        // Flash effect
        this.setAlpha(0.5);
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 100
        });
        
        return this.health <= 0;
    }
}
