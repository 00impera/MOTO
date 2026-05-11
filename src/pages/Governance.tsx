import { useState, useEffect } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { Web3Toast } from '../components/Web3HUD'

const btn: React.CSSProperties = {
  fontFamily: 'Orbitron,monospace', fontSize: 11, fontWeight: 700,
  padding: '11px 22px', borderRadius: 999, border: '1px solid',
  background: 'transparent', cursor: 'pointer', letterSpacing: 2,
  transition: 'all 0.2s', whiteSpace: 'nowrap' as const,
}

const MOCK_PROPOSALS = [
  { id: 1, title: 'Increase max claim per game', desc: 'Raise maxClaimPerGame from 100 to 150 MOTO to reward top players.', for: 6420, against: 1230, status: 'ACTIVE' },
  { id: 2, title: 'Add new weapon: Plasma Cannon', desc: 'Deploy a new weapon NFT with 3x damage multiplier for tournament use.', for: 8800, against: 400, status: 'ACTIVE' },
  { id: 3, title: 'Reduce rewardPerPoint by 10%', desc: 'Adjust tokenomics to extend reward pool duration to 2 years.', for: 3100, against: 5200, status: 'CLOSED' },
]

export default function Governance() {
  const { address, connected, loading, balanceMOTO, balanceNFT,
          connect, getVotingPower, createProposal, castVote, toast: toastState } = useWeb3()

  const [power, setPower]           = useState('0')
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle]           = useState('')
  const [desc, setDesc]             = useState('')
  const [busy, setBusy]             = useState(false)
  const [voted, setVoted]           = useState<Record<number, 0|1|2>>({})

  useEffect(() => {
    if (connected && address) getVotingPower(address).then(p => setPower(p))
  }, [connected, address])

  const handleCreate = async () => {
    if (!title || !desc) return
    setBusy(true)
    const ok = await createProposal(title, desc)
    if (ok) { setTitle(''); setDesc(''); setShowCreate(false) }
    setBusy(false)
  }

  const handleVote = async (proposalId: number, support: 0|1|2) => {
    if (!connected) { connect(); return }
    setBusy(true)
    const ok = await castVote(proposalId, support, parseInt(power) || 1)
    if (ok) setVoted(v => ({ ...v, [proposalId]: support }))
    setBusy(false)
  }

  const voteLabel = (s: 0|1|2) => s === 0 ? 'AGAINST' : s === 1 ? 'FOR' : 'ABSTAIN'
  const voteColor = (s: 0|1|2) => s === 0 ? '#FF2244' : s === 1 ? '#39FF14' : '#FFD700'

  return (
    <>
      <Web3Toast toast={toastState} />
      <div className="cyber-bg" style={{ padding: '40px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div className="cl-badge cl-badge-purple" style={{ marginBottom: 16 }}>ON-CHAIN VOTING</div>
        <h1 style={{ fontFamily: 'Orbitron,monospace', fontWeight: 900,
          fontSize: 'clamp(28px,5vw,52px)', marginBottom: 8,
          background: 'linear-gradient(90deg,#a259ff,#ff6ec7,#00eaff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GOVERNANCE</h1>
        <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 16, color: '#00eaff', marginBottom: 4 }}>
          Vote on proposals using your MOTO tokens and NFTs.
        </p>
        <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 13, color: '#a259ff', fontWeight: 600, marginBottom: 48 }}>
          1 MOTO = 1 VOTE · 1 NFT = 1 VOTE · MONAD MAINNET
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 40 }}>
          {[
            { label: 'YOUR MOTO',        val: `${balanceMOTO}`, color: '#FFD700' },
            { label: 'YOUR NFTS',        val: `${balanceNFT}`,  color: '#a259ff' },
            { label: 'VOTING POWER',     val: power,            color: '#39FF14' },
            { label: 'ACTIVE PROPOSALS', val: `${MOCK_PROPOSALS.filter(p => p.status === 'ACTIVE').length}`, color: '#00EAFF' },
          ].map(c => (
            <div key={c.label} style={{ border: `1px solid ${c.color}33`, padding: '16px 12px', borderRadius: 12,
              backdropFilter: 'blur(4px)', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = c.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = c.color + '33'}>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 7, color: 'rgba(255,215,0,0.4)', marginBottom: 8, letterSpacing: 2 }}>{c.label}</div>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 20, color: c.color }}>{c.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          {!connected ? (
            <div style={{ ...btn, borderColor: '#FFD700', color: '#FFD700', boxShadow: '0 0 10px #FFD70055', opacity: loading ? 0.5 : 1 }}
              onClick={() => !loading && connect()}
              onMouseEnter={e => { e.currentTarget.style.background = '#FFD70018' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              {loading ? 'CONNECTING...' : '⬡ CONNECT WALLET'}
            </div>
          ) : (
            <div style={{ ...btn, borderColor: '#a259ff', color: '#a259ff', boxShadow: '0 0 10px #a259ff55' }}
              onClick={() => setShowCreate(s => !s)}
              onMouseEnter={e => { e.currentTarget.style.background = '#a259ff18'; e.currentTarget.style.boxShadow = '0 0 22px #a259ff99' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = '0 0 10px #a259ff55' }}>
              {showCreate ? '✕ CANCEL' : '+ NEW PROPOSAL'}
            </div>
          )}
          {connected && address && (
            <div style={{ ...btn, borderColor: '#00EAFF', color: '#00EAFF', boxShadow: '0 0 10px #00EAFF55' }}
              onClick={() => getVotingPower(address).then(p => setPower(p))}
              onMouseEnter={e => { e.currentTarget.style.background = '#00EAFF18' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              ↺ REFRESH POWER
            </div>
          )}
        </div>

        {showCreate && (
          <div style={{ border: '1px solid rgba(162,89,255,0.3)', borderRadius: 16, padding: '24px',
            backdropFilter: 'blur(8px)', marginBottom: 32, textAlign: 'left', maxWidth: 600, margin: '0 auto 32px' }}>
            <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 11, color: '#a259ff', marginBottom: 20, letterSpacing: 2 }}>CREATE PROPOSAL</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: 'rgba(255,215,0,0.4)', marginBottom: 8, letterSpacing: 2 }}>TITLE</div>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Short proposal title..."
                style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 15, background: 'transparent',
                  border: '1px solid rgba(255,215,0,0.2)', borderRadius: 8, color: '#FFD700',
                  padding: '10px 14px', width: '100%', outline: 'none', boxSizing: 'border-box' as const }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: 'rgba(255,215,0,0.4)', marginBottom: 8, letterSpacing: 2 }}>DESCRIPTION</div>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe your proposal..." rows={4}
                style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 14, background: 'transparent',
                  border: '1px solid rgba(255,215,0,0.2)', borderRadius: 8, color: 'rgba(255,255,255,0.7)',
                  padding: '10px 14px', width: '100%', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const }} />
            </div>
            <div style={{ ...btn, borderColor: '#a259ff', color: '#a259ff', boxShadow: '0 0 10px #a259ff55',
              opacity: busy || !title || !desc ? 0.4 : 1, cursor: busy || !title || !desc ? 'not-allowed' : 'pointer',
              display: 'inline-block' }}
              onClick={handleCreate}
              onMouseEnter={e => { if (!busy && title && desc) e.currentTarget.style.background = '#a259ff18' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              {busy ? 'SUBMITTING...' : '🗳️ SUBMIT PROPOSAL'}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
          {MOCK_PROPOSALS.map(p => {
            const total = p.for + p.against
            const forPct = total ? Math.round((p.for / total) * 100) : 0
            const isActive = p.status === 'ACTIVE'
            const myVote = voted[p.id]
            return (
              <div key={p.id} style={{
                border: `1px solid ${isActive ? 'rgba(162,89,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 16, padding: '20px 24px', backdropFilter: 'blur(4px)',
                transition: 'all 0.2s', opacity: isActive ? 1 : 0.6,
              }}
              onMouseEnter={e => { if (isActive) e.currentTarget.style.borderColor = '#a259ff66' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isActive ? 'rgba(162,89,255,0.3)' : 'rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: '#a259ff', letterSpacing: 2, marginBottom: 6 }}>PROPOSAL #{p.id}</div>
                    <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 14, color: '#FFD700', marginBottom: 8 }}>{p.title}</div>
                    <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{p.desc}</div>
                  </div>
                  <div style={{ padding: '4px 12px', borderRadius: 999, border: `1px solid ${isActive ? '#39FF14' : '#555'}`,
                    fontFamily: 'Orbitron,monospace', fontSize: 8, color: isActive ? '#39FF14' : '#555', letterSpacing: 2 }}>
                    {p.status}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#39FF14' }}>FOR {p.for.toLocaleString()}</span>
                    <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#FF2244' }}>AGAINST {p.against.toLocaleString()}</span>
                  </div>
                  <div style={{ background: 'rgba(255,34,68,0.3)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                    <div style={{ background: '#39FF14', height: '100%', width: `${forPct}%`, borderRadius: 999, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 4, textAlign: 'right' }}>
                    {forPct}% FOR
                  </div>
                </div>
                {isActive && (
                  myVote !== undefined ? (
                    <div style={{ padding: '8px 16px', borderRadius: 999, display: 'inline-block',
                      border: `1px solid ${voteColor(myVote)}`,
                      fontFamily: 'Orbitron,monospace', fontSize: 9, color: voteColor(myVote), letterSpacing: 2 }}>
                      ✓ VOTED: {voteLabel(myVote)}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {([1, 0, 2] as const).map(support => (
                        <div key={support} style={{ ...btn, padding: '8px 16px', fontSize: 9,
                          borderColor: voteColor(support), color: voteColor(support),
                          boxShadow: `0 0 8px ${voteColor(support)}44`,
                          opacity: busy ? 0.4 : 1, cursor: busy ? 'not-allowed' : 'pointer' }}
                          onClick={() => !busy && handleVote(p.id, support)}
                          onMouseEnter={e => { if (!busy) e.currentTarget.style.background = voteColor(support) + '18' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                          {voteLabel(support)}
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            )
          })}
        </div>

        <p style={{ fontFamily: 'Orbitron,monospace', fontSize: 7, color: 'rgba(255,215,0,0.2)', marginTop: 32, letterSpacing: 2 }}>
          MultiGovHub · SpokeVoteAggregator · MONAD MAINNET
        </p>
      </div>
    </>
  )
}
