import { useState } from 'react'
import { createThirdwebClient } from 'thirdweb'
import { PayEmbed } from 'thirdweb/react'
import { monadTestnet } from 'thirdweb/chains'

const client = createThirdwebClient({ clientId: '39d5688409d060364e2d612723c14984' })

const PACKS = [
  { id:1, label:'STARTER',  usd:1,   moto:1000  },
  { id:2, label:'RACER',    usd:5,   moto:6000  },
  { id:3, label:'ELITE',    usd:20,  moto:30000 },
  { id:4, label:'LEGEND',   usd:100, moto:200000},
]

export default function CardPayment({ onClose }: { onClose: ()=>void }) {
  const [sel, setSel] = useState(PACKS[0])
  const [showPay, setShowPay] = useState(false)

  return (
    <div style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)'}}>
      <div style={{background:'#050A0E',border:'1px solid rgba(184,134,11,0.4)',maxWidth:480,width:'90%',padding:28,position:'relative'}}>
        <button onClick={onClose} style={{position:'absolute',top:12,right:16,background:'none',border:'none',color:'#FFD700',fontSize:20,cursor:'pointer'}}>✕</button>

        <div style={{fontFamily:'Orbitron,monospace',fontSize:11,color:'rgba(255,215,0,0.5)',letterSpacing:3,marginBottom:8}}>BUY MOTO</div>
        <div style={{fontFamily:'Orbitron,monospace',fontSize:22,color:'#FFD700',marginBottom:24}}>CARD PAYMENT</div>

        {!showPay ? (
          <>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
              {PACKS.map(p=>(
                <div key={p.id} onClick={()=>setSel(p)}
                  style={{border:`1px solid ${sel.id===p.id?'#FFD700':'rgba(184,134,11,0.2)'}`,padding:14,cursor:'pointer',background:sel.id===p.id?'rgba(255,215,0,0.08)':'rgba(10,18,25,0.9)',transition:'all 0.2s'}}>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'rgba(255,215,0,0.5)',marginBottom:4}}>{p.label}</div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:20,color:'#FFD700'}}>${p.usd}</div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:'#39FF14',marginTop:4}}>{p.moto.toLocaleString()} MOTO</div>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowPay(true)}
              style={{width:'100%',fontFamily:'Orbitron,monospace',fontSize:11,padding:'14px',background:'linear-gradient(135deg,#B8860B,#FFD700)',color:'#050A0E',border:'none',cursor:'pointer',letterSpacing:2,fontWeight:700}}>
              💳 PAY ${sel.usd} WITH CARD
            </button>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:11,color:'rgba(255,215,0,0.3)',textAlign:'center',marginTop:12}}>
              Powered by Thirdweb Pay · Secure · No crypto needed
            </div>
          </>
        ) : (
          <div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:'#39FF14',marginBottom:16,textAlign:'center'}}>
              💳 PAYING ${sel.usd} → {sel.moto.toLocaleString()} MOTO
            </div>
            <PayEmbed
              client={client}
              theme="dark"
              payOptions={{
                mode: 'fund_wallet',
                prefillBuy: {
                  chain: monadTestnet,
                  amount: String(sel.usd),
                },
              }}
            />
            <button onClick={()=>setShowPay(false)}
              style={{width:'100%',marginTop:12,fontFamily:'Orbitron,monospace',fontSize:9,padding:'10px',background:'transparent',border:'1px solid rgba(255,215,0,0.3)',color:'rgba(255,215,0,0.5)',cursor:'pointer'}}>
              ← BACK TO PACKS
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
