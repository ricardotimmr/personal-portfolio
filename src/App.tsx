import { useCallback, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import CursorTrail from './components/CursorTrail'
import InitialLoader from './components/InitialLoader'
import Navbar from './components/Navbar'
import SmoothScroll from './components/SmoothScroll'
import FreetimePage from './pages/freetime'
import IndexPage from './pages/index'
import InfoPage from './pages/info'
import WorkPage from './pages/work'
import './App.css'

function App() {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isLoaderDone, setIsLoaderDone] = useState(false)
  const handleReveal = useCallback(() => setIsRevealed(true), [])
  const handleLoaderComplete = useCallback(() => setIsLoaderDone(true), [])

  return (
    <div className={`app-shell ${isRevealed ? 'is-revealed' : ''}`}>
      {!isLoaderDone ? (
        <InitialLoader onReveal={handleReveal} onComplete={handleLoaderComplete} />
      ) : null}

      {isRevealed ? (
        <>
          <SmoothScroll />
          <CursorTrail />
          <Navbar />
        </>
      ) : null}

      <div className="app-shell__page">
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/freetime" element={<FreetimePage />} />
          <Route path="/info" element={<InfoPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
