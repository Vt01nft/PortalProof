# Local Demo Checklist

Use this checklist for the PortalProof hackathon video and live demo.

## 1. Start The Local Node

In PowerShell, repair WSL if needed:

```powershell
wsl --update
```

In Ubuntu/WSL:

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
pip install -r scripts/requirements.txt
python scripts/fund_local_account.py 5Gc3bLC4Cn1GUhhmRyfykRHTbS6YEKxQBR4oqXseLHcVumCi --amount 100
python scripts/check_portaldot_balance.py 5Gc3bLC4Cn1GUhhmRyfykRHTbS6YEKxQBR4oqXseLHcVumCi
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
7. Show the open-source contract in `contracts/portal_proof/lib.rs`.

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

On this Windows machine, compiling `cargo-contract` from source timed out twice. The practical fallback is to run the install inside a working Ubuntu/WSL environment after `wsl --update`, or use a prebuilt `cargo-contract` binary if Portaldot provides one.
