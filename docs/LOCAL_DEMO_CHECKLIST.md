# Local Demo Checklist

Use this checklist before recording or presenting PortalProof.

## 1. Start Portaldot

From the repo root:

```powershell
.\scripts\start_portaldot_node_wsl.ps1
```

Confirm the chain is live:

```powershell
cd frontend
npm run chain:local
```

Expected result:

```text
Chain: Development
Best block: #...
```

## 2. Fund The Demo Wallet

```powershell
cd frontend
npm run fund:local -- 5Gc3bLC4Cn1GUhhmRyfykRHTbS6YEKxQBR4oqXseLHcVumCi 100
```

Expected result:

```text
After: 10000000000000000
```

This is local-only POT for the local Portaldot node.

## 3. Run The App

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## 4. Demo Flow

1. Show the PortalProof dashboard.
2. Connect the wallet.
3. Show that the button changes to `Disconnect Wallet`.
4. Click `Autofill`.
5. Issue a proof.
6. Open the new record in the verification panel.
7. Copy the shareable attestation.
8. Confirm one record.
9. Dispute another record.
10. Search and filter the proof list.
11. Export records as JSON.
12. Show the open-source contract at `contracts/portal_proof/src/lib.rs`.

## 5. Contract Checks

```powershell
cd contracts/portal_proof
cargo test
cargo build --release --target wasm32-unknown-unknown --no-default-features
```

Expected test status:

```text
7 passed
```

## 6. ink! Artifact Build

On this machine, the successful local artifact build used WSL, Rust `1.85.1`, and `cargo-contract 4.1.1`:

```bash
cd /mnt/c/PortalProof/contracts/portal_proof
cargo +1.85.1 contract build --release
```

Generated artifacts:

```text
contracts/portal_proof/target/ink/portal_proof.contract
contracts/portal_proof/target/ink/portal_proof.json
contracts/portal_proof/target/ink/portal_proof.wasm
```

## 7. Deployment Note

The local node accepts chain queries and wallet transfers. Contract deployment reaches the Portaldot runtime but currently fails with:

```text
System.Other: Unspecified error occurred
```

The same runtime error appears for a fresh sample ink! contract. For the final on-chain deployment segment, ask Portaldot for the exact supported ink!/Rust/`cargo-contract` versions or a known-good sample artifact.
