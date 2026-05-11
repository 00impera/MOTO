import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LEVELS = [
  { id:1,  name:'CITY NIGHT',   zone:'ZONE 1 · EARTH',   diff:'EASY',     mult:1,   moto:1,   price:0,      img:"/levels/LV1 — CITY NIGHT.png.jpg" },
  { id:2,  name:'HIGHWAY',      zone:'ZONE 1 · EARTH',   diff:'EASY+',    mult:1.2, moto:2,   price:300,    img:"/levels/LV2 — HIGHWAY.png.jpg" },
  { id:3,  name:'DESERT RUN',   zone:'ZONE 1 · EARTH',   diff:'MEDIUM',   mult:1.4, moto:3,   price:600,    img:"/levels/LV3 — DESERT RUN.png.jpg" },
  { id:4,  name:'STORM ZONE',   zone:'ZONE 1 · EARTH',   diff:'MEDIUM',   mult:1.5, moto:4,   price:1000,   img:"/levels/LV4 — STORM ZONE,png.jpg" },
  { id:5,  name:'NEON BLADE',   zone:'ZONE 1 · EARTH',   diff:'HARD',     mult:1.6, moto:5,   price:1500,   img:"/levels/LV5 — NEON BLADE,png.jpg" },
  { id:6,  name:'ZOMBIE ROAD',  zone:'ZONE 2 · DANGER',  diff:'HARD+',    mult:1.8, moto:7,   price:2500,   img:"/levels/LV6 — ZOMBIE ROAD (SAFE VERSION),png.jpg" },
  { id:7,  name:'MOON BASE',    zone:'ZONE 2 · DANGER',  diff:'INSANE',   mult:2,   moto:9,   price:3500,   img:"/levels/LV7 — MOON BASE.png.jpg" },
  { id:8,  name:'HELL ROAD',    zone:'ZONE 2 · DANGER',  diff:'DEATH',    mult:2.3, moto:12,  price:5000,   img:"/levels/LV8 — HELL ROAD (SAFE VERSION),png.jpg" },
  { id:9,  name:'ARCTIC WAR',   zone:'ZONE 2 · DANGER',  diff:'DEATH+',   mult:2.5, moto:15,  price:7000,   img:"/levels/lv9.jpg.jpg" },
  { id:10, name:'CYBER CITY',   zone:'ZONE 2 · DANGER',  diff:'ULTRA',    mult:2.8, moto:18,  price:9000,   img:"/levels/LV10 — CYBER CITY.png.jpg" },
  { id:11, name:'MONSTER PIT',  zone:'ZONE 3 · EXTREME', diff:'ULTRA+',   mult:3,   moto:22,  price:12000,  img:"/levels/LV11 — MONSTER PIT (SAFE VERSION).png.jpg" },
  { id:12, name:'VOID ZONE',    zone:'ZONE 3 · EXTREME', diff:'GOD',      mult:3.2, moto:27,  price:15000,  img:"/levels/LV12 — VOID ZONE.png.jpg" },
  { id:13, name:'STORM TITAN',  zone:'ZONE 3 · EXTREME', diff:'GOD+',     mult:3.4, moto:32,  price:18000,  img:"/levels/LV13 — STORM TITAN (SAFE VERSION).png.jpg" },
  { id:14, name:'WAR MACHINE',  zone:'ZONE 3 · EXTREME', diff:'WAR',      mult:3.6, moto:36,  price:22000,  img:"/levels/LV14 — WAR MACHINE (SAFE VERSION),png.jpg" },
  { id:15, name:'ASTRO HELL',   zone:'ZONE 3 · EXTREME', diff:'HELL',     mult:3.8, moto:40,  price:28000,  img:"/levels/LV15 — ASTRO HELL (SAFE VERSION).png.jpg" },
  { id:16, name:'MONAD GATE',   zone:'ZONE 4 · LEGEND',  diff:'LEGEND',   mult:4,   moto:50,  price:35000,  img:"/levels/LV16 — MONAD GATE.png.jpg" },
  { id:17, name:'PHANTOM CITY', zone:'ZONE 4 · LEGEND',  diff:'LEGEND+',  mult:4.3, moto:60,  price:45000,  img:"/levels/LV17 — PHANTOM CITY.png.jpg" },
  { id:18, name:'ATOMIC ZONE',  zone:'ZONE 4 · LEGEND',  diff:'LEGEND++', mult:4.6, moto:75,  price:55000,  img:"/levels/LV18 — ATOMIC ZONE (SAFE VERSION).png.jpg" },
  { id:19, name:'MONAD CORE',   zone:'ZONE 4 · LEGEND',  diff:'ULTIMATE', mult:5,   moto:100, price:70000,  img:"/levels/LV19 — MONAD CORE.png.jpg" },
  { id:20, name:'∞ INFINITE',   zone:'ZONE 4 · LEGEND',  diff:'INFINITE', mult:6,   moto:200, price:100000, img:"/levels/LV20 — INFINITE.png.jpg" },
]

