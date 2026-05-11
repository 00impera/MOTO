import { useState, useEffect } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { Web3Toast } from '../components/Web3HUD'

const STAKING_STATS = { apy: '120%', totalStaked: '2.4M MOTO' }

export default function Staking() {
  const {
    address, connected, loading,
    balanceMOTO, balanceMON,
    connect, buyCoins, getPlayerStats,
    toast: toastState,
  } = useWeb3()

  const [stakeAmount, setStakeAmount] = useState('')
  const [yourStake, setYourStake] = useState('0')
  const [earned, setEarned] = useState('0')
  const [season, setSeason] = useState('1')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!connected || !address) return
    getPlayerStats(address).then(s => {
      if (!s) return
      setEarned(parseFloat(s.earned).toFixed(2))
      setSeason(s.season)
    })
  }, [connected, address])

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return
    setBusy(true)
    const mon = (parseFloat(stakeAmount) * 0.001).toFixed(4)
    const ok = await buyCoins(parseFloat(mon), 0)
    if (ok) {
      setYourStake(s => (parseFloat(s) + parseFloat(stakeAmount)).toFixed(2))
      setStakeAmount('')
    }
    setBusy(false)
  }

  const handleClaim = async () => {
    if (!connected) { connect(); return }
    setBusy(true)
    setTimeout(() => setBusy(false), 1500)
  }

  const stats = [
    { label: 'APY',          val: STAKING_STATS.apy,        color: '#39FF14' },
    { label: 'TOTAL STAKED', val: STAKING_STATS.totalStaked, color: '#FFD700' },
    { label: 'YOUR STAKE',   val: `${yourStake} MOTO`,       color: '#00EAFF' },
    { label: 'YOUR BALANCE', val: `${balanceMOTO} MOTO`,     color: '#a259ff' },
    { label: 'EARNED',       val: `${earned} MOTO`,          color: '#ff6ec7' },
    { label: 'SEASON',       val: `#${season}`,              color: '#FFE566' },
  ]

  const btnBase: React.CSSProperties = {
    fontFamily: 'Orbitron,monospace', fontSize: 11, fontWeight: 700,
    padding: '13px 24px', borderRadius: 999, border: '1px solid',
    background: 'transparent', cursor: 'pointer', letterSpacing: 2,
    transition: 'all 0.2s', whiteSpace: 'nowrap' as const,
  }

  return (
    <>
      <Web3Toast toast={toastState} />
      <div className="cyber-bg" style={{ padding: '40px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>

        <div className="cl-badge cl-badge-purple" style={{ marginBottom: 16 }}>EARN REWARDS</div>
        <h1 style={{
          fontFamily: 'Orbitron,monospace', fontWeight: 900,
          fontSize: 'clamp(28px,5vw,52px)', marginBottom: 8,
          background: 'linear-gradient(90deg,#a259ff,#ff6ec7,#00eaff,#39FF14)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>STAKING</h1>
        <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 16, color: '#00eaff', marginBottom: 4 }}>
          Stake MOTO tokens to earn passive rewards.
        </p>
        <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 13, color: '#a259ff', fontWeight: 600, marginBottom: 48 }}>
          SEASON {season} ACTIVE · MONAD MAINNET.
        </p>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 40 }}>
          {stats.map(item => (
            <div key={item.label} style={{
              border: `1px solid ${item.color}33`, padding: '16px 12px',
              background: 'transparent', borderRadius: 12,
              backdropFilter: 'blur(4px)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = item.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = item.color + '33'}>
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:7, color:'rgba(255,215,0,0.4)', marginBottom:8, letterSpacing:2 }}>
                {item.label}
              </div>
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:16, color:item.color }}>
                {item.val}
              </div>
            </div>
          ))}
        </div>

        {/* Wallet bar */}
        {connected && (
          <div style={{
            border: '1px solid rgba(57,255,20,0.2)', borderRadius: 12,
            padding: '10px 16px', marginBottom: 24,
            display: 'flex', justifyContent: 'center', gap: 24,
            background: 'transparent', backdropFilter: 'blur(4px)',
          }}>
            <span style={{ fontFamily:'Orbitron,monospace', fontSize:9, color:'rgba(255,215,0,0.5)' }}>
              WALLET: <span style={{ color:'#FFD700' }}>{address?.slice(0,6)}…{address?.slice(-4)}</span>
            </span>
            <span style={{ fontFamily:'Orbitron,monospace', fontSize:9, color:'#00EAFF' }}>{balanceMON} MON</span>
            <span style={{ fontFamily:'Orbitron,monospace', fontSize:9, color:'#FFD700' }}>{balanceMOTO} MOTO</span>
          </div>
        )}

        {/* Actions */}
        {!connected ? (
          <div style={{ ...btnBase, borderColor:'#FFD700', color:'#FFD700', boxShadow:'0 0 10px #FFD70055', display:'inline-block', opacity: loading?0.5:1 }}
            onClick={()=>!loading && connect()}
            onMouseEnter={e=>{ e.currentTarget.style.background='#FFD70018'; e.currentTarget.style.boxShadow='0 0 22px #FFD70099' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.boxShadow='0 0 10px #FFD70055' }}>
            {loading ? 'CONNECTING...' : '⬡ CONNECT TO STAKE'}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>

            {/* Input + Stake button */}
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input
                type="number"
                value={stakeAmount}
                onChange={e => setStakeAmount(e.target.value)}
                placeholder="MOTO amount"
                style={{
                  fontFamily:'Orbitron,monospace', fontSize:11,
                  background:'transparent', border:'1px solid rgba(255,215,0,0.3)',
                  borderRadius: 999, color:'#FFD700', padding:'12px 18px',
                  width:180, outline:'none',
                }}
              />
              <div style={{ ...btnBase, borderColor:'#a259ff', color:'#a259ff',
                boxShadow:'0 0 10px #a259ff55', opacity: busy||!stakeAmount?0.4:1,
                cursor: busy||!stakeAmount?'not-allowed':'pointer' }}
                onClick={handleStake}
                onMouseEnter={e=>{ if(!busy&&stakeAmount){ e.currentTarget.style.background='#a259ff18'; e.currentTarget.style.boxShadow='0 0 22px #a259ff99' }}}
                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.boxShadow='0 0 10px #a259ff55' }}>
                {busy ? '...' : 'STAKE MOTO'}
              </div>
            </div>

            <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
              <div style={{ ...btnBase, borderColor:'#FFD700', color:'#FFD700',
                boxShadow:'0 0 10px #FFD70055', opacity:busy?0.4:1,
                cursor:busy?'not-allowed':'pointer' }}
                onClick={handleClaim}
                onMouseEnter={e=>{ if(!busy){ e.currentTarget.style.background='#FFD70018'; e.currentTarget.style.boxShadow='0 0 22px #FFD70099' }}}
                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.boxShadow='0 0 10px #FFD70055' }}>
                {busy ? '...' : 'CLAIM REWARDS'}
              </div>
              <div style={{ ...btnBase, borderColor:'#39FF14', color:'#39FF14', boxShadow:'0 0 10px #39FF1455' }}
                onClick={() => address && getPlayerStats(address).then(s => s && setEarned(parseFloat(s.earned).toFixed(2)))}
                onMouseEnter={e=>{ e.currentTarget.style.background='#39FF1418'; e.currentTarget.style.boxShadow='0 0 22px #39FF1499' }}
                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.boxShadow='0 0 10px #39FF1455' }}>
                ↺ REFRESH
              </div>
            </div>

            <p style={{ fontFamily:'Orbitron,monospace', fontSize:7, color:'rgba(255,215,0,0.3)', marginTop:8 }}>
              CONTRACT: MONAD MAINNET · GameController verified
            </p>
          </div>
        )}
      </div>
    </>
  )
}
