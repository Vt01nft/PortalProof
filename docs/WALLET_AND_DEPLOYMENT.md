# Wallet and Portaldot Deployment

This project targets Portaldot mainnet.

## Chain Settings

| Setting | Value |
| --- | --- |
| WebSocket RPC | `wss://mainnet.portaldot.io` |
| SS58 format | `42` |
| Token | `POT` |
| Decimals | `14` |
| Contract pallet | `Contracts` |

Sources:

- Portaldot website: https://www.portaldot.world/
- Portaldot developer docs: https://portaldot-dev.readthedocs.io/en/latest/
- Chain info: https://portaldot-dev.readthedocs.io/en/latest/chain-info.html
- Contract example: https://portaldot-dev.readthedocs.io/en/latest/python-sdk/Examples.html#create-and-call-ink-contract

## Get a Compatible Wallet

1. Open https://www.portaldot.world/.
2. Use the Portaldot Wallet link from the website footer or infrastructure section.
3. Install the browser extension.
4. Create a new account.
5. Back up the seed phrase offline.
6. Copy the public address. This is safe to share; the seed phrase/private key is not.

The app also tries the standard Polkadot extension interface, so a Polkadot-compatible browser wallet may work if it exposes accounts to dapps. For the hackathon, prefer the official Portaldot Wallet if available.

## Get POT for Gas

POT is required for contract deployment and every contract transaction.

Possible routes:

- Ask the Portaldot/DoraHacks hackathon organizers for builder gas or faucet access.
- Check the official Portaldot Discord/community channels linked from https://www.portaldot.world/.
- If the network is mainnet-only during the hackathon, use the official bridge, DEX, exchange, or organizer instructions to acquire a small amount of POT.

Do not paste a seed phrase into this repo, a chat, a README, or any script. Final deployment should be signed locally from your wallet or from an environment variable on your machine only.

## Contract Build

The contract is written with stable ink! `5.1.1`, matching the Portaldot docs' Substrate `Contracts` pallet style.

```bash
cd contracts/portal_proof
cargo test
```

To generate deployable artifacts, install a compatible `cargo-contract` version and build:

```bash
cargo install cargo-contract
cd contracts/portal_proof
cargo contract build --release
```

Expected artifacts are generated under `contracts/portal_proof/target/ink/`.

## Deployment Path

Portaldot's Python SDK example deploys with `substrateinterface.contracts.ContractCode` using:

- metadata JSON
- WASM file
- `wss://mainnet.portaldot.io`
- `ss58_format=42`
- `POT` for gas

After the contract artifact is produced, deploy it with either:

- the Portaldot-compatible wallet/UI flow if available, or
- a local deployment script using the Portaldot Python SDK pattern.

For safety, keep the first public deployment tiny: deploy, create one test proof, confirm it, and record the contract address plus transaction hashes for the demo video.
