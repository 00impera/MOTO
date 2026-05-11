import { Link } from 'react-router-dom'

const btnBase: React.CSSProperties = {
  fontFamily: 'Orbitron,monospace', fontSize: 12, fontWeight: 700,
  padding: '13px 28px', borderRadius: 999, border: '1px solid',
  background: 'transparent', cursor: 'pointer', letterSpacing: 2,
  transition: 'all 0.2s', whiteSpace: 'nowrap' as const, textDecoration: 'none',
  display: 'inline-block',
}

const gridItems = [
  {label:'WEAPONS',  to:'/weapons',   n:'16',   color:'#00EAFF'},
  {label:'UPGRADES', to:'/upgrades',  n:'22',   color:'#FFD700'},
  {label:'LEVELS',   to:'/levels',    n:'20',   color:'#39FF14'},
  {label:'RIDERS',   to:'/characters',n:'12',   color:'#ff6ec7'},
  {label:'GARAGE',   to:'/cars',      n:'12',   color:'#FFD700'},
  {label:'PACKS',    to:'/packs',     n:'7',    color:'#a259ff'},
  {label:'STAKING',  to:'/staking',   n:'120%', color:'#39FF14'},
]

const bannerLinks = [
  {label:'@MOTORunnerBot', href:'https://t.me/MOTORunnerBot',           color:'#00EAFF'},
  {label:'OpenSea',        href:'https://opensea.io/SUPERRARECOINS',    color:'#a259ff'},
  {label:'MonadVision',    href:'https://monadvision.com/address/0x592B35c8917eD36c39Ef73D0F5e92B0173560b2e', color:'#39FF14'},
  {label:'00impera',       href:'https://github.com/00impera',          color:'#FFD700'},
]

