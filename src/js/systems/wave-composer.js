// Returns { type, centipedeSpawnedThisWave }
export function pickEnemyTypeForWave(rngNext, wave, centipedeSpawnedThisWave) {
  // 1-5: ants only
  // 6-10: ants + beetles
  // 11-15: ants + beetles + wasps
  // 16: above + exactly one centipede per wave
  if (wave <= 5) return { type: 'ant', centipedeSpawnedThisWave };
  if (wave <= 10) {
    const type = rngNext() < 0.6 ? 'ant' : 'beetle';
    return { type, centipedeSpawnedThisWave };
  }
  if (wave <= 15) {
    const r = rngNext();
    const type = r < 0.5 ? 'ant' : r < 0.8 ? 'beetle' : 'wasp';
    return { type, centipedeSpawnedThisWave };
  }
  if (wave === 16) {
    if (!centipedeSpawnedThisWave) {
      return { type: 'centipede', centipedeSpawnedThisWave: true };
    }
    const r = rngNext();
    const type = r < 0.5 ? 'ant' : r < 0.8 ? 'beetle' : 'wasp';
    return { type, centipedeSpawnedThisWave };
  }
  // Beyond 16: keep trio without centipede
  const r = rngNext();
  const type = r < 0.5 ? 'ant' : r < 0.8 ? 'beetle' : 'wasp';
  return { type, centipedeSpawnedThisWave };
}

