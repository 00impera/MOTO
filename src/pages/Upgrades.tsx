import { useState } from 'react'

const UPGRADES = [
  // MOVEMENT
  { id:1,  name:'TURBO BOOST',    cat:'MOVEMENT', effect:'Each level +15% max speed.',           maxLv:5, prices:[100,200,400,800,1600],  img:'/upgrades/1. ⚡ TURBO BOOST.png.jpg' },
  { id:2,  name:'NITRO BURST',    cat:'MOVEMENT', effect:'Speed burst every 20s.',               maxLv:3, prices:[800,1600,3200],           img:'/upgrades/2. 🚀 NITRO BURST.png.jpg' },
  { id:3,  name:'SLIPSTREAM',     cat:'MOVEMENT', effect:'+10% speed on kill for 2s.',           maxLv:3, prices:[700,1400,2800],           img:'/upgrades/3. 🏎 SLIPSTREAM.png.jpg' },
  { id:4,  name:'HYPER DRIVE',    cat:'MOVEMENT', effect:'Boost acceleration on start.',         maxLv:3, prices:[600,1200,2400],           img:'/upgrades/4. 💨 HYPER DRIVE.png.jpg' },
  // DEFENSE
  { id:11, name:'SHIELD GEN',     cat:'DEFENSE',  effect:'Start with extra shield per level.',   maxLv:5, prices:[300,600,1200,2400,4800],  img:'/upgrades/11. 🛡 SHIELD GEN.png.jpg' },
  { id:12, name:'HEAVY ARMOR',    cat:'DEFENSE',  effect:'Reduce damage taken 25% per level.',   maxLv:3, prices:[500,1000,2000],           img:'/upgrades/12. 🔰 HEAVY ARMOR.png.jpg' },
  { id:13, name:'AUTO REPAIR',    cat:'DEFENSE',  effect:'Auto-regen shield every 10s.',         maxLv:3, prices:[800,1600,3200],           img:'/upgrades/13. 🔧 AUTO REPAIR.png.jpg' },
  { id:14, name:'NANO SHIELD',    cat:'DEFENSE',  effect:'Regen 1 shield HP every 5s.',          maxLv:3, prices:[1000,2000,4000],          img:'/upgrades/14. 🧬 NANO SHIELD.png.jpg' },
  // OFFENSE
  { id:16, name:'RAPID FIRE',     cat:'OFFENSE',  effect:'Each level -10% fire delay.',          maxLv:5, prices:[400,800,1600,3200,6400],  img:'/upgrades/16. 💥 RAPID FIRE.png.jpg' },
  { id:17, name:'WAR HEAD',       cat:'OFFENSE',  effect:'+20% bullet damage per level.',        maxLv:5, prices:[600,1200,2400,4800,9600], img:'/upgrades/17. 🎯 WAR HEAD.png.jpg' },
  { id:18, name:'TWIN SHOT',      cat:'OFFENSE',  effect:'Fire extra bullets per shot.',         maxLv:3, prices:[1200,2400,4800],          img:'/upgrades/18. 🔀 TWIN SHOT.png.jpg' },
  { id:19, name:'SCOPE MASTER',   cat:'OFFENSE',  effect:'Bullets pierce 1 extra enemy.',        maxLv:3, prices:[900,1800,3600],           img:'/upgrades/19. 🔭 SCOPE MASTER.png.jpg' },
  { id:20, name:'MINE LAYER',     cat:'OFFENSE',  effect:'Drop mines behind you.',               maxLv:3, prices:[1500,3000,6000],          img:'/upgrades/20. 💣 MINE LAYER.png.jpg' },
  // ECONOMY
  { id:21, name:'COIN MAGNET',    cat:'ECONOMY',  effect:'Attract coins from wider range.',      maxLv:5, prices:[200,400,800,1600,3200],   img:'/upgrades/21. 🧲 COIN MAGNET.png.jpg' },
  { id:22, name:'DOUBLE COINS',   cat:'ECONOMY',  effect:'Earn 2x coins per pickup.',            maxLv:1, prices:[500],                     img:'/upgrades/22. 🪙 DOUBLE COINS.png.jpg' },
  { id:23, name:'MOTO BOOSTER',   cat:'ECONOMY',  effect:'+25% MOTO earned per run.',            maxLv:5, prices:[700,1400,2800,5600,11200], img:'/upgrades/23. 🚀 MOTO BOOSTER.png.jpg' },
  { id:24, name:'LUCKY DROPS',    cat:'ECONOMY',  effect:'+30% coin drop chance on kill.',       maxLv:3, prices:[600,1200,2400],           img:'/upgrades/upg_luckydrops.jpg.jpg' },
  // SURVIVAL
  { id:25, name:'EXTRA LIFE',     cat:'SURVIVAL', effect:'Start with 4 lives instead of 3.',    maxLv:3, prices:[800,1600,3200],           img:'/upgrades/24. ❤ EXTRA LIFE.png.jpg' },
  { id:26, name:'SECOND WIND',    cat:'SURVIVAL', effect:'Auto-revive once per run at 1HP.',     maxLv:1, prices:[3000],                    img:'/upgrades/25. 💫 SECOND WIND.png.jpg' },
  { id:27, name:'STIM PACK',      cat:'SURVIVAL', effect:'First hit heals instead of damage.',   maxLv:2, prices:[1800,3600],               img:'/upgrades/upg_stimpack.jpg.jpg' },
  // SPECIAL
  { id:28, name:'HELPER DRONE',   cat:'SPECIAL',  effect:'Deploy drone that auto-fires enemies.',maxLv:3, prices:[2000,4000,8000],          img:'/upgrades/upg_helperdrone.jpg.jpg' },
  { id:29, name:'MG TURRET',      cat:'SPECIAL',  effect:'Auto machine gun fires alongside you.',maxLv:3, prices:[2500,5000,10000],         img:'/upgrades/upg_mgturret.jpg.jpg' },
  { id:30, name:'OVERCHARGE',     cat:'SPECIAL',  effect:'10 kills = 5s invincibility.',         maxLv:3, prices:[2500,5000,10000],         img:'/upgrades/upg_overcharge.jpg.jpg' },
]

