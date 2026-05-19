import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Activity,
  BadgeCheck,
  Ban,
  ClipboardCheck,
  Copy,
  Download,
  Filter,
  FileSearch,
  HeartPulse,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import './App.css'
import {
  PORTALDOT_CHAIN,
  type WalletAccount,
} from './chain'

type ProofStatus = 'Pending' | 'Confirmed' | 'Disputed' | 'Revoked'

type ProofRecord = {
  id: number
  title: string
  recordType: string
  issuer: string
  recipient: string
  metadataUri: string
  reference: string
  status: ProofStatus
  createdAt: string
  updatedAt: string
}

type FormState = {
  title: string
  recordType: string
  issuer: string
  recipient: string
  metadataUri: string
  reference: string
}

const seedRecords: ProofRecord[] = [
  {
    id: 1001,
    title: 'Solar inverter delivery certificate',
    recordType: 'Physical delivery',
    issuer: '5F4c...Issuer',
    recipient: '5G9r...Receiver',
    metadataUri: 'ipfs://bafybeia-solar-inverter-lagos',
    reference: 'INV-SOL-2407',
    status: 'Confirmed',
    createdAt: '2026-05-16 10:24',
    updatedAt: '2026-05-16 13:52',
  },
  {
    id: 1002,
    title: 'Warehouse ownership certificate',
    recordType: 'RWA certificate',
    issuer: '5D2x...Issuer',
    recipient: '5H8m...Holder',
    metadataUri: 'ipfs://bafybeia-warehouse-title',
    reference: 'RWA-WH-8891',
    status: 'Pending',
    createdAt: '2026-05-17 09:10',
    updatedAt: '2026-05-17 09:10',
  },
  {
    id: 1003,
    title: 'MRI machine warranty transfer',
    recordType: 'Warranty certificate',
    issuer: '5B7v...MedSupply',
    recipient: '5J2p...Clinic',
    metadataUri: 'ipfs://bafybeia-mri-warranty',
    reference: 'MED-WAR-4412',
    status: 'Disputed',
    createdAt: '2026-05-17 14:35',
    updatedAt: '2026-05-18 08:18',
  },
  {
    id: 1004,
    title: 'Cold-chain vaccine delivery',
    recordType: 'Physical delivery',
    issuer: '5E6q...Logistics',
    recipient: '5K4t...Hospital',
    metadataUri: 'ipfs://bafybeia-vaccine-cold-chain',
    reference: 'VAC-LAG-0526',
    status: 'Pending',
    createdAt: '2026-05-18 11:42',
    updatedAt: '2026-05-18 11:42',
  },
]

const initialForm: FormState = {
  title: '',
  recordType: 'Physical delivery',
  issuer: '5F4c...Issuer',
  recipient: '',
  metadataUri: '',
  reference: '',
}

const statusTone: Record<ProofStatus, string> = {
  Pending: 'status pending',
  Confirmed: 'status confirmed',
  Disputed: 'status disputed',
  Revoked: 'status revoked',
}

const statuses: Array<'All' | ProofStatus> = [
  'All',
  'Pending',
  'Confirmed',
  'Disputed',
  'Revoked',
]

const recordTypes = [
  'All',
  'Physical delivery',
  'RWA certificate',
  'Warranty certificate',
  'Digital goods receipt',
]

const demoProof: FormState = {
  title: 'Emergency oxygen concentrator delivery',
  recordType: 'Physical delivery',
  issuer: '5MED...Issuer',
  recipient: '5CARE...Recipient',
  metadataUri: 'ipfs://bafybeia-oxygen-concentrator-delivery',
  reference: 'MED-OXY-0526',
}

function nowStamp() {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(new Date())
    .replace(',', '')
}

