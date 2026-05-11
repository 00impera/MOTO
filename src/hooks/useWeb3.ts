// ─────────────────────────────────────────────────────────────────
//  useWeb3.ts — Moto Runner Web3 Hook
//  Stack: viem v2 + thirdweb v5 (no ethers dependency)
//  Contracts on Monad Mainnet (chainId 143)
// ─────────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect } from 'react'
import {
  createPublicClient, createWalletClient, custom, http,
  parseEther, formatEther, formatUnits,
  type PublicClient, type WalletClient, type Address,
} from 'viem'

// ── Monad chain definition ───────────────────────────────────────
export const monad = {
  id: 143,
  name: 'Monad Mainnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.monad.xyz'] } },
  blockExplorers: { default: { name: 'Monad Explorer', url: 'https://explorer.monad.xyz' } },
} as const

// ── Contract addresses ───────────────────────────────────────────
export const CONTRACTS = {
  MOTO_TOKEN:      '0xD49e4A6caEDf6e06C8E520E90518F7cDAcEbBd63' as Address,
  MOTO_NFT:        '0x6e9E4f12D33aAf4834E6D7f61a3a9EDB5ca97AD1' as Address,
  GAME_CONTROLLER: '0x0411Cdf2897214f29426Cb87eF0B5846a71bD751' as Address,
  TREASURY:        '0x592B35c8917eD36c39Ef73D0F5e92B0173560b2e' as Address,
}

// ── ABIs ─────────────────────────────────────────────────────────
const TOKEN_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'symbol',   type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8'  }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
] as const

const NFT_ABI = [
  { name: 'balanceOf',  type: 'function', stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'MINT_PRICE', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'MAX_SUPPLY', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'totalSupply',type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'publicMint', type: 'function', stateMutability: 'payable',
    inputs: [
      { name: 'model',     type: 'uint8' },
      { name: 'color',     type: 'uint8' },
      { name: 'rarity',    type: 'uint8' },
      { name: 'character', type: 'uint8' },
    ], outputs: [] },
] as const

const CONTROLLER_ABI = [
  { name: 'claimReward', type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'score',     type: 'uint256' },
      { name: 'nonce',     type: 'uint256' },
      { name: 'signature', type: 'bytes'   },
    ], outputs: [] },
  { name: 'getPlayerStats', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ name: 'earned', type: 'uint256' }, { name: 'score', type: 'uint256' }] },
  { name: 'getSeasonScore',  type: 'function', stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'currentSeason',   type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'rewardPerPoint',  type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'maxClaimPerGame', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'tournamentActive',type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool'    }] },
  { name: 'enterTournament', type: 'function', stateMutability: 'payable',
    inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [] },
  { name: 'totalEarned',     type: 'function', stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }], outputs: [{ type: 'uint256' }] },
] as const

// ── Public client (read-only, no wallet needed) ──────────────────
const publicClient: PublicClient = createPublicClient({
  chain: monad,
  transport: http('https://rpc.monad.xyz'),
})

// ── Types ────────────────────────────────────────────────────────
export interface Web3State {
  address:      Address | null
  connected:    boolean
  chainOk:      boolean
  balanceMOTO:  string
  balanceMON:   string
  balanceNFT:   number
  loading:      boolean
  toast:        { msg: string; type: 'ok'|'err'|'warn'|'info' } | null
}

