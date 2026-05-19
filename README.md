# PortalProof

PortalProof is a Portaldot hackathon MVP for proof-of-delivery records and real-world asset certificates.

Issuers create tamper-evident proof records, recipients confirm or dispute them, and third parties verify the current status from a record ID. The core registry contract is open source and intended to run on a local Portaldot development node for the hackathon demo, with POT used as gas.

## Hackathon Fit

- Built for Portaldot smart contracts.
- Uses POT as gas on the local Portaldot node.
- Runnable MVP with a React demo app.
- Demo-ready flow: issue proof, confirm/dispute/revoke, verify by ID.
- Core contract is open source in `contracts/portal_proof`.

## Repository Structure

```text
contracts/portal_proof/  ink! smart contract
docs/                    wallet and deployment notes
frontend/                React + TypeScript MVP
scripts/                 optional Portaldot helper scripts
```

## MVP Flow

1. An issuer creates a delivery or RWA certificate proof.
2. The recipient confirms receipt or disputes the proof.
3. The issuer can revoke a non-confirmed proof.
4. Anyone can verify the proof by record ID.

## Run The Frontend

```bash
cd frontend
npm install
npm run dev
```

## Test The Contract

```bash
cd contracts/portal_proof
cargo test
cargo build --release --target wasm32-unknown-unknown --no-default-features
```

## Build For Deployment

Install `cargo-contract`, then build the contract bundle:

```bash
cargo install cargo-contract
cd contracts/portal_proof
cargo contract build --release
```

The generated contract artifacts are written to `contracts/portal_proof/target/ink/`. Deployment and contract calls require a Portaldot-compatible wallet funded with POT for gas.

See `docs/WALLET_AND_DEPLOYMENT.md` for wallet setup, POT gas notes, Portaldot chain settings, and the planned deployment path.
See `docs/LOCAL_DEMO_CHECKLIST.md` for the local-node video/demo checklist.

An optional deployment helper is available at `scripts/deploy_portal_proof.py`. It expects generated ink! metadata and Wasm files plus a local `PORTALPROOF_DEPLOYER_URI` environment variable.

## Portaldot Settings

- Local RPC: `ws://127.0.0.1:9944`
- Mainnet RPC: `wss://mainnet.portaldot.io`
- SS58 format: `42`
- Token: `POT`
- Decimals: `14`

## Local Node Quick Start

Portaldot currently expects hackathon builders to run a local node and deploy there.

```powershell
wsl --update
```

This repo includes a launcher for the downloaded Portaldot local development client:

```powershell
.\scripts\start_portaldot_node_wsl.ps1
```

For the Portaldot node-runner guide flow, this repo also includes a two-node launcher that starts Alice and Bob with `Vt01nft` in the node names:

```powershell
.\scripts\start_portaldot_two_nodes_wsl.ps1
```

Or, inside Ubuntu/WSL after downloading the Portaldot local development client:

```bash
tar -xzvf portaldot-testnet-ubuntu.tar.gz
cd portaldot-testnet-ubuntu
chmod 755 portaldot_dev
./portaldot_dev --dev --alice
```

With the node running, fund the demo wallet locally:

```powershell
cd frontend
npm run chain:local
npm run fund:local -- 5Gc3bLC4Cn1GUhhmRyfykRHTbS6YEKxQBR4oqXseLHcVumCi 100
```

Start the frontend with local Portaldot settings:

```powershell
.\scripts\start_frontend_local.ps1
```

## Demo Script

1. Open the app and show the Portaldot/POT readiness panel.
2. Create a new proof for a physical delivery or RWA certificate.
3. Use the record list to confirm or dispute the proof.
4. Search the record ID in the verification panel.
5. Explain that these actions map to the open-source contract messages:
   `create_record`, `confirm_record`, `dispute_record`, `revoke_record`, and `get_record`.

## Current Local Deployment Note

The local node is reachable and the contract bundle builds with `cargo-contract 4.1.1` under Rust `1.85.1`. Low-level `Contracts.instantiate_with_code` deployment reaches the Portaldot runtime, but the current local node returns `System.Other` for PortalProof and for a fresh sample ink! flipper contract. That suggests a Portaldot local-node/runtime/toolchain compatibility issue rather than a PortalProof contract logic failure.

The community node-runner guide at https://github.com/Investorquab/portaldot-node-guide was also tested. Alice and Bob start with the expected flags and ports, but on this WSL1 setup Bob remains at `0 peers`; use WSL2/native Linux or Codespaces for the guide screenshot if the peer count is required.
