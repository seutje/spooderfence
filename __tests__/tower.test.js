import { Tower } from '../src/js/entities/tower.js';

test('Tower shoots nearest enemy in range', () => {
  const tower = new Tower(0, 0, 0); // Web Shooter
  const now = Date.now();
  const enemies = [
    { x: 120, y: 0 }, // out of range (range=100)
    { x: 50, y: 0 }, // in range
  ];
  const projectiles = [];
  tower.update(enemies, projectiles, now + 1000); // ensure fire
  expect(projectiles.length).toBe(1);
  expect(projectiles[0].targetX).toBe(50);
});

