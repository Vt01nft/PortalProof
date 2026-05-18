import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  BadgeCheck,
  Ban,
  ClipboardCheck,
  FileSearch,
  Plus,
  RefreshCcw,
  ShieldCheck,
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

        <div className="network-panel" aria-label="Project readiness">
          <div>
            <span>Target chain</span>
            <strong>{PORTALDOT_CHAIN.name}</strong>
          </div>
          <div>
            <span>Gas</span>
            <strong>{PORTALDOT_CHAIN.tokenSymbol}</strong>
          </div>
          <div>
            <span>MVP records</span>
            <strong>{records.length}</strong>
          </div>
          <div>
            <span>Confirmed</span>
            <strong>{confirmedCount}</strong>
          </div>
        </div>
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
          <div className="section-title">
            <Plus size={20} aria-hidden="true" />
            <h2>Create Proof</h2>
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
        <div className="section-title">
          <BadgeCheck size={20} aria-hidden="true" />
          <h2>Proof Records</h2>
        </div>

        <div className="record-list">
          {records.map((record) => (
            <article className="record-card" key={record.id}>
              <div className="record-main">
                <span className={statusTone[record.status]}>
                  {record.status}
                </span>
                <h3>{record.title}</h3>
                <p>
                  #{record.id} · {record.recordType} · {record.reference}
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
        </div>
      </section>
    </main>
  )
}

export default App
