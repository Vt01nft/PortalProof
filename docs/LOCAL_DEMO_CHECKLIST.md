# Local Demo Checklist

Use this checklist for the PortalProof hackathon video and live demo.

## 1. Start The Local Node

In PowerShell, repair WSL if needed:

```powershell
wsl --update
```

From the repo root, use the helper:

```powershell
.\scripts\start_portaldot_node_wsl.ps1
```

For the Portaldot node-runner guide screenshot flow, use:

```powershell
.\scripts\start_portaldot_two_nodes_wsl.ps1
```

This starts Alice and Bob with `Vt01nft` in the node names and writes logs to:

```text
C:\PortalProof\.local\portaldot-alice.log
C:\PortalProof\.local\portaldot-bob.log
```

On this WSL1 fallback setup, Bob still reports `0 peers`; the guide expects WSL2/native Linux/Codespaces for the `1 peers` screenshot.

Or in Ubuntu/WSL:

```bash
tar -xzvf portaldot-testnet-ubuntu.tar.gz
cd portaldot-testnet-ubuntu
chmod 755 portaldot_dev
./portaldot_dev --dev --alice
```

Keep this terminal open.

## 2. Fund The Demo Wallet

In PowerShell from the repo root:

```powershell
cd frontend
npm run chain:local
npm run fund:local -- 5Gc3bLC4Cn1GUhhmRyfykRHTbS6YEKxQBR4oqXseLHcVumCi 100
```

## 3. Run The Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open http://127.0.0.1:5173.

## 4. Demo The MVP Flow

1. Connect the Portaldot wallet.
2. Create a physical delivery proof.
3. Create an RWA certificate proof.
4. Confirm one proof.
5. Dispute another proof.
6. Verify a proof by record ID.
7. Show the open-source contract in `contracts/portal_proof/src/lib.rs`.

## 5. Contract Checks

```powershell
cd contracts/portal_proof
cargo test
cargo build --release --target wasm32-unknown-unknown --no-default-features
```

## 6. Artifact Generation Status

The contract compiles to Wasm locally. To produce the final ink! bundle with metadata, install `cargo-contract`:

```powershell
cargo install cargo-contract --version 4.1.1 --locked
cd contracts/portal_proof
cargo contract build --release
```

On this Windows machine, the final artifact build succeeded inside the `UbuntuPortalProof` WSL distro with `cargo-contract 4.1.1` and Rust `1.85.1`. The generated artifacts are:

```text
contracts/portal_proof/target/ink/portal_proof.contract
contracts/portal_proof/target/ink/portal_proof.json
contracts/portal_proof/target/ink/portal_proof.wasm
```

## 7. Deployment Status

Deployment currently reaches the local Portaldot runtime, but `Contracts.instantiate_with_code` returns `System.Other`. The same runtime error was reproduced with a fresh sample ink! flipper contract, so the next step is to confirm the exact ink!/cargo-contract version or known-good sample artifact expected by this Portaldot local node.
