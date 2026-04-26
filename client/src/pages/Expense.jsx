import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getExpenseSummary, setBudget, getAccount } from '../utils/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import toast from 'react-hot-toast'
import Chatbot from '../components/Chatbot'

const CATEGORY_COLORS = {
  Income: '#10b981',
  Food: '#f59e0b',
  Shopping: '#60a5fa',
  Travel: '#a78bfa',
  Bills: '#f87171',
  Entertainment: '#ec4899',
  Health: '#34d399',
  Education: '#818cf8',
  Other: '#64748b',
}

const CATEGORY_ICONS = {
  Income: '↑',
  Food: '🍔',
  Shopping: '🛒',
  Travel: '✈️',
  Bills: '📄',
  Entertainment: '🎬',
  Health: '❤️',
  Education: '📚',
  Other: '◎',
}

export default function Expense() {
  const { logoutUser } = useAuth()
  const [summary, setSummary] = useState({})
  const [budgets, setBudgets] = useState([])
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [budgetCategory, setBudgetCategory] = useState('Food')
  const [budgetLimit, setBudgetLimit] = useState('')
  const [settingBudget, setSettingBudget] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [sumRes, accRes] = await Promise.all([getExpenseSummary(), getAccount()])
      setSummary(sumRes.data.summary || {})
      setBudgets(sumRes.data.budgets || [])
      setAccount(accRes.data)
    } catch (err) {
      console.log('Error loading expense data')
    } finally {
      setLoading(false)
    }
  }

  const handleSetBudget = async () => {
    if (!budgetLimit || budgetLimit <= 0) return toast.error('Enter a valid budget limit')
    setSettingBudget(true)
    try {
      await setBudget({ category: budgetCategory, limit: Number(budgetLimit) })
      toast.success(`Budget set for ${budgetCategory} ✅`)
      setBudgetLimit('')
      fetchData()
    } catch (err) {
      toast.error('Failed to set budget')
    } finally {
      setSettingBudget(false)
    }
  }

  const handleLogout = () => { logoutUser(); navigate('/login') }

  const getBudgetForCategory = (category) => budgets.find(b => b.category === category)

  const pieData = Object.entries(summary)
    .filter(([cat]) => cat !== 'Income')
    .map(([cat, data]) => ({ name: cat, value: data.total, color: CATEGORY_COLORS[cat] || '#64748b' }))

  const barData = Object.entries(summary).map(([cat, data]) => ({
    category: cat,
    spent: data.total,
    budget: getBudgetForCategory(cat)?.limit || 0,
    color: CATEGORY_COLORS[cat] || '#64748b'
  }))

  const totalSpent = Object.entries(summary)
    .filter(([cat]) => cat !== 'Income')
    .reduce((s, [, d]) => s + d.total, 0)

  const totalIncome = summary['Income']?.total || 0

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingText}>NEUTRONA</div>
      <div style={styles.loadingSub}>Loading expenses...</div>
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
            { label: 'Expenses', icon: '💰', path: '/expense', active: true },
            { label: 'Analytics', icon: '◎', path: '/analytics' },
            { label: 'Admin', icon: '⚡', path: '/admin' },
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
            <div style={styles.date}>EXPENSE MANAGEMENT</div>
            <div style={styles.greeting}>
              Your <span style={styles.greetingName}>Spending</span> This Month 💰
            </div>
          </div>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot} />
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Top Stats */}
        <div style={styles.statsRow}>
          {[
            { label: 'Total Income', value: `₹${totalIncome.toLocaleString('en-IN')}`, color: '#10b981', icon: '↑', glow: '#10b98120' },
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, color: '#f87171', icon: '↓', glow: '#f8717120' },
            { label: 'Net Savings', value: `₹${(totalIncome - totalSpent).toLocaleString('en-IN')}`, color: '#60a5fa', icon: '◈', glow: '#60a5fa20' },
            { label: 'Categories', value: Object.keys(summary).length, color: '#a78bfa', icon: '⊞', glow: '#a78bfa20' },
          ].map((s, i) => (
            <div key={i} style={{ ...styles.statCard, boxShadow: `0 0 30px ${s.glow}` }}>
              <div style={{ ...styles.statTopBar, background: s.color }} />
              <div style={{ ...styles.statIcon, color: s.color }}>{s.icon}</div>
              <div style={{ ...styles.statVal, color: s.color }}>{s.value}</div>
              <div style={styles.statLbl}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={styles.chartsRow}>
          {/* Pie Chart */}
          <div style={styles.glassCard}>
            <div style={styles.glassCardShine} />
            <div style={styles.cardTitle}>◎ SPENDING BREAKDOWN</div>
            {pieData.length === 0 ? (
              <div style={styles.emptyState}>No spending data yet</div>
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
                <div style={styles.legendGrid}>
                  {pieData.map((d, i) => (
                    <div key={i} style={styles.legendItem}>
                      <span style={{ color: d.color }}>●</span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{d.name}</span>
                      <span style={{ fontSize: 11, color: d.color, fontWeight: 600 }}>₹{d.value.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Budget vs Spent */}
          <div style={styles.glassCard}>
            <div style={styles.glassCardShine} />
            <div style={styles.cardTitle}>◈ BUDGET VS SPENT</div>
            {barData.length === 0 ? (
              <div style={styles.emptyState}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} layout="vertical" barGap={2}>
                  <XAxis type="number" tick={{ fill: '#334155', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{ background: '#050a14', border: '1px solid #ffffff08', borderRadius: 10, color: '#e2e8f0', fontSize: 12 }}
                    formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                  />
                  <Bar dataKey="budget" fill="#ffffff08" radius={[0, 4, 4, 0]} name="Budget" />
                  <Bar dataKey="spent" radius={[0, 4, 4, 0]} name="Spent">
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Cards */}
        <div style={styles.categoryGrid}>
          {Object.entries(summary).map(([cat, data]) => {
            const budget = getBudgetForCategory(cat)
            const pct = budget ? Math.min((data.total / budget.limit) * 100, 100) : 0
            const over = budget && data.total > budget.limit
            return (
              <div key={cat} style={{ ...styles.catCard, borderColor: over ? '#f8717130' : '#ffffff06' }}>
                <div style={styles.catCardShine} />
                <div style={styles.catHeader}>
                  <div style={{ ...styles.catIcon, background: `${CATEGORY_COLORS[cat]}15`, color: CATEGORY_COLORS[cat] }}>
                    {CATEGORY_ICONS[cat] || '◎'}
                  </div>
                  <div>
                    <div style={styles.catName}>{cat}</div>
                    <div style={styles.catCount}>{data.count} transactions</div>
                  </div>
                  {over && <div style={styles.overBudge}>OVER!</div>}
                </div>
                <div style={{ ...styles.catAmount, color: CATEGORY_COLORS[cat] }}>
                  ₹{data.total.toLocaleString('en-IN')}
                </div>
                {budget && (
                  <>
                    <div style={styles.budgetBar}>
                      <div style={{ ...styles.budgetFill, width: `${pct}%`, background: over ? '#f87171' : CATEGORY_COLORS[cat] }} />
                    </div>
                    <div style={styles.budgetInfo}>
                      <span style={{ color: '#334155', fontSize: 10 }}>Budget: ₹{budget.limit.toLocaleString('en-IN')}</span>
                      <span style={{ color: over ? '#f87171' : '#334155', fontSize: 10 }}>{pct.toFixed(0)}%</span>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Set Budget */}
        <div style={styles.glassCard}>
          <div style={styles.glassCardShine} />
          <div style={styles.cardTitle}>⊕ SET MONTHLY BUDGET</div>
          <div style={styles.budgetForm}>
            <select
              value={budgetCategory}
              onChange={(e) => setBudgetCategory(e.target.value)}
              style={styles.select}
            >
              {['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'].map(cat => (
                <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Budget limit (₹)"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              style={styles.budgetInput}
            />
            <button onClick={handleSetBudget} disabled={settingBudget} style={styles.budgetBtn}>
              {settingBudget ? 'Setting...' : 'Set Budget →'}
            </button>
          </div>
          {budgets.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10, color: '#1e3a5f', letterSpacing: '1px', marginBottom: 10 }}>CURRENT BUDGETS</div>
              <div style={styles.budgetList}>
                {budgets.map((b, i) => (
                  <div key={i} style={styles.budgetItem}>
                    <span style={{ color: CATEGORY_COLORS[b.category], fontSize: 13 }}>{CATEGORY_ICONS[b.category]} {b.category}</span>
                    <span style={{ color: '#60a5fa', fontSize: 13, fontWeight: 600 }}>₹{b.limit.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
      <Chatbot />
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
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  glassCard: { background: 'linear-gradient(135deg, #050a1490, #020408)', border: '1px solid #ffffff06', borderRadius: '18px', padding: '22px', position: 'relative', overflow: 'hidden', marginBottom: '16px' },
  glassCardShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #ffffff08, transparent)' },
  cardTitle: { fontSize: '10px', color: '#1e3a5f', letterSpacing: '2px', marginBottom: '18px', fontWeight: '700' },
  emptyState: { color: '#1e3a5f', fontSize: '13px', textAlign: 'center', padding: '40px 0' },
  legendGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' },
  catCard: { background: 'linear-gradient(135deg, #050a14, #020408)', border: '1px solid #ffffff06', borderRadius: '16px', padding: '18px', position: 'relative', overflow: 'hidden' },
  catCardShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #ffffff06, transparent)' },
  catHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  catIcon: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 },
  catName: { fontSize: '13px', fontWeight: '600', color: '#cbd5e1' },
  catCount: { fontSize: '10px', color: '#334155', marginTop: '2px' },
  overBudge: { marginLeft: 'auto', fontSize: '9px', color: '#f87171', background: '#f8717115', border: '1px solid #f8717130', padding: '2px 8px', borderRadius: 999, fontWeight: 700 },
  catAmount: { fontFamily: 'sans-serif', fontSize: '20px', fontWeight: '700', marginBottom: '10px' },
  budgetBar: { height: '4px', background: '#ffffff06', borderRadius: 999, marginBottom: '6px' },
  budgetFill: { height: '100%', borderRadius: 999, transition: 'width 0.5s' },
  budgetInfo: { display: 'flex', justifyContent: 'space-between' },
  budgetForm: { display: 'flex', gap: '12px', alignItems: 'center' },
  select: { background: '#020408', border: '1px solid #ffffff08', borderRadius: '10px', padding: '12px 14px', color: '#e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif', cursor: 'pointer' },
  budgetInput: { flex: 1, background: '#020408', border: '1px solid #ffffff08', borderRadius: '10px', padding: '12px 16px', color: '#e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif' },
  budgetBtn: { background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '10px', padding: '12px 24px', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 0 20px #2563eb30', whiteSpace: 'nowrap' },
  budgetList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  budgetItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#ffffff03', borderRadius: '8px', border: '1px solid #ffffff06' },
}