const DIFF_COLOR: Record<string,string> = {
  'EASY':'#39FF14','EASY+':'#39FF14','MEDIUM':'#FFD700','HARD':'#FF6B1A','HARD+':'#FF6B1A',
  'INSANE':'#FF2244','DEATH':'#FF2244','DEATH+':'#FF2244','ULTRA':'#BF5FFF','ULTRA+':'#BF5FFF',
  'GOD':'#00EAFF','GOD+':'#00EAFF','WAR':'#FF2244','HELL':'#FF2244',
  'LEGEND':'#FFD700','LEGEND+':'#FFD700','LEGEND++':'#FFD700','ULTIMATE':'#FFD700','INFINITE':'#39FF14',
}
const ZONE_COLOR: Record<string,string> = {
  'ZONE 1 · EARTH':'#39FF14','ZONE 2 · DANGER':'#FF6B1A',
  'ZONE 3 · EXTREME':'#FF2244','ZONE 4 · LEGEND':'#FFD700',
}
const ZONES = ['ZONE 1 · EARTH','ZONE 2 · DANGER','ZONE 3 · EXTREME','ZONE 4 · LEGEND']

// Save active level globally so Game.tsx can read it
export function getActiveLevel() {
  try { return JSON.parse(localStorage.getItem('activeLevel') || '{}') } catch { return LEVELS[0] }
}

