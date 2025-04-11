// Enemy pattern definitions for Shape Invaders
// This file contains various movement patterns for enemies based on classic Galaga

class EnemyPatterns {
    constructor(scene) {
        this.scene = scene;
        this.gameWidth = scene.game.config.width;
        this.gameHeight = scene.game.config.height;
    }
    
    // Generate a direct dive pattern toward a target position with return to formation
    directDive(startX, startY) {
        // Create a Galaga-style dive path with return to formation
        const points = [];
        
        // Starting point
        points.push({ x: startX, y: startY });
        
        // Create fixed path points (not dependent on player position)
        const screenCenterX = this.gameWidth / 2;
        
        // Determine dive direction based on starting position
        const diveToRight = startX < screenCenterX;
        
        // Create a fixed path that resembles classic Galaga dive patterns
        const diveX = startX + (diveToRight ? 150 : -150);
        
        // Add intermediate points for smooth curve
        points.push({ x: startX + (diveToRight ? 50 : -50), y: startY + 80 });
        points.push({ x: diveX, y: this.gameHeight - 200 });
        
        // Add return path to formation (classic Galaga behavior)
        // First move horizontally away from dive point
        const exitX = diveX + (diveToRight ? 50 : -50);
        points.push({ x: exitX, y: this.gameHeight - 250 });
        
        // Then curve back up to top of screen
        points.push({ x: exitX, y: 100 });
        
        // Finally return to formation position
        points.push({ x: startX, y: startY });
        
        return points;
    }
    
    // Generate a bee-style swoop pattern (like Galaga Bees/Zako)
    beeSwoop(startX, startY) {
        const points = [];
        
        // Starting point
        points.push({ x: startX, y: startY });
        
        // Create fixed path points (not dependent on player position)
        const screenCenterX = this.gameWidth / 2;
        
        // Determine swoop direction based on starting position
        const swoopToRight = startX < screenCenterX;
        
        // Create a fixed path that resembles classic Galaga bee swoop
        const swoopX1 = startX + (swoopToRight ? 100 : -100);
        const swoopX2 = swoopX1 + (swoopToRight ? 100 : -100);
        
        // Add intermediate points for smooth curve
        points.push({ x: swoopX1, y: startY + 100 });
        points.push({ x: swoopX2, y: this.gameHeight - 150 });
        
        // Swoop back upward (classic Bee behavior)
        const returnX = swoopX2 + (swoopToRight ? 80 : -80);
        points.push({ x: returnX, y: this.gameHeight - 200 });
        points.push({ x: returnX, y: startY + 150 });
        
        // Return to formation
        points.push({ x: startX, y: startY });
        
        return points;
    }
    
    // Generate a butterfly-style pattern (like Galaga Butterflies/Goei)
    butterflyPattern(startX, startY) {
        const points = [];
        
        // Starting point
        points.push({ x: startX, y: startY });
        
        // Create fixed path points (not dependent on player position)
        const screenCenterX = this.gameWidth / 2;
        
        // Determine pattern direction based on starting position
        const moveToRight = startX < screenCenterX;
        
        // Create a fixed path that resembles classic Galaga butterfly pattern
        const patternX1 = startX + (moveToRight ? 80 : -80);
        const patternX2 = patternX1 + (moveToRight ? 100 : -100);
        const patternX3 = patternX2 + (moveToRight ? 80 : -80);
        
        // Add intermediate points for butterfly-like zigzag pattern
        points.push({ x: patternX1, y: startY + 80 });
        points.push({ x: patternX1 - (moveToRight ? 40 : -40), y: startY + 150 });
        points.push({ x: patternX2, y: startY + 200 });
        points.push({ x: patternX2 - (moveToRight ? 40 : -40), y: this.gameHeight - 200 });
        points.push({ x: patternX3, y: this.gameHeight - 150 });
        
        // Return path with more zigzag movement
        points.push({ x: patternX2, y: this.gameHeight - 250 });
        points.push({ x: patternX1, y: startY + 150 });
        points.push({ x: startX, y: startY });
        
        return points;
    }
    
