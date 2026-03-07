import { describe, expect, it } from 'vitest'
import {
  clamp01,
  computeRiverRevealProgress,
  isRiverStationVisible,
} from '../../src/pages/infoRiverReveal'

describe('info river reveal math', () => {
  it('clamps progress values to [0, 1]', () => {
    expect(clamp01(-0.3)).toBe(0)
    expect(clamp01(0.45)).toBe(0.45)
    expect(clamp01(2.4)).toBe(1)
  })

  it('computes clamped reveal progress from geometry', () => {
    expect(computeRiverRevealProgress(1200, 1000, 1000)).toBe(0)
    expect(computeRiverRevealProgress(40, 1000, 1000)).toBeCloseTo(0.5, 5)
    expect(computeRiverRevealProgress(-900, 1000, 1000)).toBe(1)
  })

  it('reveals stations with configured lag', () => {
    expect(isRiverStationVisible(300, 340, -42)).toBe(true)
    expect(isRiverStationVisible(280, 340, -42)).toBe(false)
  })
})
