import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getTransactions, getAccount } from '../utils/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import Chatbot from '../components/Chatbot'

export default function Analytics() {
  const { logoutUser } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [txRes, accRes] = await Promise.all([getTransactions(), getAccount()])
      setTransactions(txRes.data)
      setAccount(accRes.data)
    } catch (err) {
      console.log('Error loading analytics')
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0)
  const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0)
  const totalTx = transactions.length
  const avgTx = totalTx > 0 ? ((totalDeposits + totalWithdrawals) / totalTx).toFixed(0) : 0

  // Monthly bar chart data
  const monthlyData = () => {
    const months = {}
    transactions.forEach(tx => {
      const month = new Date(tx.createdAt).toLocaleDateString('en-IN', { month: 'short' })
      if (!months[month]) months[month] = { month, deposits: 0, withdrawals: 0 }
      if (tx.type === 'deposit') months[month].deposits += tx.amount
      else months[month].withdrawals += tx.amount
    })
    return Object.values(months)
  }

  // Pie chart data
  const pieData = [
    { name: 'Deposits', value: totalDeposits, color: '#10b981' },
    { name: 'Withdrawals', value: totalWithdrawals, color: '#f87171' },
  ]

  // Balance over time
  const balanceData = () => {
    const sorted = [...transactions].reverse()
    return sorted.map((tx, i) => ({
      name: new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      balance: tx.balanceAfter
    }))
  }

  const handleLogout = () => { logoutUser(); navigate('/login') }

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingText}>NEUTRONA</div>
      <div style={styles.loadingSub}>Loading analytics...</div>
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
        <div style={styles.sidebarDivider} />
        <nav style={styles.nav}>
          {[
            { label: 'Dashboard', icon: '⊞', path: '/dashboard' },
            { label: 'Transactions', icon: '↕', path: '/dashboard' },
            { label: 'Transfer', icon: '→', path: '/dashboard' },
            { label: 'Analytics', icon: '◎', path: '/analytics', active: true },
            { label: 'Settings', icon: '⊙', path: '/dashboard' },
          ].map((item) => (
            <div key={item.label} onClick={() => navigate(item.path)} style={item.active ? styles.navItemActive : styles.navItem}>
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
              {item.active && <div style={styles.navActiveDot} />}
            </div>
          ))}
        </nav>
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
          <button onClick={handleLogout} style={styles.logoutBtn}>⊗ Sign Out</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.date}>EXPENSE ANALYTICS</div>
            <div style={styles.greeting}>Your Financial <span style={styles.greetingName}>Overview</span> 📊</div>
          </div>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot} />
            Live Data
          </div>
        </div>

        {/* Stat Cards */}
        <div style={styles.statsRow}>
          {[
            { label: 'Total Deposits', value: `₹${totalDeposits.toLocaleString('en-IN')}`, color: '#10b981', icon: '↑', glow: '#10b98120' },
            { label: 'Total Withdrawals', value: `₹${totalWithdrawals.toLocaleString('en-IN')}`, color: '#f87171', icon: '↓', glow: '#f8717120' },
            { label: 'Total Transactions', value: totalTx, color: '#60a5fa', icon: '↕', glow: '#60a5fa20' },
            { label: 'Average Transaction', value: `₹${Number(avgTx).toLocaleString('en-IN')}`, color: '#a78bfa', icon: '◎', glow: '#a78bfa20' },
          ].map((s, i) => (
            <div key={i} style={{ ...styles.statCard, boxShadow: `0 0 30px ${s.glow}` }}>
              <div style={{ ...styles.statTopBar, background: s.color }} />
              <div style={{ ...styles.statIcon, color: s.color }}>{s.icon}</div>
              <div style={{ ...styles.statVal, color: s.color }}>{s.value}</div>
              <div style={styles.statLbl}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div style={styles.chartsGrid}>

          {/* Bar Chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartCardShine} />
            <div style={styles.chartTitle}>◈ MONTHLY ACTIVITY</div>
            {monthlyData().length === 0 ? (
              <div style={styles.emptyChart}>No data yet — make some transactions!</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData()} barGap={4}>
                  <XAxis dataKey="month" tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#334155', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#050a14', border: '1px solid #ffffff08', borderRadius: 10, color: '#e2e8f0', fontSize: 12 }}
                    formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                  />
                  <Bar dataKey="deposits" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.9} />
                  <Bar dataKey="withdrawals" fill="#f87171" radius={[4, 4, 0, 0]} opacity={0.9} />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div style={styles.chartLegend}>
              <span style={styles.legendDot('#10b981')}>● Deposits</span>
              <span style={styles.legendDot('#f87171')}>● Withdrawals</span>
            </div>
          </div>

          {/* Pie Chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartCardShine} />
            <div style={styles.chartTitle}>◎ DISTRIBUTION</div>
            {totalDeposits === 0 && totalWithdrawals === 0 ? (
              <div style={styles.emptyChart}>No data yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} opacity={0.9} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#050a14', border: '1px solid #ffffff08', borderRadius: 10, color: '#e2e8f0', fontSize: 12 }}
                      formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={styles.pieStats}>
                  {pieData.map((d, i) => (
                    <div key={i} style={styles.pieStat}>
                      <span style={{ color: d.color, fontSize: 12 }}>● {d.name}</span>
                      <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>₹{d.value.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Line Chart — Balance Over Time */}
        <div style={{ ...styles.chartCard, marginTop: 16 }}>
          <div style={styles.chartCardShine} />
          <div style={styles.chartTitle}>↗ BALANCE OVER TIME</div>
          {balanceData().length === 0 ? (
            <div style={styles.emptyChart}>No data yet — make some transactions!</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={balanceData()}>
                <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#334155', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#050a14', border: '1px solid #ffffff08', borderRadius: 10, color: '#e2e8f0', fontSize: 12 }}
                  formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                />
                <Line type="monotone" dataKey="balance" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 4 }} activeDot={{ r: 6, fill: '#a78bfa' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Transactions Table */}
        <div style={{ ...styles.chartCard, marginTop: 16 }}>
          <div style={styles.chartCardShine} />
          <div style={styles.chartTitle}>↕ ALL TRANSACTIONS</div>
          {transactions.length === 0 ? (
            <div style={styles.emptyChart}>No transactions yet</div>
          ) : (
            <div>
              <div style={styles.tableHeader}>
                <span>Type</span>
                <span>Amount</span>
                <span>Balance After</span>
                <span>Date</span>
                <span>Status</span>
              </div>
              {transactions.map((tx) => (
                <div key={tx._id} style={styles.tableRow}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: tx.type === 'deposit' ? '#10b981' : '#f87171', fontSize: 14 }}>
                      {tx.type === 'deposit' ? '↑' : '↓'}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: 12, textTransform: 'capitalize' }}>{tx.type}</span>
                  </span>
                  <span style={{ color: tx.type === 'deposit' ? '#10b981' : '#f87171', fontWeight: 600, fontSize: 13 }}>
                    {tx.type === 'deposit' ? '+' : '−'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                  <span style={{ color: '#64748b', fontSize: 12 }}>₹{tx.balanceAfter.toLocaleString('en-IN')}</span>
                  <span style={{ color: '#334155', fontSize: 11 }}>
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ fontSize: 10, color: tx.status === 'success' ? '#10b981' : '#fbbf24', background: tx.status === 'success' ? '#10b98110' : '#fbbf2410', padding: '2px 8px', borderRadius: 999, border: `1px solid ${tx.status === 'success' ? '#10b98130' : '#fbbf2430'}` }}>
                    {tx.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      <Chatbot />
    </div>
  )
}

const legendDot = (color) => ({ color, fontSize: 12 })

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#020408', position: 'relative', overflow: 'hidden' },
  orb1: { position: 'fixed', top: '-200px', left: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, #1d4ed820, transparent 70%)', pointerEvents: 'none' },
  orb2: { position: 'fixed', bottom: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, #6d28d920, transparent 70%)', pointerEvents: 'none' },
  grid: { position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(#ffffff03 1px, transparent 1px), linear-gradient(90deg, #ffffff03 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' },
  loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020408', gap: 12 },
  loadingText: { fontFamily: 'sans-serif', fontSize: '28px', fontWeight: 700, letterSpacing: '6px', background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  loadingSub: { color: '#334155', fontSize: '13px' },
  sidebar: { width: '230px', minHeight: '100vh', background: 'linear-gradient(180deg, #050a14, #020408)', borderRight: '1px solid #ffffff06', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10 },
  sidebarGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: '200px', background: 'radial-gradient(ellipse at top, #2563eb10, transparent)', pointerEvents: 'none' },
  logo: { fontFamily: 'sans-serif', fontSize: '18px', fontWeight: 700, letterSpacing: '3px', background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' },
  sidebarDivider: { height: '1px', background: 'linear-gradient(90deg, transparent, #ffffff10, transparent)', margin: '12px 0 20px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', color: '#334155', cursor: 'pointer', position: 'relative' },
  navItemActive: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', color: '#e2e8f0', background: 'linear-gradient(135deg, #1e3a5f20, #7c3aed10)', border: '1px solid #ffffff08', cursor: 'pointer', position: 'relative' },
  navIcon: { fontSize: '14px', width: '16px', textAlign: 'center' },
  navActiveDot: { position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '60%', background: 'linear-gradient(180deg,#60a5fa,#a78bfa)', borderRadius: '0 4px 4px 0' },
  sidebarBottom: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  userChip: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid #ffffff06' },
  userAvatarWrap: { position: 'relative', flexShrink: 0 },
  userAvatar: { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' },
  userAvatarRing: { position: 'absolute', inset: '-2px', borderRadius: '50%', border: '1px solid #60a5fa40' },
  userName: { fontSize: '12px', fontWeight: '600', color: '#cbd5e1' },
  userRole: { fontSize: '10px', color: '#334155', marginTop: '2px' },
  logoutBtn: { background: 'rgba(255,255,255,0.02)', border: '1px solid #ffffff06', borderRadius: '10px', padding: '10px', color: '#334155', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  main: { marginLeft: '230px', padding: '28px 32px', flex: 1, position: 'relative', zIndex: 1 },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  date: { fontSize: '11px', color: '#1e3a5f', marginBottom: '6px', letterSpacing: '2px' },
  greeting: { fontFamily: 'sans-serif', fontSize: '24px', fontWeight: '700', color: '#f1f5f9' },
  greetingName: { background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: 6, background: '#10b98108', border: '1px solid #10b98120', color: '#10b981', fontSize: '11px', padding: '8px 16px', borderRadius: '999px', letterSpacing: '1px' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' },
  statCard: { background: 'linear-gradient(135deg, #050a14, #020408)', border: '1px solid #ffffff06', borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' },
  statTopBar: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px' },
  statIcon: { fontSize: '20px', marginBottom: '10px' },
  statVal: { fontFamily: 'sans-serif', fontSize: '18px', fontWeight: '700' },
  statLbl: { fontSize: '11px', color: '#334155', marginTop: '4px' },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' },
  chartCard: { background: 'linear-gradient(135deg, #050a1490, #020408)', border: '1px solid #ffffff06', borderRadius: '18px', padding: '22px', position: 'relative', overflow: 'hidden' },
  chartCardShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #ffffff08, transparent)' },
  chartTitle: { fontSize: '10px', color: '#1e3a5f', letterSpacing: '2px', marginBottom: '18px', fontWeight: '700' },
  emptyChart: { color: '#1e3a5f', fontSize: '13px', textAlign: 'center', padding: '40px 0' },
  chartLegend: { display: 'flex', gap: '20px', marginTop: '12px', justifyContent: 'center' },
  legendDot: (color) => ({ color, fontSize: 12 }),
  pieStats: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 },
  pieStat: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tableHeader: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 8, padding: '8px 0', borderBottom: '1px solid #ffffff06', fontSize: 10, color: '#1e3a5f', letterSpacing: '1px', fontWeight: 600 },
  tableRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 8, padding: '10px 0', borderBottom: '1px solid #ffffff04', alignItems: 'center' },
}