import { useState } from 'react'

const CHARACTERS = [
  { id:1,  name:'CRYPTO ENFORCER', coins:'x1',   price:0,     img:'/characters/1caracter.png.jpg',   spd:6, con:7, lck:5, ability:'Standard rider. Reliable in all conditions.' },
  { id:2,  name:'ETH WARRIOR',     coins:'x1.5', price:1000,  img:'/characters/2caracter.png.jpg',   spd:7, con:6, lck:6, ability:'ETH speed boost. +50% coins per pickup.' },
  { id:3,  name:'USDC SUIT',       coins:'x2',   price:2000,  img:'/characters/3caracter.png.jpg',   spd:5, con:9, lck:5, ability:'Stable armor. Double coins, extra defense.' },
  { id:4,  name:'BTC KING',        coins:'x3',   price:5000,  img:'/characters/4caracter.png.jpg',   spd:8, con:8, lck:7, ability:'BTC power. Triple coins, high resilience.' },
  { id:5,  name:'BTC MINER',       coins:'x3',   price:10000, img:'/characters/5caracter.png.jpg',   spd:6, con:9, lck:8, ability:'Mining mode. Triple coins + lucky drops.' },
  { id:6,  name:'COD OPERATOR',    coins:'x2.5', price:8000,  img:'/characters/6caracter.png.jpg',   spd:9, con:6, lck:7, ability:'Combat specialist. 2.5x coins + rapid fire.' },
  { id:7,  name:'CRYPTO ENFORCER', coins:'x2',   price:3000,  img:'/characters/7caracter.png.jpg',   spd:7, con:7, lck:8, ability:'Elite enforcer. Double coins + shield regen.' },
  { id:8,  name:'MECH-PHANTOM',    coins:'x4',   price:10000, img:'/characters/8caracters.png.jpg',  spd:10,con:8, lck:9, ability:'Mech suit. 4x coins + invincibility frames.' },
  { id:9,  name:'VOID RUNNER',     coins:'x3.5', price:12000, img:'/characters/9caracters.png.jpg',  spd:9, con:7, lck:10,ability:'Dimension runner. 3.5x coins + phase shift.' },
  { id:10, name:'NEON GHOST',      coins:'x3',   price:8000,  img:'/characters/10caracters.png.jpg', spd:10,con:5, lck:9, ability:'Ghost mode. Triple coins + speed burst.' },
  { id:11, name:'MONAD RIDER',     coins:'x5',   price:20000, img:'/characters/11caracters.png.jpg', spd:10,con:10,lck:10,ability:'Ultimate rider. 5x coins + all bonuses.' },
  { id:12, name:'CYBER TITAN',     coins:'x4.5', price:15000, img:'/characters/12caracters.png.jpg', spd:9, con:10,lck:8, ability:'Titan armor. 4.5x coins + mega shield.' },
]

