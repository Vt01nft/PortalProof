export const PORTALDOT_CHAIN = {
  name: import.meta.env.VITE_PORTALDOT_CHAIN_NAME || 'Portaldot Local Node',
  rpcUrl: import.meta.env.VITE_PORTALDOT_RPC || 'ws://127.0.0.1:9944',
  ss58Format: 42,
  tokenSymbol: 'POT',
  tokenDecimals: 14,
}

export type WalletAccount = {
  address: string
  name: string
}
