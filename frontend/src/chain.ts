export const PORTALDOT_CHAIN = {
  name: 'Portaldot Mainnet',
  rpcUrl: 'wss://mainnet.portaldot.io',
  ss58Format: 42,
  tokenSymbol: 'POT',
  tokenDecimals: 14,
}

export type WalletAccount = {
  address: string
  name: string
}
