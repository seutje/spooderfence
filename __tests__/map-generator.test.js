import { MapGenerator } from '../src/js/systems/map-generator.js';

test('MapGenerator produces grid and path of expected size', () => {
  const rows = 5, cols = 5, gridSize = 10, seed = 123;
  const gen = new MapGenerator(rows, cols, gridSize, seed);
  const { grid, path } = gen.generate();
  expect(grid.length).toBe(rows);
  expect(grid[0].length).toBe(cols);
  expect(Array.isArray(path)).toBe(true);
  // Start path should be on left column
  const startCellX = Math.round((path[0].x - gridSize / 2) / gridSize);
  expect(startCellX).toBe(0);
});