function App() {
  const [records, setRecords] = useState<ProofRecord[]>(seedRecords)
  const [form, setForm] = useState<FormState>(initialForm)
  const [query, setQuery] = useState('1001')
  const [recordSearch, setRecordSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | ProofStatus>('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [copyStatus, setCopyStatus] = useState('')
  const [walletAccount, setWalletAccount] = useState<WalletAccount>()
  const [walletBalance, setWalletBalance] = useState('')
  const [walletStatus, setWalletStatus] = useState(
    'Connect a wallet when you are ready to deploy or call Portaldot.',
  )

  const selectedRecord = useMemo(() => {
    const id = Number(query.trim())
    if (!Number.isFinite(id)) {
      return undefined
    }
    return records.find((record) => record.id === id)
  }, [query, records])

  const confirmedCount = records.filter(
    (record) => record.status === 'Confirmed',
  ).length
  const pendingCount = records.filter((record) => record.status === 'Pending').length
  const activeCount = records.filter((record) => record.status !== 'Revoked').length
  const disputeCount = records.filter(
    (record) => record.status === 'Disputed',
  ).length

  const filteredRecords = useMemo(() => {
    const normalizedSearch = recordSearch.trim().toLowerCase()

    return records.filter((record) => {
      const matchesStatus =
        statusFilter === 'All' || record.status === statusFilter
      const matchesType = typeFilter === 'All' || record.recordType === typeFilter
      const searchableText = [
        record.id,
        record.title,
        record.recordType,
        record.reference,
        record.issuer,
        record.recipient,
        record.metadataUri,
      ]
        .join(' ')
        .toLowerCase()

      return (
        matchesStatus &&
        matchesType &&
        (!normalizedSearch || searchableText.includes(normalizedSearch))
      )
    })
  }, [recordSearch, records, statusFilter, typeFilter])

  const selectedAttestation = selectedRecord
    ? `PortalProof #${selectedRecord.id}: ${selectedRecord.status} / ${selectedRecord.reference} / ${selectedRecord.metadataUri}`
    : ''

  function submitProof(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextId = Math.max(...records.map((record) => record.id), 1000) + 1
    const timestamp = nowStamp()
    const nextRecord: ProofRecord = {
      id: nextId,
      title: form.title.trim(),
      recordType: form.recordType,
      issuer: form.issuer.trim(),
      recipient: form.recipient.trim(),
      metadataUri: form.metadataUri.trim(),
      reference: form.reference.trim() || `PP-${nextId}`,
      status: 'Pending',
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    setRecords((current) => [nextRecord, ...current])
    setQuery(String(nextId))
    setForm(initialForm)
  }

  function updateStatus(id: number, status: ProofStatus) {
    setRecords((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              status,
              updatedAt: nowStamp(),
            }
          : record,
      ),
    )
  }

  async function copyAttestation() {
    if (!selectedAttestation) {
      return
    }

    try {
      await navigator.clipboard.writeText(selectedAttestation)
      setCopyStatus('Attestation copied.')
    } catch {
      setCopyStatus('Copy unavailable in this browser.')
    }
  }

  function exportRecords() {
    const payload = JSON.stringify(
      {
        exportedAt: nowStamp(),
        chain: PORTALDOT_CHAIN,
        records,
      },
      null,
      2,
    )
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'portalproof-records.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function connectWallet() {
    setWalletStatus('Requesting wallet access...')

    try {
      const { connectWalletAccounts, getFormattedBalance } = await import(
        './portaldot'
      )
      const accounts = await connectWalletAccounts()
      const [firstAccount] = accounts

      if (!firstAccount) {
        setWalletStatus('Wallet found, but no accounts are available.')
        return
      }

      setWalletAccount(firstAccount)
      setWalletStatus('Wallet connected.')
      setForm((current) => ({
        ...current,
        issuer: firstAccount.address,
      }))

      const balance = await getFormattedBalance(firstAccount.address)
      setWalletBalance(balance)
    } catch (error) {
      setWalletStatus(
        error instanceof Error ? error.message : 'Unable to connect wallet.',
      )
    }
  }

  const canSubmit =
    form.title.trim() &&
    form.issuer.trim() &&
    form.recipient.trim() &&
    form.metadataUri.trim()

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <ShieldCheck size={22} />
          </div>
          <div>
            <strong>PortalProof</strong>
            <span>verified care-grade records</span>
          </div>
        </div>
        <div className="chain-pill">
          <Activity size={16} aria-hidden="true" />
          {PORTALDOT_CHAIN.name}
        </div>
      </header>

      <section className="hero-band">
        <div className="hero-copy">
          <span className="eyebrow">Portaldot proof registry</span>
          <h1>PortalProof</h1>
          <p>
            Issue tamper-evident delivery receipts and real-world asset
            certificates, then let recipients confirm, dispute, or verify them
            on-chain.
          </p>
        </div>

        <div className="hero-visual" aria-label="Project readiness">
          <div className="synova-cross" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="network-panel">
            <div>
              <span>Target chain</span>
              <strong>{PORTALDOT_CHAIN.name}</strong>
            </div>
            <div>
              <span>Gas</span>
              <strong>{PORTALDOT_CHAIN.tokenSymbol}</strong>
            </div>
            <div>
              <span>Total records</span>
              <strong>{records.length}</strong>
            </div>
            <div>
              <span>Active</span>
              <strong>{activeCount}</strong>
            </div>
          </div>
          <div className="signal-card">
            <span>Integrity layer</span>
            <strong>Human-centered verification for delivery and asset records.</strong>
          </div>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Proof registry metrics">
        <article>
          <span>Confirmed</span>
          <strong>{confirmedCount}</strong>
          <p>Recipient-approved records ready for third-party verification.</p>
        </article>
        <article>
          <span>Pending</span>
          <strong>{pendingCount}</strong>
          <p>Proofs awaiting recipient action or final settlement.</p>
        </article>
        <article>
          <span>Disputes</span>
          <strong>{disputeCount}</strong>
          <p>Records flagged for review before they become final.</p>
        </article>
        <article>
          <span>Categories</span>
          <strong>{recordTypes.length - 1}</strong>
          <p>Record types available for delivery and asset verification.</p>
        </article>
      </section>

      <section className="wallet-strip">
        <div>
          <span>RPC</span>
          <strong>{PORTALDOT_CHAIN.rpcUrl}</strong>
        </div>
        <div>
          <span>Wallet</span>
          <strong>{walletAccount ? walletAccount.name : 'Not connected'}</strong>
          {walletAccount ? <p>{walletAccount.address}</p> : <p>{walletStatus}</p>}
          {walletBalance ? <p>{walletBalance}</p> : null}
        </div>
        <button type="button" onClick={connectWallet}>
          <Wallet size={18} aria-hidden="true" />
          Connect Wallet
        </button>
      </section>

      <section className="workspace-grid">
        <form className="proof-form" onSubmit={submitProof}>
          <div className="panel-heading">
            <div className="section-title">
              <Plus size={20} aria-hidden="true" />
              <h2>Create Proof</h2>
            </div>
            <button className="ghost-action" type="button" onClick={() => setForm(demoProof)}>
              <Sparkles size={16} aria-hidden="true" />
              Autofill
            </button>
          </div>

          <label>
            Title
            <input
              required
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              placeholder="Solar equipment delivery"
            />
          </label>

          <label>
            Type
            <select
              value={form.recordType}
              onChange={(event) =>
                setForm({ ...form, recordType: event.target.value })
              }
            >
              <option>Physical delivery</option>
              <option>RWA certificate</option>
              <option>Warranty certificate</option>
              <option>Digital goods receipt</option>
            </select>
          </label>

          <label>
            Issuer wallet
            <input
              required
              value={form.issuer}
              onChange={(event) =>
                setForm({ ...form, issuer: event.target.value })
              }
              placeholder="5..."
            />
          </label>

          <label>
            Recipient wallet
            <input
              required
              value={form.recipient}
              onChange={(event) =>
                setForm({ ...form, recipient: event.target.value })
              }
              placeholder="5..."
            />
          </label>

          <label>
            Metadata URI or hash
            <input
              required
              value={form.metadataUri}
              onChange={(event) =>
                setForm({ ...form, metadataUri: event.target.value })
              }
              placeholder="ipfs://... or sha256:..."
            />
          </label>

          <label>
            Reference
            <input
              value={form.reference}
              onChange={(event) =>
                setForm({ ...form, reference: event.target.value })
              }
              placeholder="Invoice, bill of lading, title number"
            />
          </label>

          <button className="primary-action" type="submit" disabled={!canSubmit}>
            <ClipboardCheck size={18} aria-hidden="true" />
            Issue Proof
          </button>
        </form>

        <section className="verify-panel">
          <div className="section-title">
            <FileSearch size={20} aria-hidden="true" />
            <h2>Verify Record</h2>
          </div>

          <label>
            Record ID
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="1001"
            />
          </label>

          {selectedRecord ? (
            <article className="verification-result">
              <div className="result-heading">
                <ShieldCheck size={22} aria-hidden="true" />
                <div>
                  <span className={statusTone[selectedRecord.status]}>
                    {selectedRecord.status}
                  </span>
                  <h3>{selectedRecord.title}</h3>
                </div>
              </div>
              <dl>
                <div>
                  <dt>Record</dt>
                  <dd>#{selectedRecord.id}</dd>
                </div>
                <div>
                  <dt>Issuer</dt>
                  <dd>{selectedRecord.issuer}</dd>
                </div>
                <div>
                  <dt>Recipient</dt>
                  <dd>{selectedRecord.recipient}</dd>
                </div>
                <div>
                  <dt>Metadata</dt>
                  <dd>{selectedRecord.metadataUri}</dd>
                </div>
                <div>
                  <dt>Reference</dt>
                  <dd>{selectedRecord.reference}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{selectedRecord.updatedAt}</dd>
                </div>
              </dl>
              <div className="attestation-box">
                <span>Shareable attestation</span>
                <p>{selectedAttestation}</p>
                <button type="button" onClick={copyAttestation}>
                  <Copy size={16} aria-hidden="true" />
                  Copy
                </button>
              </div>
              {copyStatus ? <p className="copy-status">{copyStatus}</p> : null}
              <ol className="timeline" aria-label="Record timeline">
                <li>
                  <span />
                  <div>
                    <strong>Issued</strong>
                    <p>{selectedRecord.createdAt}</p>
                  </div>
                </li>
                <li>
                  <span />
                  <div>
                    <strong>Latest status</strong>
                    <p>{selectedRecord.status} at {selectedRecord.updatedAt}</p>
                  </div>
                </li>
                <li>
                  <span />
                  <div>
                    <strong>Verification surface</strong>
                    <p>{PORTALDOT_CHAIN.tokenSymbol} gas / {PORTALDOT_CHAIN.name}</p>
                  </div>
                </li>
              </ol>
            </article>
          ) : (
            <div className="empty-state">
              <TriangleAlert size={20} aria-hidden="true" />
              No matching proof record found.
            </div>
          )}
        </section>
      </section>

      <section className="records-section">
        <div className="records-header">
          <div className="section-title">
            <BadgeCheck size={20} aria-hidden="true" />
            <h2>Proof Records</h2>
          </div>
          <button className="ghost-action" type="button" onClick={exportRecords}>
            <Download size={16} aria-hidden="true" />
            Export JSON
          </button>
        </div>

        <div className="records-toolbar">
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <input
              value={recordSearch}
              onChange={(event) => setRecordSearch(event.target.value)}
              placeholder="Search proofs, wallets, references..."
            />
          </label>
          <label className="compact-field">
            <Filter size={16} aria-hidden="true" />
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as 'All' | ProofStatus)
              }
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="compact-field">
            <HeartPulse size={16} aria-hidden="true" />
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              {recordTypes.map((recordType) => (
                <option key={recordType}>{recordType}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="record-list">
          {filteredRecords.map((record) => (
            <article className="record-card" key={record.id}>
              <div className="record-main">
                <span className={statusTone[record.status]}>
                  {record.status}
                </span>
                <h3>{record.title}</h3>
                <p>
                  #{record.id} / {record.recordType} / {record.reference}
                </p>
              </div>

              <div className="record-actions" aria-label={`Actions for ${record.title}`}>
                <button
                  type="button"
                  title="Verify"
                  onClick={() => setQuery(String(record.id))}
                >
                  <FileSearch size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  title="Confirm"
                  onClick={() => updateStatus(record.id, 'Confirmed')}
                >
                  <BadgeCheck size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  title="Dispute"
                  onClick={() => updateStatus(record.id, 'Disputed')}
                >
                  <TriangleAlert size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  title="Revoke"
                  onClick={() => updateStatus(record.id, 'Revoked')}
                >
                  <Ban size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  title="Reset to pending"
                  onClick={() => updateStatus(record.id, 'Pending')}
                >
                  <RefreshCcw size={17} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
          {!filteredRecords.length ? (
            <div className="empty-state">
              <TriangleAlert size={20} aria-hidden="true" />
              No proof records match the current filters.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default App
