import { useState } from 'react'

const WEAPONS = [
  // T1 STARTER
  { id:1,  name:'PISTOL',       tier:'T1 · STARTER',  dmg:1,  spd:20,  price:0,     tag:'',          img:'/weapons/1 pistol.png.jpg' },
  { id:2,  name:'SHOTGUN',      tier:'T1 · STARTER',  dmg:3,  spd:45,  price:800,   tag:'',          img:'/weapons/2 shotgun.png.jpg' },
  { id:3,  name:'LASER',        tier:'T1 · STARTER',  dmg:2,  spd:8,   price:1500,  tag:'',          img:'/weapons/3 LASER — Cyberlux Laser Rifle.png.jpg' },
  // T2 HEAVY
  { id:4,  name:'ROCKET',       tier:'T2 · HEAVY',    dmg:5,  spd:80,  price:3000,  tag:'',          img:'/weapons/4. ROCKET — Cyberlux Rocket Launcher.png.jpg' },
  { id:5,  name:'PLASMA',       tier:'T2 · HEAVY',    dmg:4,  spd:15,  price:5000,  tag:'',          img:'/weapons/5. PLASMA — Cyberlux Plasma Cannon.png.jpg' },
  { id:6,  name:'FREEZE RAY',   tier:'T2 · HEAVY',    dmg:2,  spd:35,  price:2500,  tag:'',          img:'/weapons/6 futuristic freeze ray gun.png.jpg' },
  { id:7,  name:'LIGHTNING',    tier:'T2 · HEAVY',    dmg:5,  spd:20,  price:4000,  tag:'',          img:'/weapons/7. LIGHTNING.png.jpg' },
  { id:13, name:'MACHINE GUN',  tier:'T2 · HEAVY',    dmg:1,  spd:3,   price:3000,  tag:'COIN SHOT', img:'/weapons/13. MACHINE GUN.png.jpg' },
  // T3 ELITE
  { id:8,  name:'RAILGUN',      tier:'T3 · ELITE',    dmg:8,  spd:120, price:8000,  tag:'',          img:'/weapons/8. RAILGUN — Cyberlux Railgun.png.jpg' },
  { id:9,  name:'VORTEX',       tier:'T3 · ELITE',    dmg:4,  spd:60,  price:6000,  tag:'',          img:'/weapons/9. VORTEX.png.jpg' },
  { id:10, name:'GRENADE',      tier:'T3 · ELITE',    dmg:6,  spd:90,  price:10000, tag:'',          img:'/weapons/10. GRENADE.png.jpg' },
  { id:11, name:'FLAMETHROWER', tier:'T3 · ELITE',    dmg:3,  spd:5,   price:6000,  tag:'',          img:'/weapons/11. FLAMETHROWER.png.jpg' },
  // T4 LEGENDARY
  { id:12, name:'NUKE',         tier:'T4 · LEGENDARY',dmg:10, spd:200, price:15000, tag:'',          img:'/weapons/12. NUKE.png.jpg' },
  // T5 SPECIAL
  { id:14, name:'DEF TOWER',    tier:'T5 · SPECIAL',  dmg:4,  spd:25,  price:20000, tag:'AUTO-AIM',  img:'/weapons/14. DEF TOWER.png.jpg' },
  { id:15, name:'HELICOPTER',   tier:'T5 · SPECIAL',  dmg:6,  spd:30,  price:25000, tag:'GUNSHIP',   img:'/weapons/15. HELICOPTER.png.jpg' },
  { id:16, name:'ATOMIC BOMB',  tier:'T5 · SPECIAL',  dmg:15, spd:300, price:50000, tag:'ATOMIC',    img:'/weapons/16. ATOMIC BOMB,png.jpg' },
  // CYBER GUNS
  { id:17, name:'CYBER GUN 1',  tier:'CYBER · GUNS',  dmg:4,  spd:40,  price:4000,  tag:'CYBER',     img:'/weapons/1.png.jpg' },
  { id:18, name:'CYBER GUN 2',  tier:'CYBER · GUNS',  dmg:5,  spd:50,  price:5000,  tag:'CYBER',     img:'/weapons/2.png.jpg' },
  { id:19, name:'CYBER GUN 3',  tier:'CYBER · GUNS',  dmg:6,  spd:35,  price:6000,  tag:'CYBER',     img:'/weapons/3.png.jpg' },
  { id:20, name:'CYBER GUN 4',  tier:'CYBER · GUNS',  dmg:7,  spd:45,  price:7000,  tag:'CYBER',     img:'/weapons/4.png.jpg' },
  { id:21, name:'CYBER GUN 5',  tier:'CYBER · GUNS',  dmg:6,  spd:55,  price:8000,  tag:'CYBER',     img:'/weapons/5.png.jpg' },
  { id:22, name:'CYBER GUN 6',  tier:'CYBER · GUNS',  dmg:8,  spd:30,  price:9000,  tag:'CYBER',     img:'/weapons/6.png.jpg' },
  { id:23, name:'CYBER GUN 7',  tier:'CYBER · GUNS',  dmg:7,  spd:60,  price:10000, tag:'CYBER',     img:'/weapons/7.png.jpg' },
  { id:24, name:'CYBER GUN 8',  tier:'CYBER · GUNS',  dmg:9,  spd:25,  price:12000, tag:'CYBER',     img:'/weapons/8.png.jpg' },
  { id:25, name:'CYBER GUN 9',  tier:'CYBER · GUNS',  dmg:8,  spd:70,  price:14000, tag:'CYBER',     img:'/weapons/9.png.jpg' },
  { id:26, name:'CYBER GUN 10', tier:'CYBER · GUNS',  dmg:10, spd:40,  price:16000, tag:'CYBER',     img:'/weapons/10.png.jpg' },
  { id:27, name:'CYBER GUN 11', tier:'CYBER · GUNS',  dmg:11, spd:35,  price:18000, tag:'CYBER',     img:'/weapons/11.png.jpg' },
  { id:28, name:'CYBER GUN 12', tier:'CYBER · GUNS',  dmg:12, spd:50,  price:20000, tag:'CYBER',     img:'/weapons/12.png.jpg' },
]

