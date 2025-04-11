class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.enemies = [];
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
        this.powerUps = [];
        this.stars = [];
        this.wave = 0;
        this.waveInProgress = false;
        this.spawnTimer = 0;
        this.scoreText = null;
        this.waveText = null;
        this.livesText = null;
        this.missilesText = null;
        this.bossSpawned = false;
        this.enemyPatterns = null;
        this.effectsManager = null;
        this.attackTimer = 0;
        this.capturedShip = false;
        this.formationDirection = 1; // 1 = right, -1 = left
        this.formationSpeed = 30;
        this.formationX = 0;
        this.formationY = 100;
        this.formationWidth = 0;
        this.debugMode = false;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Initialize managers
        this.enemyPatterns = new EnemyPatterns(this);
        this.effectsManager = new EffectsManager(this);
        
        // Create starfield background
        this.stars = this.effectsManager.createStarfield(100);
        
        // Create player
        this.player = new Player(this, width / 2, height - 100);
        
        // Setup input handlers
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.player.shoot();
            } else if (pointer.rightButtonDown()) {
                this.player.fireMissile();
            }
        });
        
        // Prevent right-click context menu
        this.input.mouse.disableContextMenu();
        
        // Create HUD with enhanced styling
        this.createHUD();
        
        // Start first wave
        this.spawnWave();
        
        // Set attack timer for enemy dive patterns
        this.attackTimer = this.time.addEvent({
            delay: 3000, // 3 seconds between attacks
            callback: this.triggerEnemyAttack,
            callbackScope: this,
            loop: true
        });
        
        // Setup debug keys
        this.input.keyboard.on('keydown-BACKTICK', () => {
            this.debugMode = !this.debugMode;
            this.enemies.forEach(enemy => {
                enemy.debugText.visible = this.debugMode;
            });
            console.log(`Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`);
        });
        
        // Add sound effects
        this.sound.add('explosion', { volume: 0.5 });
        this.sound.add('shoot', { volume: 0.3 });
        this.sound.add('missile', { volume: 0.4 });
    }
    
    createHUD() {
        const width = this.cameras.main.width;
        
        // Create HUD background panel
        const hudPanel = this.add.rectangle(110, 80, 200, 140, 0x000000, 0.5);
        hudPanel.setStrokeStyle(2, 0x333333);
        
        // Score display
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        // Wave display
        this.waveText = this.add.text(20, 60, 'Wave: 1', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        // Lives display
        this.livesText = this.add.text(20, 100, 'Lives: 3', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        // Missiles display
        this.missilesText = this.add.text(20, 140, 'Missiles: 3', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        // Controls reminder (fades out after a few seconds)
        const controlsText = this.add.text(width / 2, 700, 'CONTROLS: MOUSE to move, LEFT CLICK to shoot, RIGHT CLICK for missile', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });
        controlsText.setOrigin(0.5);
        
        // Fade out controls reminder
        this.tweens.add({
            targets: controlsText,
            alpha: 0,
            delay: 5000,
            duration: 1000,
            ease: 'Power2'
        });
    }
    
    update(time, delta) {
        // Update starfield
        this.effectsManager.updateStarfield(this.stars);
        
        // Update player
        if (this.player) {
            this.player.update(time, delta);
        }
        
        // Update formation position
        this.updateFormation(delta);
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(time, delta);
        });
        
        // Update power-ups
        this.powerUps.forEach(powerUp => {
            powerUp.update(time, delta);
        });
        
        // Update HUD
        if (this.player) {
            this.scoreText.setText(`Score: ${this.player.score}`);
            this.livesText.setText(`Lives: ${this.player.lives}`);
            this.missilesText.setText(`Missiles: ${this.player.missiles}`);
        }
        
        // Check for collisions
        this.checkCollisions();
        
        // Spawn new wave if needed
        if (this.enemies.length === 0 && !this.waveInProgress) {
            this.spawnWave();
        }
        
        // Spawn enemies during wave
        if (this.waveInProgress && this.spawnTimer <= 0) {
            this.spawnEnemies();
            this.spawnTimer = 60; // 1 second between spawns
        } else if (this.waveInProgress) {
            this.spawnTimer--;
        }
    }
    
    updateFormation(delta) {
        // Move formation horizontally (authentic Galaga behavior)
        const formationSpeed = this.formationSpeed * (delta / 1000);
        this.formationX += this.formationDirection * formationSpeed;
        
        // Check formation boundaries and reverse direction if needed
        const width = this.cameras.main.width;
        if (this.formationX > width - this.formationWidth - 50) {
            this.formationDirection = -1;
            this.formationX = width - this.formationWidth - 50;
        } else if (this.formationX < 50) {
            this.formationDirection = 1;
            this.formationX = 50;
        }
        
        // Update positions of enemies in formation
        this.enemies.forEach(enemy => {
            if (enemy.state === 'inFormation') {
                enemy.x = enemy.formationX + this.formationX;
                enemy.y = enemy.formationY;
            }
        });
    }
    
    spawnWave() {
        if (!this.waveInProgress && this.enemies.length === 0) {
            this.wave++;
            this.waveText.setText(`Wave: ${this.wave}`);
            this.waveInProgress = true;
            this.spawnTimer = 60;
            this.bossSpawned = false;
            
            // Reset formation position
            this.formationX = 100;
            this.formationDirection = 1;
            
            // Show wave announcement with enhanced effects
            this.effectsManager.createWaveAnnouncement(`WAVE ${this.wave}`);
            
            // Unlock new shapes at certain waves
            if (this.wave === 5 && !this.player.unlocked.includes('circle')) {
                this.player.unlocked.push('circle');
                this.effectsManager.createUnlockMessage('Circle Shape Unlocked!');
            } else if (this.wave === 10 && !this.player.unlocked.includes('square')) {
                this.player.unlocked.push('square');
                this.effectsManager.createUnlockMessage('Square Shape Unlocked!');
            }
            
            // Award 3 missiles every wave (up to max of 6)
            this.player.missiles = Math.min(6, this.player.missiles + 3);
            this.effectsManager.createUnlockMessage('Missiles Replenished!');
        }
    }
    
    spawnEnemies() {
        const width = this.cameras.main.width;
        
        if (this.wave % 5 === 0 && !this.bossSpawned) {
            // Boss wave
            const boss = new Enemy(this, width / 2, -50, 'boss');
            
            // Set boss formation position
            boss.formationX = width / 2 - this.formationX;
            boss.formationY = 100;
            
            // Start in spawning state
            boss.setState('spawning');
            
            this.enemies.push(boss);
            this.bossSpawned = true;
            this.waveInProgress = false;
            
            // Show boss warning
            this.effectsManager.createUnlockMessage('WARNING: BOSS APPROACHING!');
        } else if (this.enemies.length < this.wave * 2) {
            // Regular wave - spawn enemies in formation
            const formationWidth = Math.min(8, this.wave) * 80;
            this.formationWidth = formationWidth;
            const startX = 40;
            
            // Determine entry direction (alternate between sides for variety)
            const entryDirections = ['top', 'left', 'right'];
            const entryDirection = entryDirections[this.enemies.length % entryDirections.length];
            
            for (let i = 0; i < Math.min(8, this.wave); i++) {
                // Calculate formation position
                const formationX = startX + i * 80;
                const formationY = 100 + Math.floor(i / 4) * 80;
                
                // Determine enemy type based on wave and position
                let enemyType = 'normal';
                
                if (this.wave > 3) {
                    // Add fast enemies from wave 4
                    if (i % 3 === 0) enemyType = 'fast';
                }
                
                if (this.wave > 6) {
                    // Add shooter enemies from wave 7
                    if (i % 4 === 0) enemyType = 'shooter';
                }
                
                // Create enemy off-screen
                const enemy = new Enemy(this, -50, -50, enemyType);
                
                // Set formation position
                enemy.formationX = formationX;
                enemy.formationY = formationY;
                
                // Start in spawning state
                enemy.setState('spawning');
                
                this.enemies.push(enemy);
            }
            
            this.waveInProgress = false;
        }
    }
    
    triggerEnemyAttack() {
        // Only trigger attacks if there are enemies in formation
        const formationEnemies = this.enemies.filter(enemy => 
            enemy.state === 'inFormation'
        );
        
        if (formationEnemies.length === 0 || !this.player) return;
        
        // Determine attack type based on wave and randomness
        const attackType = this.determineAttackType();
        
        switch (attackType) {
            case 'single':
                this.singleEnemyAttack(formationEnemies);
                break;
                
            case 'group':
                this.groupEnemyAttack(formationEnemies);
                break;
                
            case 'boss':
                this.bossAttack();
                break;
                
            case 'capture':
                this.captureAttack();
                break;
        }
    }
    
    determineAttackType() {
        // Boss attacks and capture attempts
        const bossEnemy = this.enemies.find(enemy => 
            enemy.enemyType === 'boss' && enemy.state === 'inFormation'
        );
        
        if (bossEnemy && !this.capturedShip && Phaser.Math.Between(1, 10) <= 2) {
            return 'capture'; // 20% chance of capture attempt when boss is present
        }
        
        if (bossEnemy && Phaser.Math.Between(1, 10) <= 4) {
            return 'boss'; // 40% chance of boss attack when boss is present
        }
        
        // Group attacks more common in higher waves
        const groupChance = Math.min(0.5, 0.1 + (this.wave * 0.05));
        
        if (Phaser.Math.Between(0, 100) < groupChance * 100) {
            return 'group';
        }
        
        return 'single';
    }
    
    singleEnemyAttack(formationEnemies) {
        // Select random enemy from formation
        const enemy = Phaser.Utils.Array.GetRandom(formationEnemies);
        
        // Transition to diving state
        enemy.setState('diving');
    }
    
    groupEnemyAttack(formationEnemies) {
        // Determine group size based on wave (more enemies in higher waves)
        const groupSize = Math.min(
            Math.max(2, Math.floor(this.wave / 2)),
            Math.min(4, formationEnemies.length)
        );
        
        // For authentic Galaga behavior, try to select enemies of the same type
        // This mimics how Galaga enemies of the same type attack in groups
        const enemyTypes = ['normal', 'fast', 'shooter'];
        const selectedType = Phaser.Utils.Array.GetRandom(enemyTypes);
        
        // Filter enemies by type, fallback to any enemies if not enough of selected type
        let typeEnemies = formationEnemies.filter(enemy => enemy.enemyType === selectedType);
        if (typeEnemies.length < groupSize) {
            typeEnemies = formationEnemies;
        }
        
        // Select random enemies for group attack
        const attackGroup = Phaser.Utils.Array.Shuffle(typeEnemies).slice(0, groupSize);
        
        // Transition selected enemies to diving state
        attackGroup.forEach(enemy => {
            enemy.setState('diving');
        });
    }
    
    bossAttack() {
        // Find boss enemy
        const boss = this.enemies.find(enemy => 
            enemy.enemyType === 'boss' && enemy.state === 'inFormation'
        );
        
        if (!boss) return;
        
        // Transition boss to diving state
        boss.setState('diving');
    }
    
    captureAttack() {
        // Find boss enemy
        const boss = this.enemies.find(enemy => 
            enemy.enemyType === 'boss' && enemy.state === 'inFormation'
        );
        
        if (!boss) return;
        
        // Transition boss to tractor beam state
        boss.setState('tractorBeam');
    }
    
    capturePlayer() {
        if (this.player) {
            this.player.captured = true;
            this.capturedShip = true;
            
            // Visual effect for capture
            this.effectsManager.createCaptureEffect(this.player.x, this.player.y);
            
            // Reduce lives
            this.player.lives--;
            
            // Game over if no lives left
            if (this.player.lives <= 0) {
                this.gameOver();
            }
        }
    }
    
    addEnemyProjectile(x, y, angle) {
        const projectile = new Projectile(this, x, y, 'enemy');
        projectile.fire(angle, 300);
        this.enemyProjectiles.push(projectile);
        return projectile;
    }
    
    addPlayerProjectile(x, y, angle, isMissile = false) {
        const projectile = new Projectile(this, x, y, isMissile ? 'missile' : 'player');
        const speed = isMissile ? 400 : 600;
        projectile.fire(angle, speed);
        
        if (isMissile) {
            projectile.isMissile = true;
            projectile.explosionRadius = 100;
            this.sound.play('missile');
        } else {
            this.sound.play('shoot');
        }
        
        this.playerProjectiles.push(projectile);
        return projectile;
    }
    
    checkCollisions() {
        // Check player projectiles vs enemies
        this.checkProjectileEnemyCollisions();
        
        // Check enemy projectiles vs player
        this.checkEnemyProjectilePlayerCollision();
        
        // Check missiles vs enemies (with explosion radius)
        this.checkMissileCollisions();
        
        // Check direct collisions between player and enemies
        this.checkPlayerEnemyCollisions();
    }
    
    checkProjectileEnemyCollisions() {
        for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.playerProjectiles[i];
            
            // Skip missiles, they're handled separately
            if (projectile.isMissile) continue;
            
            let hit = false;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                // Only check enemies that are diving or in formation
                if (enemy.state !== 'diving' && enemy.state !== 'inFormation') continue;
                
                if (Phaser.Geom.Rectangle.Overlaps(projectile.body, enemy.body)) {
                    // Hit enemy
                    enemy.damage(1);
                    hit = true;
                    
                    // Create hit effect
                    this.effectsManager.createHitEffect(projectile.x, projectile.y);
                    
                    // Check if enemy is destroyed
                    if (enemy.health <= 0) {
                        // Award score
                        this.player.score += enemy.score;
                        
                        // Create explosion effect
                        this.effectsManager.createExplosion(enemy.x, enemy.y);
                        this.sound.play('explosion');
                        
                        // Remove enemy
                        this.enemies.splice(j, 1);
                        enemy.destroy();
                    }
                    
                    break;
                }
            }
            
            if (hit) {
                // Remove projectile
                this.playerProjectiles.splice(i, 1);
                projectile.destroy();
            }
        }
    }
    
    checkEnemyProjectilePlayerCollision() {
        if (!this.player || this.player.invulnerable) return;
        
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.enemyProjectiles[i];
            
            if (Phaser.Geom.Rectangle.Overlaps(projectile.body, this.player.body)) {
                // Hit player
                this.player.damage(1);
                
                // Create hit effect
                this.effectsManager.createHitEffect(projectile.x, projectile.y);
                
                // Remove projectile
                this.enemyProjectiles.splice(i, 1);
                projectile.destroy();
                
                // Check if player is destroyed
                if (this.player.health <= 0) {
                    // Create explosion effect
                    this.effectsManager.createExplosion(this.player.x, this.player.y);
                    this.sound.play('explosion');
                    
                    // Reduce lives
                    this.player.lives--;
                    
                    // Game over if no lives left
                    if (this.player.lives <= 0) {
                        this.gameOver();
                    } else {
                        // Respawn player
                        this.player.respawn();
                    }
                }
                
                break;
            }
        }
    }
    
    checkMissileCollisions() {
        // COMPLETELY REWRITTEN: Ensure missiles explode immediately on contact
        for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
            const missile = this.playerProjectiles[i];
            
            // Only process missiles
            if (!missile.isMissile) continue;
            
            // Check if missile hits any enemy
            let hitEnemy = false;
            let hitPosition = { x: missile.x, y: missile.y };
            
            for (let j = 0; j < this.enemies.length; j++) {
                const enemy = this.enemies[j];
                
                // Only check enemies that are diving or in formation
                if (enemy.state !== 'diving' && enemy.state !== 'inFormation') continue;
                
                // Check for collision using rectangle overlap
                const enemyRect = new Phaser.Geom.Rectangle(
                    enemy.x - enemy.width/2, 
                    enemy.y - enemy.height/2, 
                    enemy.width, 
                    enemy.height
                );
                
                const missileRect = new Phaser.Geom.Rectangle(
                    missile.x - missile.width/2, 
                    missile.y - missile.height/2, 
                    missile.width, 
                    missile.height
                );
                
                if (Phaser.Geom.Rectangle.Overlaps(missileRect, enemyRect)) {
                    hitEnemy = true;
                    hitPosition = { x: enemy.x, y: enemy.y };
                    
                    // Create explosion at hit position immediately
                    this.createMissileExplosion(enemy.x, enemy.y);
                    
                    // Remove missile immediately after hit
                    this.playerProjectiles.splice(i, 1);
                    missile.destroy();
                    
                    // Log for debugging
                    if (this.debugMode) {
                        console.log(`Missile hit enemy at position ${enemy.x}, ${enemy.y}`);
                    }
                    
                    // Exit both loops after first hit
                    return;
                }
            }
            
            // If missile reaches top of screen (only if no enemy was hit)
            if (!hitEnemy && missile.y <= 0) {
                // Create explosion at top of screen
                this.createMissileExplosion(missile.x, 0);
                
                // Remove missile
                this.playerProjectiles.splice(i, 1);
                missile.destroy();
            }
        }
    }
    
    createMissileExplosion(x, y) {
        // Create visual explosion effect
        this.effectsManager.createMissileExplosion(x, y);
        this.sound.play('explosion');
        
        // Apply damage to enemies within explosion radius
        const explosionRadius = 100;
        let hitCount = 0;
        
        this.enemies.forEach((enemy, index) => {
            // Only check enemies that are diving or in formation
            if (enemy.state !== 'diving' && enemy.state !== 'inFormation') return;
            
            // Calculate distance from explosion center to enemy
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if enemy is within explosion radius
            if (distance <= explosionRadius) {
                // Apply damage (more damage closer to center)
                const damage = Math.max(1, Math.floor(3 * (1 - distance / explosionRadius)));
                enemy.damage(damage);
                
                // Create hit effect on enemy
                this.effectsManager.createHitEffect(enemy.x, enemy.y);
                
                // Play appropriate hit sound based on enemy type
                if (enemy.enemyType === 'boss') {
                    this.sound.play('boss_hit');
                } else if (enemy.enemyType === 'fast') {
                    this.sound.play('enemy_hit');
                } else {
                    this.sound.play('enemy_hit');
                }
                
                hitCount++;
                
                // Check if enemy is destroyed
                if (enemy.health <= 0) {
                    // Award score
                    this.player.score += enemy.score;
                    this.sound.play('score_up');
                    
                    // Create explosion effect
                    this.effectsManager.createExplosion(enemy.x, enemy.y);
                    
                    // Play appropriate destruction sound based on enemy type
                    if (enemy.enemyType === 'boss') {
                        this.sound.play('boss_destroy');
                    } else {
                        this.sound.play('explosion');
                    }
                    
                    // Remove enemy
                    this.enemies.splice(index, 1);
                    enemy.destroy();
                }
            }
        });
        
        if (this.debugMode) {
            console.log(`Missile explosion hit ${hitCount} enemies`);
        }
    }
    
    checkPlayerEnemyCollisions() {
        if (!this.player || this.player.invulnerable) return;
        
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Only check enemies that are diving
            if (enemy.state !== 'diving') continue;
            
            if (Phaser.Geom.Rectangle.Overlaps(this.player.body, enemy.body)) {
                // Hit player
                this.player.damage(enemy.damage);
                
                // Create hit effect
                this.effectsManager.createHitEffect(this.player.x, this.player.y);
                
                // Check if player is destroyed
                if (this.player.health <= 0) {
                    // Create explosion effect
                    this.effectsManager.createExplosion(this.player.x, this.player.y);
                    this.sound.play('explosion');
                    
                    // Reduce lives
                    this.player.lives--;
                    
                    // Game over if no lives left
                    if (this.player.lives <= 0) {
                        this.gameOver();
                    } else {
                        // Respawn player
                        this.player.respawn();
                    }
                }
                
                // Damage enemy
                enemy.damage(1);
                
                // Check if enemy is destroyed
                if (enemy.health <= 0) {
                    // Award score
                    this.player.score += enemy.score;
                    
                    // Create explosion effect
                    this.effectsManager.createExplosion(enemy.x, enemy.y);
                    this.sound.play('explosion');
                    
                    // Remove enemy
                    this.enemies.splice(i, 1);
                    enemy.destroy();
                }
                
                break;
            }
        }
    }
    
    gameOver() {
        // Transition to game over scene
        this.scene.start('GameOverScene', { score: this.player.score });
    }
    
    shouldEnemyDive(enemy) {
        // This is called from the enemy's update method when in formation
        // to determine if it should start diving
        
        // Don't dive if already too many enemies diving
        const divingCount = this.enemies.filter(e => e.state === 'diving').length;
        if (divingCount >= Math.min(3, Math.floor(this.wave / 2))) {
            return false;
        }
        
        // Random chance based on enemy type and wave
        let diveChance = 0.001; // Base chance per frame
        
        switch (enemy.enemyType) {
            case 'fast':
                diveChance *= 1.5; // Fast enemies dive more often
                break;
            case 'shooter':
                diveChance *= 0.8; // Shooter enemies dive less often
                break;
            case 'boss':
                diveChance *= 0.5; // Boss enemies dive rarely
                break;
        }
        
        // Increase chance in higher waves
        diveChance *= (1 + this.wave * 0.1);
        
        return Math.random() < diveChance;
    }
    
    shouldUseTractorBeam() {
        // Only use tractor beam if player is not already captured
        return !this.capturedShip && Math.random() < 0.3; // 30% chance
    }
}