export default function Characters() {
  const [sel, setSel]       = useState(1)
  const [owned, setOwned]   = useState<number[]>([1])
  const [active, setActive] = useState(1)
  const [coinBal, setCoinBal] = useState(5000)
  const [flash, setFlash]   = useState<string|null>(null)

  const selC = CHARACTERS.find(c => c.id === sel)!
  const isOwned = owned.includes(sel)
  const isActive = active === sel

  const showFlash = (msg: string, _color?: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(null), 2000)
  }

  const handleUnlock = () => {
    if (isOwned) return
    if (coinBal < selC.price) {
      showFlash('NOT ENOUGH COINS!', '#FF2244')
      return
    }
    setCoinBal(b => b - selC.price)
    setOwned(p => [...p, selC.id])
    setActive(selC.id)
    showFlash(`${selC.name} UNLOCKED!`, '#39FF14')
  }

  const handleActivate = () => {
    setActive(selC.id)
    showFlash(`${selC.name} ACTIVATED!`, '#BF5FFF')
  }

  const StatBar = ({label,val,color}:{label:string,val:number,color:string}) => (
    <div style={{marginBottom:8}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
        <span style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'rgba(255,215,0,0.4)'}}>{label}</span>
        <span style={{fontFamily:'Orbitron,monospace',fontSize:8,color}}>{val}/10</span>
      </div>
      <div style={{height:4,background:'rgba(255,215,0,0.1)',borderRadius:2}}>
        <div style={{height:'100%',width:`${val*10}%`,background:color,borderRadius:2,transition:'width 0.4s'}}/>
      </div>
    </div>
  )

  return (
    <div className="cyber-bg" style={{padding:'40px 24px',maxWidth:1400,margin:'0 auto'}}>

      {/* Flash message */}
      {flash && (
        <div style={{position:'fixed',top:80,left:'50%',transform:'translateX(-50%)',
          zIndex:9999,padding:'8px 24px',
          background:'rgba(5,10,14,0.97)',border:'1px solid #39FF14',
          color:'#39FF14',fontFamily:'Orbitron,monospace',fontSize:11,letterSpacing:2,
          pointerEvents:'none'}}>
          {flash}
        </div>
      )}

      <div style={{marginBottom:24,textAlign:'center'}}>
        <div className="cl-badge cl-badge-purple" style={{marginBottom:12}}>ROSTER</div>
        <h1 className="cl-title" style={{fontSize:'clamp(28px,5vw,52px)'}}>SELECT CHARACTER</h1>
        <p style={{fontFamily:'Rajdhani,sans-serif',fontSize:14,color:'rgba(255,230,100,0.4)',marginTop:4}}>CHOOSE YOUR RIDER & BONUS</p>
        {/* Coin balance */}
        <div style={{fontFamily:'Orbitron,monospace',fontSize:12,color:'#FFD700',marginTop:8}}>
          🪙 COINS: <span style={{color:'#39FF14'}}>{coinBal.toLocaleString()}</span>
          {active > 0 && <span style={{marginLeft:16,color:'#BF5FFF',fontSize:10}}>
            ACTIVE: {CHARACTERS.find(c=>c.id===active)?.name}
          </span>}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:24,marginBottom:32}}>

        {/* SELECTED DETAIL */}
        <div style={{border:`1px solid ${isActive?'rgba(57,255,20,0.5)':'rgba(191,95,255,0.3)'}`,overflow:'hidden',background:'rgba(10,18,25,0.95)',transition:'border 0.3s'}}>
          <div style={{aspectRatio:'3/4',overflow:'hidden',background:'#030609',position:'relative'}}>
            <img src={selC.img} alt={selC.name} style={{width:'100%',height:'100%',objectFit:'cover'}}
              onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(5,10,14,0.9) 0%,transparent 60%)'}}/>
            {isActive && (
              <div style={{position:'absolute',top:10,right:10,background:'rgba(57,255,20,0.15)',border:'1px solid #39FF14',padding:'3px 10px',fontFamily:'Orbitron,monospace',fontSize:8,color:'#39FF14'}}>
                ✓ ACTIVE
              </div>
            )}
            <div style={{position:'absolute',bottom:12,left:12}}>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:14,fontWeight:900,color:'#BF5FFF'}}>{selC.name}</div>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:11,color:'#FFD700'}}>{selC.coins} COINS</div>
            </div>
          </div>
          <div style={{padding:16}}>
            <StatBar label="SPD" val={selC.spd} color="#00EAFF"/>
            <StatBar label="CON" val={selC.con} color="#39FF14"/>
            <StatBar label="LCK" val={selC.lck} color="#FFD700"/>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:12,color:'rgba(255,230,100,0.5)',marginTop:12,marginBottom:16,lineHeight:1.4}}>
              {selC.ability}
            </div>

            {!isOwned ? (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <div style={{display:'flex',justifyContent:'space-between',fontFamily:'Orbitron,monospace',fontSize:9}}>
                  <span style={{color:'rgba(255,215,0,0.4)'}}>COST</span>
                  <span style={{color: coinBal >= selC.price ? '#FFD700' : '#FF2244'}}>
                    {selC.price.toLocaleString()} COINS
                  </span>
                </div>
                <button
                  onClick={handleUnlock}
                  disabled={coinBal < selC.price}
                  className="cl-btn cl-btn-purple"
                  style={{width:'100%',fontSize:9,opacity: coinBal < selC.price ? 0.5 : 1}}>
                  {coinBal < selC.price ? '🔒 INSUFFICIENT COINS' : `UNLOCK — ${selC.price.toLocaleString()} COINS`}
                </button>
              </div>
            ) : isActive ? (
              <button className="cl-btn cl-btn-green" style={{width:'100%',fontSize:9}}>✓ ACTIVE</button>
            ) : (
              <button onClick={handleActivate} className="cl-btn cl-btn-purple" style={{width:'100%',fontSize:9}}>
                ▶ SET ACTIVE
              </button>
            )}
          </div>
        </div>

        {/* GRID */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10,alignContent:'start'}}>
          {CHARACTERS.map(c => {
            const isO = owned.includes(c.id)
            const isA = active === c.id
            return (
              <div key={c.id} onClick={()=>setSel(c.id)}
                style={{background:'rgba(10,18,25,0.9)',
                  border:`1px solid ${sel===c.id?'#BF5FFF':isA?'rgba(57,255,20,0.5)':isO?'rgba(57,255,20,0.25)':'rgba(184,134,11,0.2)'}`,
                  cursor:'pointer',overflow:'hidden',transition:'all 0.2s',
                  boxShadow:sel===c.id?'0 0 20px rgba(191,95,255,0.2)':isA?'0 0 12px rgba(57,255,20,0.15)':'none'}}>
                <div style={{position:'relative',aspectRatio:'3/4',overflow:'hidden',background:'#030609'}}>
                  <img src={c.img} alt={c.name}
                    style={{width:'100%',height:'100%',objectFit:'cover',opacity:isO?0.95:0.35,transition:'opacity 0.3s'}}
                    onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(5,10,14,0.85) 0%,transparent 55%)'}}/>
                  {!isO && <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🔒</div>}
                  {isA && <div style={{position:'absolute',top:6,left:6,background:'rgba(57,255,20,0.15)',border:'1px solid #39FF14',padding:'2px 6px',fontFamily:'Orbitron,monospace',fontSize:7,color:'#39FF14'}}>ACTIVE</div>}
                  <div style={{position:'absolute',bottom:6,left:8,right:8}}>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:8,fontWeight:700,color:'#BF5FFF'}}>{c.name}</div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'#FFD700'}}>{c.coins}</div>
                  </div>
                </div>
                <div style={{padding:'8px 10px'}}>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:isA?'#39FF14':isO?'rgba(57,255,20,0.6)':'rgba(255,215,0,0.4)'}}>
                    {isA ? '✓ ACTIVE' : isO ? '✓ OWNED' : c.price===0 ? 'FREE' : `${c.price.toLocaleString()} COINS`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
