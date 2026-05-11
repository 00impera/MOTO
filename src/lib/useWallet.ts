import { useState, useEffect } from 'react'
import { getBalance, getMotoBalance } from './alchemy'

const MONAD_CHAIN = {
  chainId: '0x8f',
  chainName: 'Monad Mainnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: ['https://rpc.monad.xyz'],
  blockExplorerUrls: ['https://explorer.monad.xyz'],
}

export function useWallet() {
  const [addr, setAddr] = useState<string|null>(null)
  const [monBalance, setMonBalance] = useState('0')
  const [motoBalance, setMotoBalance] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const eth = (window as any).ethereum
    if (!eth) return
    eth.request({ method: 'eth_accounts' }).then((a: string[]) => {
      if (a[0]) { setAddr(a[0]); loadBalances(a[0]) }
    })
    eth.on('accountsChanged', (a: string[]) => {
      setAddr(a[0] || null)
      if (a[0]) loadBalances(a[0])
    })
  }, [])

  async function loadBalances(address: string) {
    try {
      const [mon, moto] = await Promise.all([
        getBalance(address),
        getMotoBalance(address)
      ])
      setMonBalance(mon)
      setMotoBalance(moto)
    } catch (e) {
      console.error('Balance error:', e)
    }
  }

  async function connect() {
    const eth = (window as any).ethereum
    if (!eth) { setError('Install MetaMask'); return }
    setLoading(true)
    try {
      const accounts = await eth.request({ method: 'eth_requestAccounts' })
      try {
        await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: MONAD_CHAIN.chainId }] })
      } catch (sw: any) {
        if (sw.code === 4902) await eth.request({ method: 'wallet_addEthereumChain', params: [MONAD_CHAIN] })
      }
      setAddr(accounts[0])
      setError('')
      await loadBalances(accounts[0])
    } catch (e: any) {
      setError(e.code === 4001 ? 'Rejected' : e.code === -32002 ? 'Check MetaMask' : 'Error')
    } finally {
      setLoading(false)
    }
  }

  function disconnect() {
    setAddr(null)
    setMonBalance('0')
    setMotoBalance('0')
  }

  const short = addr ? addr.slice(0,6)+'...'+addr.slice(-4) : null

  return { addr, short, monBalance, motoBalance, loading, error, connect, disconnect, loadBalances }
}
