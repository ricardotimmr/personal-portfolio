import { Route, Routes } from 'react-router-dom'
import CursorTrail from './components/CursorTrail'
import Navbar from './components/Navbar'
import SmoothScroll from './components/SmoothScroll'
import FreetimePage from './pages/freetime'
import IndexPage from './pages/index'
import InfoPage from './pages/info'
import WorkPage from './pages/work'

function App() {
  return (
    <>
      <SmoothScroll />
      <CursorTrail />
      <Navbar />
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/freetime" element={<FreetimePage />} />
        <Route path="/info" element={<InfoPage />} />
      </Routes>
    </>
  )
}

export default App