const TIER_COLOR:Record<string,string> = {
  'T1 · STARTER':'#39FF14',
  'T2 · HEAVY':'#00EAFF',
  'T3 · ELITE':'#BF5FFF',
  'T4 · LEGENDARY':'#FFD700',
  'T5 · SPECIAL':'#FF2244',
  'CYBER · GUNS':'#FF6B1A',
}

const TIERS = ['ALL','T1 · STARTER','T2 · HEAVY','T3 · ELITE','T4 · LEGENDARY','T5 · SPECIAL','CYBER · GUNS']

export default function Weapons() {
  const [sel, setSel] = useState<number|null>(null)
  const [owned, setOwned] = useState<number[]>([1])
  const [coins, setCoins] = useState(5000)
  const [active, setActive] = useState(1)
  const [filter, setFilter] = useState('ALL')
  const selW = WEAPONS.find(w => w.id === sel)
  const visible = filter === 'ALL' ? WEAPONS : WEAPONS.filter(w => w.tier === filter)

  return (
    <div className="cyber-bg" style={{padding:'40px 24px',maxWidth:1400,margin:'0 auto'}}>
      <div style={{marginBottom:24}}>
        <div className="cl-badge cl-badge-red" style={{marginBottom:12}}>ARMORY</div>
        <h1 className="cl-title" style={{fontSize:'clamp(28px,5vw,52px)'}}>ARSENAL</h1>
        <p style={{fontFamily:'Rajdhani,sans-serif',fontSize:14,color:'rgba(255,230,100,0.4)',marginTop:4}}>
          {WEAPONS.length} WEAPONS · MACHINE GUN AUTO-COLLECTS COINS
        </p>
      </div>

      {/* FILTER */}
      <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:20}}>
        {TIERS.map(t=>(
          <button key={t} onClick={()=>setFilter(t)} style={{padding:'6px 12px',cursor:'pointer',fontFamily:'Orbitron,monospace',fontSize:8,letterSpacing:1,background:filter===t?`${TIER_COLOR[t]||'rgba(255,215,0'}20`:'transparent',border:`1px solid ${filter===t?(TIER_COLOR[t]||'#FFD700'):'rgba(255,215,0,0.2)'}`,color:filter===t?(TIER_COLOR[t]||'#FFD700'):'rgba(255,215,0,0.4)',transition:'all 0.2s'}}>{t}</button>
        ))}
      </div>

      {/* SELECTED DETAIL */}
      {selW && (
        <div style={{marginBottom:24,padding:20,background:'rgba(0,0,0,0.7)',border:`1px solid ${TIER_COLOR[selW.tier]||'#FFD700'}40`,display:'grid',gridTemplateColumns:'160px 1fr auto',gap:20,alignItems:'center'}}>
          <div style={{aspectRatio:'1',overflow:'hidden',border:`1px solid ${TIER_COLOR[selW.tier]||'#FFD700'}30`}}>
            <img src={selW.img} alt={selW.name} style={{width:'100%',height:'100%',objectFit:'cover'}}
              onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
          </div>
          <div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:18,color:TIER_COLOR[selW.tier]||'#FFD700',marginBottom:4}}>{selW.name}</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'rgba(255,215,0,0.4)',marginBottom:12,letterSpacing:2}}>{selW.tier}</div>
            <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
              {[['DMG',selW.dmg,15],['SPD',selW.spd,300]].map(([l,v,m])=>(
                <div key={l as string}>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'rgba(255,215,0,0.4)',marginBottom:4}}>{l}</div>
                  <div style={{display:'flex',gap:2}}>
                    {Array.from({length:10},(_,i)=>(
                      <div key={i} style={{width:14,height:6,background:i<Math.ceil((v as number)/(m as number)*10)?TIER_COLOR[selW.tier]||'#FFD700':'rgba(255,215,0,0.1)',borderRadius:1}}/>
                    ))}
                  </div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'rgba(255,215,0,0.5)',marginTop:2}}>{v}</div>
                </div>
              ))}
              {selW.tag && <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'#FF6B1A',border:'1px solid #FF6B1A',padding:'4px 10px',alignSelf:'center'}}>{selW.tag}</div>}
            </div>
          </div>
          {!owned.includes(selW.id) ? (
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:coins>=selW.price?'#FFD700':'#FF2244'}}>
                🪙 {coins.toLocaleString()} / {selW.price.toLocaleString()}
              </div>
              <button onClick={()=>{if(coins<selW.price)return;setCoins(c=>c-selW.price);setOwned(p=>[...p,selW.id]);setActive(selW.id)}}
                disabled={coins<selW.price}
                className="cl-btn cl-btn-gold" style={{fontSize:9,whiteSpace:'nowrap',opacity:coins<selW.price?0.5:1}}>
                {coins<selW.price?'🔒 INSUFFICIENT COINS':'UNLOCK — '+selW.price.toLocaleString()+' COINS'}
              </button>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {active===selW.id
                ? <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:'#39FF14'}}>✓ ACTIVE</div>
                : <button onClick={()=>setActive(selW.id)} className="cl-btn cl-btn-green" style={{fontSize:9}}>▶ SET ACTIVE</button>
              }
            </div>
          )}
        </div>
      )}

      {/* GRID */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:12}}>
        {visible.map(w => {
          const bc = TIER_COLOR[w.tier]||'#FFD700'
          const isOwned = owned.includes(w.id)
          return (
            <div key={w.id} onClick={()=>setSel(w.id)}
              style={{background:'rgba(10,18,25,0.9)',border:`1px solid ${sel===w.id?bc:isOwned?'rgba(57,255,20,0.3)':'rgba(184,134,11,0.2)'}`,cursor:'pointer',overflow:'hidden',transition:'all 0.2s'}}>
              <div style={{position:'relative',aspectRatio:'4/3',overflow:'hidden',background:'#030609'}}>
                <img src={w.img} alt={w.name} style={{width:'100%',height:'100%',objectFit:'cover',opacity:isOwned?0.95:0.5}}
                  onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(5,10,14,0.8) 0%,transparent 60%)'}}/>
                {isOwned && <div style={{position:'absolute',top:8,left:8,background:'rgba(57,255,20,0.15)',border:'1px solid #39FF14',padding:'2px 8px',fontFamily:'Orbitron,monospace',fontSize:7,color:'#39FF14'}}>ACTIVE</div>}
                <div style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.85)',border:`1px solid ${bc}50`,padding:'2px 6px',fontFamily:'Orbitron,monospace',fontSize:7,color:bc}}>{w.tier.split('·')[0].trim()}</div>
                {w.tag && <div style={{position:'absolute',bottom:24,left:8,background:'rgba(255,107,26,0.15)',border:'1px solid #FF6B1A',padding:'2px 6px',fontFamily:'Orbitron,monospace',fontSize:7,color:'#FF6B1A'}}>{w.tag}</div>}
                <div style={{position:'absolute',bottom:8,left:8,right:8,display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'rgba(255,215,0,0.6)'}}>DMG {w.dmg}</span>
                  <span style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'rgba(255,215,0,0.6)'}}>SPD {w.spd}</span>
                </div>
              </div>
              <div style={{padding:'10px 12px'}}>
                <div style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,color:bc,marginBottom:6}}>{w.name}</div>
                <div style={{fontFamily:'Orbitron,monospace',fontSize:11,color:isOwned?'#39FF14':bc}}>
                  {isOwned ? '✓ ACTIVE' : w.price===0 ? 'FREE' : `${w.price.toLocaleString()} COINS`}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
