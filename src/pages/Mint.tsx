import { useState, useEffect } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { Web3Toast } from '../components/Web3HUD'

const IPFS = 'https://ipfs.io/ipfs/bafybeidclxrggnikudbcc6gpgc4h2q247crste727v2hjkgeoktf7e55gi'

const btn: React.CSSProperties = {
  fontFamily: 'Orbitron,monospace', fontSize: 11, fontWeight: 700,
  padding: '13px 28px', borderRadius: 999, border: '1px solid',
  background: 'transparent', cursor: 'pointer', letterSpacing: 2,
  transition: 'all 0.2s', whiteSpace: 'nowrap' as const,
}

const MODELS = [
  { name: 'STREET RED',    file: 'model_0_street_red.jpg',    color: '#FF2244' },
  { name: 'DIRT BLUE',     file: 'model_1_dirt_blue.jpg',     color: '#00EAFF' },
  { name: 'NEON GREEN',    file: 'model_2_neon_green.jpg',    color: '#39FF14' },
  { name: 'CYBER PURPLE',  file: 'model_3_cyber_purple.jpg',  color: '#a259ff' },
  { name: 'GHOST GOLD',    file: 'model_4_ghost_gold.jpg',    color: '#FFD700' },
]

const CHARACTERS = [
  { name: "AUSD",    file: "AUSD.PNG.jpg" },
  { name: "BITCOIN", file: "BITCOIN.PNG.jpg" },
  { name: "DUST",    file: "DUST.PNG.jpg" },
  { name: "ETH",     file: "ETH.PNG.jpg" },
  { name: "GIGA",    file: "GIGA.PNG.jpg" },
  { name: "GMON",    file: "GMON.PNG.jpg" },
  { name: "MOFU",    file: "MOFU.PNG.jpg" },
  { name: "MONKA",   file: "MONKA.PNG.jpg" },
  { name: "MOON",    file: "MOON.PNG.jpg" },
  { name: "SBITE",   file: "SBITE.PNG.jpg" },
  { name: "SOLANA",  file: "SOLANA.PNG.jpg" },
  { name: "USDC",    file: "USDC.PNG.jpeg" },
  { name: "USDT",    file: "USDT.PNG.jpg" },
  { name: "WBTC",    file: "WBTC.PNG.jpg" },
  { name: "WETH",    file: "WETH.PNG.jpg" },
  { name: "WMON",    file: "WMON.PNG.jpg" },
  { name: "cbBTC",   file: "cbBTC.PNG.jpg" },
  { name: "BITCOIN2",file: "BITCOIN.PNG.jpg" },
]

const RARITIES = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY']
const RARITY_COLORS: Record<string, string> = {
  COMMON: '#aaa', RARE: '#00EAFF', EPIC: '#a259ff', LEGENDARY: '#FFD700',
}

