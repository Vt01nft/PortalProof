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

The Portaldot docs recommend WSL for Windows users. On this PC, WSL is present but currently reports that the WSL 2 kernel is missing, so run this once in PowerShell:

```powershell
wsl --update
```

Then install or open an Ubuntu WSL distro and follow Portaldot's local development node instructions:

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
pip install -r scripts/requirements.txt
python scripts/fund_local_account.py 5Gc3bLC4Cn1GUhhmRyfykRHTbS6YEKxQBR4oqXseLHcVumCi --amount 100
python scripts/check_portaldot_balance.py 5Gc3bLC4Cn1GUhhmRyfykRHTbS6YEKxQBR4oqXseLHcVumCi
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

The contract is written with stable ink! `5.1.1`, matching the Portaldot docs' Substrate `Contracts` pallet style.

```bash
cd contracts/portal_proof
cargo test
cargo build --release --target wasm32-unknown-unknown --no-default-features
```

To generate deployable artifacts, install a compatible `cargo-contract` version and build:

```bash
cargo install cargo-contract
cd contracts/portal_proof
cargo contract build --release
```

Expected artifacts are generated under `contracts/portal_proof/target/ink/`. If `cargo-contract` is not available yet, the raw Wasm compile check still verifies that the contract is Wasm-ready.

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

## Mainnet Gas Later

POT is required for mainnet contract deployment and every mainnet contract transaction. If mainnet deployment becomes part of final submission, use official Portaldot bridge, DEX, exchange, or organizer instructions to acquire POT and sign locally from your wallet.
