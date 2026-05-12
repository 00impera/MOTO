import { NavLink } from 'react-router-dom'
import { useWeb3 } from '../hooks/useWeb3'
import { Web3Toast } from './Web3HUD'
import MotoCoin from './MotoCoin'

const NAV = [
  {to:'/game',       label:'▶ PLAY',     color:'#39FF14'},
  {to:'/claim',      label:'⚡ CLAIM',    color:'#39FF14'},
  {to:'/mint',       label:'🏍 MINT NFT', color:'#FFD700'},
  {to:'/packs',      label:'PACKS',       color:'#ff6ec7'},
  {to:'/governance', label:'🗳 VOTE',      color:'#a259ff'},
  {to:'/weapons',    label:'ARSENAL',     color:'#00EAFF'},
  {to:'/cars',       label:'GARAGE',      color:'#FFD700'},
  {to:'/upgrades',   label:'UPGRADES',    color:'#a259ff'},
  {to:'/packs',      label:'PACKS',       color:'#ff6ec7'},
  {to:'/staking',    label:'STAKING',     color:'#39FF14'},
  {to:'/buy',        label:'BUY MOTO',    color:'#FFD700'},
]

function LedDot({color}:{color:string}) {
  return (
    <span style={{
      display:'inline-block', width:5, height:5, borderRadius:'50%',
      background:color, boxShadow:`0 0 4px ${color}, 0 0 8px ${color}`,
      flexShrink:0, animation:'led-pulse 1.8s ease-in-out infinite',
    }}/>
  )
}

export default function Navbar() {
  const {
    address, connected, chainOk, loading,
    balanceMOTO, balanceMON, balanceNFT,
    connect, disconnect, addMotoToWallet, fetchBalances,
    toast: toastState,
  } = useWeb3()

  const short = address ? `${address.slice(0,5)}…${address.slice(-4)}` : ''

  return (
    <>
      <Web3Toast toast={toastState} />
      <style>{`@keyframes led-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      <nav style={{position:'sticky',top:0,zIndex:50,background:'rgba(5,10,14,0.97)',
        borderBottom:'1px solid rgba(184,134,11,0.2)',backdropFilter:'blur(12px)'}}>

        <div style={{display:'flex',alignItems:'center',gap:10,padding:'5px 16px',
          borderBottom:'1px solid rgba(184,134,11,0.1)',flexWrap:'wrap'}}>
          <LedDot color={chainOk ? '#39FF14' : connected ? '#FF2244' : '#555'} />
          <span style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'rgba(255,215,0,0.5)',letterSpacing:2}}>
            MONAD MAINNET #143
          </span>
          {connected && address && <>
            <span style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'#00EAFF'}}>{balanceMON} MON</span>
            <span style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'#FFD700'}}>
              {parseFloat(balanceMOTO) > 9999 ? (parseFloat(balanceMOTO)/1000).toFixed(1)+'K' : balanceMOTO} MOTO
            </span>
            <span style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'#a259ff'}}>{balanceNFT} NFT</span>
            <span style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'rgba(255,215,0,0.4)',cursor:'pointer'}}
              onClick={()=>fetchBalances(address)}>↺</span>
            <button onClick={addMotoToWallet} style={{
              fontFamily:'Orbitron,monospace',fontSize:7,padding:'2px 8px',
              borderRadius:999,border:'1px solid rgba(255,215,0,0.3)',
              color:'rgba(255,215,0,0.5)',background:'transparent',cursor:'pointer'}}>+MOTO</button>
          </>}
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 16px',gap:8}}>
          <NavLink to="/" style={{textDecoration:'none',display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
            <MotoCoin size={44}/>
            <span style={{fontFamily:'Orbitron,monospace',fontWeight:900,fontSize:16,color:'#FFD700',textShadow:'0 0 8px #FFD700'}}>MOTO</span>
          </NavLink>

          <div style={{display:'flex',alignItems:'center',gap:5,overflowX:'auto'}}>
            {NAV.map(({to,label,color})=>(
              <NavLink key={to} to={to} style={{textDecoration:'none'}}>
                {({isActive})=>(
                  <div style={{
                    display:'flex',alignItems:'center',gap:5,
                    padding:'5px 11px',borderRadius:999,
                    border:`1px solid ${isActive ? '#FFD700' : color+'55'}`,
                    background: isActive ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.02)',
                    cursor:'pointer',transition:'all 0.2s',whiteSpace:'nowrap' as const,
                  }}
                  onMouseEnter={e=>{
                    e.currentTarget.style.border=`1px solid ${color}`
                    e.currentTarget.style.boxShadow=`0 0 12px ${color}55`
                    e.currentTarget.style.background=`${color}15`
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.border=`1px solid ${isActive?'#FFD700':color+'55'}`
                    e.currentTarget.style.boxShadow='none'
                    e.currentTarget.style.background=isActive?'rgba(255,215,0,0.08)':'rgba(255,255,255,0.02)'
                  }}>
                    <LedDot color={isActive ? '#FFD700' : color} />
                    <span style={{fontFamily:'Orbitron,monospace',fontSize:8,
                      color: isActive ? '#FFD700' : color,letterSpacing:1.5}}>{label}</span>
                  </div>
                )}
              </NavLink>
            ))}
          </div>

          <div style={{flexShrink:0}}>
            {connected ? (
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',
                borderRadius:999,border:'1px solid #39FF14',background:'transparent',cursor:'pointer'}}
                onClick={disconnect}
                onMouseEnter={e=>(e.currentTarget.style.background='rgba(57,255,20,0.1)')}
                onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                <LedDot color='#39FF14'/>
                <span style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'#39FF14',letterSpacing:1}}>{short}</span>
              </div>
            ) : (
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',
                borderRadius:999,border:'1px solid #FFD700',background:'transparent',
                cursor:'pointer',boxShadow:'0 0 10px rgba(255,215,0,0.3)'}}
                onClick={()=>!loading && connect()}
                onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,215,0,0.1)')}
                onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                <LedDot color='#FFD700'/>
                <span style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'#FFD700',letterSpacing:1}}>
                  {loading ? '...' : '⬡ CONNECT'}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