// ── Hook ─────────────────────────────────────────────────────────
export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    address: null, connected: false, chainOk: false,
    balanceMOTO: '0', balanceMON: '0', balanceNFT: 0,
    loading: false, toast: null,
  })
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)

  // ── Toast ──────────────────────────────────────────────────────
  const toast = useCallback((msg: string, type: 'ok'|'err'|'warn'|'info' = 'info') => {
    setState(s => ({ ...s, toast: { msg, type } }))
    setTimeout(() => setState(s => ({ ...s, toast: null })), 3500)
  }, [])

  // ── Get wallet provider ────────────────────────────────────────
  const getProvider = useCallback(() => {
    const w = window as any
    return w.ethereum || w._web3provider || null
  }, [])

  // ── Build wallet client ────────────────────────────────────────
  const buildWalletClient = useCallback((provider: any): WalletClient => {
    return createWalletClient({ chain: monad, transport: custom(provider) })
  }, [])

  // ── Switch to Monad ────────────────────────────────────────────
  const switchToMonad = useCallback(async (provider: any): Promise<boolean> => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x8f' }],
      })
      return true
    } catch (err: any) {
      if (err.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x8f',
              chainName: 'Monad Mainnet',
              nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
              rpcUrls: ['https://rpc.monad.xyz'],
              blockExplorerUrls: ['https://explorer.monad.xyz'],
            }],
          })
          return true
        } catch { return false }
      }
      return false
    }
  }, [])

  // ── Fetch balances (uses publicClient — no wallet needed) ──────
  const fetchBalances = useCallback(async (address: Address) => {
    if (!address || typeof address !== 'string' || !address.startsWith('0x') || address.length !== 42) {
      console.warn('fetchBalances: invalid address', address); return
    }
    try {
      const [motoRaw, nftRaw, monRaw] = await Promise.all([
        publicClient.readContract({ address: CONTRACTS.MOTO_TOKEN, abi: TOKEN_ABI, functionName: 'balanceOf', args: [address] }),
        publicClient.readContract({ address: CONTRACTS.MOTO_NFT,   abi: NFT_ABI,   functionName: 'balanceOf', args: [address] }),
        publicClient.getBalance({ address }),
      ])
      const moto = parseFloat(formatUnits(motoRaw as bigint, 18)).toFixed(2)
      const mon  = parseFloat(formatEther(monRaw)).toFixed(4)
      const nfts = Number(nftRaw as bigint)
      setState(s => ({ ...s, balanceMOTO: moto, balanceMON: mon, balanceNFT: nfts }))
      return { moto, mon, nfts }
    } catch (e) { console.warn('fetchBalances', e) }
  }, [])

  // ── Connect ────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    const provider = getProvider()
    if (!provider) { 
      window.open('https://metamask.io/download/', '_blank')
      toast('Install MetaMask', 'err'); return 
    }
    // Focus current window so MetaMask popup appears here
    window.focus()
    setState(s => ({ ...s, loading: true }))
    try {
      // Request accounts direct via provider - mai sigur
      const accounts: string[] = await provider.request({ 
        method: 'eth_requestAccounts'
      })
      if (!accounts || accounts.length === 0) throw new Error('No accounts returned')
      const address = accounts[0] as Address
      if (!address || !address.startsWith('0x') || address.length !== 42) {
        throw new Error('Invalid address returned: ' + address)
      }
      const wc = buildWalletClient(provider)

      // Check chain
      const chainIdHex: string = await provider.request({ method: 'eth_chainId' })
      let chainOk = parseInt(chainIdHex, 16) === 143
      if (!chainOk) {
        toast('Switching to Monad...', 'warn')
        chainOk = await switchToMonad(provider)
      }

      setWalletClient(wc)
      setState(s => ({ ...s, address, connected: true, chainOk, loading: false }))
      toast(`Connected: ${address.slice(0,6)}…${address.slice(-4)}`, 'ok')
      await fetchBalances(address)
    } catch (e: any) {
      toast(e.shortMessage || e.message || 'Connect failed', 'err')
      setState(s => ({ ...s, loading: false }))
    }
  }, [getProvider, buildWalletClient, switchToMonad, fetchBalances, toast])

  // ── Sign Score via Cloudflare Worker ────────────────────────────
  const claimReward = useCallback(async (score: number, nonce: number, signature: `0x${string}`) => {
    if (!walletClient || !state.address) { toast('Connect wallet first', 'err'); return }
    setState(s => ({ ...s, loading: true }))
    try {
      toast('Claiming reward...', 'info')
      const hash = await walletClient.writeContract({
        address: CONTRACTS.GAME_CONTROLLER, abi: CONTROLLER_ABI,
        functionName: 'claimReward',
        args: [BigInt(score), BigInt(nonce), signature as `0x${string}`],
        account: state.address, chain: monad,
      })
      toast('Waiting for tx...', 'warn')
      await publicClient.waitForTransactionReceipt({ hash })
      toast('Reward claimed! 🎉', 'ok')
      if (state.address && state.address.startsWith('0x') && state.address.length === 42) await fetchBalances(state.address)
    } catch (e: any) {
      if (e.name === 'UserRejectedRequestError') toast('Rejected', 'warn')
      else toast('Claim failed: ' + (e.shortMessage || e.message || '?'), 'err')
    } finally { setState(s => ({ ...s, loading: false })) }
  }, [walletClient, state.address, fetchBalances, toast])
  const signScore = useCallback(async (score: number): Promise<boolean> => {
    const address = state.address
    if (!address) { toast('Connect wallet first', 'err'); return false }
    try {
      toast('Signing score...', 'warn')
      const nonce = Math.floor(Date.now() / 1000)
      const res = await fetch('https://moto-signer.nelutz2you.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: address, score, nonce })
      })
      const data = await res.json()
      if (data.error) { toast('Sign error: ' + data.error, 'err'); return false }
      toast('Claiming MOTO reward...', 'warn')
      await claimReward(score, nonce, data.signature)
      return true
    } catch (e: any) {
      toast('Claim error: ' + e.message, 'err')
      return false
    }
  }, [state.address, toast, claimReward])

  // ── Disconnect ─────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    setWalletClient(null)
    setState(s => ({ ...s, address: null, connected: false, chainOk: false, balanceMOTO: '0', balanceMON: '0', balanceNFT: 0 }))
    toast('Disconnected', 'info')
  }, [toast])

  // ── Mint NFT ───────────────────────────────────────────────────
  const mintNFT = useCallback(async (model=0, color=0, rarity=0, character=0) => {
    if (!walletClient || !state.address) { toast('Connect wallet first', 'err'); return }
    setState(s => ({ ...s, loading: true }))
    try {
      toast('Fetching mint price...', 'info')
      const price = await publicClient.readContract({
        address: CONTRACTS.MOTO_NFT, abi: NFT_ABI, functionName: 'MINT_PRICE',
      }) as bigint

      toast('Confirm mint in wallet...', 'warn')
      const hash = await walletClient.writeContract({
        address: CONTRACTS.MOTO_NFT, abi: NFT_ABI,
        functionName: 'publicMint',
        args: [model, color, rarity, character],
        value: price,
        account: state.address,
        chain: monad,
      })
      toast('Minting NFT...', 'info')
      await publicClient.waitForTransactionReceipt({ hash })
      toast('NFT Minted! 🏍️', 'ok')
      if (state.address && state.address.startsWith('0x') && state.address.length === 42) await fetchBalances(state.address)
    } catch (e: any) {
      if (e.code === 4001 || e.name === 'UserRejectedRequestError') toast('Rejected by user', 'warn')
      else toast('Mint failed: ' + (e.shortMessage || e.message || '?'), 'err')
    } finally { setState(s => ({ ...s, loading: false })) }
  }, [walletClient, state.address, fetchBalances, toast])

  // ── Claim reward ───────────────────────────────────────────────

  // ── Sign score ─────────────────────────────────────────────────

  // ── Buy coins with MON ─────────────────────────────────────────
  const buyCoins = useCallback(async (monAmount: number, coinsAmount: number): Promise<boolean> => {
    if (!walletClient || !state.address) { toast('Connect wallet first', 'err'); return false }
    setState(s => ({ ...s, loading: true }))
    try {
      toast('Confirm payment in wallet...', 'warn')
      const hash = await walletClient.sendTransaction({
        to: CONTRACTS.TREASURY,
        value: parseEther(monAmount.toString()),
        account: state.address, chain: monad,
      })
      toast(`Sending ${monAmount} MON...`, 'info')
      await publicClient.waitForTransactionReceipt({ hash })
      toast(`+${coinsAmount} coins added! 🪙`, 'ok')
      if (state.address && state.address.startsWith('0x') && state.address.length === 42) await fetchBalances(state.address)
      return true
    } catch (e: any) {
      if (e.name === 'UserRejectedRequestError') toast('Payment rejected', 'warn')
      else toast('Payment failed: ' + (e.shortMessage || e.message || '?'), 'err')
      return false
    } finally { setState(s => ({ ...s, loading: false })) }
  }, [walletClient, state.address, fetchBalances, toast])

  // ── Add MOTO token to wallet ───────────────────────────────────
  const addMotoToWallet = useCallback(async () => {
    const provider = getProvider()
    if (!provider) { toast('No wallet found', 'err'); return }
    try {
      await provider.request({
        method: 'wallet_watchAsset',
        params: { type: 'ERC20', options: {
          address: CONTRACTS.MOTO_TOKEN,
          symbol: 'MOTO', decimals: 18,
          image: 'https://00impera.github.io/MOTO-RUNNER-V2/icon-512%20(2).png',
        }},
      })
      toast('MOTO added to wallet!', 'ok')
    } catch { toast('Failed to add token', 'err') }
  }, [getProvider, toast])

  // ── Get player stats (read-only) ───────────────────────────────
  const getPlayerStats = useCallback(async (address: Address) => {
    try {
      const [stats, seasonScore, season] = await Promise.all([
        publicClient.readContract({ address: CONTRACTS.GAME_CONTROLLER, abi: CONTROLLER_ABI, functionName: 'getPlayerStats', args: [address] }),
        publicClient.readContract({ address: CONTRACTS.GAME_CONTROLLER, abi: CONTROLLER_ABI, functionName: 'getSeasonScore',  args: [address] }),
        publicClient.readContract({ address: CONTRACTS.GAME_CONTROLLER, abi: CONTROLLER_ABI, functionName: 'currentSeason'              }),
      ]) as any[]
      return {
        earned:      formatUnits(stats.earned, 18),
        score:       stats.score.toString(),
        seasonScore: seasonScore.toString(),
        season:      season.toString(),
      }
    } catch (e) { console.warn('getPlayerStats', e); return null }
  }, [])

  // ── Enter tournament ───────────────────────────────────────────
  const enterTournament = useCallback(async (tokenId: number) => {
    if (!walletClient || !state.address) { toast('Connect wallet first', 'err'); return }
    setState(s => ({ ...s, loading: true }))
    try {
      toast('Fetching tournament fee...', 'info')
      const fee = await publicClient.readContract({
        address: CONTRACTS.GAME_CONTROLLER, abi: CONTROLLER_ABI, functionName: 'tournamentFee' as any,
      }) as bigint
      toast('Confirm entry in wallet...', 'warn')
      const hash = await walletClient.writeContract({
        address: CONTRACTS.GAME_CONTROLLER, abi: CONTROLLER_ABI,
        functionName: 'enterTournament',
        args: [BigInt(tokenId)],
        value: fee,
        account: state.address, chain: monad,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      toast('Tournament entered! 🏆', 'ok')
    } catch (e: any) {
      if (e.name === 'UserRejectedRequestError') toast('Rejected', 'warn')
      else toast('Entry failed: ' + (e.shortMessage || e.message || '?'), 'err')
    } finally { setState(s => ({ ...s, loading: false })) }
  }, [walletClient, state.address, toast])

  // ── Auto-reconnect ─────────────────────────────────────────────
  useEffect(() => {
    const provider = getProvider()
    if (!provider) return
    provider.request({ method: 'eth_accounts' }).then(async (accounts: Address[]) => {
      if (accounts.length > 0) {
        const wc = buildWalletClient(provider)
        setWalletClient(wc)
        const chainIdHex: string = await provider.request({ method: 'eth_chainId' })
        const chainOk = parseInt(chainIdHex, 16) === 143
        setState(s => ({ ...s, address: accounts[0], connected: true, chainOk }))
        fetchBalances(accounts[0])
      }
    }).catch(() => {})

    const onAccounts = (accounts: Address[]) => {
      if (accounts.length === 0) disconnect()
      else {
        const wc = buildWalletClient(provider)
        setWalletClient(wc)
        setState(s => ({ ...s, address: accounts[0], connected: true }))
        fetchBalances(accounts[0])
      }
    }
    const onChain = () => { /* chain changed - no reload needed */ }
    provider.on?.('accountsChanged', onAccounts)
    provider.on?.('chainChanged', onChain)
    return () => {
      provider.removeListener?.('accountsChanged', onAccounts)
      provider.removeListener?.('chainChanged', onChain)
    }
  }, [])

  return {
    ...state,
    connect, disconnect, fetchBalances, signScore, mintNFT, claimReward,
    buyCoins, addMotoToWallet, getPlayerStats, enterTournament,
  }
}
