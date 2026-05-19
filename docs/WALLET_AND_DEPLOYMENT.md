# Wallet and Portaldot Deployment

PortalProof targets the Portaldot local development node for this hackathon demo.

## Chain Settings

| Setting | Value |
| --- | --- |
| Local WebSocket RPC | `ws://127.0.0.1:9944` |
| Mainnet WebSocket RPC | `wss://mainnet.portaldot.io` |
| SS58 format | `42` |
| Token | `POT` |
| Decimals | `14` |
| Contract pallet | `Contracts` |
| Explorer | `https://portalscan.portaldot.io/` |

## Wallet

Demo wallet:

```text
5Gc3bLC4Cn1GUhhmRyfykRHTbS6YEKxQBR4oqXseLHcVumCi
```

The frontend uses the standard Polkadot extension interface, which is also exposed by Portaldot-compatible browser wallets.

Useful wallet links:

- Portaldot website: `https://www.portaldot.world/`
- Portaldot wallet: `https://chromewebstore.google.com/detail/portaldot-wallet/cpdecangbhmfijmlmjglfcocfpaojceo`

Never share or commit seed phrases, private keys, or secret URIs.

## Start Local Portaldot

From the repo root:

```powershell
.\scripts\start_portaldot_node_wsl.ps1
```

Manual WSL command:

```bash
tar -xzvf portaldot-testnet-ubuntu.tar.gz
cd portaldot-testnet-ubuntu
chmod 755 portaldot_dev
./portaldot_dev --dev --alice --name Vt01nft-alice --base-path /tmp/portalproof-alice
```

Verify:

```powershell
cd frontend
npm run chain:local
```

## Fund Wallet With Local POT

On the local dev node, `//Alice` starts funded. Use it to fund the demo wallet:

```powershell
cd frontend
npm run fund:local -- 5Gc3bLC4Cn1GUhhmRyfykRHTbS6YEKxQBR4oqXseLHcVumCi 100
```

This is local-only POT. It is reset when the local chain state is reset.

## Frontend Config

The frontend defaults to:

```text
VITE_PORTALDOT_CHAIN_NAME="Portaldot Local Node"
VITE_PORTALDOT_RPC="ws://127.0.0.1:9944"
```

Run:

```powershell
cd frontend
npm install
npm run dev
```

## Contract Build

Contract source:

```text
contracts/portal_proof/src/lib.rs
```

Test:

```bash
cd contracts/portal_proof
cargo test
```

Build raw Wasm:

```bash
cd contracts/portal_proof
cargo build --release --target wasm32-unknown-unknown --no-default-features
```

Build ink! bundle:

```bash
cd contracts/portal_proof
cargo +1.85.1 contract build --release
```

Generated artifacts:

```text
contracts/portal_proof/target/ink/portal_proof.contract
contracts/portal_proof/target/ink/portal_proof.json
contracts/portal_proof/target/ink/portal_proof.wasm
```

## Deployment Helper

Set local deployment environment variables:

```powershell
$env:PORTALDOT_RPC = "ws://127.0.0.1:9944"
$env:PORTALPROOF_DEPLOYER_URI = "//Alice"
```

Deploy:

```powershell
python scripts\deploy_portal_proof.py --metadata contracts\portal_proof\target\ink\portal_proof.json --wasm contracts\portal_proof\target\ink\portal_proof.wasm
```

Only use `//Alice` on local dev nodes.

## Current Deployment Result

The deployment helper reaches Portaldot `Contracts.instantiate_with_code`, but the runtime returns:

```text
System.Other: Unspecified error occurred
```

The same runtime result was reproduced with a fresh sample ink! contract, so this is likely a Portaldot local-node/runtime/toolchain compatibility issue.

Ask Portaldot for:

```text
The exact supported ink!, Rust, and cargo-contract versions for the current local node, or a known-good deployable sample artifact.
```

## Node-Runner Guide Note

The community two-node guide is supported by:

```powershell
.\scripts\start_portaldot_two_nodes_wsl.ps1
```

On this PC's WSL1 fallback, Alice and Bob start with the correct names and ports, but Bob remains at `0 peers`. If a `1 peers` screenshot is required, use WSL2, native Linux, or GitHub Codespaces.
