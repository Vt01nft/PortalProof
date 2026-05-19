# PortalProof Demo Script

Target length: 2 to 4 minutes.

## Opening

PortalProof is a proof registry built for Portaldot. It helps issuers create delivery, warranty, digital receipt, and real-world asset proof records. Recipients can confirm or dispute those records, and anyone can verify the latest status from a record ID.

## Shot List

### 1. Repository

Show the GitHub repo:

```text
https://github.com/Vt01nft/PortalProof
```

Mention:

- React MVP in `frontend`.
- Open-source ink! contract in `contracts/portal_proof/src/lib.rs`.
- Local Portaldot scripts in `scripts`.
- Demo and deployment docs in `docs`.

### 2. Local Portaldot Node

Show the local chain check:

```powershell
cd frontend
npm run chain:local
```

Mention:

- Local RPC is `ws://127.0.0.1:9944`.
- POT is used as gas.
- The demo wallet is funded with local POT.

### 3. App Dashboard

Open:

```text
http://127.0.0.1:5173
```

Show:

- Dashboard metrics.
- Wallet section.
- Create proof panel.
- Verification panel.
- Proof records list.

### 4. Wallet

Click `Connect Wallet`.

Show:

- Wallet name.
- Wallet address.
- POT balance.
- Button changes to `Disconnect Wallet`.

### 5. Create A Proof

Click `Autofill`, then `Issue Proof`.

Mention:

- A new proof record is created.
- In production, this maps to the contract `create_record` message.

### 6. Verify A Proof

Show the verification panel for the new record.

Mention:

- Status.
- Issuer.
- Recipient.
- Metadata hash or URI.
- Reference ID.
- Timeline.
- Shareable attestation.

Click `Copy`.

### 7. Record Actions

Use the record action buttons:

- Verify.
- Confirm.
- Dispute.
- Revoke.
- Reset to pending.

Mention:

- These map to the contract messages `confirm_record`, `dispute_record`, `revoke_record`, and `get_record`.

### 8. Search, Filter, Export

Show:

- Search by title, wallet, reference, or metadata.
- Filter by status.
- Filter by record type.
- Export JSON.

### 9. Contract

Show:

```text
contracts/portal_proof/src/lib.rs
```

Mention:

- Core contract is open source.
- Tests pass locally.
- ink! artifacts build locally.

### 10. Deployment Status

Say:

The local node is running, the wallet has local POT, and the contract builds. Deployment reaches Portaldot `Contracts.instantiate_with_code`, but the provided local runtime returns `System.Other`, including for a fresh sample ink! contract. The next required Portaldot-side input is the exact supported ink!, Rust, and `cargo-contract` version or a known-good sample artifact.

## Closing

PortalProof delivers a runnable MVP, open-source contracts, local Portaldot integration, POT gas preparation, and a demo-ready workflow for verifiable delivery and asset records.
