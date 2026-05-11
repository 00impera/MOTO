import { useState } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { Web3Toast } from '../components/Web3HUD'
import CardPayment from '../components/CardPayment'

const FULL_CONTRACT = '0xD49e4A6caEDf6e06C8E520E90518F7cDAcEbBd63'

export default function Buy() {
  const [showCard, setShowCard] = useState(false)
  const { connected, loading, balanceMOTO, balanceMON, connect, addMotoToWallet, toast: toastState } = useWeb3()

  const stats = [
    { label: 'CONTRACT', val: `${FULL_CONTRACT.slice(0,10)}...${FULL_CONTRACT.slice(-5)}`, color: '#00EAFF',
      link: `https://explorer.monad.xyz/address/${FULL_CONTRACT}` },
    { label: 'NETWORK',  val: 'Monad Mainnet', color: '#FFD700' },
    { label: 'SYMBOL',   val: 'MOTO',          color: '#39FF14' },
    { label: 'DECIMALS', val: '18',            color: '#FFD700' },
    { label: 'YOUR MOTO', val: `${balanceMOTO} MOTO`, color: '#a259ff' },
    { label: 'YOUR MON',  val: `${balanceMON} MON`,   color: '#00EAFF' },
  ]

  const btnBase: React.CSSProperties = {
    fontFamily: 'Orbitron,monospace', fontSize: 11, fontWeight: 700,
    padding: '13px 24px', borderRadius: 999, border: '1px solid',
    background: 'transparent', cursor: 'pointer', letterSpacing: 2,
    transition: 'all 0.2s', whiteSpace: 'nowrap' as const,
    textDecoration: 'none', display: 'inline-block',
  }

  const buttons = [
    { label: 'BUY ON UNISWAP', href: 'https://app.uniswap.org', color: '#FFD700' },
    { label: 'MONAD SWAP', href: 'https://www.monadbridge.com/', color: '#00EAFF' },
  ]

  return (
    <>
      <Web3Toast toast={toastState} />
      <div className="cyber-bg" style={{ padding: '40px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>

        <div className="cl-badge cl-badge-green" style={{ marginBottom: 16 }}>TOKEN SWAP</div>
        <h1 style={{
          fontFamily: 'Orbitron,monospace', fontWeight: 900,
          fontSize: 'clamp(28px,5vw,52px)', marginBottom: 8,
          background: 'linear-gradient(90deg,#FFD700,#39FF14,#00eaff,#a259ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>BUY MOTO</h1>
        <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 16, color: '#00eaff', marginBottom: 4 }}>
          Buy MOTO tokens to play, earn rewards and unlock exclusive content.
        </p>
        <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 13, color: '#a259ff', fontWeight: 600, marginBottom: 48 }}>
          SECURE ON MONAD MAINNET.
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
          gap: 12, marginBottom: 48,
        }}>
          {stats.map(item => (
            <div key={item.label} style={{
              border: `1px solid ${item.color}33`, padding: '16px 12px',
              background: 'transparent', borderRadius: 12, backdropFilter: 'blur(4px)', transition: 'all 0.2s',
            }}
            onMouseEnter={e=>(e.currentTarget.style.borderColor=item.color)}
            onMouseLeave={e=>(e.currentTarget.style.borderColor=item.color+'33')}>
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:7, color:'rgba(255,215,0,0.4)', marginBottom:8, letterSpacing:2 }}>
                {item.label}
              </div>
              {item.link ? (
                <a href={item.link} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:11, color:item.color, wordBreak:'break-all' }}>{item.val}</div>
                </a>
              ) : (
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:12, color:item.color }}>{item.val}</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:16 }}>
          {buttons.map(b => (
            <a key={b.label} href={b.href} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
              <div style={{ ...btnBase, borderColor:b.color, color:b.color, boxShadow:`0 0 10px ${b.color}55` }}
                onMouseEnter={e=>{ e.currentTarget.style.background=b.color+'18'; e.currentTarget.style.boxShadow=`0 0 22px ${b.color}99` }}
                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.boxShadow=`0 0 10px ${b.color}55` }}>
                {b.label}
              </div>
            </a>
          ))}

          {connected ? (
            <div style={{ ...btnBase, borderColor:'#39FF14', color:'#39FF14', boxShadow:'0 0 10px #39FF1455' }}
              onClick={addMotoToWallet}
              onMouseEnter={e=>{ e.currentTarget.style.background='#39FF1418'; e.currentTarget.style.boxShadow='0 0 22px #39FF1499' }}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.boxShadow='0 0 10px #39FF1455' }}>
              + ADD MOTO TO WALLET
            </div>
          ) : (
            <div style={{ ...btnBase, borderColor:'#39FF14', color:'#39FF14', boxShadow:'0 0 10px #39FF1455', opacity:loading?0.5:1 }}
              onClick={()=>!loading && connect()}
              onMouseEnter={e=>{ e.currentTarget.style.background='#39FF1418' }}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent' }}>
              {loading ? '...' : '⬡ CONNECT WALLET'}
            </div>
          )}

          <div style={{ ...btnBase, borderColor:'#ff6ec7', color:'#ff6ec7', boxShadow:'0 0 10px #ff6ec755' }}
            onClick={()=>setShowCard(true)}
            onMouseEnter={e=>{ e.currentTarget.style.background='#ff6ec718'; e.currentTarget.style.boxShadow='0 0 22px #ff6ec799' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.boxShadow='0 0 10px #ff6ec755' }}>
            💳 BUY WITH CARD
          </div>
        </div>

        <p style={{ fontFamily:'Orbitron,monospace', fontSize:7, color:'rgba(255,215,0,0.2)', marginTop:32, letterSpacing:2 }}>
          MONAD MAINNET · CHAIN ID 143 · {FULL_CONTRACT}
        </p>
      </div>
      {showCard && <CardPayment onClose={()=>setShowCard(false)} />}
    </>
  )
}
