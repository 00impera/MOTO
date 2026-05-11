import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Providers } from './providers'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Weapons from './pages/Weapons'
import Upgrades from './pages/Upgrades'
import Levels from './pages/Levels'
import Characters from './pages/Characters'
import Cars from './pages/Cars'
import Packs from './pages/Packs'
import Buy from './pages/Buy'
import Staking from './pages/Staking'
import Game from './pages/Game'
import './index.css'

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Navbar/>
        <main>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/game" element={<Game/>}/>
            <Route path="/weapons" element={<Weapons/>}/>
            <Route path="/upgrades" element={<Upgrades/>}/>
            <Route path="/levels" element={<Levels/>}/>
            <Route path="/characters" element={<Characters/>}/>
            <Route path="/cars" element={<Cars/>}/>
            <Route path="/packs" element={<Packs/>}/>
            <Route path="/buy" element={<Buy/>}/>
            <Route path="/staking" element={<Staking/>}/>
          </Routes>
        </main>
      </BrowserRouter>
    </Providers>
  )
}
