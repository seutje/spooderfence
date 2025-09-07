export class Tower {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.lastShot = 0;
    this.level = 1;

    switch (type) {
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

    let nearestEnemy = null;
    let nearestDistance = Infinity;
    for (const enemy of enemies) {
      const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
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
      areaEffect: this.areaEffect || false,
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
      ctx.lineTo(this.x + Math.cos(angle) * legLength, this.y + Math.sin(angle) * legLength);
      ctx.stroke();
    }

    if (this.selected) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

