import { useState } from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { Web3Toast } from '../components/Web3HUD'

const MOON_PACKS = [
  { id:1, label:'ON MOON ×1',   usd:'$1',   coins:1000,   moto:1000,   mon:0.01, img:'/packs/pack_1.jpg' },
  { id:2, label:'ON MOON ×2',   usd:'$2',   coins:2500,   moto:2500,   mon:0.02, img:'/packs/pack_2.jpg' },
  { id:3, label:'ON MOON ×5',   usd:'$5',   coins:7000,   moto:7000,   mon:0.05, img:'/packs/pack_5.jpg' },
  { id:4, label:'ON MOON ×10',  usd:'$10',  coins:15000,  moto:15000,  mon:0.1,  img:'/packs/pack_10.jpg' },
  { id:5, label:'ON MOON ×20',  usd:'$20',  coins:35000,  moto:35000,  mon:0.2,  img:'/packs/pack_20.jpg' },
  { id:6, label:'ON MOON ×50',  usd:'$50',  coins:100000, moto:100000, mon:0.5,  img:'/packs/pack_50.jpg' },
  { id:7, label:'ON MOON ×100', usd:'$100', coins:250000, moto:250000, mon:1,    img:'/packs/pack_100.jpg' },
]

const COIN_PACKS = [
  { id:1, name:'MICRO',     coins:200,    bonus:100,   mon:0.02, img:'/packs/pack_micro.jpg.jpg' },
  { id:2, name:'STARTER',   coins:600,    bonus:500,   mon:0.05, img:'/packs/pack_starter.jpg.jpg' },
  { id:3, name:'RACER',     coins:2000,   bonus:1000,  mon:0.5,  img:'/packs/pack_racer.jpg.jpg' },
  { id:4, name:'FIGHTER',   coins:5000,   bonus:3000,  mon:1,    img:'/packs/pack_fighter.jpg.jpg' },
  { id:5, name:'CHAMPION',  coins:12000,  bonus:8000,  mon:2,    img:'/packs/pack_champion.jpg.jpg' },
  { id:6, name:'ELITE',     coins:30000,  bonus:20000, mon:5,    img:'/packs/pack_elite.jpg.jpg' },
  { id:7, name:'WHALE',     coins:80000,  bonus:75000, mon:10,   img:'/packs/pack_whale.jpg.jpg' },
  { id:8, name:'MONAD GOD', coins:250000, bonus:0,     mon:25,   img:'/packs/pack_god.jpg.jpg' },
]

const MOTO_CONTRACT = '0xD49e4A6caEDf6e06C8E520E90518F7cDAcEbBd63'

