import { useWeb3, CONTRACTS, monad } from '../hooks/useWeb3'

// ── Toast ────────────────────────────────────────────────────────
export function Web3Toast({ toast }: { toast: { msg: string; type: string } | null }) {
  if (!toast) return null
  const colors: Record<string, string> = { ok:'#39FF14', err:'#FF2244', warn:'#FFD700', info:'#00EAFF' }
  const c = colors[toast.type] || colors.info
  return (
    <div style={{
      position:'fixed', top:72, left:'50%', transform:'translateX(-50%)',
      zIndex:99999, padding:'8px 20px',
      background:'rgba(5,10,14,0.97)', border:`1px solid ${c}`, color:c,
      fontFamily:'Orbitron,monospace', fontSize:10, letterSpacing:1,
      boxShadow:`0 0 20px ${c}44`, pointerEvents:'none',
    }}>{toast.msg}</div>
  )
}

// ── Wallet Button (Navbar) ───────────────────────────────────────
export function WalletButton() {
  const { address, connected, chainOk, loading, balanceMOTO, balanceMON, balanceNFT,
          connect, disconnect, addMotoToWallet, fetchBalances, toast: toastState } = useWeb3()
  return (
    <>
      <Web3Toast toast={toastState} />
      {!connected ? (
        <button onClick={connect} disabled={loading} className="cl-btn cl-btn-gold"
          style={{ fontSize:9, padding:'6px 16px', letterSpacing:2 }}>
          {loading ? 'CONNECTING...' : '⬡ CONNECT'}
        </button>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:6, height:6, borderRadius:'50%',
            background: chainOk?'#39FF14':'#FF2244',
            boxShadow:`0 0 6px ${chainOk?'#39FF14':'#FF2244'}` }}
            title={chainOk ? 'Monad Mainnet' : 'Wrong network — click CONNECT to switch'} />
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:9, color:'#FFD700' }}>
            {parseFloat(balanceMOTO)>9999 ? (parseFloat(balanceMOTO)/1000).toFixed(1)+'K' : balanceMOTO} MOTO
          </span>
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:9, color:'#00EAFF' }}>{balanceMON} MON</span>
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:9, color:'#a259ff' }}>{balanceNFT} NFT</span>
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:8, color:'rgba(255,215,0,0.45)', cursor:'pointer' }}
            onClick={() => address && fetchBalances(address)} title="Click to refresh">
            {address?.slice(0,5)}…{address?.slice(-4)}
          </span>
          <button onClick={addMotoToWallet} className="cl-btn cl-btn-ghost"
            style={{ fontSize:7, padding:'3px 8px' }} title="Add MOTO to wallet">+MOTO</button>
          <button onClick={disconnect} className="cl-btn cl-btn-ghost"
            style={{ fontSize:7, padding:'3px 8px', color:'#FF2244', borderColor:'#FF224444' }}>✕</button>
        </div>
      )}
    </>
  )
}

// ── Coin packages ────────────────────────────────────────────────
const COIN_PACKAGES = [
  { label:'STARTER',  mon:0.01, coins:1000   },
  { label:'RACER',    mon:0.05, coins:6000   },
  { label:'CHAMPION', mon:0.1,  coins:15000  },
  { label:'WHALE',    mon:0.5,  coins:100000 },
]

