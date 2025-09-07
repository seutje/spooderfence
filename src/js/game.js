import { MapGenerator } from './systems/map-generator.js';
import { SeededRandom } from './utils/seeded-random.js';
import { Tower } from './entities/tower.js';
import { AntEnemy, BeetleEnemy, WaspEnemy, CentipedeEnemy } from './entities/enemy.js';
import { pickEnemyTypeForWave } from './systems/wave-composer.js';

export class TowerDefenseGame {
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
    this.centipedeSpawnedThisWave = false;

    this.generateMap();
    this.updateUI();
  }

  generateMap() {
    const seed = document.getElementById('seedInput').value || Math.floor(Math.random() * 1000000);
    // Map generation uses its own SeededRandom; keep a separate one for enemy RNG
    const gen = new MapGenerator(this.rows, this.cols, this.gridSize, seed);
    const { grid, path } = gen.generate();
    this.grid = grid;
    this.path = path;
    this.random = new SeededRandom(parseInt(seed, 10));
  }

  setupEventListeners() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const gridX = Math.floor(x / this.gridSize);
      const gridY = Math.floor(y / this.gridSize);

      if (
        this.selectedTowerType !== null &&
        this.grid[gridY] &&
        this.grid[gridY][gridX] === 2
      ) {
        const towerExists = this.towers.some(
          (tower) => Math.floor(tower.x / this.gridSize) === gridX && Math.floor(tower.y / this.gridSize) === gridY
        );

        if (!towerExists) {
          const costs = [50, 100, 150, 200];
          if (this.gold >= costs[this.selectedTowerType]) {
            this.gold -= costs[this.selectedTowerType];
            this.towers.push(
              new Tower(this.selectedTowerType, gridX * this.gridSize + this.gridSize / 2, gridY * this.gridSize + this.gridSize / 2)
            );
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
    const pick = pickEnemyTypeForWave(() => this.random.next(), this.wave, this.centipedeSpawnedThisWave);
    this.centipedeSpawnedThisWave = pick.centipedeSpawnedThisWave ?? this.centipedeSpawnedThisWave;

    let enemy;
    switch (pick.type) {
      case 'ant':
        enemy = new AntEnemy(this.path, this.wave); break;
      case 'beetle':
        enemy = new BeetleEnemy(this.path, this.wave); break;
      case 'wasp':
        enemy = new WaspEnemy(this.path, this.wave); break;
      case 'centipede':
        enemy = new CentipedeEnemy(this.path, this.wave); break;
      default:
        enemy = new AntEnemy(this.path, this.wave);
    }
    this.enemies.push(enemy);
    this.enemiesSpawned++;
  }

  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      const dx = proj.targetX - proj.x;
      const dy = proj.targetY - proj.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < proj.speed) {
        if (proj.areaEffect) {
          for (const enemy of this.enemies) {
            const enemyDist = Math.hypot(enemy.x - proj.targetX, enemy.y - proj.targetY);
            if (enemyDist < 50) {
              if (enemy.takeDamage(proj.damage)) {
                this.gold += enemy.reward;
                this.score += enemy.reward * 10;
                this.enemies.splice(this.enemies.indexOf(enemy), 1);
              }
            }
          }
        } else {
          for (const enemy of this.enemies) {
            const enemyDist = Math.hypot(enemy.x - proj.targetX, enemy.y - proj.targetY);
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

  update() {
    if (this.paused) return;
    const currentTime = Date.now();

    if (currentTime - this.lastWaveTime > this.waveTimer) {
      if (this.enemiesSpawned >= this.enemiesInWave && this.enemies.length === 0) {
        this.wave++;
        this.enemiesInWave += 2;
        this.enemiesSpawned = 0;
        this.centipedeSpawnedThisWave = false;
        this.lastWaveTime = currentTime;
        this.gold += 50 + this.wave * 10;
      }
    }

    if (currentTime - this.spawnTimer > this.spawnDelay && this.enemiesSpawned < this.enemiesInWave) {
      this.spawnEnemy();
      this.spawnTimer = currentTime;
    }

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

    for (const tower of this.towers) tower.update(this.enemies, this.projectiles, currentTime);
    this.updateProjectiles();
    this.updateUI();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid
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

    // Path
    this.ctx.fillStyle = '#444';
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x] === 1) {
          this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
        }
      }
    }

    // Tower spots
    this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x] === 2) {
          this.ctx.fillRect(x * this.gridSize + 5, y * this.gridSize + 5, this.gridSize - 10, this.gridSize - 10);
        }
      }
    }

    for (const tower of this.towers) tower.draw(this.ctx);
    for (const enemy of this.enemies) enemy.draw(this.ctx);
    this.drawProjectiles();
  }

  drawProjectiles() {
    for (const proj of this.projectiles) {
      this.ctx.fillStyle = '#ffff00';
      this.ctx.beginPath();
      this.ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  updateUI() {
    document.getElementById('wave').textContent = this.wave;
    document.getElementById('lives').textContent = this.lives;
    document.getElementById('gold').textContent = this.gold;
    document.getElementById('score').textContent = this.score;
    document.getElementById('healthBar').style.width = `${(this.lives / 20) * 100}%`;
  }

  togglePause() { this.paused = !this.paused; }

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
