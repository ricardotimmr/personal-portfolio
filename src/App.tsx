import { useCallback, useEffect, useMemo, useState } from 'react'
import { Route, Routes, useLocation, type Location } from 'react-router-dom'
import CursorTrail from './components/CursorTrail'
import InitialLoader from './components/InitialLoader'
import Navbar from './components/Navbar'
import PageTransition from './components/PageTransition'
import SmoothScroll from './components/SmoothScroll'
import motionBlurHeroOptimized from './assets/images/motion-blur-hero-optimized.jpg'
import FreetimePage from './pages/freetime'
import IndexPage from './pages/index'
import InfoPage from './pages/info'
import WorkPage from './pages/work'
import './App.css'

type AppRoutesProps = {
  routeLocation: Location
}

function AppRoutes({ routeLocation }: AppRoutesProps) {
  return (
    <Routes location={routeLocation}>
      <Route path="/" element={<IndexPage />} />
      <Route path="/work" element={<WorkPage />} />
      <Route path="/freetime" element={<FreetimePage />} />
      <Route path="/info" element={<InfoPage />} />
    </Routes>
  )
}

function App() {
  const location = useLocation()
  const [displayedLocationKey, setDisplayedLocationKey] = useState(location.key)
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isLoaderDone, setIsLoaderDone] = useState(false)
  const handleReveal = useCallback(() => setIsRevealed(true), [])
  const handleLoaderComplete = useCallback(() => setIsLoaderDone(true), [])

  useEffect(() => {
    const image = new Image()
    image.src = motionBlurHeroOptimized
    image.decoding = 'async'
    image.fetchPriority = 'high'
    void image.decode().catch(() => undefined)
  }, [])

  const shouldDeferRouteScrollSync = useMemo(
    () => isPageTransitioning || location.key !== displayedLocationKey,
    [displayedLocationKey, isPageTransitioning, location.key],
  )

  return (
    <div className={`app-shell ${isRevealed ? 'is-revealed' : ''}`}>
      {!isLoaderDone ? (
        <InitialLoader onReveal={handleReveal} onComplete={handleLoaderComplete} />
      ) : null}

      {isRevealed ? (
        <>
          <SmoothScroll deferRouteSync={shouldDeferRouteScrollSync} />
          <CursorTrail />
          <Navbar />
        </>
      ) : null}

      <PageTransition
        renderRoute={(routeLocation) => <AppRoutes routeLocation={routeLocation} />}
        onTransitioningChange={setIsPageTransitioning}
        onDisplayedLocationKeyChange={setDisplayedLocationKey}
      />
    </div>
  )
}

export default App
