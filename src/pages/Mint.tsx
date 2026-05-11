import { useState, useEffect } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { Web3Toast } from '../components/Web3HUD'

const btn: React.CSSProperties = {
  fontFamily: 'Orbitron,monospace', fontSize: 11, fontWeight: 700,
  padding: '13px 28px', borderRadius: 999, border: '1px solid',
  background: 'transparent', cursor: 'pointer', letterSpacing: 2,
  transition: 'all 0.2s', whiteSpace: 'nowrap' as const,
}

const MODELS     = ['SPEED',  'HEAVY',  'STEALTH', 'TURBO']
const COLORS     = ['RED',    'BLUE',   'GOLD',    'DARK',  'WHITE', 'NEON']
const RARITIES   = ['COMMON', 'RARE',   'EPIC',    'LEGENDARY']
const CHARACTERS = ['RIDER',  'HUNTER', 'GHOST',   'TITAN']
const RARITY_COLORS: Record<string, string> = {
  COMMON: '#aaa', RARE: '#00EAFF', EPIC: '#a259ff', LEGENDARY: '#FFD700',
}

export default function Mint() {
  const { connected, loading, balanceNFT, balanceMON,
          connect, mintNFT, toast: toastState } = useWeb3()

  const [model,     setModel]     = useState(0)
  const [color,     setColor]     = useState(0)
  const [rarity,    setRarity]    = useState(0)
  const [character, setCharacter] = useState(0)
  const [busy, setBusy]           = useState(false)
  const [nftInfo, setNftInfo]     = useState<{ supply: string; max: string; price: string } | null>(null)

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
    await mintNFT(model, color, rarity, character)
    setBusy(false)
  }

  const rarityColor = RARITY_COLORS[RARITIES[rarity]]

  const Selector = ({ label, items, value, onChange, colors }: {
    label: string; items: string[]; value: number; onChange: (i: number) => void; colors?: Record<string, string>
  }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: 'rgba(255,215,0,0.4)', marginBottom: 10, letterSpacing: 2 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {items.map((item, i) => {
          const c = colors?.[item] ?? '#00EAFF'
          const active = value === i
          return (
            <div key={item} onClick={() => onChange(i)} style={{
              padding: '6px 14px', borderRadius: 999, border: `1px solid ${active ? c : c + '44'}`,
              fontFamily: 'Orbitron,monospace', fontSize: 9, color: active ? c : c + '88',
              cursor: 'pointer', transition: 'all 0.2s',
              background: active ? c + '18' : 'transparent',
              boxShadow: active ? `0 0 12px ${c}55` : 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c; e.currentTarget.style.color = c }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = active ? c : c + '44'; e.currentTarget.style.color = active ? c : c + '88' }}>
              {item}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      <Web3Toast toast={toastState} />
      <div className="cyber-bg" style={{ padding: '40px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div className="cl-badge cl-badge-gold" style={{ marginBottom: 16 }}>NFT COLLECTION</div>
        <h1 style={{ fontFamily: 'Orbitron,monospace', fontWeight: 900,
          fontSize: 'clamp(28px,5vw,52px)', marginBottom: 8,
          background: 'linear-gradient(90deg,#FFD700,#ff6ec7,#a259ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MINT NFT</h1>
        <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 16, color: '#00eaff', marginBottom: 4 }}>
          Mint your unique MOTO Rider NFT. Unlock tournament access and boost voting power.
        </p>
        <p style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 13, color: '#a259ff', fontWeight: 600, marginBottom: 48 }}>
          ON-CHAIN · MONAD MAINNET · LIMITED SUPPLY
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 40 }}>
          {[
            { label: 'MINTED',     val: nftInfo?.supply ?? '…',    color: '#ff6ec7' },
            { label: 'MAX SUPPLY', val: nftInfo?.max ?? '…',       color: '#FFD700' },
            { label: 'MINT PRICE', val: nftInfo ? `${nftInfo.price} MON` : '…', color: '#00EAFF' },
            { label: 'YOUR NFTS',  val: `${balanceNFT}`,           color: '#a259ff' },
            { label: 'YOUR MON',   val: `${balanceMON} MON`,       color: '#39FF14' },
            { label: 'RARITY',     val: RARITIES[rarity],          color: rarityColor },
          ].map(c => (
            <div key={c.label} style={{ border: `1px solid ${c.color}33`, padding: '16px 12px', borderRadius: 12,
              backdropFilter: 'blur(4px)', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = c.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = c.color + '33'}>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 7, color: 'rgba(255,215,0,0.4)', marginBottom: 8, letterSpacing: 2 }}>{c.label}</div>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 14, color: c.color }}>{c.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'inline-block', marginBottom: 40,
          border: `2px solid ${rarityColor}55`, borderRadius: 20, padding: '32px 40px',
          backdropFilter: 'blur(8px)', boxShadow: `0 0 40px ${rarityColor}22`, transition: 'all 0.3s' }}>
          <div style={{ fontSize: 72, marginBottom: 12 }}>🏍️</div>
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 16, color: rarityColor, marginBottom: 4 }}>
            {MODELS[model]} RIDER
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
            {[
              { label: MODELS[model],     color: '#00EAFF' },
              { label: COLORS[color],     color: '#ff6ec7' },
              { label: RARITIES[rarity],  color: rarityColor },
              { label: CHARACTERS[character], color: '#39FF14' },
            ].map(tag => (
              <span key={tag.label} style={{ padding: '3px 10px', borderRadius: 999,
                border: `1px solid ${tag.color}55`, fontFamily: 'Orbitron,monospace',
                fontSize: 7, color: tag.color, letterSpacing: 1 }}>{tag.label}</span>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 600, margin: '0 auto', marginBottom: 32 }}>
          <Selector label="MODEL" items={MODELS} value={model} onChange={setModel}
            colors={{ SPEED: '#00EAFF', HEAVY: '#FF6600', STEALTH: '#a259ff', TURBO: '#39FF14' }} />
          <Selector label="COLOR" items={COLORS} value={color} onChange={setColor}
            colors={{ RED: '#FF2244', BLUE: '#00EAFF', GOLD: '#FFD700', DARK: '#888', WHITE: '#eee', NEON: '#39FF14' }} />
          <Selector label="RARITY" items={RARITIES} value={rarity} onChange={setRarity} colors={RARITY_COLORS} />
          <Selector label="CHARACTER" items={CHARACTERS} value={character} onChange={setCharacter}
            colors={{ RIDER: '#00EAFF', HUNTER: '#FF6600', GHOST: '#a259ff', TITAN: '#FFD700' }} />
        </div>

        {!connected ? (
          <div style={{ ...btn, borderColor: '#FFD700', color: '#FFD700', boxShadow: '0 0 10px #FFD70055',
            display: 'inline-block', opacity: loading ? 0.5 : 1 }}
            onClick={() => !loading && connect()}
            onMouseEnter={e => { e.currentTarget.style.background = '#FFD70018'; e.currentTarget.style.boxShadow = '0 0 22px #FFD70099' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = '0 0 10px #FFD70055' }}>
            {loading ? 'CONNECTING...' : '⬡ CONNECT WALLET'}
          </div>
        ) : (
          <div style={{ ...btn, borderColor: rarityColor, color: rarityColor,
            boxShadow: `0 0 16px ${rarityColor}55`, fontSize: 14, padding: '16px 48px',
            opacity: busy ? 0.5 : 1, cursor: busy ? 'not-allowed' : 'pointer', display: 'inline-block' }}
            onClick={!busy ? handleMint : undefined}
            onMouseEnter={e => { if (!busy) { e.currentTarget.style.background = rarityColor + '18'; e.currentTarget.style.boxShadow = `0 0 30px ${rarityColor}88` } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = `0 0 16px ${rarityColor}55` }}>
            {busy ? 'MINTING...' : loading ? '...' : `🏍️ MINT ${RARITIES[rarity]}`}
          </div>
        )}

        <p style={{ fontFamily: 'Orbitron,monospace', fontSize: 7, color: 'rgba(255,215,0,0.2)', marginTop: 24, letterSpacing: 2 }}>
          CONTRACT: 0x6e9E4f12D33aAf4834E6D7f61a3a9EDB5ca97AD1 · MONAD MAINNET
        </p>
      </div>
    </>
  )
}
