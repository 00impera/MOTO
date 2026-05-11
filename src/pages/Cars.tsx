import { useState } from 'react'

const CARS = [
  { id:1,  name:'STREET RUNNER',  type:'STANDARD',  price:0,     img:'/cars/1.png.jpg',  spd:5, hdl:6, acc:5 },
  { id:2,  name:'NEON RACER',     type:'SPORT',     price:1000,  img:'/cars/2.png.jpg',  spd:7, hdl:7, acc:6 },
  { id:3,  name:'CYBER HAWK',     type:'SPORT',     price:2000,  img:'/cars/3.png.jpg',  spd:7, hdl:8, acc:7 },
  { id:4,  name:'TURBO GHOST',    type:'ELITE',     price:3500,  img:'/cars/4.png.jpg',  spd:8, hdl:7, acc:8 },
  { id:5,  name:'IRON CLAW',      type:'ELITE',     price:5000,  img:'/cars/5.png.jpg',  spd:8, hdl:9, acc:7 },
  { id:6,  name:'PLASMA BLADE',   type:'ELITE',     price:7000,  img:'/cars/6.png.jpg',  spd:9, hdl:8, acc:8 },
  { id:7,  name:'VOID STRIKER',   type:'LEGEND',    price:10000, img:'/cars/7.png.jpg',  spd:9, hdl:9, acc:9 },
  { id:8,  name:'MONAD BEAST',    type:'LEGEND',    price:12000, img:'/cars/8.png.jpg',  spd:10,hdl:8, acc:9 },
  { id:9,  name:'DEATH MACHINE',  type:'LEGEND',    price:15000, img:'/cars/9.png.jpg',  spd:10,hdl:9, acc:8 },
  { id:10, name:'CYBER TITAN',    type:'ULTIMATE',  price:20000, img:'/cars/10.png.jpg', spd:10,hdl:10,acc:9 },
  { id:11, name:'PHANTOM X',      type:'ULTIMATE',  price:25000, img:'/cars/11.png.jpg', spd:10,hdl:9, acc:10 },
  { id:12, name:'MONAD GOD CAR',  type:'ULTIMATE',  price:50000, img:'/cars/12.png.jpg', spd:10,hdl:10,acc:10 },
]

const TYPE_COLOR:Record<string,string> = {
  'STANDARD':'#39FF14','SPORT':'#00EAFF','ELITE':'#BF5FFF','LEGEND':'#FFD700','ULTIMATE':'#FF2244'
}

export default function Cars() {
  const [sel, setSel] = useState(1)
  const [owned, setOwned] = useState<number[]>([1])
  const [coins, setCoins] = useState(5000)
  const [_active, setActive] = useState(1)
  const selC = CARS.find(c => c.id === sel)!
  const tc = TYPE_COLOR[selC.type]||'#FFD700'

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
      <div style={{marginBottom:24}}>
        <div className="cl-badge cl-badge-cyan" style={{marginBottom:12}}>VEHICLE SELECT</div>
        <h1 className="cl-title" style={{fontSize:'clamp(28px,5vw,52px)'}}>GARAGE</h1>
        <p style={{fontFamily:'Rajdhani,sans-serif',fontSize:14,color:'rgba(255,230,100,0.4)',marginTop:4}}>12 VEHICLES · CHOOSE YOUR RIDE</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:24}}>
        {/* DETAIL */}
        <div style={{border:`1px solid ${tc}40`,overflow:'hidden',background:'rgba(10,18,25,0.95)'}}>
          <div style={{position:'relative',aspectRatio:'4/3',overflow:'hidden',background:'#030609'}}>
            <img src={selC.img} alt={selC.name} style={{width:'100%',height:'100%',objectFit:'cover'}}
              onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(5,10,14,0.9) 0%,transparent 55%)'}}/>
            <div style={{position:'absolute',top:10,left:10,background:`rgba(0,0,0,0.85)`,border:`1px solid ${tc}`,padding:'3px 10px',fontFamily:'Orbitron,monospace',fontSize:8,color:tc}}>{selC.type}</div>
            <div style={{position:'absolute',bottom:12,left:12}}>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:16,fontWeight:900,color:tc}}>{selC.name}</div>
            </div>
          </div>
          <div style={{padding:16}}>
            <StatBar label="SPEED"        val={selC.spd} color="#FF2244"/>
            <StatBar label="HANDLING"     val={selC.hdl} color="#00EAFF"/>
            <StatBar label="ACCELERATION" val={selC.acc} color="#FFD700"/>
            <div style={{marginTop:16}}>
              {!owned.includes(selC.id) ? (
                <button onClick={()=>{if(!selC||coins<selC.price)return;setCoins(c=>c-selC.price);setOwned(p=>[...p,selC.id]);setActive(selC.id)}} className="cl-btn cl-btn-gold" style={{width:'100%',fontSize:9}}>
                  BUY — {selC.price.toLocaleString()} COINS
                </button>
              ) : (
                <button className="cl-btn cl-btn-green" style={{width:'100%',fontSize:9}}>✓ SELECT VEHICLE</button>
              )}
            </div>
          </div>
        </div>

        {/* GRID */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:12,alignContent:'start'}}>
          {CARS.map(c => {
            const isOwned = owned.includes(c.id)
            const bc = TYPE_COLOR[c.type]||'#FFD700'
            return (
              <div key={c.id} onClick={()=>setSel(c.id)}
                style={{background:'rgba(10,18,25,0.9)',border:`1px solid ${sel===c.id?bc:isOwned?'rgba(57,255,20,0.3)':'rgba(184,134,11,0.2)'}`,cursor:'pointer',overflow:'hidden',transition:'all 0.2s',boxShadow:sel===c.id?`0 0 20px ${bc}20`:'none'}}>
                <div style={{position:'relative',aspectRatio:'4/3',overflow:'hidden',background:'#030609'}}>
                  <img src={c.img} alt={c.name} style={{width:'100%',height:'100%',objectFit:'cover',opacity:isOwned?0.95:0.4}}
                    onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(5,10,14,0.85) 0%,transparent 55%)'}}/>
                  {!isOwned && <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🔒</div>}
                  {isOwned && <div style={{position:'absolute',top:6,left:6,background:'rgba(57,255,20,0.15)',border:'1px solid #39FF14',padding:'2px 6px',fontFamily:'Orbitron,monospace',fontSize:7,color:'#39FF14'}}>OWNED</div>}
                  <div style={{position:'absolute',top:6,right:6,background:'rgba(0,0,0,0.85)',border:`1px solid ${bc}50`,padding:'2px 6px',fontFamily:'Orbitron,monospace',fontSize:7,color:bc}}>{c.type}</div>
                </div>
                <div style={{padding:'10px 12px'}}>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:bc,marginBottom:4}}>{c.name}</div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:isOwned?'#39FF14':'rgba(255,215,0,0.4)'}}>
                    {isOwned ? '✓ OWNED' : c.price===0 ? 'FREE' : `${c.price.toLocaleString()} COINS`}
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