    // Generate a boss capture pattern (like Boss Galaga tractor beam)
    capturePattern(bossX, bossY, playerX, playerY) {
        const points = [];
        
        // Starting point
        points.push({ x: bossX, y: bossY });
        
        // Create fixed path points (not dependent on player position)
        const screenCenterX = this.gameWidth / 2;
        
        // Loop once at top of screen (classic Boss Galaga behavior)
        const loopRadius = 80;
        const loopSteps = 8;
        
        for (let i = 1; i <= loopSteps; i++) {
            const angle = Math.PI * 2 * i / loopSteps;
            points.push({
                x: bossX + loopRadius * Math.cos(angle),
                y: bossY + loopRadius * Math.sin(angle) * 0.5
            });
        }
        
        // Determine capture position (fixed point in the middle-bottom of screen)
        const captureX = screenCenterX;
        const captureY = this.gameHeight - 200;
        
        // Slide down to position for capture
        points.push({ x: captureX, y: bossY + 50 });
        
        // Move down to capture position
        points.push({ x: captureX, y: captureY });
        
        // Hold position during capture (multiple points to create pause)
        for (let i = 0; i < 3; i++) {
            points.push({ x: captureX, y: captureY });
        }
        
        // Return to formation with captured ship
        points.push({ x: captureX, y: bossY });
        points.push({ x: bossX, y: bossY });
        
        return points;
    }
    
    // Generate a boss attack pattern with escorts (like Boss Galaga with escorts)
    bossSimpleDive(startX, startY) {
        const points = [];
        
        // Add starting point
        points.push({ x: startX, y: startY });
        
        // Create fixed path points (not dependent on player position)
        const screenCenterX = this.gameWidth / 2;
        
        // Simple side-to-side movement with return (early stage)
        points.push({ x: startX - 150, y: startY + 50 });
        points.push({ x: startX + 150, y: startY + 100 });
        points.push({ x: screenCenterX, y: this.gameHeight - 200 });
        points.push({ x: startX + 100, y: startY + 50 });
        points.push({ x: startX, y: startY });
        
        return points;
    }
    
    // More aggressive boss pattern
    bossAggressiveDive(startX, startY) {
        const points = [];
        
        // Add starting point
        points.push({ x: startX, y: startY });
        
        // Create fixed path points (not dependent on player position)
        const screenCenterX = this.gameWidth / 2;
        
        // More aggressive pattern (mid stage)
        points.push({ x: startX - 100, y: startY + 100 });
        points.push({ x: screenCenterX, y: this.gameHeight - 150 });
        points.push({ x: screenCenterX + 100, y: this.gameHeight - 200 });
        points.push({ x: screenCenterX - 100, y: this.gameHeight - 200 });
        points.push({ x: startX + 100, y: startY + 100 });
        points.push({ x: startX, y: startY });
        
        return points;
    }
    
    // Most aggressive boss pattern
    bossDesperate(startX, startY) {
        const points = [];
        
        // Add starting point
        points.push({ x: startX, y: startY });
        
        // Create fixed path points (not dependent on player position)
        const screenCenterX = this.gameWidth / 2;
        
        // Most aggressive dive pattern (final stage)
        points.push({ x: startX, y: startY + 150 });
        points.push({ x: screenCenterX, y: this.gameHeight - 150 });
        points.push({ x: screenCenterX + 150, y: this.gameHeight - 100 });
        points.push({ x: screenCenterX - 150, y: this.gameHeight - 100 });
        points.push({ x: screenCenterX, y: this.gameHeight - 150 });
        points.push({ x: startX, y: startY + 150 });
        points.push({ x: startX, y: startY });
        
        return points;
    }
    
    // Generate a formation entry pattern from off-screen (like Galaga stage start)
    formationEntry(targetX, targetY, entryDirection = 'top') {
        const points = [];
        
        // Determine starting position based on entry direction
        let startX, startY;
        
        switch (entryDirection) {
            case 'top':
                startX = targetX;
                startY = -50;
                break;
            case 'left':
                startX = -50;
                startY = targetY;
                break;
            case 'right':
                startX = this.gameWidth + 50;
                startY = targetY;
                break;
            default:
                startX = targetX;
                startY = -50;
        }
        
        // Add starting point
        points.push({ x: startX, y: startY });
        
        // Add intermediate points for smoother entry with Galaga-style loop
        if (entryDirection === 'left' || entryDirection === 'right') {
            // Horizontal entry with arc
            const midX = (startX + targetX) / 2;
            const arcY = targetY - 50;
            points.push({ x: midX, y: arcY });
        } else {
            // Vertical entry with slight curve (classic Galaga formation entry)
            const loopX = targetX + (Math.random() > 0.5 ? 80 : -80);
            const midY = 100;
            points.push({ x: loopX, y: midY });
            points.push({ x: loopX + (targetX - loopX) * 0.5, y: midY + 30 });
        }
        
        // Add target position
        points.push({ x: targetX, y: targetY });
        
        return points;
    }
    
