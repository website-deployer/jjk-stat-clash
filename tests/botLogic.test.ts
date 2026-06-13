import { describe, it, expect } from 'vitest';
import { getEntityPower, getSynergyWeight } from '../src/utils/botLogic';

describe('botLogic helpers', () => {
  it('calculates entity power based on statValue and grade', () => {
    const entity = { statValue: 80, grade: 'Legendary' };
    const p = getEntityPower(entity, 'strength');
    // Base 80 + Legendary (+50) = 130
    expect(p).toBe(130);
  });

  it('calculates synergy weight and doubles for secret', () => {
    const pairing = { bonusStats: { strength: 10, speed: 5 }, isSecret: true } as any;
    const w = getSynergyWeight(pairing);
    // (10+5) * 2.5 = 37.5
    expect(w).toBeCloseTo(37.5);
  });
});
