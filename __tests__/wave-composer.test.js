import { pickEnemyTypeForWave } from '../src/js/systems/wave-composer.js';

const fixed = (vals) => {
  let i = 0;
  return () => vals[i++ % vals.length];
};

test('Waves 1-5: ants only', () => {
  for (let w = 1; w <= 5; w++) {
    const { type } = pickEnemyTypeForWave(() => 0.9, w, false);
    expect(type).toBe('ant');
  }
});

test('Waves 6-10: ants and beetles', () => {
  const rng = fixed([0.2, 0.8]); // ant then beetle
  for (let w = 6; w <= 10; w++) {
    let r = pickEnemyTypeForWave(rng, w, false).type;
    expect(['ant', 'beetle']).toContain(r);
    r = pickEnemyTypeForWave(rng, w, false).type;
    expect(['ant', 'beetle']).toContain(r);
  }
});

test('Wave 16: includes exactly one centipede then trio', () => {
  let spawned = false;
  const rng = () => 0.9; // pick last in trio when not centipede
  let pick = pickEnemyTypeForWave(rng, 16, spawned);
  spawned = pick.centipedeSpawnedThisWave;
  expect(pick.type).toBe('centipede');
  pick = pickEnemyTypeForWave(rng, 16, spawned);
  expect(['ant', 'beetle', 'wasp']).toContain(pick.type);
});