export default function Levels() {
  const navigate = useNavigate()
  const [sel, setSel]         = useState<number>(1)
  const [unlocked, setUnlocked] = useState<number[]>([1])
  const [coins, setCoins]     = useState(5000)
  const [flash, setFlash]     = useState<string|null>(null)

  const selL = LEVELS.find(l => l.id === sel)!
  const isUnlocked = unlocked.includes(sel)

  const showFlash = (msg: string) => {
    setFlash(msg); setTimeout(() => setFlash(null), 2000)
  }

  const handleUnlock = () => {
    if (coins < selL.price) { showFlash('NOT ENOUGH COINS!'); return }
    setCoins(c => c - selL.price)
    setUnlocked(p => [...p, selL.id])
    showFlash(`${selL.name} UNLOCKED!`)
  }

  const handlePlay = () => {
    // Save level config so Game.tsx uses the right settings
    localStorage.setItem('activeLevel', JSON.stringify({
      id: selL.id,
      name: selL.name,
      mult: selL.mult,
      moto: selL.moto,
      diff: selL.diff,
      img: selL.img,
      zone: selL.zone,
    }))
    navigate('/game')
  }

  return (
    <div className="cyber-bg" style={{padding:'40px 24px',maxWidth:1400,margin:'0 auto'}}>

      {/* Flash */}
      {flash && (
        <div style={{position:'fixed',top:80,left:'50%',transform:'translateX(-50%)',zIndex:9999,
          padding:'8px 24px',background:'rgba(5,10,14,0.97)',border:'1px solid #39FF14',
          color:'#39FF14',fontFamily:'Orbitron,monospace',fontSize:11,letterSpacing:2,pointerEvents:'none'}}>
          {flash}
        </div>
      )}

      <div style={{marginBottom:24}}>
        <div className="cl-badge cl-badge-cyan" style={{marginBottom:12}}>MISSION SELECT</div>
        <h1 className="cl-title" style={{fontSize:'clamp(28px,5vw,52px)'}}>LEVELS</h1>
        <div style={{display:'flex',gap:24,alignItems:'center',marginTop:8,flexWrap:'wrap'}}>
          <p style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'rgba(255,215,0,0.4)',letterSpacing:2}}>
            HIGHER LEVELS = BETTER MOTO COIN CONVERSION RATE
          </p>
          <div style={{fontFamily:'Orbitron,monospace',fontSize:12,color:'#FFD700'}}>
            🪙 <span style={{color:'#39FF14'}}>{coins.toLocaleString()}</span> COINS
          </div>
        </div>
      </div>

      {/* Selected level detail panel */}
      {selL && (
        <div style={{marginBottom:32,overflow:'hidden',border:`1px solid ${ZONE_COLOR[selL.zone]||'#00EAFF'}50`,background:'rgba(5,10,14,0.97)',position:'relative'}}>
          {/* Background image blurred */}
          <div style={{position:'absolute',inset:0,overflow:'hidden'}}>
            <img src={selL.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.12,filter:'blur(8px)',transform:'scale(1.1)'}}
              onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
          </div>
          <div style={{position:'relative',display:'grid',gridTemplateColumns:'240px 1fr auto',gap:24,padding:20,alignItems:'center'}}>
            {/* Thumbnail */}
            <div style={{aspectRatio:'16/9',overflow:'hidden',border:`1px solid ${ZONE_COLOR[selL.zone]||'#00EAFF'}40`}}>
              <img src={selL.img} alt={selL.name} style={{width:'100%',height:'100%',objectFit:'cover'}}
                onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
            </div>
            {/* Info */}
            <div>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:ZONE_COLOR[selL.zone],letterSpacing:2,marginBottom:4}}>{selL.zone}</div>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:20,color:'#00EAFF',marginBottom:16}}>LV{selL.id}: {selL.name}</div>
              <div style={{display:'flex',gap:28,flexWrap:'wrap'}}>
                <div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'rgba(255,215,0,0.4)',marginBottom:4}}>DIFFICULTY</div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:14,color:DIFF_COLOR[selL.diff]||'#FFD700'}}>{selL.diff}</div>
                </div>
                <div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'rgba(255,215,0,0.4)',marginBottom:4}}>SPEED MULT</div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:14,color:'#00EAFF'}}>⚡{selL.mult}x</div>
                </div>
                <div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'rgba(255,215,0,0.4)',marginBottom:4}}>CONVERSION</div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:14,color:'#39FF14'}}>1 coin = {selL.moto} MOTO</div>
                </div>
                {!isUnlocked && selL.price > 0 && (
                  <div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'rgba(255,215,0,0.4)',marginBottom:4}}>UNLOCK COST</div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:14,color:coins>=selL.price?'#FFD700':'#FF2244'}}>
                      {selL.price.toLocaleString()} COINS
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Action button */}
            <div style={{display:'flex',flexDirection:'column',gap:8,minWidth:140}}>
              {!isUnlocked ? (
                <button
                  onClick={handleUnlock}
                  disabled={coins < selL.price}
                  className="cl-btn cl-btn-cyan"
                  style={{fontSize:9,whiteSpace:'nowrap',opacity:coins<selL.price?0.5:1}}>
                  {coins < selL.price ? '🔒 NEED MORE COINS' : `UNLOCK — ${selL.price.toLocaleString()}`}
                </button>
              ) : (
                <button onClick={handlePlay} className="cl-btn cl-btn-green" style={{fontSize:11,padding:'14px 24px'}}>
                  ▶ PLAY
                </button>
              )}
              {isUnlocked && (
                <div style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'#39FF14',textAlign:'center',letterSpacing:1}}>
                  ✓ UNLOCKED
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Level grid by zone */}
      {ZONES.map(zone => (
        <div key={zone} style={{marginBottom:36}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
            <div style={{width:3,height:20,background:ZONE_COLOR[zone]}}/>
            <span style={{fontFamily:'Orbitron,monospace',fontSize:11,color:ZONE_COLOR[zone],letterSpacing:3}}>{zone}</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
            {LEVELS.filter(l=>l.zone===zone).map(lv => {
              const isU = unlocked.includes(lv.id)
              const isSel = sel === lv.id
              const dc = DIFF_COLOR[lv.diff]||'#FFD700'
              const zc = ZONE_COLOR[lv.zone]||'#00EAFF'
              return (
                <div key={lv.id} onClick={()=>setSel(lv.id)}
                  style={{background:'rgba(10,18,25,0.9)',
                    border:`1px solid ${isSel?zc:isU?'rgba(57,255,20,0.4)':'rgba(184,134,11,0.2)'}`,
                    cursor:'pointer',overflow:'hidden',transition:'all 0.2s',
                    boxShadow:isSel?`0 0 20px ${zc}33`:'none'}}>
                  <div style={{position:'relative',aspectRatio:'16/9',overflow:'hidden',background:'#030609'}}>
                    <img src={lv.img} alt={lv.name}
                      style={{width:'100%',height:'100%',objectFit:'cover',opacity:isU?0.9:0.3,transition:'opacity 0.3s'}}
                      onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(5,10,14,0.9) 0%,transparent 55%)'}}/>
                    <div style={{position:'absolute',top:8,left:8,background:'rgba(0,0,0,0.85)',border:`1px solid ${zc}50`,padding:'2px 8px',fontFamily:'Orbitron,monospace',fontSize:9,color:zc}}>LV{lv.id}</div>
                    <div style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.85)',border:`1px solid ${dc}50`,padding:'2px 6px',fontFamily:'Orbitron,monospace',fontSize:8,color:dc}}>{lv.diff}</div>
                    {!isU && (
                      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)'}}>
                        <span style={{fontFamily:'Orbitron,monospace',fontSize:18,color:'rgba(255,215,0,0.25)'}}>LOCKED</span>
                      </div>
                    )}
                    {isSel && isU && (
                      <div style={{position:'absolute',top:8,left:'50%',transform:'translateX(-50%)',background:'rgba(57,255,20,0.15)',border:'1px solid #39FF14',padding:'2px 8px',fontFamily:'Orbitron,monospace',fontSize:7,color:'#39FF14'}}>SELECTED</div>
                    )}
                    <div style={{position:'absolute',bottom:8,left:8,right:8,display:'flex',justifyContent:'space-between'}}>
                      <span style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'#00EAFF'}}>⚡{lv.mult}x</span>
                      <span style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'#39FF14'}}>×{lv.moto} MOTO</span>
                    </div>
                  </div>
                  <div style={{padding:'10px 12px'}}>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,color:zc,marginBottom:4}}>{lv.name}</div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:isU?'#39FF14':'rgba(255,215,0,0.4)'}}>
                      {isU ? '▶ CLICK TO PLAY' : lv.price===0?'FREE':`${lv.price.toLocaleString()} COINS`}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
