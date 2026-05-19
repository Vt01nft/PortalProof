import { ApiPromise, WsProvider } from '@polkadot/api'

const rpcUrl = process.env.PORTALDOT_RPC || 'ws://127.0.0.1:9944'
const api = await ApiPromise.create({ provider: new WsProvider(rpcUrl) })
const chain = await api.rpc.system.chain()
const header = await api.rpc.chain.getHeader()

console.log(`RPC: ${rpcUrl}`)
console.log(`Chain: ${chain.toString()}`)
console.log(`Best block: #${header.number.toString()}`)

await api.disconnect()