export default function Packs() {
  const [selMoon, setSelMoon] = useState<number|null>(null)
  const [selCoin, setSelCoin] = useState<number|null>(null)
  const [buying, setBuying] = useState<string|null>(null)

  const {
    connected, loading, balanceMON,
    connect, buyCoins, mintNFT, addMotoToWallet,
    toast: toastState,
  } = useWeb3()

  const handleMoonPack = async (pack: typeof MOON_PACKS[0], e: React.MouseEvent) => {
    e.stopPropagation()
    if (!connected) { connect(); return }
    setBuying(`moon-${pack.id}`)
    const totalCoins = pack.coins + pack.moto
    const ok = await buyCoins(pack.mon, totalCoins)
    if (ok) {
      // Mint NFT included in moon pack
      await mintNFT(0, 0, 0, 0)
    }
    setBuying(null)
  }

  const handleCoinPack = async (pack: typeof COIN_PACKS[0], e: React.MouseEvent) => {
    e.stopPropagation()
    if (!connected) { connect(); return }
    setBuying(`coin-${pack.id}`)
    await buyCoins(pack.mon, pack.coins + pack.bonus)
    setBuying(null)
  }

  const handleClaim = async () => {
    if (!connected) { connect(); return }
    await addMotoToWallet()
  }

  const canAfford = (mon: number) => connected && parseFloat(balanceMON) >= mon

  return (
    <>
      <Web3Toast toast={toastState} />
      <div className="cyber-bg" style={{padding:'40px 24px',maxWidth:1200,margin:'0 auto'}}>

        {/* Wallet bar */}
        {connected && (
          <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',gap:12,marginBottom:20}}>
            <span style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'#00EAFF'}}>{balanceMON} MON available</span>
          </div>
        )}

        {/* ── MOON PACKS ── */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div className="cl-badge cl-badge-gold" style={{marginBottom:12}}>MOON PACKS</div>
          <h1 className="cl-title" style={{fontSize:'clamp(22px,4vw,44px)',marginBottom:8}}>
            BUY MOTO COINS + RECEIVE MOTO NFT
          </h1>
          <p style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'rgba(255,215,0,0.4)',letterSpacing:2}}>
            EVERY MOON PACK = 1 UNIQUE MOTO NFT AIRDROPPED TO YOUR WALLET · MONAD #143
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16,marginBottom:64}}>
          {MOON_PACKS.map(pack => {
            const isSel = selMoon === pack.id
            const isBuying = buying === `moon-${pack.id}`
            const affordable = canAfford(pack.mon)
            return (
              <div key={pack.id} onClick={()=>setSelMoon(pack.id)}
                style={{background:'rgba(10,18,25,0.9)',border:`1px solid ${isSel?'#FFD700':'rgba(184,134,11,0.2)'}`,cursor:'pointer',overflow:'hidden',transition:'all 0.2s',boxShadow:isSel?'0 0 28px rgba(255,215,0,0.15)':'none',opacity:connected&&!affordable?0.5:1}}>
                <div style={{position:'relative',aspectRatio:'4/3',overflow:'hidden',background:'#030609'}}>
                  <img src={pack.img} alt={pack.label}
                    style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.3s'}}
                    onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.05)')}
                    onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
                    onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(5,10,14,0.9) 0%,transparent 50%)'}}/>
                  <div style={{position:'absolute',top:10,left:10,background:'rgba(191,95,255,0.15)',border:'1px solid rgba(191,95,255,0.5)',padding:'3px 10px',fontFamily:'Orbitron,monospace',fontSize:8,color:'#BF5FFF'}}>NFT INCLUDED</div>
                  <div style={{position:'absolute',bottom:10,left:12}}>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:22,fontWeight:900,color:'#FFD700'}}>{pack.usd}</div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'rgba(255,215,0,0.5)'}}>{pack.mon} MON</div>
                  </div>
                </div>
                <div style={{padding:'12px 14px'}}>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:11,color:'#FFD700',marginBottom:8}}>{pack.label}</div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'rgba(255,215,0,0.4)'}}>COINS</span>
                    <span style={{fontFamily:'Orbitron,monospace',fontSize:10,color:'#FFD700'}}>+{pack.coins.toLocaleString()}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                    <span style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'rgba(57,255,20,0.4)'}}>MOTO</span>
                    <span style={{fontFamily:'Orbitron,monospace',fontSize:10,color:'#39FF14'}}>+{pack.moto.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={e=>handleMoonPack(pack,e)}
                    disabled={isBuying||loading||(connected&&!affordable)}
                    className="cl-btn cl-btn-gold"
                    style={{width:'100%',fontSize:9,padding:'10px'}}>
                    {isBuying ? 'PROCESSING...' : !connected ? 'CONNECT & BUY' : !affordable ? 'INSUFFICIENT MON' : 'BUY + GET NFT'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── VIP COIN PACKS ── */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
          <div style={{width:3,height:24,background:'#00EAFF'}}/>
          <div>
            <div className="cl-badge cl-badge-gold" style={{marginBottom:4}}>VIP PACK</div>
            <p style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'rgba(0,234,255,0.4)',letterSpacing:2}}>
              BUY COINS WITH MON · BONUS COINS INCLUDED
            </p>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16,marginBottom:48}}>
          {COIN_PACKS.map(pack => {
            const isSel = selCoin === pack.id
            const isBuying = buying === `coin-${pack.id}`
            const affordable = canAfford(pack.mon)
            return (
              <div key={pack.id} onClick={()=>setSelCoin(pack.id)}
                style={{background:'rgba(10,18,25,0.9)',border:`1px solid ${isSel?'#00EAFF':'rgba(184,134,11,0.2)'}`,cursor:'pointer',overflow:'hidden',transition:'all 0.2s',boxShadow:isSel?'0 0 24px rgba(0,234,255,0.1)':'none',opacity:connected&&!affordable?0.5:1}}>
                <div style={{position:'relative',aspectRatio:'1',overflow:'hidden',background:'#030609'}}>
                  <img src={pack.img} alt={pack.name}
                    style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.3s'}}
                    onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.05)')}
                    onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
                    onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(5,10,14,0.9) 0%,transparent 50%)'}}/>
                  {pack.bonus>0 && (
                    <div style={{position:'absolute',top:10,right:10,background:'rgba(57,255,20,0.15)',border:'1px solid #39FF14',padding:'3px 8px',fontFamily:'Orbitron,monospace',fontSize:8,color:'#39FF14'}}>
                      +{pack.bonus.toLocaleString()} FREE
                    </div>
                  )}
                  <div style={{position:'absolute',bottom:10,left:12}}>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:20,fontWeight:900,color:'#FFD700'}}>{pack.coins.toLocaleString()}</div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:8,color:'rgba(255,215,0,0.5)',letterSpacing:2}}>COINS</div>
                  </div>
                </div>
                <div style={{padding:'12px 14px'}}>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:12,color:'#00EAFF',marginBottom:6}}>{pack.name}</div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:13,color:'rgba(255,215,0,0.6)',marginBottom:12}}>{pack.mon} MON</div>
                  <button
                    onClick={e=>handleCoinPack(pack,e)}
                    disabled={isBuying||loading||(connected&&!affordable)}
                    className="cl-btn cl-btn-cyan"
                    style={{width:'100%',fontSize:9,padding:'10px'}}>
                    {isBuying ? 'PROCESSING...' : !connected ? 'CONNECT & BUY' : !affordable ? 'INSUFFICIENT MON' : 'BUY'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* CLAIM MOTO */}
        <div style={{border:'1px solid rgba(57,255,20,0.2)',background:'rgba(10,18,25,0.95)',padding:28,textAlign:'center'}}>
          <div className="cl-badge cl-badge-green" style={{marginBottom:16}}>CLAIM MOTO TOKENS</div>
          <p style={{fontFamily:'Rajdhani,sans-serif',fontSize:15,color:'rgba(255,230,100,0.6)',marginBottom:12}}>
            MOTO earned in-game can be claimed to your wallet
          </p>
          <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:'rgba(0,234,255,0.6)',marginBottom:20}}>
            CONTRACT: <a href={`https://explorer.monad.xyz/address/${MOTO_CONTRACT}`} target="_blank" rel="noreferrer"
              style={{color:'#00EAFF',textDecoration:'none'}}>{MOTO_CONTRACT}</a>
          </div>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={handleClaim} disabled={loading} className="cl-btn cl-btn-green" style={{fontSize:11,padding:'14px 32px'}}>
              {connected ? '+ ADD MOTO TO WALLET' : '⬡ CONNECT WALLET'}
            </button>
            {!connected && (
              <button onClick={connect} disabled={loading} className="cl-btn cl-btn-gold" style={{fontSize:11,padding:'14px 32px'}}>
                {loading ? 'CONNECTING...' : '⬡ CONNECT & BUY'}
              </button>
            )}
          </div>
        </div>

      </div>
    </>
  )
}
