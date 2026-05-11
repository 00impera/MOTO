import { ThirdwebProvider, ConnectButton } from 'thirdweb/react'
import { createThirdwebClient, defineChain } from 'thirdweb'
import { createWallet, inAppWallet } from 'thirdweb/wallets'

// Thirdweb clients
export const clientWallet = createThirdwebClient({ clientId: '39d5688409d060364e2d612723c14984' })
export const clientShop = createThirdwebClient({ clientId: '821819db832d1a313ae3b1a62fbeafb7' })

// Alchemy config
export const ALCHEMY_KEY = 'Uwb7T0DbXMQHjiJBNf9_b005qYjLmJqk'
export const ALCHEMY_RPC = `https://monad-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`

// Contracts
export const CONTRACTS = {
  MOTO:       '0xD49e4A6caEDf6e06C8E520E90518F7cDAcEbBd63',
  NFT:        '0x6e9E4f12D33aAf4834E6D7f61a3a9EDB5ca97AD1',
  CONTROLLER: '0x0411Cdf2897214f29426Cb87eF0B5846a71bD751',
  NFT_BRIDGE: '0x7480e83eCf8E9164892bc66aeb36Bd86b8528faE',
  TREASURY:   '0x592B35c8917eD36c39Ef73D0F5e92B0173560b2e',
}

export const monad = defineChain({
  id: 143,
  name: 'Monad Mainnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpc: ALCHEMY_RPC,
})

export const wallets = [
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
  inAppWallet({
    auth: { options: ['email', 'google', 'apple'] }
  }),
]

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThirdwebProvider>{children}</ThirdwebProvider>
}

export function WalletButton() {
  return (
    <ConnectButton
      client={clientWallet}
      chain={monad}
      wallets={wallets}
      connectButton={{label:'CONNECT',style:{background:'linear-gradient(135deg,#B8860B,#FFD700)',color:'#050A0E',fontFamily:'Orbitron,monospace',fontSize:'9px',fontWeight:'900',letterSpacing:'2px',border:'none',padding:'10px 18px',cursor:'pointer',clipPath:'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)'}}}
    />
  )
}
