import { AntEnemy, BeetleEnemy, WaspEnemy, CentipedeEnemy } from '../src/js/entities/enemy.js';

const path = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 20, y: 0 },
];

test('AntEnemy base stats and scaling', () => {
  const e1 = new AntEnemy(path, 1); // 50% speed
  const e10 = new AntEnemy(path, 10); // 100% speed
  // Base speed is 1, so expect 0.5 and 1.0 respectively
  expect(e1.speed).toBeCloseTo(0.5, 5);
  expect(e10.speed).toBeCloseTo(1.0, 5);
  expect(e10.maxHealth).toBe(50 + 10 * 10);
});

test('BeetleEnemy base stats and scaling', () => {
  const e1 = new BeetleEnemy(path, 1);
  const e10 = new BeetleEnemy(path, 10);
  expect(e1.speed).toBeCloseTo(0.25, 5); // base 0.5 * 0.5
  expect(e10.speed).toBeCloseTo(0.5, 5);
  expect(e10.reward).toBe(20);
});

test('WaspEnemy fast base speed and scaling', () => {
  const e1 = new WaspEnemy(path, 1);
  const e10 = new WaspEnemy(path, 10);
  expect(e1.speed).toBeCloseTo(1.0, 5); // base 2 * 0.5
  expect(e10.speed).toBeCloseTo(2.0, 5);
});

test('CentipedeEnemy scaling and damage', () => {
  const e10 = new CentipedeEnemy(path, 10);
  expect(e10.speed).toBeCloseTo(0.8, 5);
  expect(e10.damage).toBe(5);
});