export default function Mint() {
  const { connected, loading, balanceNFT, balanceMON,
          connect, mintNFT, toast: toastState } = useWeb3() as any

  const [model,     setModel]     = useState(0)
  const [rarity,    setRarity]    = useState(0)
  const [character, setCharacter] = useState(0)
  const [busy, setBusy]           = useState(false)
  const [nftInfo, setNftInfo]     = useState<{ supply: string; max: string; price: string } | null>(null)
  const [tab, setTab]             = useState<'model'|'character'>('model')


  // const [loadingNFTs, setLoadingNFTs] = useState(false)

  useEffect(() => {
    import('viem').then(({ createPublicClient, http, formatEther, defineChain }) => {
      const monad = defineChain({ id: 143, name: 'Monad Mainnet',
        nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
        rpcUrls: { default: { http: ['https://rpc.monad.xyz'] } } })
      const client = createPublicClient({ chain: monad, transport: http('https://rpc.monad.xyz') })
      const NFT = '0x6e9E4f12D33aAf4834E6D7f61a3a9EDB5ca97AD1' as `0x${string}`
      const abi = [
        { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
        { name: 'MAX_SUPPLY',  type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
        { name: 'MINT_PRICE',  type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
      ] as const
      Promise.all([
        client.readContract({ address: NFT, abi, functionName: 'totalSupply' }),
        client.readContract({ address: NFT, abi, functionName: 'MAX_SUPPLY' }),
        client.readContract({ address: NFT, abi, functionName: 'MINT_PRICE' }),
      ]).then(([supply, max, price]) => {
        setNftInfo({ supply: supply.toString(), max: max.toString(), price: parseFloat(formatEther(price as bigint)).toFixed(4) })
      }).catch(() => {})
    })
  }, [])

  const handleMint = async () => {
    if (!connected) { connect(); return }
    setBusy(true)
    await mintNFT(model, 0, rarity, character)
    setBusy(false)
  }

  const rarityColor = RARITY_COLORS[RARITIES[rarity]]
  const currentModel = MODELS[model]
  const currentChar  = CHARACTERS[character]
  const supplyPct = nftInfo ? Math.round((parseInt(nftInfo.supply) / parseInt(nftInfo.max)) * 100) : 0

  return (
    <>
      <Web3Toast toast={toastState} />
      <div className="cyber-bg" style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="cl-badge cl-badge-gold" style={{ marginBottom: 12 }}>NFT COLLECTION</div>
          <h1 style={{ fontFamily: 'Orbitron,monospace', fontWeight: 900,
            fontSize: 'clamp(28px,5vw,52px)', marginBottom: 8,
            background: 'linear-gradient(90deg,#FFD700,#ff6ec7,#a259ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MINT NFT</h1>
          <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 15, color: '#00eaff', marginBottom: 4 }}>
            Mint your unique MOTO Rider NFT on Monad Mainnet.
          </p>
          <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 12, color: '#a259ff', fontWeight: 600 }}>
            ON-CHAIN · MONAD MAINNET · LIMITED SUPPLY
          </p>
        </div>

        {/* SUPPLY BAR */}
        <div style={{ marginBottom: 32, border: '1px solid rgba(255,215,0,0.15)', borderRadius: 12, padding: '16px 20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: 'rgba(255,215,0,0.5)', letterSpacing: 2 }}>MINTED</span>
            <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: 'rgba(255,215,0,0.5)', letterSpacing: 2 }}>MAX SUPPLY</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 22, color: '#ff6ec7' }}>{nftInfo?.supply ?? '…'}</span>
            <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 22, color: '#FFD700' }}>{nftInfo?.max ?? '…'}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(90deg,#ff6ec7,#FFD700)', height: '100%', width: `${supplyPct}%`, borderRadius: 999, transition: 'width 1s' }} />
          </div>
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 6, textAlign: 'right' }}>
            {supplyPct}% MINTED · {nftInfo ? parseInt(nftInfo.max) - parseInt(nftInfo.supply) : '…'} REMAINING
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>

          {/* LEFT — PREVIEW */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* MOTO IMAGE from IPFS */}
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden',
              border: `2px solid ${rarityColor}55`, boxShadow: `0 0 30px ${rarityColor}22` }}>
              <img src={`${IPFS}/${currentModel.file}`} alt={currentModel.name}
                style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                onError={e => { (e.target as HTMLImageElement).src = '/cars/model0_street_red.jpg' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,10,14,0.85) 0%, transparent 50%)' }} />
              <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 16, fontWeight: 900, color: currentModel.color, marginBottom: 8 }}>
                  {currentModel.name}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 999, border: `1px solid ${currentModel.color}55`,
                    fontFamily: 'Orbitron,monospace', fontSize: 7, color: currentModel.color }}>{currentModel.name}</span>
                  <span style={{ padding: '3px 10px', borderRadius: 999, border: `1px solid ${rarityColor}55`,
                    fontFamily: 'Orbitron,monospace', fontSize: 7, color: rarityColor }}>{RARITIES[rarity]}</span>
                  <span style={{ padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(0,234,255,0.4)',
                    fontFamily: 'Orbitron,monospace', fontSize: 7, color: '#00EAFF' }}>{currentChar?.name}</span>
                </div>
              </div>
              <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 12px', borderRadius: 999,
                background: rarityColor + '22', border: `1px solid ${rarityColor}`,
                fontFamily: 'Orbitron,monospace', fontSize: 8, color: rarityColor, letterSpacing: 2 }}>
                {RARITIES[rarity]}
              </div>
            </div>

            {/* CHARACTER IMAGE from IPFS */}
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,234,255,0.2)', position: 'relative' }}>
              <img src={`/characters/${currentChar?.file}`} alt={currentChar?.name}
                style={{ width: '100%', aspectRatio: '16/7', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                onError={e => { (e.target as HTMLImageElement).src = '/characters/char_1.jpg' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,10,14,0.8) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 14 }}>
                <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 11, color: '#00EAFF' }}>{currentChar?.name}</div>
              </div>
            </div>

            {/* STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { label: 'MINT PRICE', val: nftInfo ? `${nftInfo.price} MON` : '…', color: '#00EAFF' },
                { label: 'YOUR NFTS',  val: `${balanceNFT}`,                         color: '#a259ff' },
                { label: 'YOUR MON',   val: `${balanceMON}`,                         color: '#39FF14' },
              ].map(c => (
                <div key={c.label} style={{ border: `1px solid ${c.color}33`, padding: '12px 10px', borderRadius: 10, backdropFilter: 'blur(4px)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 7, color: 'rgba(255,215,0,0.4)', marginBottom: 6, letterSpacing: 2 }}>{c.label}</div>
                  <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 12, color: c.color }}>{c.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — SELECTORS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* TABS */}
            <div style={{ display: 'flex', gap: 8 }}>
              {(['model', 'character'] as const).map(t => (
                <div key={t} onClick={() => setTab(t)} style={{
                  flex: 1, textAlign: 'center', padding: '10px', borderRadius: 10,
                  border: `1px solid ${tab === t ? '#FFD700' : 'rgba(255,215,0,0.2)'}`,
                  background: tab === t ? 'rgba(255,215,0,0.08)' : 'transparent',
                  fontFamily: 'Orbitron,monospace', fontSize: 9, color: tab === t ? '#FFD700' : 'rgba(255,215,0,0.4)',
                  cursor: 'pointer', letterSpacing: 2, transition: 'all 0.2s',
                }}>
                  {t === 'model' ? 'MOTO MODEL' : 'CHARACTER'}
                </div>
              ))}
            </div>

            {/* MODEL GRID */}
            {tab === 'model' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {MODELS.map((m, i) => (
                  <div key={m.name} onClick={() => setModel(i)} style={{
                    borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                    border: `2px solid ${model === i ? m.color : m.color + '33'}`,
                    boxShadow: model === i ? `0 0 16px ${m.color}44` : 'none',
                    transition: 'all 0.2s', position: 'relative',
                  }}>
                    <img src={`${IPFS}/${m.file}`} alt={m.name}
                      style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                      onError={e => { (e.target as HTMLImageElement).src = `/cars/${m.file.replace('model_', 'model').replace('_', '')}` }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,10,14,0.8) 0%, transparent 50%)' }} />
                    <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
                      <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: m.color, letterSpacing: 1 }}>{m.name}</div>
                    </div>
                    {model === i && (
                      <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%',
                        background: m.color, boxShadow: `0 0 8px ${m.color}` }} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* CHARACTER GRID */}
            {tab === 'character' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {CHARACTERS.map((c, i) => (
                  <div key={c.name} onClick={() => setCharacter(i)} style={{
                    borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                    border: `2px solid ${character === i ? '#00EAFF' : 'rgba(0,234,255,0.2)'}`,
                    boxShadow: character === i ? '0 0 16px rgba(0,234,255,0.4)' : 'none',
                    transition: 'all 0.2s', position: 'relative',
                  }}>
                    <img src={`/characters/${c.file}`} alt={c.name}
                      style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,10,14,0.8) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', bottom: 6, left: 6 }}>
                      <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 7, color: '#00EAFF' }}>{c.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* RARITY */}
            <div>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: 'rgba(255,215,0,0.4)', marginBottom: 10, letterSpacing: 2 }}>RARITY</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {RARITIES.map((r, i) => {
                  const c = RARITY_COLORS[r]
                  const active = rarity === i
                  return (
                    <div key={r} onClick={() => setRarity(i)} style={{
                      padding: '10px 6px', borderRadius: 10, textAlign: 'center',
                      border: `1px solid ${active ? c : c + '44'}`,
                      background: active ? c + '18' : 'transparent',
                      boxShadow: active ? `0 0 12px ${c}44` : 'none',
                      fontFamily: 'Orbitron,monospace', fontSize: 8, color: active ? c : c + '88',
                      cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1,
                    }}>
                      {r}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* MINT BUTTON */}
            <div style={{ marginTop: 'auto', paddingTop: 16 }}>
              {!connected ? (
                <div style={{ ...btn, borderColor: '#FFD700', color: '#FFD700', boxShadow: '0 0 10px #FFD70055',
                  display: 'block', textAlign: 'center', opacity: loading ? 0.5 : 1 }}
                  onClick={() => !loading && connect()}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FFD70018'; e.currentTarget.style.boxShadow = '0 0 22px #FFD70099' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = '0 0 10px #FFD70055' }}>
                  {loading ? 'CONNECTING...' : '⬡ CONNECT WALLET'}
                </div>
              ) : (
                <div style={{ ...btn, borderColor: rarityColor, color: rarityColor,
                  boxShadow: `0 0 16px ${rarityColor}55`, fontSize: 13, padding: '16px',
                  display: 'block', textAlign: 'center',
                  opacity: busy ? 0.5 : 1, cursor: busy ? 'not-allowed' : 'pointer' }}
                  onClick={!busy ? handleMint : undefined}
                  onMouseEnter={e => { if (!busy) { e.currentTarget.style.background = rarityColor + '18'; e.currentTarget.style.boxShadow = `0 0 30px ${rarityColor}88` } }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = `0 0 16px ${rarityColor}55` }}>
                  {busy ? 'MINTING...' : `MINT ${RARITIES[rarity]} — ${nftInfo?.price ?? '…'} MON`}
                </div>
              )}
              <p style={{ fontFamily: 'Orbitron,monospace', fontSize: 7, color: 'rgba(255,215,0,0.2)', marginTop: 12, textAlign: 'center', letterSpacing: 2 }}>
                CONTRACT: 0x6e9E4f12D33aAf4834E6D7f61a3a9EDB5ca97AD1 · MONAD MAINNET
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}