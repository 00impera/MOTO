import { useState, useEffect, useCallback } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { Web3Toast } from '../components/Web3HUD'
import { createPublicClient, http, defineChain, type Address } from 'viem'

const GOVERNANCE = '0x2926649E00E08f740EF33C523Ca79eE8D1ccCfD9' as Address

const monad = defineChain({ id: 143, name: 'Monad Mainnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.monad.xyz'] } } })

const publicClient = createPublicClient({ chain: monad, transport: http('https://rpc.monad.xyz') })

const GOV_ABI = [
  { name: 'proposalCount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'proposals', type: 'function', stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'id',           type: 'uint256' },
      { name: 'proposer',     type: 'address' },
      { name: 'title',        type: 'string'  },
      { name: 'description',  type: 'string'  },
      { name: 'startBlock',   type: 'uint256' },
      { name: 'endBlock',     type: 'uint256' },
      { name: 'forVotes',     type: 'uint256' },
      { name: 'againstVotes', type: 'uint256' },
      { name: 'abstainVotes', type: 'uint256' },
      { name: 'executed',     type: 'bool'    },
      { name: 'canceled',     type: 'bool'    },
    ]},
  { name: 'voted', type: 'function', stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }, { name: '', type: 'address' }],
    outputs: [{ type: 'bool' }] },
  { name: 'castVote', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'proposalId', type: 'uint256' }, { name: 'support', type: 'uint8' }, { name: 'weight', type: 'uint256' }],
    outputs: [] },
  { name: 'createProposal', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'title', type: 'string' }, { name: 'description', type: 'string' }],
    outputs: [{ type: 'uint256' }] },
] as const

const btn: React.CSSProperties = {
  fontFamily: 'Orbitron,monospace', fontSize: 11, fontWeight: 700,
  padding: '11px 22px', borderRadius: 999, border: '1px solid',
  background: 'transparent', cursor: 'pointer', letterSpacing: 2,
  transition: 'all 0.2s', whiteSpace: 'nowrap' as const,
}

type Proposal = {
  id: number; proposer: string; title: string; description: string
  startBlock: bigint; endBlock: bigint
  forVotes: bigint; againstVotes: bigint; abstainVotes: bigint
  executed: boolean; canceled: boolean
}