const CATS = ['ALL','MOVEMENT','DEFENSE','OFFENSE','ECONOMY','SURVIVAL','SPECIAL']
const CAT_COLOR:Record<string,string> = {
  MOVEMENT:'#00EAFF', DEFENSE:'#39FF14', OFFENSE:'#FF2244',
  ECONOMY:'#FFD700',  SURVIVAL:'#FF6B1A', SPECIAL:'#BF5FFF'
}

export default function Upgrades() {
  const [cat, setCat] = useState('ALL')
  const [levels, setLevels] = useState<Record<number,number>>(() => {
    try { return JSON.parse(localStorage.getItem('upgradeLevels') || '{}') } catch { return {} }
  })
  const visible = cat === 'ALL' ? UPGRADES : UPGRADES.filter(u => u.cat === cat)
  const [coins, setCoins] = useState(() => {
    try { return parseInt(localStorage.getItem('upgradeCoins') || '5000') } catch { return 5000 }
  })
  const lv = (id:number) => levels[id] || 0
  const upgrade = (id:number) => {
    const u = UPGRADES.find(x => x.id === id)!
    const l = lv(id)
    if (l >= u.maxLv) return
    const price = u.prices[l]
    if (coins < price) return
    const newCoins = coins - price
    const newLevels = {...levels, [id]: l+1}
    setCoins(newCoins)
    setLevels(newLevels)
    try {
      localStorage.setItem('upgradeCoins', String(newCoins))
      localStorage.setItem('upgradeLevels', JSON.stringify(newLevels))
    } catch {}
  }

  return (
    <div className="cyber-bg" style={{padding:'40px 24px',maxWidth:1400,margin:'0 auto'}}>
      <div style={{marginBottom:24}}>
        <div className="cl-badge cl-badge-gold" style={{marginBottom:12}}>UPGRADE LAB</div>
        <h1 className="cl-title" style={{fontSize:'clamp(28px,5vw,52px)'}}>UPGRADES</h1>
        <div style={{fontFamily:'Orbitron,monospace',fontSize:12,color:'#FFD700',marginTop:8}}>
          🪙 COINS: <span style={{color:'#39FF14'}}>{coins.toLocaleString()}</span>
        </div>
      </div>
      <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:24}}>
        {CATS.map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{padding:'8px 16px',cursor:'pointer',fontFamily:'Orbitron,monospace',fontSize:9,letterSpacing:2,background:cat===c?`rgba(${c==='ALL'?'255,215,0':''}, 0.1)`:'transparent',border:`1px solid ${cat===c?(CAT_COLOR[c]||'#FFD700'):'rgba(255,215,0,0.2)'}`,color:cat===c?(CAT_COLOR[c]||'#FFD700'):'rgba(255,215,0,0.4)',transition:'all 0.2s'}}>{c}</button>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
        {visible.map(u=>{
          const l=lv(u.id), maxed=l>=u.maxLv, bc=CAT_COLOR[u.cat]||'#FFD700', price=l<u.maxLv?u.prices[l]:null
          return (
            <div key={u.id} style={{background:'rgba(10,18,25,0.9)',border:`1px solid ${maxed?'rgba(57,255,20,0.3)':'rgba(184,134,11,0.2)'}`,overflow:'hidden'}}>
              <div style={{position:'relative',aspectRatio:'16/9',overflow:'hidden',background:'#030609'}}>
                <img src={u.img} alt={u.name} style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.9}}
                  onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                <div style={{position:'absolute',top:8,left:8,background:`rgba(0,0,0,0.85)`,border:`1px solid ${bc}50`,padding:'2px 8px',fontFamily:'Orbitron,monospace',fontSize:8,color:bc}}>{u.cat}</div>
                <div style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.85)',border:`1px solid ${maxed?'#39FF14':bc}`,padding:'2px 8px',fontFamily:'Orbitron,monospace',fontSize:9,color:maxed?'#39FF14':bc}}>{maxed?'MAX':`Lv${l}/${u.maxLv}`}</div>
                <div style={{position:'absolute',bottom:0,left:0,right:0,display:'flex',gap:2,padding:'0 4px 4px'}}>
                  {Array.from({length:u.maxLv},(_,i)=>(
                    <div key={i} style={{flex:1,height:3,background:i<l?bc:'rgba(255,215,0,0.15)',borderRadius:1.5}}/>
                  ))}
                </div>
              </div>
              <div style={{padding:'10px 12px'}}>
                <div style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,color:maxed?'#39FF14':bc,marginBottom:4}}>{u.name}</div>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:11,color:'rgba(255,230,100,0.45)',marginBottom:10,lineHeight:1.3}}>{u.effect}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:11,color:maxed?'#39FF14':bc}}>{maxed?'MAXED':`${price?.toLocaleString()} COINS`}</div>
                  {!maxed&&<button onClick={()=>upgrade(u.id)} className="cl-btn cl-btn-gold" style={{padding:'5px 12px',fontSize:8}}>{l===0?'BUY':'UPGRADE'}</button>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
