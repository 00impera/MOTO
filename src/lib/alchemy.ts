import { ALCHEMY_RPC, CONTRACTS } from '../providers'

// Alchemy RPC call helper
export async function alchemyRPC(method: string, params: any[] = []) {
  const res = await fetch(ALCHEMY_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result
}

// Get MON balance
export async function getBalance(address: string): Promise<string> {
  const hex = await alchemyRPC('eth_getBalance', [address, 'latest'])
  const wei = BigInt(hex)
  return (Number(wei) / 1e18).toFixed(4)
}

// Get MOTO token balance
export async function getMotoBalance(address: string): Promise<string> {
  const data = '0x70a08231' + address.slice(2).padStart(64, '0')
  const hex = await alchemyRPC('eth_call', [{ to: CONTRACTS.MOTO, data }, 'latest'])
  const val = BigInt(hex)
  return (Number(val) / 1e18).toFixed(2)
}

// Get transaction count (nonce)
export async function getNonce(address: string): Promise<number> {
  const hex = await alchemyRPC('eth_getTransactionCount', [address, 'latest'])
  return parseInt(hex, 16)
}

// Send raw transaction
export async function sendTransaction(signedTx: string): Promise<string> {
  return await alchemyRPC('eth_sendRawTransaction', [signedTx])
}

// Get token info
export async function getTokenInfo() {
  return {
    address: CONTRACTS.MOTO,
    name: 'MOTO',
    symbol: 'MOTO',
    decimals: 18,
    network: 'Monad Mainnet',
    chainId: 143,
  }
}

// Simulate gas estimate
export async function estimateGas(tx: { from: string, to: string, data: string }): Promise<string> {
  const hex = await alchemyRPC('eth_estimateGas', [tx])
  return parseInt(hex, 16).toString()
}