export default function Home() {
  return (
    <div className="cyber-bg" style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',padding:'80px 24px 60px',textAlign:'center'}}>
      <div className="cl-badge cl-badge-gold" style={{marginBottom:16}}>WEB3 GAME ON MONAD</div>

      <h1 style={{fontFamily:'Orbitron,monospace',fontWeight:900,fontSize:'clamp(40px,8vw,96px)',lineHeight:1,marginBottom:24,
        background:'linear-gradient(90deg,#FFD700,#39FF14,#00eaff)',
        WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>MOTO</h1>

      <p style={{fontFamily:'Rajdhani,sans-serif',fontSize:18,color:'rgba(255,230,100,0.6)',marginBottom:48,maxWidth:500}}>
        Survive. Upgrade. Earn MOTO. The fastest Web3 runner on Monad Mainnet.
      </p>

      <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center',marginBottom:64}}>
        <Link to="/game" style={{textDecoration:'none'}}>
          <div style={{...btnBase,borderColor:'#FFD700',color:'#FFD700',boxShadow:'0 0 10px #FFD70055'}}
            onMouseEnter={e=>{e.currentTarget.style.background='#FFD70018';e.currentTarget.style.boxShadow='0 0 22px #FFD70099'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.boxShadow='0 0 10px #FFD70055'}}>
            ▶ PLAY NOW
          </div>
        </Link>
        <Link to="/upgrades" style={{textDecoration:'none'}}>
          <div style={{...btnBase,borderColor:'#00EAFF',color:'#00EAFF',boxShadow:'0 0 10px #00EAFF55'}}
            onMouseEnter={e=>{e.currentTarget.style.background='#00EAFF18';e.currentTarget.style.boxShadow='0 0 22px #00EAFF99'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.boxShadow='0 0 10px #00EAFF55'}}>
            UPGRADES
          </div>
        </Link>
        <Link to="/buy" style={{textDecoration:'none'}}>
          <div style={{...btnBase,borderColor:'#39FF14',color:'#39FF14',boxShadow:'0 0 10px #39FF1455'}}
            onMouseEnter={e=>{e.currentTarget.style.background='#39FF1418';e.currentTarget.style.boxShadow='0 0 22px #39FF1499'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.boxShadow='0 0 10px #39FF1455'}}>
            BUY MOTO
          </div>
        </Link>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,maxWidth:820,width:'100%'}}>
        {gridItems.map(item=>(
          <Link key={item.to} to={item.to} style={{textDecoration:'none'}}>
            <div style={{border:`1px solid ${item.color}33`,padding:'20px 12px',background:'transparent',borderRadius:12,backdropFilter:'blur(4px)',transition:'all 0.2s',cursor:'pointer'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=item.color;e.currentTarget.style.boxShadow=`0 0 16px ${item.color}44`}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=item.color+'33';e.currentTarget.style.boxShadow='none'}}>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:22,color:item.color,marginBottom:6}}>{item.n}</div>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:8,letterSpacing:2,color:item.color+'99'}}>{item.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{marginTop:64,marginBottom:32,textAlign:'center'}}>
        <div style={{display:'inline-block',padding:'24px 32px',border:'1px solid #C8960C44',background:'transparent',borderRadius:16,maxWidth:360,width:'90%',backdropFilter:'blur(8px)',animation:'pulse-glow 2.5s ease-in-out infinite'}}>
          <div style={{fontFamily:'Orbitron,monospace',fontSize:15,fontWeight:900,color:'#FFD700',textShadow:'0 0 8px #FFE566',marginBottom:12}}>
            LIKE · SUPPORT
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12,justifyContent:'center',marginBottom:16}}>
            <span style={{color:'#39FF14',fontSize:18,textShadow:'0 0 8px #00FF00',letterSpacing:4}}>★★★★☆</span>
            <div style={{padding:'4px 12px',background:'transparent',border:'1px solid #39FF14',boxShadow:'0 0 10px #39FF14',borderRadius:999,fontFamily:'Orbitron,monospace',fontSize:9,color:'#39FF14'}}>
              12,584 LIKES
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <a href="https://monadvision.com/myspace" target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
              <div style={{...btnBase,borderColor:'#39FF14',color:'#39FF14',boxShadow:'0 0 10px #39FF1455',display:'block',textAlign:'center',padding:'11px 20px'}}
                onMouseEnter={e=>{e.currentTarget.style.background='#39FF1418';e.currentTarget.style.boxShadow='0 0 22px #39FF1499'}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.boxShadow='0 0 10px #39FF1455'}}>
                VISIT & LIKE
              </div>
            </a>
            <a href="https://monadvision.com/myspace" target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
              <div style={{...btnBase,borderColor:'#FFD700',color:'#FFD700',boxShadow:'0 0 10px #FFD70055',display:'block',textAlign:'center',padding:'11px 20px'}}
                onMouseEnter={e=>{e.currentTarget.style.background='#FFD70018';e.currentTarget.style.boxShadow='0 0 22px #FFD70099'}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.boxShadow='0 0 10px #FFD70055'}}>
                DONATE & SUPPORT
              </div>
            </a>
          </div>
        </div>
      </div>

      <div style={{width:'100%',maxWidth:820,marginTop:16,borderTop:'1px solid rgba(255,215,0,0.15)',paddingTop:20,display:'flex',flexWrap:'wrap',justifyContent:'center',alignItems:'center',gap:0}}>
        {bannerLinks.map((item,i)=>(
          <span key={item.href} style={{display:'flex',alignItems:'center'}}>
            <a href={item.href} target="_blank" rel="noreferrer" style={{fontFamily:'Orbitron,monospace',fontSize:8,letterSpacing:1.5,color:item.color,textDecoration:'none',padding:'6px 14px',transition:'all 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.textShadow=`0 0 10px ${item.color}`}}
              onMouseLeave={e=>{e.currentTarget.style.textShadow='none'}}>
              {item.label}
            </a>
            {i < bannerLinks.length-1 && <span style={{color:'rgba(255,215,0,0.2)',fontSize:10}}>·</span>}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 10px #C8960C44, 0 0 25px rgba(200,150,12,0.2); }
          50% { box-shadow: 0 0 25px #FFD70066, 0 0 60px rgba(255,215,0,0.25); }
        }
      `}</style>
    </div>
  )
}
