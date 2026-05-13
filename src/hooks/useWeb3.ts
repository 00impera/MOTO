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
  // ── Write ──────────────────────────────────────────────────────
  { name: 'claimReward',    type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'score',     type: 'uint256' },
      { name: 'nonce',     type: 'uint256' },
      { name: 'signature', type: 'bytes'   },
    ], outputs: [] },
  { name: 'enterTournament', type: 'function', stateMutability: 'payable',
    inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [] },
  // ── Read ───────────────────────────────────────────────────────
  // ── FIX: outputs cu nume explicite ca sa viem sa le returneze ca obiect ──
  { name: 'getPlayerStats',  type: 'function', stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [
      { name: 'earned', type: 'uint256' },
      { name: 'score',  type: 'uint256' },
    ]},
  { name: 'getSeasonScore',  type: 'function', stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }], outputs: [{ name: 'seasonScore', type: 'uint256' }] },
  { name: 'totalEarned',     type: 'function', stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'totalBurned',     type: 'function', stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'usedSignatures',  type: 'function', stateMutability: 'view',
    inputs: [{ name: 'sig', type: 'bytes32' }], outputs: [{ type: 'bool' }] },
  { name: 'currentSeason',   type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'tournamentActive',type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool'    }] },
  { name: 'tournamentFee',   type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'owner',           type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { name: 'signer',          type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  // ── Owner only ─────────────────────────────────────────────────
  { name: 'setMaxClaim',     type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'setSigner',       type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'signer', type: 'address' }], outputs: [] },
  { name: 'withdraw',        type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'token', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
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

  // ── Fetch balances ─────────────────────────────────────────────
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
    window.focus()
    setState(s => ({ ...s, loading: true }))
    try {
      const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' })
      if (!accounts || accounts.length === 0) throw new Error('No accounts returned')
      const address = accounts[0] as Address
      if (!address || !address.startsWith('0x') || address.length !== 42) {
        throw new Error('Invalid address returned: ' + address)
      }
      const wc = buildWalletClient(provider)
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

  // ── Claim Reward ───────────────────────────────────────────────
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
      if (state.address) await fetchBalances(state.address)
    } catch (e: any) {
      if (e.name === 'UserRejectedRequestError') toast('Rejected', 'warn')
      else toast('Claim failed: ' + (e.shortMessage || e.message || '?'), 'err')
    } finally { setState(s => ({ ...s, loading: false })) }
  }, [walletClient, state.address, fetchBalances, toast])

  // ── Sign Score via Cloudflare Worker ──────────────────────────
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
    setState(s => ({ ...s, address: null, connected: false, chainOk: false,
      balanceMOTO: '0', balanceMON: '0', balanceNFT: 0 }))
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
        account: state.address, chain: monad,
      })
      toast('Minting NFT...', 'info')
      await publicClient.waitForTransactionReceipt({ hash })
      toast('NFT Minted! 🏍️', 'ok')
      if (state.address) await fetchBalances(state.address)
    } catch (e: any) {
      if (e.code === 4001 || e.name === 'UserRejectedRequestError') toast('Rejected by user', 'warn')
      else toast('Mint failed: ' + (e.shortMessage || e.message || '?'), 'err')
    } finally { setState(s => ({ ...s, loading: false })) }
  }, [walletClient, state.address, fetchBalances, toast])

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
      if (state.address) await fetchBalances(state.address)
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

  // ── Get player stats ── FIX: destructurare corecta array→obiect ─
  const getPlayerStats = useCallback(async (address: Address) => {
    try {
      const [rawStats, rawSeasonScore, rawSeason] = await Promise.all([
        publicClient.readContract({
          address: CONTRACTS.GAME_CONTROLLER,
          abi: CONTROLLER_ABI,
          functionName: 'getPlayerStats',
          args: [address],
        }),
        publicClient.readContract({
          address: CONTRACTS.GAME_CONTROLLER,
          abi: CONTROLLER_ABI,
          functionName: 'getSeasonScore',
          args: [address],
        }),
        publicClient.readContract({
          address: CONTRACTS.GAME_CONTROLLER,
          abi: CONTROLLER_ABI,
          functionName: 'currentSeason',
        }),
      ])

      // viem returneaza array [earned, score] sau obiect {earned, score}
      // Tratam ambele cazuri
      let earned: bigint
      let score: bigint

      if (Array.isArray(rawStats)) {
        // Array: [earned, score]
        earned = rawStats[0] as bigint
        score  = rawStats[1] as bigint
      } else {
        // Obiect: { earned, score }
        const s = rawStats as any
        earned = s.earned as bigint
        score  = s.score  as bigint
      }

      const seasonScore = rawSeasonScore as bigint
      const season      = rawSeason      as bigint

      return {
        earned:      parseFloat(formatUnits(earned, 18)).toFixed(2),
        score:       score.toString(),
        seasonScore: seasonScore.toString(),
        season:      season.toString(),
      }
    } catch (e) {
      console.warn('getPlayerStats error:', e)
      return null
    }
  }, [])

  // ── Enter tournament ───────────────────────────────────────────
  const enterTournament = useCallback(async (tokenId: number) => {
    if (!walletClient || !state.address) { toast('Connect wallet first', 'err'); return }
    setState(s => ({ ...s, loading: true }))
    try {
      toast('Fetching tournament fee...', 'info')
      const fee = await publicClient.readContract({
        address: CONTRACTS.GAME_CONTROLLER, abi: CONTROLLER_ABI,
        functionName: 'tournamentFee' as any,
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
    const onChain = () => { /* chain changed */ }
    provider.on?.('accountsChanged', onAccounts)
    provider.on?.('chainChanged', onChain)
    return () => {
      provider.removeListener?.('accountsChanged', onAccounts)
      provider.removeListener?.('chainChanged', onChain)
    }
  }, [])

  // ── Get Voting Power ───────────────────────────────────────────
  const getVotingPower = useCallback(async (address: Address): Promise<string> => {
    try {
      const power = await publicClient.readContract({
        address: '0xdF8cC3CD492cce409740249dffAB4f85594B3083' as Address,
        abi: [{ name: 'getVotingPower', type: 'function', stateMutability: 'view',
          inputs: [{ name: 'voter', type: 'address' }], outputs: [{ type: 'uint256' }] }],
        functionName: 'getVotingPower',
        args: [address],
      }) as bigint
      return power.toString()
    } catch (e) { console.warn('getVotingPower', e); return '0' }
  }, [])

  // ── Create Governance Proposal ─────────────────────────────────
  const createProposal = useCallback(async (title: string, description: string): Promise<boolean> => {
    if (!walletClient || !state.address) { toast('Connect wallet first', 'err'); return false }
    setState(s => ({ ...s, loading: true }))
    try {
      toast('Creating proposal...', 'info')
      const hash = await walletClient.writeContract({
        address: '0x2926649E00E08f740EF33C523Ca79eE8D1ccCfD9' as Address,
        abi: [{ name: 'createProposal', type: 'function', stateMutability: 'nonpayable',
          inputs: [{ name: 'title', type: 'string' }, { name: 'description', type: 'string' }],
          outputs: [{ type: 'uint256' }] }],
        functionName: 'createProposal',
        args: [title, description],
        account: state.address, chain: monad,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      toast('Proposal created! 🗳️', 'ok')
      return true
    } catch (e: any) {
      toast('Failed: ' + (e.shortMessage || e.message), 'err')
      return false
    } finally { setState(s => ({ ...s, loading: false })) }
  }, [walletClient, state.address, toast])

  // ── Cast Vote ──────────────────────────────────────────────────
  const castVote = useCallback(async (proposalId: number, support: 0|1|2, weight: number): Promise<boolean> => {
    if (!walletClient || !state.address) { toast('Connect wallet first', 'err'); return false }
    setState(s => ({ ...s, loading: true }))
    try {
      toast('Casting vote...', 'info')
      const hash = await walletClient.writeContract({
        address: '0x2926649E00E08f740EF33C523Ca79eE8D1ccCfD9' as Address,
        abi: [{ name: 'castVote', type: 'function', stateMutability: 'nonpayable',
          inputs: [{ name: 'proposalId', type: 'uint256' }, { name: 'support', type: 'uint8' }, { name: 'weight', type: 'uint256' }],
          outputs: [] }],
        functionName: 'castVote',
        args: [BigInt(proposalId), support, BigInt(weight)],
        account: state.address, chain: monad,
      })
      await publicClient.waitForTransactionReceipt({ hash })
      toast('Vote cast! ✅', 'ok')
      return true
    } catch (e: any) {
      toast('Vote failed: ' + (e.shortMessage || e.message), 'err')
      return false
    } finally { setState(s => ({ ...s, loading: false })) }
  }, [walletClient, state.address, toast])

  return {
    ...state,
    connect, disconnect, fetchBalances, signScore, mintNFT, claimReward,
    buyCoins, addMotoToWallet, getPlayerStats, enterTournament,
    getVotingPower, createProposal, castVote,
  }
}
