import { SeededRandom } from '../utils/seeded-random.js';

export class MapGenerator {
  constructor(rows, cols, gridSize, seed) {
    this.rows = rows;
    this.cols = cols;
    this.gridSize = gridSize;
    this.random = new SeededRandom(parseInt(seed, 10));
  }

  generate() {
    const grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    const path = this.generatePath(grid);
    this.addTowerSpots(grid);
    return { grid, path };
  }

  generatePath(grid) {
    let x = 0;
    let y = Math.floor(this.rows / 2);
    grid[y][x] = 1;
    const path = [{ x: x * this.gridSize + this.gridSize / 2, y: y * this.gridSize + this.gridSize / 2 }];

    while (x < this.cols - 1) {
      const directions = [];
      if (x < this.cols - 1) directions.push({ dx: 1, dy: 0 });
      if (y > 0 && this.random.next() < 0.3) directions.push({ dx: 0, dy: -1 });
      if (y < this.rows - 1 && this.random.next() < 0.3) directions.push({ dx: 0, dy: 1 });

      const dir = directions[this.random.nextInt(0, directions.length - 1)];
      x += dir.dx;
      y += dir.dy;

      if (x >= this.cols) x = this.cols - 1;
      if (y < 0) y = 0;
      if (y >= this.rows) y = this.rows - 1;

      grid[y][x] = 1;
      path.push({ x: x * this.gridSize + this.gridSize / 2, y: y * this.gridSize + this.gridSize / 2 });
    }
    return path;
  }

  addTowerSpots(grid) {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (grid[y][x] !== 0) continue; // skip path and already-marked cells
        let adjacentToPath = false;
        for (let dy = -1; dy <= 1 && !adjacentToPath; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < this.rows && nx >= 0 && nx < this.cols) {
              if (grid[ny][nx] === 1) {
                adjacentToPath = true;
                break;
              }
            }
          }
        }
        if (adjacentToPath) grid[y][x] = 2; // mark all squares touching the path (including diagonals)
      }
    }
  }
}
