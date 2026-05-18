import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import { formatBalance } from '@polkadot/util'
import { PORTALDOT_CHAIN, type WalletAccount } from './chain'

let apiPromise: Promise<ApiPromise> | undefined

export function configurePortaldotUnits() {
  formatBalance.setDefaults({
    decimals: PORTALDOT_CHAIN.tokenDecimals,
    unit: PORTALDOT_CHAIN.tokenSymbol,
  })
}

export function getPortaldotApi() {
  if (!apiPromise) {
    const provider = new WsProvider(PORTALDOT_CHAIN.rpcUrl)
    apiPromise = ApiPromise.create({ provider })
  }

  return apiPromise
}

export async function connectWalletAccounts(): Promise<WalletAccount[]> {
  const extensions = await web3Enable('PortalProof')

  if (!extensions.length) {
    throw new Error(
      'No compatible wallet extension found. Install Portaldot Wallet or a Polkadot-compatible extension, then reload.',
    )
  }

  const accounts = await web3Accounts()

  return accounts.map(({ address, meta }) => ({
    address,
    name: meta.name || 'Unnamed account',
  }))
}

export async function getFormattedBalance(address: string) {
  configurePortaldotUnits()
  const api = await getPortaldotApi()
  const account = await api.query.system.account(address)
  const data = account.toHuman() as { data?: { free?: string } }

  return data.data?.free || 'Balance unavailable'
}
