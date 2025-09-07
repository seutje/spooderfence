import { SeededRandom } from '../src/js/utils/seeded-random.js';

test('SeededRandom produces deterministic sequence', () => {
  const rng1 = new SeededRandom(123);
  const rng2 = new SeededRandom(123);
  const seq1 = Array.from({ length: 5 }, () => rng1.next());
  const seq2 = Array.from({ length: 5 }, () => rng2.next());
  expect(seq1).toEqual(seq2);
});

test('nextInt returns values within range', () => {
  const rng = new SeededRandom(42);
  for (let i = 0; i < 20; i++) {
    const v = rng.nextInt(3, 7);
    expect(v).toBeGreaterThanOrEqual(3);
    expect(v).toBeLessThanOrEqual(7);
  }
});