    // Generate a group attack pattern for normal enemies (triangles)
    normalGroupAttack(startPositions) {
        const patterns = [];
        const screenCenterX = this.gameWidth / 2;
        
        // Create patterns for each enemy in the group
        startPositions.forEach((pos, index) => {
            // Create fixed paths that don't depend on player position
            const diveToRight = pos.x < screenCenterX;
            const offset = (index % 3) * 50; // Stagger the patterns
            
            const pattern = [];
            // Starting point
            pattern.push({ x: pos.x, y: pos.y });
            
            // Create dive path
            pattern.push({ x: pos.x + (diveToRight ? 50 + offset : -50 - offset), y: pos.y + 100 });
            pattern.push({ x: pos.x + (diveToRight ? 150 + offset : -150 - offset), y: this.gameHeight - 200 - (index % 2) * 50 });
            
            // Return path
            pattern.push({ x: pos.x + (diveToRight ? 100 : -100), y: pos.y + 150 });
            pattern.push({ x: pos.x, y: pos.y });
            
            patterns.push(pattern);
        });
        
        return patterns;
    }
    
    // Generate a group attack pattern for fast enemies (circles/bees)
    beeGroupAttack(startPositions) {
        const patterns = [];
        const screenCenterX = this.gameWidth / 2;
        
        // Create patterns for each enemy in the group
        startPositions.forEach((pos, index) => {
            // Create fixed paths that don't depend on player position
            const swoopToRight = pos.x < screenCenterX;
            const offset = (index % 3) * 40; // Stagger the patterns
            
            const pattern = [];
            // Starting point
            pattern.push({ x: pos.x, y: pos.y });
            
            // Create swoop path
            pattern.push({ x: pos.x + (swoopToRight ? 80 + offset : -80 - offset), y: pos.y + 80 });
            pattern.push({ x: pos.x + (swoopToRight ? 160 + offset : -160 - offset), y: this.gameHeight - 180 - (index % 2) * 40 });
            
            // Swoop back
            pattern.push({ x: pos.x + (swoopToRight ? 200 + offset : -200 - offset), y: this.gameHeight - 220 });
            pattern.push({ x: pos.x + (swoopToRight ? 120 : -120), y: pos.y + 120 });
            
            // Return to formation
            pattern.push({ x: pos.x, y: pos.y });
            
            patterns.push(pattern);
        });
        
        return patterns;
    }
    
    // Generate a group attack pattern for shooter enemies (squares/butterflies)
    butterflyGroupAttack(startPositions) {
        const patterns = [];
        const screenCenterX = this.gameWidth / 2;
        
        // Create patterns for each enemy in the group
        startPositions.forEach((pos, index) => {
            // Create fixed paths that don't depend on player position
            const moveToRight = pos.x < screenCenterX;
            const offset = (index % 3) * 30; // Stagger the patterns
            
            const pattern = [];
            // Starting point
            pattern.push({ x: pos.x, y: pos.y });
            
            // Create butterfly zigzag path
            pattern.push({ x: pos.x + (moveToRight ? 60 + offset : -60 - offset), y: pos.y + 70 });
            pattern.push({ x: pos.x + (moveToRight ? 30 + offset : -30 - offset), y: pos.y + 140 });
            pattern.push({ x: pos.x + (moveToRight ? 90 + offset : -90 - offset), y: pos.y + 210 });
            pattern.push({ x: pos.x + (moveToRight ? 60 + offset : -60 - offset), y: this.gameHeight - 170 - (index % 2) * 30 });
            
            // Return path with zigzag
            pattern.push({ x: pos.x + (moveToRight ? 120 + offset : -120 - offset), y: this.gameHeight - 220 });
            pattern.push({ x: pos.x + (moveToRight ? 90 + offset : -90 - offset), y: pos.y + 150 });
            pattern.push({ x: pos.x + (moveToRight ? 30 : -30), y: pos.y + 80 });
            
            // Return to formation
            pattern.push({ x: pos.x, y: pos.y });
            
            patterns.push(pattern);
        });
        
        return patterns;
    }
    
    // Generic group attack that selects appropriate pattern based on enemy type
    groupAttack(startPositions, enemyType) {
        switch (enemyType) {
            case 'normal':
                return this.normalGroupAttack(startPositions);
            case 'fast':
                return this.beeGroupAttack(startPositions);
            case 'shooter':
                return this.butterflyGroupAttack(startPositions);
            default:
                return this.normalGroupAttack(startPositions);
        }
    }
}
