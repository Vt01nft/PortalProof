# Wallet and Portaldot Deployment

This project targets a local Portaldot development node for the hackathon demo. Portaldot mainnet settings are kept for later production deployment, but current organizer guidance is to run a local node on your PC and deploy there.

## Chain Settings

| Setting | Value |
| --- | --- |
| Local WebSocket RPC | `ws://127.0.0.1:9944` |
| Mainnet WebSocket RPC | `wss://mainnet.portaldot.io` |
| SS58 format | `42` |
| Token | `POT` |
| Decimals | `14` |
| Contract pallet | `Contracts` |
| Explorer | https://portalscan.portaldot.io/ |

Sources:

- Portaldot website: https://www.portaldot.world/
- Portaldot developer docs: https://portaldot-dev.readthedocs.io/en/latest/
- Local node docs: https://portaldot-dev.readthedocs.io/en/latest/getting-started/local_test.html
- Chain info: https://portaldot-dev.readthedocs.io/en/latest/chain-info.html
- Contract example: https://portaldot-dev.readthedocs.io/en/latest/python-sdk/Examples.html#create-and-call-ink-contract

## Get a Compatible Wallet

1. Open https://www.portaldot.world/.
2. Install Portaldot Wallet: https://chromewebstore.google.com/detail/portaldot-wallet/cpdecangbhmfijmlmjglfcocfpaojceo
3. Create a new account.
4. Back up the seed phrase offline.
5. Copy the public address. This is safe to share; the seed phrase/private key is not.

The app also tries the standard Polkadot extension interface, so a Polkadot-compatible browser wallet may work if it exposes accounts to dapps. For the hackathon, prefer the official Portaldot Wallet if available.

## Run A Local Portaldot Node

The Portaldot docs recommend WSL for Windows users. This repo has been tested with a local WSL distro named `UbuntuPortalProof` and a helper script:

```powershell
.\scripts\start_portaldot_node_wsl.ps1
```

The community two-node guide is also supported by:

```powershell
.\scripts\start_portaldot_two_nodes_wsl.ps1
```

That launcher matches the Alice/Bob names, base paths, ports, bootnode flag, and log files from the guide. On this PC's WSL1 fallback, the nodes start but remain at `0 peers`; WSL2, native Linux, or Codespaces is recommended if Portaldot requires the `1 peers` node-runner screenshot.

You can also install or open an Ubuntu WSL distro manually and follow Portaldot's local development node instructions:

```bash
tar -xzvf portaldot-testnet-ubuntu.tar.gz
cd portaldot-testnet-ubuntu
chmod 755 portaldot_dev
./portaldot_dev --dev --alice
```

Keep that terminal running while deploying and demoing PortalProof. The expected local RPC endpoint is:

```text
ws://127.0.0.1:9944
```

## Fund Your Local Wallet

Your wallet address:

```text
5Gc3bLC4Cn1GUhhmRyfykRHTbS6YEKxQBR4oqXseLHcVumCi
```

On a local dev node, `//Alice` starts funded. Use it to send local-only POT to your wallet:

```powershell
cd frontend
npm run chain:local
npm run fund:local -- 5Gc3bLC4Cn1GUhhmRyfykRHTbS6YEKxQBR4oqXseLHcVumCi 100
```

This funds the address only on your local chain. It does not spend or move your real POT.

## Frontend Local Config

The frontend defaults to local Portaldot:

```text
VITE_PORTALDOT_CHAIN_NAME="Portaldot Local Node"
VITE_PORTALDOT_RPC="ws://127.0.0.1:9944"
```

Copy `frontend/.env.example` to `frontend/.env.local` only if you need to override those values.

## Contract Build

The contract is written with stable ink! `5.1.1`.

```bash
cd contracts/portal_proof
cargo test
cargo build --release --target wasm32-unknown-unknown --no-default-features
```

To generate deployable artifacts, install a compatible `cargo-contract` version and build. On this machine the successful combination was `cargo-contract 4.1.1` with Rust `1.85.1` inside WSL:

```bash
cargo install cargo-contract --version 4.1.1 --locked
rustup toolchain install 1.85.1 --component rust-src,clippy,rustfmt
cd contracts/portal_proof
cargo +1.85.1 contract build --release
```

Expected artifacts are generated under `contracts/portal_proof/target/ink/`.

## Local Deployment Path

Portaldot's Python SDK example deploys with `substrateinterface.contracts.ContractCode` using:

- metadata JSON
- WASM file
- `ss58_format=42`
- POT for gas

For the local hackathon demo:

```powershell
$env:PORTALDOT_RPC = "ws://127.0.0.1:9944"
$env:PORTALPROOF_DEPLOYER_URI = "//Alice"
python scripts/deploy_portal_proof.py --metadata <path-to-json> --wasm <path-to-wasm>
```

Only use `//Alice` on the local dev node. For mainnet, use your own local secret URI and never commit it, paste it into chat, or put it in a `.env` file that might be uploaded.

Current status: the helper script reaches the local Portaldot runtime, but `Contracts.instantiate_with_code` returns `System.Other`. The same error was reproduced with a fresh sample ink! flipper contract, so this appears to be a local Portaldot node/runtime/toolchain compatibility issue. Ask the Portaldot team for the exact supported ink!/cargo-contract version or a known-good contract artifact for this local node before recording the final on-chain deployment segment.

## Mainnet Gas Later

POT is required for mainnet contract deployment and every mainnet contract transaction. If mainnet deployment becomes part of final submission, use official Portaldot bridge, DEX, exchange, or organizer instructions to acquire POT and sign locally from your wallet.