// ── In-Game Web3 Panel (after game over) ─────────────────────────
export function GameWeb3Panel({
  score, coins, kills, level, onClose, onAddCoins
}: {
  score:number, coins:number, kills:number, level:number,
  onClose:()=>void, onAddCoins?:(n:number)=>void
}) {
  const {
    address, connected, chainOk, loading, balanceMOTO, balanceMON, balanceNFT,
    connect, signScore, buyCoins, mintNFT, addMotoToWallet, toast: toastState,
  } = useWeb3()

  const handleBuyCoins = async (mon: number, c: number) => {
    const ok = await buyCoins(mon, c)
    if (ok && onAddCoins) onAddCoins(c)
  }

  const row: React.CSSProperties = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid rgba(255,215,0,0.07)' }
  const lbl: React.CSSProperties = { fontFamily:'Orbitron,monospace', fontSize:9, color:'rgba(255,215,0,0.45)', letterSpacing:1 }
  const val: React.CSSProperties = { fontFamily:'Orbitron,monospace', fontSize:11, color:'#FFD700' }

  return (
    <>
      <Web3Toast toast={toastState} />
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
        <div style={{ width:420, maxHeight:'90vh', overflowY:'auto',
          background:'rgba(5,10,14,0.99)',
          border:'1px solid rgba(200,150,12,0.6)',
          outline:'1px solid rgba(57,255,20,0.12)',
          padding:'22px 20px' }}>

          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
            <div>
              <div className="cl-badge cl-badge-gold" style={{ marginBottom:6 }}>GAME RESULTS</div>
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:15, color:'#FFD700' }}>WEB3 REWARDS</div>
            </div>
            <button onClick={onClose} className="cl-btn cl-btn-ghost" style={{ fontSize:9, padding:'4px 12px', alignSelf:'start' }}>✕ CLOSE</button>
          </div>

          {/* Score */}
          <div style={{ background:'rgba(0,0,0,0.5)', padding:'10px 14px', marginBottom:14, border:'1px solid rgba(57,255,20,0.18)' }}>
            <div style={row}><span style={lbl}>SCORE</span><span style={val}>{score.toLocaleString()}</span></div>
            <div style={row}><span style={lbl}>COINS</span><span style={{...val,color:'#39FF14'}}>{coins.toLocaleString()}</span></div>
            <div style={row}><span style={lbl}>KILLS</span><span style={{...val,color:'#00EAFF'}}>{kills.toLocaleString()}</span></div>
            <div style={{...row,borderBottom:'none'}}><span style={lbl}>LEVEL</span><span style={{...val,color:'#a259ff'}}>{level}</span></div>
          </div>

          {/* Connect prompt */}
          {!connected ? (
            <div style={{ textAlign:'center', padding:'18px 0' }}>
              <p style={{ fontFamily:'Orbitron,monospace', fontSize:9, color:'rgba(255,215,0,0.35)', marginBottom:14 }}>
                CONNECT WALLET → CLAIM REWARDS · MINT NFTs · BUY COINS
              </p>
              <button onClick={connect} disabled={loading} className="cl-btn cl-btn-gold"
                style={{ fontSize:11, padding:'12px 32px', width:'100%' }}>
                {loading ? 'CONNECTING...' : '⬡ CONNECT WALLET'}
              </button>
            </div>
          ) : (
            <>
              {/* Wallet info bar */}
              <div style={{ background:'rgba(57,255,20,0.04)', border:'1px solid rgba(57,255,20,0.18)', padding:'10px 12px', marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
                  <span style={lbl}>WALLET</span>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:chainOk?'#39FF14':'#FF2244', boxShadow:`0 0 5px ${chainOk?'#39FF14':'#FF2244'}` }} />
                    <span style={{ fontFamily:'Orbitron,monospace', fontSize:8, color:chainOk?'#39FF14':'#FF2244' }}>
                      {chainOk ? 'MONAD MAINNET' : 'WRONG CHAIN'}
                    </span>
                  </div>
                </div>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:8, color:'rgba(255,215,0,0.5)', marginBottom:7 }}>
                  {address?.slice(0,10)}…{address?.slice(-8)}
                </div>
                <div style={{ display:'flex', gap:18 }}>
                  <div><div style={lbl}>MOTO</div><div style={val}>{parseFloat(balanceMOTO)>9999?(parseFloat(balanceMOTO)/1000).toFixed(1)+'K':balanceMOTO}</div></div>
                  <div><div style={lbl}>MON</div><div style={{...val,color:'#00EAFF'}}>{balanceMON}</div></div>
                  <div><div style={lbl}>NFTs</div><div style={{...val,color:'#a259ff'}}>{balanceNFT}</div></div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:18 }}>
                <button onClick={() => signScore(score)}
                  disabled={loading} className="cl-btn cl-btn-gold"
                  style={{ fontSize:10, padding:'10px', width:'100%' }}>
                  {loading ? '...' : '✍ SIGN SCORE ON-CHAIN'}
                </button>
                <button onClick={() => mintNFT(0,0,0,0)} disabled={loading}
                  style={{ fontFamily:'Orbitron,monospace', fontSize:10, letterSpacing:1,
                    padding:'10px', width:'100%', cursor:'pointer',
                    background:'rgba(162,89,255,0.1)', border:'1px solid #a259ff', color:'#a259ff' }}>
                  {loading ? '...' : '⬡ MINT MOTO NFT'}
                </button>
                <button onClick={addMotoToWallet} className="cl-btn cl-btn-ghost"
                  style={{ fontSize:9, padding:'8px', width:'100%' }}>
                  + ADD MOTO TO WALLET
                </button>
              </div>

              {/* Buy coins */}
              <div>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:9, color:'rgba(0,234,255,0.55)', letterSpacing:2, marginBottom:8 }}>
                  BUY COINS WITH MON
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
                  {COIN_PACKAGES.map(pkg => (
                    <button key={pkg.label}
                      onClick={() => handleBuyCoins(pkg.mon, pkg.coins)}
                      disabled={loading || parseFloat(balanceMON) < pkg.mon}
                      style={{ fontFamily:'Orbitron,monospace', cursor:'pointer', textAlign:'center',
                        background:'rgba(255,215,0,0.05)', border:'1px solid rgba(255,215,0,0.25)',
                        padding:'10px 8px',
                        opacity: parseFloat(balanceMON) < pkg.mon ? 0.4 : 1, transition:'all 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background='rgba(255,215,0,0.12)')}
                      onMouseLeave={e => (e.currentTarget.style.background='rgba(255,215,0,0.05)')}>
                      <div style={{ fontSize:8, color:'rgba(255,215,0,0.45)', marginBottom:3 }}>{pkg.label}</div>
                      <div style={{ fontSize:15, color:'#FFD700', fontWeight:700 }}>
                        {pkg.coins>=1000 ? pkg.coins/1000+'K' : pkg.coins}
                      </div>
                      <div style={{ fontSize:9, color:'#FFD700' }}>🪙 COINS</div>
                      <div style={{ fontSize:10, color:'#39FF14', marginTop:3 }}>{pkg.mon} MON</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contract addresses */}
              <div style={{ marginTop:14, padding:'10px', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:7, color:'rgba(255,255,255,0.18)', marginBottom:5, letterSpacing:2 }}>
                  CONTRACTS · MONAD MAINNET · CHAIN {monad.id}
                </div>
                {[
                  { label:'MOTO TOKEN', addr: CONTRACTS.MOTO_TOKEN },
                  { label:'MOTO NFT',   addr: CONTRACTS.MOTO_NFT   },
                  { label:'CONTROLLER', addr: CONTRACTS.GAME_CONTROLLER },
                ].map(c => (
                  <div key={c.label} style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ fontFamily:'Orbitron,monospace', fontSize:7, color:'rgba(255,215,0,0.28)' }}>{c.label}</span>
                    <a href={`https://explorer.monad.xyz/address/${c.addr}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily:'monospace', fontSize:7, color:'rgba(0,234,255,0.38)', textDecoration:'none' }}>
                      {c.addr.slice(0,8)}…{c.addr.slice(-6)}
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
