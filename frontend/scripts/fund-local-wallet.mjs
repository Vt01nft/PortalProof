import { ApiPromise, Keyring, WsProvider } from '@polkadot/api'
import { cryptoWaitReady } from '@polkadot/util-crypto'

const [, , recipient, amountInput = '100'] = process.argv

if (!recipient) {
  console.error('Usage: node scripts/fund-local-wallet.mjs <SS58_ADDRESS> [AMOUNT]')
  process.exit(1)
}

const rpcUrl = process.env.PORTALDOT_RPC || 'ws://127.0.0.1:9944'
const tokenDecimals = 14n
const amount = BigInt(amountInput) * 10n ** tokenDecimals

await cryptoWaitReady()

const api = await ApiPromise.create({ provider: new WsProvider(rpcUrl) })
const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 })
const alice = keyring.addFromUri('//Alice')
const before = await api.query.system.account(recipient)

console.log(`RPC: ${rpcUrl}`)
console.log(`Recipient: ${recipient}`)
console.log(`Before: ${before.data.free.toString()}`)

const txHash = await api.tx.balances
  .transferKeepAlive(recipient, amount)
  .signAndSend(alice)

console.log(`Submitted: ${txHash.toString()}`)

await new Promise((resolve) => setTimeout(resolve, 12_000))

const after = await api.query.system.account(recipient)
console.log(`After: ${after.data.free.toString()}`)

await api.disconnect()
