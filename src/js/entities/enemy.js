// Base Enemy with shared behavior + speed scaling
export class Enemy {
  constructor({ type, path, wave, stats }) {
    this.type = type;
    this.path = path;
    this.pathIndex = 0;
    this.x = path[0].x;
    this.y = path[0].y;
    this.wave = wave;

    // Stats
    this.maxHealth = stats.maxHealth;
    this.speed = stats.speed; // base speed before scaling
    this.reward = stats.reward;
    this.damage = stats.damage;
    this.color = stats.color;
    this.size = stats.size;

    // Wave-based speed scaling: 50% at wave 1 -> 100% at wave 10
    const wClamped = Math.max(1, Math.min(wave, 10));
    const speedMultiplier = 0.5 + ((wClamped - 1) * (0.5 / 9));
    this.speed *= speedMultiplier;

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
    ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 10, barWidth, barHeight);

    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 10, barWidth * healthPercent, barHeight);
  }

  takeDamage(damage) {
    this.health -= damage;
    return this.health <= 0;
  }
}

export class AntEnemy extends Enemy {
  constructor(path, wave) {
    super({
      type: 'ant',
      path,
      wave,
      stats: {
        maxHealth: 50 + wave * 10,
        speed: 1,
        reward: 10,
        damage: 1,
        color: '#8B4513',
        size: 8,
      },
    });
  }
}

export class BeetleEnemy extends Enemy {
  constructor(path, wave) {
    super({
      type: 'beetle',
      path,
      wave,
      stats: {
        maxHealth: 100 + wave * 20,
        speed: 0.5,
        reward: 20,
        damage: 2,
        color: '#2F4F4F',
        size: 12,
      },
    });
  }
}

export class WaspEnemy extends Enemy {
  constructor(path, wave) {
    super({
      type: 'wasp',
      path,
      wave,
      stats: {
        maxHealth: 30 + wave * 5,
        speed: 2,
        reward: 15,
        damage: 1,
        color: '#FFD700',
        size: 10,
      },
    });
  }
}

export class CentipedeEnemy extends Enemy {
  constructor(path, wave) {
    super({
      type: 'centipede',
      path,
      wave,
      stats: {
        maxHealth: 200 + wave * 30,
        speed: 0.8,
        reward: 50,
        damage: 5,
        color: '#8B008B',
        size: 15,
      },
    });
  }
}

