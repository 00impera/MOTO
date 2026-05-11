import { useState, useEffect } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { Web3Toast } from '../components/Web3HUD'

const btn: React.CSSProperties = {
  fontFamily: 'Orbitron,monospace', fontSize: 11, fontWeight: 700,
  padding: '13px 28px', borderRadius: 999, border: '1px solid',
  background: 'transparent', cursor: 'pointer', letterSpacing: 2,
  transition: 'all 0.2s', whiteSpace: 'nowrap' as const,
}

export default function Claim() {
  const { address, connected, loading, balanceMOTO, balanceMON,
          connect, signScore, claimReward, getPlayerStats, toast: toastState } = useWeb3()

  const [score, setScore]     = useState('')
  const [busy, setBusy]       = useState(false)
  const [stats, setStats]     = useState<any>(null)
  const [preview, setPreview] = useState('0')

  useEffect(() => {
    if (connected && address) getPlayerStats(address).then(s => { if (s) setStats(s) })
  }, [connected, address])

  useEffect(() => {
    setPreview(Math.min((parseFloat(score) || 0) * 0.001, 100).toFixed(3))
  }, [score])

  const handleClaim = async () => {
    const s = parseInt(score)
    if (!s || s <= 0) return
    if (!connected) { connect(); return }
    setBusy(true)
    const ok = await signScore(s)
    if (ok) { setScore(''); if (address) getPlayerStats(address).then(st => { if (st) setStats(st) }) }
    setBusy(false)
  }

  const cards = [
    { label: 'YOUR MOTO',    val: `${balanceMOTO} MOTO`,  color: '#FFD700' },
    { label: 'YOUR MON',     val: `${balanceMON} MON`,    color: '#00EAFF' },
    { label: 'TOTAL EARNED', val: stats ? `${parseFloat(stats.earned).toFixed(2)} MOTO` : '—', color: '#39FF14' },
    { label: 'BEST SCORE',   val: stats?.score ?? '—',    color: '#ff6ec7' },
    { label: 'SEASON SCORE', val: stats?.seasonScore ?? stats?.score ?? '—', color: '#a259ff' },
    { label: 'SEASON',       val: stats ? `#${stats.season}` : '—', color: '#FFE566' },
  ]

  const steps = [
    { n: '01', label: 'PLAY',  desc: 'Race & collect coins in-game', color: '#39FF14' },
    { n: '02', label: 'SCORE', desc: 'Earn points during the run',   color: '#FFD700' },
    { n: '03', label: 'SIGN',  desc: 'Backend verifies your score',  color: '#00EAFF' },
    { n: '04', label: 'CLAIM', desc: 'MOTO tokens sent to wallet',   color: '#ff6ec7' },
  ]

  return (
    <>
      <Web3Toast toast={toastState} />
      <div className="cyber-bg" style={{ padding: '40px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div className="cl-badge cl-badge-green" style={{ marginBottom: 16 }}>EARN ON-CHAIN</div>
        <h1 style={{ fontFamily: 'Orbitron,monospace', fontWeight: 900,
          fontSize: 'clamp(28px,5vw,52px)', marginBottom: 8,
          background: 'linear-gradient(90deg,#39FF14,#FFD700,#00eaff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CLAIM MOTO</h1>
        <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 16, color: '#00eaff', marginBottom: 4 }}>
          Play the game, then claim your MOTO token rewards on-chain.
        </p>
        <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 13, color: '#a259ff', fontWeight: 600, marginBottom: 48 }}>
          0.001 MOTO PER POINT · MAX 100 MOTO PER RUN · MONAD MAINNET
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          {steps.map(s => (
            <div key={s.n} style={{ border: `1px solid ${s.color}33`, padding: '20px 16px', borderRadius: 12,
              backdropFilter: 'blur(4px)', width: 140, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = `0 0 16px ${s.color}44` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = s.color + '33'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 22, color: s.color, marginBottom: 6 }}>{s.n}</div>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: s.color, letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 40 }}>
          {cards.map(c => (
            <div key={c.label} style={{ border: `1px solid ${c.color}33`, padding: '16px 12px', borderRadius: 12,
              backdropFilter: 'blur(4px)', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = c.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = c.color + '33'}>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 7, color: 'rgba(255,215,0,0.4)', marginBottom: 8, letterSpacing: 2 }}>{c.label}</div>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 14, color: c.color }}>{c.val}</div>
            </div>
          ))}
        </div>

        {connected && address && (
          <div style={{ border: '1px solid rgba(57,255,20,0.2)', borderRadius: 12, padding: '10px 16px',
            marginBottom: 32, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', backdropFilter: 'blur(4px)' }}>
            <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: 'rgba(255,215,0,0.5)' }}>
              WALLET: <span style={{ color: '#FFD700' }}>{address.slice(0,6)}…{address.slice(-4)}</span>
            </span>
            <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#00EAFF' }}>{balanceMON} MON</span>
            <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#FFD700' }}>{balanceMOTO} MOTO</span>
          </div>
        )}

        {!connected ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
              Connect your wallet to claim MOTO rewards
            </p>
            <div style={{ ...btn, borderColor: '#FFD700', color: '#FFD700', boxShadow: '0 0 10px #FFD70055', opacity: loading ? 0.5 : 1 }}
              onClick={() => !loading && connect()}
              onMouseEnter={e => { e.currentTarget.style.background = '#FFD70018'; e.currentTarget.style.boxShadow = '0 0 22px #FFD70099' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = '0 0 10px #FFD70055' }}>
              {loading ? 'CONNECTING...' : '⬡ CONNECT WALLET'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ border: '1px solid rgba(255,215,0,0.2)', borderRadius: 16, padding: '24px 32px',
              backdropFilter: 'blur(8px)', width: '100%', maxWidth: 400 }}>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: 'rgba(255,215,0,0.5)', marginBottom: 12, letterSpacing: 2 }}>
                ENTER YOUR GAME SCORE
              </div>
              <input type="number" value={score} onChange={e => setScore(e.target.value)}
                placeholder="0" min="1" max="999999"
                style={{ fontFamily: 'Orbitron,monospace', fontSize: 32, fontWeight: 900,
                  background: 'transparent', border: 'none',
                  borderBottom: '1px solid rgba(255,215,0,0.3)',
                  color: '#FFD700', padding: '8px 0', width: '100%',
                  outline: 'none', textAlign: 'center', marginBottom: 16 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', borderRadius: 8, background: 'rgba(57,255,20,0.05)',
                border: '1px solid rgba(57,255,20,0.15)' }}>
                <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>REWARD PREVIEW</span>
                <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 18, color: '#39FF14' }}>{preview} MOTO</span>
              </div>
            </div>
            <div style={{ ...btn, borderColor: '#39FF14', color: '#39FF14', boxShadow: '0 0 10px #39FF1455',
              fontSize: 13, padding: '15px 48px',
              opacity: busy || !score || parseFloat(score) <= 0 ? 0.4 : 1,
              cursor: busy || !score ? 'not-allowed' : 'pointer' }}
              onClick={handleClaim}
              onMouseEnter={e => { if (!busy && score) { e.currentTarget.style.background = '#39FF1418'; e.currentTarget.style.boxShadow = '0 0 22px #39FF1499' } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = '0 0 10px #39FF1455' }}>
              {busy ? 'CLAIMING...' : loading ? '...' : '⚡ CLAIM MOTO'}
            </div>
            <p style={{ fontFamily: 'Orbitron,monospace', fontSize: 7, color: 'rgba(255,215,0,0.25)', letterSpacing: 2 }}>
              SCORE VERIFIED BY BACKEND · MONAD MAINNET · GameController
            </p>
          </div>
        )}

        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,215,0,0.1)' }}>
          <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
            No score yet? Go play first!
          </p>
          <a href="/game" style={{ textDecoration: 'none' }}>
            <div style={{ ...btn, borderColor: '#FFD700', color: '#FFD700', boxShadow: '0 0 10px #FFD70055' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FFD70018'; e.currentTarget.style.boxShadow = '0 0 22px #FFD70099' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = '0 0 10px #FFD70055' }}>
              ▶ PLAY NOW
            </div>
          </a>
        </div>
      </div>
    </>
  )
}
