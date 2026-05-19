# Submission Checklist

## Required Items

- [x] Built on Portaldot.
- [x] Uses POT as gas on the local Portaldot node.
- [x] Runnable MVP.
- [x] Demo-ready frontend.
- [x] Core contract is open source.
- [x] GitHub repo prepared.
- [ ] Demo video recorded.
- [ ] Submission form completed.

## Repo Links

```text
https://github.com/Vt01nft/PortalProof
```

## Run Commands

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Contract tests:

```bash
cd contracts/portal_proof
cargo test
```

Local chain check:

```bash
cd frontend
npm run chain:local
```

## Final Demo Must Show

- Wallet connect and disconnect.
- Proof creation.
- Record verification.
- Shareable attestation copy.
- Confirm/dispute/revoke/reset record actions.
- Search and filters.
- JSON export.
- Open-source contract file.
- Local Portaldot node running.
- POT balance on the local wallet.

## Contract Messages

The UI flow maps to these contract messages:

```text
create_record
confirm_record
dispute_record
revoke_record
get_record
next_record_id
```

## Current Deployment Status

Ready:

- Local node runs.
- Wallet funding works.
- Contract tests pass.
- ink! artifacts build.
- Deployment helper reaches the runtime.

Blocked:

- The local Portaldot runtime returns `System.Other` for `Contracts.instantiate_with_code`.
- The same error appears with a fresh sample ink! contract.

Needed from Portaldot:

```text
Exact supported ink!, Rust, and cargo-contract versions, or a known-good sample artifact for the current local node.
```
