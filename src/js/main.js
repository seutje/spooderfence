        class SeededRandom {
            constructor(seed) {
                this.seed = seed;
            }
            
            next() {
                this.seed = (this.seed * 9301 + 49297) % 233280;
                return this.seed / 233280;
            }
            
            nextInt(min, max) {
                return Math.floor(this.next() * (max - min + 1)) + min;
            }
        }

        class Enemy {
            constructor(type, path, wave) {
                this.type = type;
                this.path = path;
                this.pathIndex = 0;
                this.x = path[0].x;
                this.y = path[0].y;
                this.wave = wave;
                
                // Set properties based on type
                switch(type) {
                    case 'ant':
                        this.maxHealth = 50 + wave * 10;
                        this.speed = 1;
                        this.reward = 10;
                        this.damage = 1;
                        this.color = '#8B4513';
                        this.size = 8;
                        break;
                    case 'beetle':
                        this.maxHealth = 100 + wave * 20;
                        this.speed = 0.5;
                        this.reward = 20;
                        this.damage = 2;
                        this.color = '#2F4F4F';
                        this.size = 12;
                        break;
                    case 'wasp':
                        this.maxHealth = 30 + wave * 5;
                        this.speed = 2;
                        this.reward = 15;
                        this.damage = 1;
                        this.color = '#FFD700';
                        this.size = 10;
                        break;
                    case 'centipede':
                        this.maxHealth = 200 + wave * 30;
                        this.speed = 0.8;
                        this.reward = 50;
                        this.damage = 5;
                        this.color = '#8B008B';
                        this.size = 15;
                        break;
                }
                
                this.health = this.maxHealth;
            }
            
            update() {
                if (this.pathIndex < this.path.length - 1) {
                    const target = this.path[this.pathIndex + 1];
                    const dx = target.x - this.x;
                    const dy = target.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.speed) {
                        this.pathIndex++;
                        if (this.pathIndex >= this.path.length - 1) {
                            return true; // Reached end
                        }
                    } else {
                        this.x += (dx / distance) * this.speed;
                        this.y += (dy / distance) * this.speed;
                    }
                }
                return false;
            }
            
            draw(ctx) {
                // Draw enemy
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw health bar
                const barWidth = this.size * 2;
                const barHeight = 4;
                const healthPercent = this.health / this.maxHealth;
                
                ctx.fillStyle = '#333';
                ctx.fillRect(this.x - barWidth/2, this.y - this.size - 10, barWidth, barHeight);
                
                ctx.fillStyle = '#ff6b6b';
                ctx.fillRect(this.x - barWidth/2, this.y - this.size - 10, barWidth * healthPercent, barHeight);
            }
            
            takeDamage(damage) {
                this.health -= damage;
                return this.health <= 0;
            }
        }

        class Tower {
            constructor(type, x, y) {
                this.type = type;
                this.x = x;
                this.y = y;
                this.lastShot = 0;
                this.level = 1;
                
                // Set properties based on type
                switch(type) {
                    case 0: // Web Shooter
                        this.damage = 10;
                        this.range = 100;
                        this.fireRate = 500;
                        this.color = '#87CEEB';
                        this.size = 15;
                        break;
                    case 1: // Venom Spitter
                        this.damage = 25;
                        this.range = 150;
                        this.fireRate = 1000;
                        this.color = '#98FB98';
                        this.size = 18;
                        break;
                    case 2: // Trap Spider
                        this.damage = 40;
                        this.range = 80;
                        this.fireRate = 2000;
                        this.color = '#DDA0DD';
                        this.size = 20;
                        this.areaEffect = true;
                        break;
                    case 3: // Mother Spider
                        this.damage = 60;
                        this.range = 120;
                        this.fireRate = 1500;
                        this.color = '#FFB6C1';
                        this.size = 22;
                        this.spawnsMinis = true;
                        break;
                }
            }
            
            update(enemies, projectiles, currentTime) {
                if (currentTime - this.lastShot < this.fireRate) return;
                
                // Find nearest enemy in range
                let nearestEnemy = null;
                let nearestDistance = Infinity;
                
                for (const enemy of enemies) {
                    const distance = Math.sqrt(
                        Math.pow(enemy.x - this.x, 2) + 
                        Math.pow(enemy.y - this.y, 2)
                    );
                    
                    if (distance <= this.range && distance < nearestDistance) {
                        nearestEnemy = enemy;
                        nearestDistance = distance;
                    }
                }
                
                if (nearestEnemy) {
                    this.shoot(nearestEnemy, projectiles);
                    this.lastShot = currentTime;
                }
            }
            
            shoot(target, projectiles) {
                projectiles.push({
                    x: this.x,
                    y: this.y,
                    targetX: target.x,
                    targetY: target.y,
                    damage: this.damage,
                    speed: 5,
                    type: this.type,
                    areaEffect: this.areaEffect || false
                });
            }
            
            draw(ctx) {
                // Draw tower base
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw spider legs
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const legLength = this.size + 10;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(
                        this.x + Math.cos(angle) * legLength,
                        this.y + Math.sin(angle) * legLength
                    );
                    ctx.stroke();
                }
                
                // Draw range when selected
                if (this.selected) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }

        class TowerDefenseGame {
            constructor() {
                this.canvas = document.getElementById('gameCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.gridSize = 40;
                this.cols = this.canvas.width / this.gridSize;
                this.rows = this.canvas.height / this.gridSize;
                
                this.resetGame();
                this.setupEventListeners();
                this.gameLoop();
            }
            
            resetGame() {
                this.towers = [];
                this.enemies = [];
                this.projectiles = [];
                this.selectedTowerType = null;
                this.gold = 100;
                this.lives = 20;
                this.wave = 1;
                this.score = 0;
                this.paused = false;
                this.waveTimer = 5000;
                this.lastWaveTime = Date.now();
                this.enemiesInWave = 5;
                this.enemiesSpawned = 0;
                this.spawnTimer = 0;
                this.spawnDelay = 1000;
                
                this.generateMap();
                this.updateUI();
            }
            
            generateMap() {
                const seed = document.getElementById('seedInput').value || 
                           Math.floor(Math.random() * 1000000);
                this.random = new SeededRandom(parseInt(seed));
                
                this.grid = [];
                for (let y = 0; y < this.rows; y++) {
                    this.grid[y] = [];
                    for (let x = 0; x < this.cols; x++) {
                        this.grid[y][x] = 0; // 0 = empty, 1 = path, 2 = tower spot
                    }
                }
                
                // Generate path using random walk
                this.generatePath();
                
                // Add random tower spots
                this.addTowerSpots();
            }
            
            generatePath() {
                let x = 0;
                let y = Math.floor(this.rows / 2);
                this.grid[y][x] = 1;
                
                this.path = [{x: x * this.gridSize + this.gridSize/2, 
                             y: y * this.gridSize + this.gridSize/2}];
                
                while (x < this.cols - 1) {
                    const directions = [];
                    if (x < this.cols - 1) directions.push({dx: 1, dy: 0});
                    if (y > 0 && this.random.next() < 0.3) directions.push({dx: 0, dy: -1});
                    if (y < this.rows - 1 && this.random.next() < 0.3) directions.push({dx: 0, dy: 1});
                    
                    const dir = directions[this.random.nextInt(0, directions.length - 1)];
                    x += dir.dx;
                    y += dir.dy;
                    
                    if (x >= this.cols) x = this.cols - 1;
                    if (y < 0) y = 0;
                    if (y >= this.rows) y = this.rows - 1;
                    
                    this.grid[y][x] = 1;
                    this.path.push({
                        x: x * this.gridSize + this.gridSize/2,
                        y: y * this.gridSize + this.gridSize/2
                    });
                }
            }
            
            addTowerSpots() {
                for (let y = 0; y < this.rows; y++) {
                    for (let x = 0; x < this.cols; x++) {
                        if (this.grid[y][x] === 0 && this.random.next() < 0.2) {
                            // Check if adjacent to path
                            let adjacentToPath = false;
                            for (let dy = -1; dy <= 1; dy++) {
                                for (let dx = -1; dx <= 1; dx++) {
                                    const ny = y + dy;
                                    const nx = x + dx;
                                    if (ny >= 0 && ny < this.rows && nx >= 0 && nx < this.cols) {
                                        if (this.grid[ny][nx] === 1) {
                                            adjacentToPath = true;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (adjacentToPath) {
                                this.grid[y][x] = 2;
                            }
                        }
                    }
                }
            }
            
            setupEventListeners() {
                this.canvas.addEventListener('click', (e) => {
                    const rect = this.canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const gridX = Math.floor(x / this.gridSize);
                    const gridY = Math.floor(y / this.gridSize);
                    
                    if (this.selectedTowerType !== null && 
                        this.grid[gridY] && 
                        this.grid[gridY][gridX] === 2) {
                        
                        // Check if tower already exists here
                        const towerExists = this.towers.some(tower => 
                            Math.floor(tower.x / this.gridSize) === gridX &&
                            Math.floor(tower.y / this.gridSize) === gridY
                        );
                        
                        if (!towerExists) {
                            const costs = [50, 100, 150, 200];
                            if (this.gold >= costs[this.selectedTowerType]) {
                                this.gold -= costs[this.selectedTowerType];
                                this.towers.push(new Tower(
                                    this.selectedTowerType,
                                    gridX * this.gridSize + this.gridSize/2,
                                    gridY * this.gridSize + this.gridSize/2
                                ));
                                this.updateUI();
                            }
                        }
                    }
                });
            }
            
            selectTower(type) {
                this.selectedTowerType = type;
                document.querySelectorAll('.tower-item').forEach((item, index) => {
                    item.classList.toggle('selected', index === type);
                });
            }
            
            spawnEnemy() {
                if (this.enemiesSpawned >= this.enemiesInWave) return;
                
                const types = ['ant', 'beetle', 'wasp', 'centipede'];
                const weights = [0.4, 0.3, 0.2, 0.1];
                
                let random = this.random.next();
                let type = 'ant';
                for (let i = 0; i < weights.length; i++) {
                    if (random < weights[i]) {
                        type = types[i];
                        break;
                    }
                    random -= weights[i];
                }
                
                this.enemies.push(new Enemy(type, this.path, this.wave));
                this.enemiesSpawned++;
            }
            
            updateProjectiles() {
                for (let i = this.projectiles.length - 1; i >= 0; i--) {
                    const proj = this.projectiles[i];
                    
                    const dx = proj.targetX - proj.x;
                    const dy = proj.targetY - proj.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < proj.speed) {
                        // Hit target
                        if (proj.areaEffect) {
                            // Area damage
                            for (const enemy of this.enemies) {
                                const enemyDist = Math.sqrt(
                                    Math.pow(enemy.x - proj.targetX, 2) + 
                                    Math.pow(enemy.y - proj.targetY, 2)
                                );
                                if (enemyDist < 50) {
                                    if (enemy.takeDamage(proj.damage)) {
                                        this.gold += enemy.reward;
                                        this.score += enemy.reward * 10;
                                        this.enemies.splice(this.enemies.indexOf(enemy), 1);
                                    }
                                }
                            }
                        } else {
                            // Single target damage
                            for (const enemy of this.enemies) {
                                const enemyDist = Math.sqrt(
                                    Math.pow(enemy.x - proj.targetX, 2) + 
                                    Math.pow(enemy.y - proj.targetY, 2)
                                );
                                if (enemyDist < 20) {
                                    if (enemy.takeDamage(proj.damage)) {
                                        this.gold += enemy.reward;
                                        this.score += enemy.reward * 10;
                                        this.enemies.splice(this.enemies.indexOf(enemy), 1);
                                    }
                                    break;
                                }
                            }
                        }
                        this.projectiles.splice(i, 1);
                    } else {
                        proj.x += (dx / distance) * proj.speed;
                        proj.y += (dy / distance) * proj.speed;
                    }
                }
            }
            
            drawProjectiles() {
                for (const proj of this.projectiles) {
                    this.ctx.fillStyle = '#ffff00';
                    this.ctx.beginPath();
                    this.ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
            
            update() {
                if (this.paused) return;
                
                const currentTime = Date.now();
                
                // Wave management
                if (currentTime - this.lastWaveTime > this.waveTimer) {
                    if (this.enemiesSpawned >= this.enemiesInWave && this.enemies.length === 0) {
                        this.wave++;
                        this.enemiesInWave += 2;
                        this.enemiesSpawned = 0;
                        this.lastWaveTime = currentTime;
                        this.gold += 50 + this.wave * 10;
                    }
                }
                
                // Spawn enemies
                if (currentTime - this.spawnTimer > this.spawnDelay && 
                    this.enemiesSpawned < this.enemiesInWave) {
                    this.spawnEnemy();
                    this.spawnTimer = currentTime;
                }
                
                // Update enemies
                for (let i = this.enemies.length - 1; i >= 0; i--) {
                    const enemy = this.enemies[i];
                    if (enemy.update()) {
                        this.lives -= enemy.damage;
                        this.enemies.splice(i, 1);
                        if (this.lives <= 0) {
                            alert(`Game Over! Final Score: ${this.score}`);
                            this.resetGame();
                        }
                    }
                }
                
                // Update towers
                for (const tower of this.towers) {
                    tower.update(this.enemies, this.projectiles, currentTime);
                }
                
                // Update projectiles
                this.updateProjectiles();
                
                this.updateUI();
            }
            
            draw() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Draw grid
                this.ctx.strokeStyle = '#222';
                this.ctx.lineWidth = 1;
                for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, 0);
                    this.ctx.lineTo(x, this.canvas.height);
                    this.ctx.stroke();
                }
                for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, y);
                    this.ctx.lineTo(this.canvas.width, y);
                    this.ctx.stroke();
                }
                
                // Draw path
                this.ctx.fillStyle = '#444';
                for (let y = 0; y < this.rows; y++) {
                    for (let x = 0; x < this.cols; x++) {
                        if (this.grid[y][x] === 1) {
                            this.ctx.fillRect(
                                x * this.gridSize, 
                                y * this.gridSize, 
                                this.gridSize, 
                                this.gridSize
                            );
                        }
                    }
                }
                
                // Draw tower spots
                this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
                for (let y = 0; y < this.rows; y++) {
                    for (let x = 0; x < this.cols; x++) {
                        if (this.grid[y][x] === 2) {
                            this.ctx.fillRect(
                                x * this.gridSize + 5, 
                                y * this.gridSize + 5, 
                                this.gridSize - 10, 
                                this.gridSize - 10
                            );
                        }
                    }
                }
                
                // Draw towers
                for (const tower of this.towers) {
                    tower.draw(this.ctx);
                }
                
                // Draw enemies
                for (const enemy of this.enemies) {
                    enemy.draw(this.ctx);
                }
                
                // Draw projectiles
                this.drawProjectiles();
            }
            
            updateUI() {
                document.getElementById('wave').textContent = this.wave;
                document.getElementById('lives').textContent = this.lives;
                document.getElementById('gold').textContent = this.gold;
                document.getElementById('score').textContent = this.score;
                document.getElementById('healthBar').style.width = `${(this.lives / 20) * 100}%`;
            }
            
            togglePause() {
                this.paused = !this.paused;
            }
            
            generateNewMap() {
                this.towers = [];
                this.enemies = [];
                this.projectiles = [];
                this.generateMap();
            }
            
            gameLoop() {
                this.update();
                this.draw();
                requestAnimationFrame(() => this.gameLoop());
            }
        }

        // Start the game
        const game = new TowerDefenseGame();