export default function Governance() {
  const { address, connected, loading, balanceMOTO, balanceNFT,
          connect, getVotingPower, toast: toastState, walletClient } = useWeb3() as any

  const [power, setPower]           = useState('0')
  const [proposals, setProposals]   = useState<Proposal[]>([])
  const [loadingP, setLoadingP]     = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle]           = useState('')
  const [desc, setDesc]             = useState('')
  const [busy, setBusy]             = useState(false)
  const [voted, setVoted]           = useState<Record<number, boolean>>({})

  const fetchProposals = useCallback(async () => {
    setLoadingP(true)
    try {
      const count = await publicClient.readContract({ address: GOVERNANCE, abi: GOV_ABI, functionName: 'proposalCount' }) as bigint
      const results: Proposal[] = []
      for (let i = 1; i <= Number(count); i++) {
        const p = await publicClient.readContract({ address: GOVERNANCE, abi: GOV_ABI, functionName: 'proposals', args: [BigInt(i)] }) as any
        results.push({
          id: Number(p[0]), proposer: p[1], title: p[2], description: p[3],
          startBlock: p[4], endBlock: p[5],
          forVotes: p[6], againstVotes: p[7], abstainVotes: p[8],
          executed: p[9], canceled: p[10],
        })
      }
      setProposals(results.reverse())

      // check voted status for connected address
      if (address) {
        const votedMap: Record<number, boolean> = {}
        for (const p of results) {
          votedMap[p.id] = await publicClient.readContract({
            address: GOVERNANCE, abi: GOV_ABI, functionName: 'voted',
            args: [BigInt(p.id), address as Address],
          }) as boolean
        }
        setVoted(votedMap)
      }
    } catch (e) { console.warn('fetchProposals', e) }
    finally { setLoadingP(false) }
  }, [address])

  useEffect(() => { fetchProposals() }, [fetchProposals])

  useEffect(() => {
    if (connected && address) getVotingPower(address).then((p: string) => setPower(p))
  }, [connected, address])

  const handleVote = async (proposalId: number, support: 0|1|2) => {
    if (!connected) { connect(); return }
    if (!walletClient) return
    setBusy(true)
    try {
      toastState && null // handled by useWeb3
      const hash = await walletClient.writeContract({
        address: GOVERNANCE, abi: GOV_ABI, functionName: 'castVote',
        args: [BigInt(proposalId), support, BigInt(parseInt(power) || 1)],
        account: address, chain: monad,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      setVoted(v => ({ ...v, [proposalId]: true }))
      await fetchProposals()
    } catch (e: any) { console.warn('vote', e) }
    finally { setBusy(false) }
  }

  const handleCreate = async () => {
    if (!title || !desc || !walletClient) return
    setBusy(true)
    try {
      const hash = await walletClient.writeContract({
        address: GOVERNANCE, abi: GOV_ABI, functionName: 'createProposal',
        args: [title, desc], account: address, chain: monad,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      setTitle(''); setDesc(''); setShowCreate(false)
      await fetchProposals()
    } catch (e: any) { console.warn('create', e) }
    finally { setBusy(false) }
  }

  const voteLabel = (s: 0|1|2) => s === 0 ? 'AGAINST' : s === 1 ? 'FOR' : 'ABSTAIN'
  const voteColor = (s: 0|1|2) => s === 0 ? '#FF2244' : s === 1 ? '#39FF14' : '#FFD700'

  const isActive = (_p: Proposal) => true

  const formatVotes = (v: bigint) => {
    const n = Number(v)
    if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n/1000).toFixed(1) + 'K'
    return n.toString()
  }

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

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 40 }}>
          {[
            { label: 'YOUR MOTO',        val: `${balanceMOTO}`, color: '#FFD700' },
            { label: 'YOUR NFTS',        val: `${balanceNFT}`,  color: '#a259ff' },
            { label: 'VOTING POWER',     val: power,            color: '#39FF14' },
            { label: 'PROPOSALS',        val: `${proposals.length}`, color: '#00EAFF' },
            { label: 'ACTIVE',           val: `${proposals.filter(p => isActive(p)).length}`, color: '#ff6ec7' },
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

        {/* ACTIONS */}
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
              onMouseEnter={e => { e.currentTarget.style.background = '#a259ff18' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              {showCreate ? '✕ CANCEL' : '+ NEW PROPOSAL'}
            </div>
          )}
          <div style={{ ...btn, borderColor: '#00EAFF', color: '#00EAFF', boxShadow: '0 0 10px #00EAFF55' }}
            onClick={fetchProposals}
            onMouseEnter={e => { e.currentTarget.style.background = '#00EAFF18' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
            {loadingP ? '...' : '↺ REFRESH'}
          </div>
        </div>

        {/* CREATE PROPOSAL */}
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
              opacity: busy || !title || !desc ? 0.4 : 1, cursor: busy || !title || !desc ? 'not-allowed' : 'pointer', display: 'inline-block' }}
              onClick={handleCreate}
              onMouseEnter={e => { if (!busy && title && desc) e.currentTarget.style.background = '#a259ff18' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              {busy ? 'SUBMITTING...' : 'SUBMIT PROPOSAL'}
            </div>
          </div>
        )}

        {/* PROPOSALS */}
        {loadingP ? (
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)', padding: 40 }}>
            LOADING PROPOSALS...
          </div>
        ) : proposals.length === 0 ? (
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)', padding: 40 }}>
            NO PROPOSALS YET
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
            {proposals.map(p => {
              const total = Number(p.forVotes + p.againstVotes + p.abstainVotes)
              const forPct = total ? Math.round((Number(p.forVotes) / total) * 100) : 0
              const active = isActive(p)
              const hasVoted = voted[p.id]
              const status = p.canceled ? "CANCELED" : p.executed ? "EXECUTED" : "ACTIVE"
              const statusColor = p.canceled ? '#FF2244' : p.executed ? '#FFD700' : '#39FF14'

              return (
                <div key={p.id} style={{
                  border: `1px solid ${active ? 'rgba(162,89,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 16, padding: '20px 24px', backdropFilter: 'blur(4px)',
                  transition: 'all 0.2s', opacity: active ? 1 : 0.7,
                }}
                onMouseEnter={e => { if (active) e.currentTarget.style.borderColor = '#a259ff66' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = active ? 'rgba(162,89,255,0.3)' : 'rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: '#a259ff', letterSpacing: 2, marginBottom: 6 }}>
                        PROPOSAL #{p.id} · {p.proposer.slice(0,6)}…{p.proposer.slice(-4)}
                      </div>
                      <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 14, color: '#FFD700', marginBottom: 8 }}>{p.title}</div>
                      <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{p.description}</div>
                    </div>
                    <div style={{ padding: '4px 12px', borderRadius: 999, border: `1px solid ${statusColor}`,
                      fontFamily: 'Orbitron,monospace', fontSize: 8, color: statusColor, letterSpacing: 2, flexShrink: 0 }}>
                      {status}
                    </div>
                  </div>

                  {/* VOTE BAR */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#39FF14' }}>FOR {formatVotes(p.forVotes)}</span>
                      <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#FFD700' }}>ABSTAIN {formatVotes(p.abstainVotes)}</span>
                      <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#FF2244' }}>AGAINST {formatVotes(p.againstVotes)}</span>
                    </div>
                    <div style={{ background: 'rgba(255,34,68,0.3)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                      <div style={{ background: '#39FF14', height: '100%', width: `${forPct}%`, borderRadius: 999, transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 4, textAlign: 'right' }}>
                      {forPct}% FOR · {total} TOTAL VOTES
                    </div>
                  </div>

                  {/* VOTE BUTTONS */}
                  {active && (
                    hasVoted ? (
                      <div style={{ padding: '8px 16px', borderRadius: 999, display: 'inline-block',
                        border: '1px solid #39FF14', fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#39FF14', letterSpacing: 2 }}>
                        ✓ VOTED
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {([1, 0, 2] as const).map(support => (
                          <div key={support} style={{ ...btn, padding: '8px 16px', fontSize: 9,
                            borderColor: voteColor(support), color: voteColor(support),
                            boxShadow: `0 0 8px ${voteColor(support)}44`,
                            opacity: busy || !connected ? 0.4 : 1,
                            cursor: busy || !connected ? 'not-allowed' : 'pointer' }}
                            onClick={() => !busy && connected && handleVote(p.id, support)}
                            onMouseEnter={e => { if (!busy && connected) e.currentTarget.style.background = voteColor(support) + '18' }}
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
        )}

        <p style={{ fontFamily: 'Orbitron,monospace', fontSize: 7, color: 'rgba(255,215,0,0.2)', marginTop: 32, letterSpacing: 2 }}>
          GOVERNANCE CONTRACT: {GOVERNANCE} · MONAD MAINNET
        </p>
      </div>
    </>
  )
}
