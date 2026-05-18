# PortalProof

PortalProof is a Portaldot hackathon MVP for proof-of-delivery records and real-world asset certificates.

Issuers create tamper-evident proof records, recipients confirm or dispute them, and third parties verify the current status from a record ID. The core registry contract is open source and intended to run on Portaldot with POT used as gas for contract deployment and transactions.

## Hackathon Fit

- Built for Portaldot smart contracts.
- Uses POT as gas when deployed to Portaldot.
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
```

## Build For Deployment

Install `cargo-contract`, then build the contract bundle:

```bash
cargo install cargo-contract
cd contracts/portal_proof
cargo contract build --release
```

The generated contract artifact can be deployed to Portaldot. Deployment and contract calls require a Portaldot-compatible wallet funded with POT for gas.

See `docs/WALLET_AND_DEPLOYMENT.md` for wallet setup, POT gas notes, Portaldot chain settings, and the planned deployment path.

## Portaldot Settings

- RPC: `wss://mainnet.portaldot.io`
- SS58 format: `42`
- Token: `POT`
- Decimals: `14`

## Demo Script

1. Open the app and show the Portaldot/POT readiness panel.
2. Create a new proof for a physical delivery or RWA certificate.
3. Use the record list to confirm or dispute the proof.
4. Search the record ID in the verification panel.
5. Explain that these actions map to the open-source contract messages:
   `create_record`, `confirm_record`, `dispute_record`, `revoke_record`, and `get_record`.
