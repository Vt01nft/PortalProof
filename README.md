# PortalProof

![PortalProof logo](frontend/public/portalproof-logo.png)

PortalProof is a Portaldot-powered proof registry for delivery confirmations and real-world asset records.

Issuers create tamper-evident proof records, recipients confirm or dispute them, and anyone can verify the latest record status by ID. The MVP includes a polished React demo app, an open-source ink! contract, Portaldot local-node tooling, wallet/POT gas helpers, and a demo-ready workflow.

## Submission Summary

- Live app: `https://portalproof.vercel.app`
- Built for Portaldot smart contracts.
- Uses POT as gas on the Portaldot local development node.
- Provides a runnable React MVP.
- Includes open-source core contract code in `contracts/portal_proof`.
- Includes local node, wallet funding, build, deployment, and demo documentation.

## What The Demo Shows

1. Connect a Portaldot-compatible wallet.
2. Create a proof for a delivery, warranty, digital receipt, or RWA certificate.
3. Confirm, dispute, revoke, or reset proof status from the record list.
4. Verify a record by ID.
5. Search and filter records.
6. Copy a shareable attestation.
7. Export records as JSON.

## Repository Structure

```text
contracts/portal_proof/  Open-source ink! contract
docs/                    Demo, wallet, deployment, and submission notes
frontend/                React + TypeScript PortalProof app
scripts/                 Local Portaldot node and deployment helpers
```

## Quick Start

Install frontend dependencies and run the app:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Local Portaldot Node

From the repo root on Windows/WSL:

```powershell
.\scripts\start_portaldot_node_wsl.ps1
```

Verify the local chain:

```powershell
cd frontend
npm run chain:local
```

Fund the demo wallet with local POT:

```powershell
cd frontend
npm run fund:local -- 5Gc3bLC4Cn1GUhhmRyfykRHTbS6YEKxQBR4oqXseLHcVumCi 100
```

This sends local-only POT from the dev account `//Alice`. It does not move mainnet funds.

## Contract

The open-source contract is here:

```text
contracts/portal_proof/src/lib.rs
```

Run contract tests:

```bash
cd contracts/portal_proof
cargo test
```

Build raw Wasm:

```bash
cd contracts/portal_proof
cargo build --release --target wasm32-unknown-unknown --no-default-features
```

Build ink! artifacts with `cargo-contract`:

```bash
cd contracts/portal_proof
cargo +1.85.1 contract build --release
```

Generated local artifacts:

```text
contracts/portal_proof/target/ink/portal_proof.contract
contracts/portal_proof/target/ink/portal_proof.json
contracts/portal_proof/target/ink/portal_proof.wasm
```

## Portaldot Settings

| Setting | Value |
| --- | --- |
| Local WebSocket RPC | `ws://127.0.0.1:9944` |
| Mainnet WebSocket RPC | `wss://mainnet.portaldot.io` |
| Token | `POT` |
| Decimals | `14` |
| SS58 format | `42` |
| Contract pallet | `Contracts` |

## Deployment Status

The local Portaldot node is reachable, the wallet is funded with local POT, and the contract builds successfully. Deployment currently reaches `Contracts.instantiate_with_code`, but the provided local runtime returns:

```text
System.Other: Unspecified error occurred
```

The same error was reproduced with a fresh sample ink! contract, which points to a Portaldot local-node/runtime/toolchain compatibility issue rather than PortalProof business logic.

The next required Portaldot-side answer is the exact supported ink!, Rust, and `cargo-contract` version, or a known-good sample artifact for this node.

## Docs

- `docs/LOCAL_DEMO_CHECKLIST.md`: exact steps for recording the demo.
- `docs/DEMO_SCRIPT.md`: short video narration and shot list.
- `docs/WALLET_AND_DEPLOYMENT.md`: wallet, POT, local node, and deployment notes.
- `docs/SUBMISSION_CHECKLIST.md`: final hackathon submission checklist.

## GitHub

Repository:

```text
https://github.com/Vt01nft/PortalProof
```
