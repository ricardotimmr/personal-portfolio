export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function computeRiverRevealProgress(trackTop: number, trackHeight: number, viewportHeight: number) {
  const safeTrackHeight = Math.max(1, trackHeight)
  const safeViewportHeight = Math.max(1, viewportHeight)
  const revealStartY = safeViewportHeight * 0.8
  const revealRange = safeTrackHeight + safeViewportHeight * 0.52
  return clamp01((revealStartY - trackTop) / Math.max(1, revealRange))
}

export function isRiverStationVisible(revealedRoadY: number, stationY: number, revealLagPx: number) {
  return revealedRoadY >= stationY + revealLagPx
}
