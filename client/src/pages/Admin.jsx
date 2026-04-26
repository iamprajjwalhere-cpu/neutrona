import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAdminStats, getAdminUsers, getAdminTransactions, getAdminFraudAlerts } from '../utils/api'

export default function Admin() {
  const { logoutUser } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [fraudAlerts, setFraudAlerts] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [s, u, t, f] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminTransactions(),
        getAdminFraudAlerts(),
      ])
      setStats(s.data)
      setUsers(u.data)
      setTransactions(t.data)
      setFraudAlerts(f.data)
    } catch (err) {
      console.log('Admin load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => { logoutUser(); navigate('/login') }

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingText}>NEUTRONA</div>
      <div style={styles.loadingSub}>Loading admin panel...</div>
    </div>
  )

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.grid} />

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarGlow} />
        <div style={styles.logo}>◈ NEUTRONA</div>
        <div style={styles.adminBadge}>⚡ Admin Panel</div>
        <div style={styles.sidebarDivider} />
        <nav style={styles.nav}>
          {[
            { label: 'Overview', icon: '⊞', tab: 'overview' },
            { label: 'Users', icon: '◎', tab: 'users' },
            { label: 'Transactions', icon: '↕', tab: 'transactions' },
            { label: 'Fraud Alerts', icon: '🚨', tab: 'fraud' },
          ].map((item) => (
            <div key={item.tab} onClick={() => setActiveTab(item.tab)} style={activeTab === item.tab ? styles.navItemActive : styles.navItem}>
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
              {activeTab === item.tab && <div style={styles.navActiveDot} />}
            </div>
          ))}
        </nav>
        <div style={styles.sidebarBottom}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back to App</button>
          <button onClick={handleLogout} style={styles.logoutBtn}>⊗ Sign Out</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.date}>ADMIN CONTROL CENTER</div>
            <div style={styles.greeting}>
              System <span style={styles.greetingName}>Overview</span> ⚡
            </div>
          </div>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot} />
            System Online
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <div style={styles.statsGrid}>
              {[
                { label: 'Total Users', value: stats?.totalUsers || 0, color: '#60a5fa', icon: '◎', glow: '#60a5fa20' },
                { label: 'Total Transactions', value: stats?.totalTransactions || 0, color: '#a78bfa', icon: '↕', glow: '#a78bfa20' },
                { label: 'Fraud Alerts', value: stats?.totalFraudAlerts || 0, color: '#f87171', icon: '🚨', glow: '#f8717120' },
                { label: 'Total Deposits', value: `₹${(stats?.totalDeposits || 0).toLocaleString('en-IN')}`, color: '#10b981', icon: '↑', glow: '#10b98120' },
                { label: 'Total Withdrawals', value: `₹${(stats?.totalWithdrawals || 0).toLocaleString('en-IN')}`, color: '#f87171', icon: '↓', glow: '#f8717120' },
                { label: 'Net Flow', value: `₹${((stats?.totalDeposits || 0) - (stats?.totalWithdrawals || 0)).toLocaleString('en-IN')}`, color: '#fbbf24', icon: '◈', glow: '#fbbf2420' },
              ].map((s, i) => (
                <div key={i} style={{ ...styles.statCard, boxShadow: `0 0 30px ${s.glow}` }}>
                  <div style={{ ...styles.statTopBar, background: s.color }} />
                  <div style={{ ...styles.statIcon, color: s.color }}>{s.icon}</div>
                  <div style={{ ...styles.statVal, color: s.color }}>{s.value}</div>
                  <div style={styles.statLbl}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div style={styles.glassCard}>
              <div style={styles.glassCardShine} />
              <div style={styles.cardTitle}>↕ RECENT SYSTEM ACTIVITY</div>
              {transactions.slice(0, 8).map((tx) => (
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
                    <div style={styles.txName}>{tx.userId?.name || 'Unknown'}</div>
                    <div style={styles.txDate}>{tx.userId?.email || ''}</div>
                  </div>
                  <div>
                    <div style={{ ...styles.txAmount, color: tx.type === 'deposit' ? '#10b981' : '#f87171' }}>
                      {tx.type === 'deposit' ? '+' : '−'}₹{tx.amount.toLocaleString('en-IN')}
                    </div>
                    <div style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div style={styles.glassCard}>
            <div style={styles.glassCardShine} />
            <div style={styles.cardTitle}>◎ ALL USERS ({users.length})</div>
            <div style={styles.tableHeader}>
              <span>Name</span>
              <span>Email</span>
              <span>Account No.</span>
              <span>Balance</span>
              <span>Status</span>
            </div>
            {users.map((u) => (
              <div key={u._id} style={styles.tableRow}>
                <div style={styles.userCell}>
                  <div style={styles.miniAvatar}>{u.name?.charAt(0).toUpperCase()}</div>
                  <span style={{ color: '#cbd5e1', fontSize: 13 }}>{u.name}</span>
                </div>
                <span style={{ color: '#475569', fontSize: 12 }}>{u.email}</span>
                <span style={{ color: '#334155', fontSize: 11, fontFamily: 'monospace' }}>{u.accountNumber}</span>
                <span style={{ color: '#60a5fa', fontSize: 13, fontWeight: 600 }}>₹{u.balance?.toLocaleString('en-IN')}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: u.accountStatus === 'active' ? '#10b981' : '#f87171',
                  background: u.accountStatus === 'active' ? '#10b98110' : '#f8717110',
                  padding: '3px 10px', borderRadius: 999,
                  border: `1px solid ${u.accountStatus === 'active' ? '#10b98130' : '#f8717130'}`
                }}>
                  {u.accountStatus?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div style={styles.glassCard}>
            <div style={styles.glassCardShine} />
            <div style={styles.cardTitle}>↕ ALL TRANSACTIONS ({transactions.length})</div>
            <div style={styles.tableHeader}>
              <span>User</span>
              <span>Type</span>
              <span>Amount</span>
              <span>Balance After</span>
              <span>Date</span>
            </div>
            {transactions.map((tx) => (
              <div key={tx._id} style={styles.tableRow}>
                <div style={styles.userCell}>
                  <div style={styles.miniAvatar}>{tx.userId?.name?.charAt(0).toUpperCase()}</div>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>{tx.userId?.name}</span>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: tx.type === 'deposit' ? '#10b981' : '#f87171',
                  background: tx.type === 'deposit' ? '#10b98110' : '#f8717110',
                  padding: '3px 10px', borderRadius: 999,
                  border: `1px solid ${tx.type === 'deposit' ? '#10b98130' : '#f8717130'}`
                }}>
                  {tx.type.toUpperCase()}
                </span>
                <span style={{ color: tx.type === 'deposit' ? '#10b981' : '#f87171', fontWeight: 700, fontSize: 13 }}>
                  {tx.type === 'deposit' ? '+' : '−'}₹{tx.amount.toLocaleString('en-IN')}
                </span>
                <span style={{ color: '#475569', fontSize: 12 }}>₹{tx.balanceAfter?.toLocaleString('en-IN')}</span>
                <span style={{ color: '#334155', fontSize: 11 }}>
                  {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* FRAUD TAB */}
        {activeTab === 'fraud' && (
          <div style={styles.glassCard}>
            <div style={styles.glassCardShine} />
            <div style={{ ...styles.cardTitle, color: '#f87171' }}>🚨 FRAUD ALERTS ({fraudAlerts.length})</div>
            {fraudAlerts.length === 0 ? (
              <div style={styles.emptyState}>✅ No fraud alerts — system is clean!</div>
            ) : (
              fraudAlerts.map((alert) => (
                <div key={alert._id} style={styles.alertRow}>
                  <div style={{
                    ...styles.alertBadge,
                    background: alert.riskLevel === 'high' ? '#f8717120' : '#fbbf2420',
                    color: alert.riskLevel === 'high' ? '#f87171' : '#fbbf24',
                    border: `1px solid ${alert.riskLevel === 'high' ? '#f8717140' : '#fbbf2440'}`
                  }}>
                    {alert.riskLevel?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>{alert.userId?.name}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{alert.userId?.email}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{alert.flags?.join(' · ')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: '#f87171', fontWeight: 700 }}>Score: {alert.riskScore}</div>
                    <div style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>
                      {new Date(alert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{
                      fontSize: 10, color: alert.status === 'open' ? '#fbbf24' : '#10b981',
                      background: alert.status === 'open' ? '#fbbf2410' : '#10b98110',
                      padding: '2px 8px', borderRadius: 999, marginTop: 4,
                      border: `1px solid ${alert.status === 'open' ? '#fbbf2430' : '#10b98130'}`
                    }}>
                      {alert.status?.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#020408', position: 'relative', overflow: 'hidden' },
  orb1: { position: 'fixed', top: '-200px', left: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, #1d4ed820, transparent 70%)', pointerEvents: 'none' },
  orb2: { position: 'fixed', bottom: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, #6d28d920, transparent 70%)', pointerEvents: 'none' },
  grid: { position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(#ffffff03 1px, transparent 1px), linear-gradient(90deg, #ffffff03 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' },
  loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020408', gap: 12 },
  loadingText: { fontFamily: 'sans-serif', fontSize: '28px', fontWeight: 700, letterSpacing: '6px', background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  loadingSub: { color: '#334155', fontSize: '13px' },
  sidebar: { width: '230px', minHeight: '100vh', background: 'linear-gradient(180deg, #050a14, #020408)', borderRight: '1px solid #ffffff06', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10 },
  sidebarGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: '200px', background: 'radial-gradient(ellipse at top, #7c3aed10, transparent)', pointerEvents: 'none' },
  logo: { fontFamily: 'sans-serif', fontSize: '18px', fontWeight: 700, letterSpacing: '3px', background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' },
  adminBadge: { fontSize: '11px', color: '#a78bfa', background: '#a78bfa10', border: '1px solid #a78bfa20', borderRadius: 999, padding: '3px 12px', display: 'inline-block', marginBottom: '8px', letterSpacing: '1px' },
  sidebarDivider: { height: '1px', background: 'linear-gradient(90deg, transparent, #ffffff10, transparent)', margin: '12px 0 20px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', color: '#334155', cursor: 'pointer', position: 'relative' },
  navItemActive: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', color: '#e2e8f0', background: 'linear-gradient(135deg, #1e3a5f20, #7c3aed10)', border: '1px solid #ffffff08', cursor: 'pointer', position: 'relative' },
  navIcon: { fontSize: '14px', width: '16px', textAlign: 'center' },
  navActiveDot: { position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '60%', background: 'linear-gradient(180deg,#60a5fa,#a78bfa)', borderRadius: '0 4px 4px 0' },
  sidebarBottom: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  backBtn: { background: 'rgba(96,165,250,0.05)', border: '1px solid #60a5fa20', borderRadius: '10px', padding: '10px', color: '#60a5fa', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  logoutBtn: { background: 'rgba(255,255,255,0.02)', border: '1px solid #ffffff06', borderRadius: '10px', padding: '10px', color: '#334155', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  main: { marginLeft: '230px', padding: '28px 32px', flex: 1, position: 'relative', zIndex: 1 },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  date: { fontSize: '11px', color: '#1e3a5f', marginBottom: '6px', letterSpacing: '2px' },
  greeting: { fontFamily: 'sans-serif', fontSize: '24px', fontWeight: '700', color: '#f1f5f9' },
  greetingName: { background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: 6, background: '#10b98108', border: '1px solid #10b98120', color: '#10b981', fontSize: '11px', padding: '8px 16px', borderRadius: '999px', letterSpacing: '1px' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' },
  statCard: { background: 'linear-gradient(135deg, #050a14, #020408)', border: '1px solid #ffffff06', borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' },
  statTopBar: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px' },
  statIcon: { fontSize: '20px', marginBottom: '10px' },
  statVal: { fontFamily: 'sans-serif', fontSize: '20px', fontWeight: '700' },
  statLbl: { fontSize: '11px', color: '#334155', marginTop: '4px' },
  glassCard: { background: 'linear-gradient(135deg, #050a1490, #020408)', border: '1px solid #ffffff06', borderRadius: '18px', padding: '22px', position: 'relative', overflow: 'hidden', marginBottom: '16px' },
  glassCardShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #ffffff08, transparent)' },
  cardTitle: { fontSize: '10px', color: '#1e3a5f', letterSpacing: '2px', marginBottom: '18px', fontWeight: '700' },
  txRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #ffffff04' },
  txTypeIcon: { width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 },
  txName: { fontSize: '13px', color: '#94a3b8', fontWeight: '500' },
  txDate: { fontSize: '10px', color: '#1e3a5f', marginTop: '2px' },
  txAmount: { fontSize: '13px', fontWeight: '700', textAlign: 'right' },
  tableHeader: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, padding: '8px 0', borderBottom: '1px solid #ffffff06', fontSize: 10, color: '#1e3a5f', letterSpacing: '1px', fontWeight: 600, marginBottom: 4 },
  tableRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, padding: '10px 0', borderBottom: '1px solid #ffffff04', alignItems: 'center' },
  userCell: { display: 'flex', alignItems: 'center', gap: 8 },
  miniAvatar: { width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 },
  emptyState: { color: '#10b981', fontSize: '13px', textAlign: 'center', padding: '32px', },
  alertRow: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 0', borderBottom: '1px solid #ffffff04' },
  alertBadge: { fontSize: '9px', fontWeight: '700', padding: '4px 10px', borderRadius: '999px', letterSpacing: '1px', flexShrink: 0, marginTop: 2 },
}