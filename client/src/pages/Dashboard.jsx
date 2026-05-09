import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAccount, deposit, withdraw, getTransactions, getFraudAlerts } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Chatbot from '../components/Chatbot'

export default function Dashboard() {
  const { logoutUser } = useAuth()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [activeAction, setActiveAction] = useState(null)
  const [txLoading, setTxLoading] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [fraudAlerts, setFraudAlerts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchAccount()
    fetchTransactions()
    fetchFraudAlerts()
  }, [])

  const fetchAccount = async () => {
    try {
      const res = await getAccount()
      setAccount(res.data)
    } catch (err) {
      toast.error('Failed to load account')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions()
      setTransactions(res.data)
    } catch (err) {
      console.log('Could not load transactions')
    }
  }

  const fetchFraudAlerts = async () => {
    try {
      const res = await getFraudAlerts()
      setFraudAlerts(res.data)
    } catch (err) {
      console.log('Could not load fraud alerts')
    }
  }

  const handleTransaction = async (type) => {
    if (!amount || amount <= 0) return toast.error('Enter a valid amount')
    setTxLoading(true)
    try {
      if (type === 'deposit') {
        const res = await deposit({ amount: Number(amount) })
        toast.success(res.data.message)
        setAccount(prev => ({ ...prev, balance: res.data.newBalance }))
      } else {
        const res = await withdraw({ amount: Number(amount) })
        toast.success(res.data.message)
        setAccount(prev => ({ ...prev, balance: res.data.newBalance }))
      }
      setAmount('')
      setActiveAction(null)
      fetchTransactions()
      fetchFraudAlerts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed')
    } finally {
      setTxLoading(false)
    }
  }

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingOrb} />
      <div style={styles.loadingText}>NEUTRONA</div>
      <div style={styles.loadingSub}>Loading your dashboard...</div>
    </div>
  )

  return (
    <div style={styles.page}>
      {/* Ambient background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />
      <div style={styles.grid} />

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarGlow} />
        <div style={styles.logo}>
          <span style={styles.logoIcon}>◈</span> NEUTRONA
        </div>

        <div style={styles.sidebarDivider} />

{[
  { label: 'Dashboard', icon: '⊞', path: '/dashboard', active: true },
  { label: 'Bill Payment', icon: '💳', path: '/bills', active: false },
  { label: 'Expenses', icon: '💰', path: '/expense', active: false },
  { label: 'Analytics', icon: '◎', path: '/analytics', active: false },
  { label: 'Settings', icon: '⚙️', path: '/settings', active: false },
].map((item) => (
  <div key={item.label} onClick={() => navigate(item.path)} style={item.active ? styles.navItemActive : styles.navItem}>
    <span style={styles.navIcon}>{item.icon}</span>
    {item.label}
    {item.active && <div style={styles.navActiveDot} />}
  </div>
))}
        <div style={styles.sidebarBottom}>
          <div style={styles.userChip}>
            <div style={styles.userAvatarWrap}>
              <div style={styles.userAvatar}>{account?.name?.charAt(0).toUpperCase()}</div>
              <div style={styles.userAvatarRing} />
            </div>
            <div>
              <div style={styles.userName}>{account?.name}</div>
              <div style={styles.userRole}>⬡ Premium Member</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            ⊗ Sign Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main}>

        {/* Topbar */}
        <div style={styles.topbar}>
          <div>
            <div style={styles.date}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div style={styles.greeting}>
              Welcome back, <span style={styles.greetingName}>{account?.name?.split(' ')[0]}</span> 👋
            </div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.statusBadge}>
              <span style={styles.statusDot} />
              Account Active
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div style={styles.balanceCard}>
          <div style={styles.balanceCardShine} />
          <div style={styles.balanceCardOrb} />
          <div style={styles.balanceCardInner}>
            <div>
              <div style={styles.balanceLabel}>◈ TOTAL PORTFOLIO BALANCE</div>
              <div style={styles.balanceAmount}>
                <span style={styles.currency}>₹</span>
                {account?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={styles.balanceSub}>Neutrona Secure Banking</div>
              <div style={styles.accountNum}>
                {account?.accountNumber?.replace('NEU', 'NEU · ')}
              </div>
            </div>
            <div style={styles.cardRight}>
              <div style={styles.cardChip}>
                <div style={styles.chipLine} />
                <div style={styles.chipLine} />
                <div style={styles.chipLine} />
              </div>
              <div style={styles.cardNetwork}>◎ NEUTRONA</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.actionsRow}>
          {[
            { label: 'Deposit', type: 'deposit', color: '#10b981', bg: 'linear-gradient(135deg,#10b98115,#10b98105)', border: '#10b98130', icon: '↑' },
            { label: 'Withdraw', type: 'withdraw', color: '#f87171', bg: 'linear-gradient(135deg,#f8717115,#f8717105)', border: '#f8717130', icon: '↓' },
            { label: 'Transfer', type: 'transfer', color: '#60a5fa', bg: 'linear-gradient(135deg,#60a5fa15,#60a5fa05)', border: '#60a5fa30', icon: '→' },
            { label: 'Pay Bill', type: 'bill', color: '#a78bfa', bg: 'linear-gradient(135deg,#a78bfa15,#a78bfa05)', border: '#a78bfa30', icon: '⊕' },
          ].map((action) => (
            <div
              key={action.type}
              style={{
                ...styles.actionCard,
                background: activeAction === action.type ? action.bg : 'rgba(255,255,255,0.02)',
                borderColor: activeAction === action.type ? action.border : '#ffffff08',
              }}
              onClick={() => setActiveAction(activeAction === action.type ? null : action.type)}
            >
              <div style={{ ...styles.actionIconWrap, background: action.bg, border: `1px solid ${action.border}`, color: action.color }}>
                {action.icon}
              </div>
              <div style={{ ...styles.actionLabel, color: activeAction === action.type ? action.color : '#64748b' }}>
                {action.label}
              </div>
            </div>
          ))}
        </div>

        {/* Transaction Panel */}
        {(activeAction === 'deposit' || activeAction === 'withdraw') && (
          <div style={styles.txPanel}>
            <div style={styles.txPanelShine} />
            <div style={styles.txPanelTitle}>
              {activeAction === 'deposit' ? '↑ Deposit Funds' : '↓ Withdraw Funds'}
            </div>
            <div style={styles.txInputRow}>
              <span style={styles.txRupee}>₹</span>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={styles.txInput}
              />
              <button
                onClick={() => handleTransaction(activeAction)}
                disabled={txLoading}
                style={activeAction === 'deposit' ? styles.txBtnGreen : styles.txBtnRed}
              >
                {txLoading ? '...' : 'Confirm →'}
              </button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div style={styles.statsRow}>
          {[
            { icon: '◎', label: 'Account Status', value: 'Active', color: '#10b981', glow: '#10b98120' },
            { icon: '⬡', label: 'Security Level', value: 'Maximum', color: '#60a5fa', glow: '#60a5fa20' },
            { icon: '★', label: 'Member Tier', value: 'Premium', color: '#a78bfa', glow: '#a78bfa20' },
          ].map((stat, i) => (
            <div key={i} style={{ ...styles.statCard, boxShadow: `0 0 30px ${stat.glow}` }}>
              <div style={{ ...styles.statTopBar, background: stat.color }} />
              <div style={{ ...styles.statIconEl, color: stat.color }}>{stat.icon}</div>
              <div style={{ ...styles.statVal, color: stat.color }}>{stat.value}</div>
              <div style={styles.statLbl}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Bottom Grid */}
        <div style={styles.bottomGrid}>

          {/* Account Details */}
          <div style={styles.glassCard}>
            <div style={styles.glassCardShine} />
            <div style={styles.cardTitle}>◈ ACCOUNT DETAILS</div>
            <div style={styles.detailsGrid}>
              {[
                { label: 'Account Holder', value: account?.name },
                { label: 'Email Address', value: account?.email },
                { label: 'Account Number', value: account?.accountNumber },
                { label: 'Account Status', value: `● ${account?.accountStatus}`, green: true },
              ].map((d, i) => (
                <div key={i} style={styles.detailItem}>
                  <div style={styles.detailLabel}>{d.label}</div>
                  <div style={{ ...styles.detailValue, color: d.green ? '#10b981' : '#cbd5e1' }}>{d.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div style={styles.glassCard}>
            <div style={styles.glassCardShine} />
            <div style={styles.cardTitle}>↕ RECENT TRANSACTIONS</div>
            {transactions.length === 0 ? (
              <div style={styles.emptyState}>No transactions yet</div>
            ) : (
              transactions.slice(0, 5).map((tx) => (
                <div key={tx._id} style={styles.txRow}>
                  <div style={{
                    ...styles.txTypeIcon,
                    background: tx.type === 'deposit' ? '#10b98115' : '#f8717115',
                    border: `1px solid ${tx.type === 'deposit' ? '#10b98130' : '#f8717130'}`,
                    color: tx.type === 'deposit' ? '#10b981' : '#f87171',
                  }}>
                    {tx.type === 'deposit' ? '↑' : '↓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.txName}>{tx.description}</div>
                    <div style={styles.txDate}>
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ ...styles.txAmount, color: tx.type === 'deposit' ? '#10b981' : '#f87171' }}>
                      {tx.type === 'deposit' ? '+' : '−'}₹{tx.amount.toLocaleString('en-IN')}
                    </div>
                    <div style={styles.txBalance}>₹{tx.balanceAfter.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fraud Alerts */}
        {fraudAlerts.length > 0 && (
          <div style={{ ...styles.glassCard, marginTop: 16, borderColor: '#f8717125' }}>
            <div style={styles.glassCardShine} />
            <div style={{ ...styles.cardTitle, color: '#f87171' }}>🚨 FRAUD ALERTS</div>
            {fraudAlerts.map((alert) => (
              <div key={alert._id} style={styles.alertRow}>
                <div style={{
                  ...styles.alertBadge,
                  background: alert.riskLevel === 'high' ? '#f8717120' : '#fbbf2420',
                  color: alert.riskLevel === 'high' ? '#f87171' : '#fbbf24',
                  border: `1px solid ${alert.riskLevel === 'high' ? '#f8717140' : '#fbbf2440'}`
                }}>
                  {alert.riskLevel.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.alertFlags}>{alert.flags.join(' · ')}</div>
                  <div style={styles.alertDate}>
                    {new Date(alert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={styles.alertScore}>Risk: {alert.riskScore}</div>
              </div>
            ))}
          </div>
        )}

      </div>

      <Chatbot />
    </div>
  )
}

const styles = {
  // Page
  page: { display: 'flex', minHeight: '100vh', background: '#020408', position: 'relative', overflow: 'hidden' },

  // Background
  orb1: { position: 'fixed', top: '-200px', left: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, #1d4ed820, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  orb2: { position: 'fixed', bottom: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, #6d28d920, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  orb3: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, #0ea5e908, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  grid: { position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(#ffffff03 1px, transparent 1px), linear-gradient(90deg, #ffffff03 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none', zIndex: 0 },

  // Loading
  loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020408', gap: 16 },
  loadingOrb: { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 0 60px #2563eb40', animation: 'pulse 2s infinite' },
  loadingText: { fontFamily: 'sans-serif', fontSize: '28px', fontWeight: 700, letterSpacing: '6px', background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  loadingSub: { color: '#334155', fontSize: '13px', letterSpacing: '1px' },

  // Sidebar
  sidebar: { width: '230px', minHeight: '100vh', background: 'linear-gradient(180deg, #050a14 0%, #020408 100%)', borderRight: '1px solid #ffffff06', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10 },
  sidebarGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: '200px', background: 'radial-gradient(ellipse at top, #2563eb10, transparent)', pointerEvents: 'none' },
  logo: { fontFamily: 'sans-serif', fontSize: '18px', fontWeight: 700, letterSpacing: '3px', background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' },
  logoIcon: { fontSize: '20px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  sidebarDivider: { height: '1px', background: 'linear-gradient(90deg, transparent, #ffffff10, transparent)', margin: '12px 0 20px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', color: '#334155', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' },
  navItemActive: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', color: '#e2e8f0', background: 'linear-gradient(135deg, #1e3a5f20, #7c3aed10)', border: '1px solid #ffffff08', cursor: 'pointer', position: 'relative', boxShadow: '0 0 20px #2563eb10' },
  navIcon: { fontSize: '14px', width: '16px', textAlign: 'center' },
  navActiveDot: { position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '60%', background: 'linear-gradient(180deg,#60a5fa,#a78bfa)', borderRadius: '0 4px 4px 0' },
  sidebarBottom: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  userChip: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid #ffffff06' },
  userAvatarWrap: { position: 'relative', flexShrink: 0 },
  userAvatar: { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' },
  userAvatarRing: { position: 'absolute', inset: '-2px', borderRadius: '50%', border: '1px solid #60a5fa40' },
  userName: { fontSize: '12px', fontWeight: '600', color: '#cbd5e1' },
  userRole: { fontSize: '10px', color: '#334155', marginTop: '2px' },
  logoutBtn: { background: 'rgba(255,255,255,0.02)', border: '1px solid #ffffff06', borderRadius: '10px', padding: '10px', color: '#334155', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' },

  // Main
  main: { marginLeft: '230px', padding: '28px 32px', flex: 1, position: 'relative', zIndex: 1 },

  // Topbar
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  date: { fontSize: '11px', color: '#1e3a5f', marginBottom: '6px', letterSpacing: '2px', textTransform: 'uppercase' },
  greeting: { fontFamily: 'sans-serif', fontSize: '24px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.5px' },
  greetingName: { background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 12 },
  statusBadge: { display: 'flex', alignItems: 'center', gap: 6, background: '#10b98108', border: '1px solid #10b98120', color: '#10b981', fontSize: '11px', padding: '8px 16px', borderRadius: '999px', letterSpacing: '1px', boxShadow: '0 0 20px #10b98110' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' },

  // Balance Card
  balanceCard: { background: 'linear-gradient(135deg, #0a1628 0%, #0d0a1e 50%, #080d1a 100%)', border: '1px solid #ffffff08', borderRadius: '24px', padding: '32px', marginBottom: '20px', position: 'relative', overflow: 'hidden', boxShadow: '0 0 60px #2563eb08, inset 0 1px 0 #ffffff08' },
  balanceCardShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #60a5fa30, #a78bfa30, transparent)' },
  balanceCardOrb: { position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, #2563eb12, transparent 70%)', pointerEvents: 'none' },
  balanceCardInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 },
  balanceLabel: { fontSize: '10px', color: '#1e3a5f', letterSpacing: '3px', marginBottom: '10px', fontWeight: '600' },
  balanceAmount: { fontFamily: 'sans-serif', fontSize: '44px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-2px', textShadow: '0 0 40px #60a5fa20' },
  currency: { fontSize: '24px', color: '#60a5fa', verticalAlign: 'super', textShadow: '0 0 20px #60a5fa' },
  balanceSub: { fontSize: '11px', color: '#1e3a5f', marginTop: '4px', letterSpacing: '1px' },
  accountNum: { fontFamily: 'monospace', fontSize: '13px', color: '#1e3a5f', letterSpacing: '4px', marginTop: '20px' },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' },
  cardChip: { width: '44px', height: '34px', borderRadius: '6px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '6px', gap: '4px', boxShadow: '0 0 20px #fbbf2420' },
  chipLine: { height: '2px', background: '#92400e', borderRadius: 1, opacity: 0.6 },
  cardNetwork: { fontSize: '10px', color: '#1e3a5f', letterSpacing: '2px', fontWeight: '600' },

  // Actions
  actionsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' },
  actionCard: { borderRadius: '16px', padding: '20px 12px', textAlign: 'center', cursor: 'pointer', border: '1px solid #ffffff08', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' },
  actionIconWrap: { width: '44px', height: '44px', borderRadius: '12px', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700' },
  actionLabel: { fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' },

  // Transaction Panel
  txPanel: { background: 'linear-gradient(135deg, #050a14, #080d1a)', border: '1px solid #ffffff08', borderRadius: '16px', padding: '22px', marginBottom: '20px', position: 'relative', overflow: 'hidden' },
  txPanelShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #60a5fa20, transparent)' },
  txPanelTitle: { fontSize: '13px', color: '#60a5fa', marginBottom: '16px', fontWeight: '600', letterSpacing: '1px' },
  txInputRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  txRupee: { fontSize: '22px', color: '#60a5fa', fontWeight: '700', textShadow: '0 0 20px #60a5fa' },
  txInput: { flex: 1, background: '#020408', border: '1px solid #ffffff08', borderRadius: '12px', padding: '13px 16px', color: '#e2e8f0', fontSize: '16px', outline: 'none', fontFamily: 'Inter, sans-serif' },
  txBtnGreen: { background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none', borderRadius: '12px', padding: '13px 24px', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 0 20px #10b98130', letterSpacing: '0.5px' },
  txBtnRed: { background: 'linear-gradient(135deg, #dc2626, #f87171)', border: 'none', borderRadius: '12px', padding: '13px 24px', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 0 20px #f8717130', letterSpacing: '0.5px' },

  // Stats
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' },
  statCard: { background: 'linear-gradient(135deg, #050a14, #020408)', border: '1px solid #ffffff06', borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' },
  statTopBar: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px' },
  statIconEl: { fontSize: '22px', marginBottom: '12px' },
  statVal: { fontFamily: 'sans-serif', fontSize: '18px', fontWeight: '700' },
  statLbl: { fontSize: '11px', color: '#334155', marginTop: '4px', letterSpacing: '0.5px' },

  // Bottom Grid
  bottomGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },

  // Glass Card
  glassCard: { background: 'linear-gradient(135deg, #050a1490, #020408)', border: '1px solid #ffffff06', borderRadius: '18px', padding: '22px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)' },
  glassCardShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #ffffff08, transparent)' },
  cardTitle: { fontSize: '10px', color: '#1e3a5f', letterSpacing: '2px', marginBottom: '18px', fontWeight: '700' },

  // Details
  detailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  detailItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  detailLabel: { fontSize: '10px', color: '#1e3a5f', letterSpacing: '0.5px' },
  detailValue: { fontSize: '13px', fontWeight: '600' },

  // Transactions
  emptyState: { color: '#1e3a5f', fontSize: '13px', textAlign: 'center', padding: '24px' },
  txRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #ffffff04' },
  txTypeIcon: { width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 },
  txName: { fontSize: '12px', color: '#94a3b8', fontWeight: '500' },
  txDate: { fontSize: '10px', color: '#1e3a5f', marginTop: '2px' },
  txAmount: { fontSize: '13px', fontWeight: '700', textAlign: 'right' },
  txBalance: { fontSize: '10px', color: '#1e3a5f', textAlign: 'right', marginTop: '2px' },

  // Alerts
  alertRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #ffffff04' },
  alertBadge: { fontSize: '9px', fontWeight: '700', padding: '4px 10px', borderRadius: '999px', letterSpacing: '1px', flexShrink: 0 },
  alertFlags: { fontSize: '12px', color: '#94a3b8' },
  alertDate: { fontSize: '10px', color: '#1e3a5f', marginTop: '2px' },
  alertScore: { fontSize: '11px', color: '#334155', flexShrink: 0 },
}