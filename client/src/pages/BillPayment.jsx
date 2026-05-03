import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAccount, payBill } from '../utils/api'
import toast from 'react-hot-toast'
import Chatbot from '../components/Chatbot'

const BILL_CATEGORIES = [
  { id: 'Food', icon: '🍔', label: 'Food & Dining', color: '#f59e0b', examples: 'Swiggy, Zomato, Restaurant' },
  { id: 'Shopping', icon: '🛒', label: 'Shopping', color: '#60a5fa', examples: 'Amazon, Flipkart, Mall' },
  { id: 'Travel', icon: '✈️', label: 'Travel', color: '#a78bfa', examples: 'Uber, Ola, Flight, Train' },
  { id: 'Bills', icon: '📄', label: 'Utilities & Bills', color: '#f87171', examples: 'Electricity, Water, Rent' },
  { id: 'Entertainment', icon: '🎬', label: 'Entertainment', color: '#ec4899', examples: 'Netflix, Spotify, Movies' },
  { id: 'Health', icon: '❤️', label: 'Health & Medical', color: '#34d399', examples: 'Hospital, Medicine, Doctor' },
  { id: 'Education', icon: '📚', label: 'Education', color: '#818cf8', examples: 'Course, Books, School' },
  { id: 'Other', icon: '◎', label: 'Other', color: '#64748b', examples: 'Miscellaneous expenses' },
]

export default function BillPayment() {
  const { logoutUser } = useAuth()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchAccount() }, [])

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

  const handlePay = async () => {
    if (!selectedCategory) return toast.error('Please select a category')
    if (!amount || amount <= 0) return toast.error('Enter a valid amount')
    if (Number(amount) > account.balance) return toast.error('Insufficient balance ❌')

    setPaying(true)
    try {
      const res = await payBill({
        amount: Number(amount),
        category: selectedCategory.id,
        description: description || selectedCategory.label
      })
      setSuccess({
        amount: Number(amount),
        category: selectedCategory,
        description: description || selectedCategory.label,
        newBalance: res.data.newBalance
      })
      setAccount(prev => ({ ...prev, balance: res.data.newBalance }))
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  const resetForm = () => {
    setSuccess(null)
    setSelectedCategory(null)
    setAmount('')
    setDescription('')
  }

  const handleLogout = () => { logoutUser(); navigate('/login') }

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingText}>NEUTRONA</div>
      <div style={styles.loadingSub}>Loading...</div>
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
            { label: 'Bill Payment', icon: '💳', path: '/bills', active: true },
            { label: 'Expenses', icon: '💰', path: '/expense' },
            { label: 'Analytics', icon: '◎', path: '/analytics' },
            { label: 'Settings', icon: '⚙️', path: '/settings' },
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
            <div style={styles.date}>BILL PAYMENT</div>
            <div style={styles.greeting}>
              Pay your <span style={styles.greetingName}>Bills</span> 💳
            </div>
          </div>
          <div style={styles.balanceChip}>
            Balance: <span style={{ color: '#60a5fa', fontWeight: 700 }}>₹{account?.balance?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Success Screen */}
        {success && (
          <div style={styles.successCard}>
            <div style={styles.successCardShine} />
            <div style={styles.successIcon}>✅</div>
            <div style={styles.successTitle}>Payment Successful!</div>
            <div style={styles.successAmount}>₹{success.amount.toLocaleString('en-IN')}</div>
            <div style={styles.successDesc}>{success.icon} {success.description}</div>
            <div style={styles.successBalance}>New Balance: ₹{success.newBalance.toLocaleString('en-IN')}</div>
            <div style={styles.successBtns}>
              <button onClick={resetForm} style={styles.payAgainBtn}>Pay Another Bill</button>
              <button onClick={() => navigate('/dashboard')} style={styles.dashBtn}>Go to Dashboard</button>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {!success && (
          <>
            {/* Step 1 - Select Category */}
            <div style={styles.glassCard}>
              <div style={styles.glassCardShine} />
              <div style={styles.cardTitle}>STEP 1 — SELECT CATEGORY</div>
              <div style={styles.categoryGrid}>
                {BILL_CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      ...styles.catCard,
                      borderColor: selectedCategory?.id === cat.id ? cat.color : '#ffffff06',
                      background: selectedCategory?.id === cat.id ? `${cat.color}10` : 'rgba(255,255,255,0.02)',
                      boxShadow: selectedCategory?.id === cat.id ? `0 0 20px ${cat.color}20` : 'none'
                    }}
                  >
                    <div style={styles.catEmoji}>{cat.icon}</div>
                    <div style={{ ...styles.catName, color: selectedCategory?.id === cat.id ? cat.color : '#94a3b8' }}>
                      {cat.label}
                    </div>
                    <div style={styles.catExamples}>{cat.examples}</div>
                    {selectedCategory?.id === cat.id && (
                      <div style={{ ...styles.catCheck, background: cat.color }}>✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2 - Enter Amount */}
            {selectedCategory && (
              <div style={styles.glassCard}>
                <div style={styles.glassCardShine} />
                <div style={styles.cardTitle}>STEP 2 — ENTER PAYMENT DETAILS</div>
                <div style={styles.selectedCatBadge}>
                  <span style={{ fontSize: 18 }}>{selectedCategory.icon}</span>
                  <span style={{ color: selectedCategory.color, fontWeight: 600, fontSize: 14 }}>{selectedCategory.label}</span>
                </div>
                <div style={styles.paymentForm}>
                  <div style={styles.amountWrap}>
                    <span style={styles.rupeeSign}>₹</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={styles.amountInput}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Description (optional) e.g. Electricity Bill"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.descInput}
                  />

                  {/* Quick Amount Buttons */}
                  <div style={styles.quickAmounts}>
                    {[100, 500, 1000, 2000, 5000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setAmount(amt)}
                        style={{ ...styles.quickBtn, borderColor: amount == amt ? selectedCategory.color : '#ffffff08', color: amount == amt ? selectedCategory.color : '#475569' }}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handlePay}
                    disabled={paying || !amount}
                    style={{
                      ...styles.payBtn,
                      background: `linear-gradient(135deg, ${selectedCategory.color}, ${selectedCategory.color}aa)`,
                      boxShadow: `0 0 30px ${selectedCategory.color}30`
                    }}
                  >
                    {paying ? 'Processing...' : `Pay ₹${amount || '0'} →`}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
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
  balanceChip: { background: '#07091a', border: '1px solid #ffffff08', borderRadius: '999px', padding: '8px 18px', fontSize: '13px', color: '#475569' },
  successCard: { background: 'linear-gradient(135deg, #050a14, #020408)', border: '1px solid #10b98130', borderRadius: '24px', padding: '48px', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 0 60px #10b98110' },
  successCardShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #10b98140, transparent)' },
  successIcon: { fontSize: '56px', marginBottom: '16px' },
  successTitle: { fontFamily: 'sans-serif', fontSize: '24px', fontWeight: '700', color: '#10b981', marginBottom: '8px' },
  successAmount: { fontFamily: 'sans-serif', fontSize: '40px', fontWeight: '800', color: '#f1f5f9', marginBottom: '8px' },
  successDesc: { fontSize: '14px', color: '#475569', marginBottom: '8px' },
  successBalance: { fontSize: '13px', color: '#334155', marginBottom: '28px' },
  successBtns: { display: 'flex', gap: '12px', justifyContent: 'center' },
  payAgainBtn: { background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '12px', padding: '12px 24px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  dashBtn: { background: 'transparent', border: '1px solid #ffffff10', borderRadius: '12px', padding: '12px 24px', color: '#475569', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  glassCard: { background: 'linear-gradient(135deg, #050a1490, #020408)', border: '1px solid #ffffff06', borderRadius: '18px', padding: '24px', position: 'relative', overflow: 'hidden', marginBottom: '16px' },
  glassCardShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #ffffff08, transparent)' },
  cardTitle: { fontSize: '10px', color: '#1e3a5f', letterSpacing: '2px', marginBottom: '20px', fontWeight: '700' },
  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  catCard: { border: '1px solid #ffffff06', borderRadius: '14px', padding: '16px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' },
  catEmoji: { fontSize: '28px', marginBottom: '8px' },
  catName: { fontSize: '12px', fontWeight: '600', marginBottom: '4px' },
  catExamples: { fontSize: '10px', color: '#334155' },
  catCheck: { position: 'absolute', top: 8, right: 8, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: '700' },
  selectedCatBadge: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '10px 16px', background: '#ffffff05', borderRadius: '10px', border: '1px solid #ffffff08' },
  paymentForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
  amountWrap: { display: 'flex', alignItems: 'center', gap: '12px', background: '#020408', border: '1px solid #ffffff08', borderRadius: '14px', padding: '4px 20px' },
  rupeeSign: { fontSize: '28px', color: '#60a5fa', fontWeight: '700' },
  amountInput: { flex: 1, background: 'transparent', border: 'none', color: '#f1f5f9', fontSize: '32px', fontWeight: '700', outline: 'none', fontFamily: 'sans-serif', padding: '12px 0' },
  descInput: { background: '#020408', border: '1px solid #ffffff08', borderRadius: '12px', padding: '13px 16px', color: '#e2e8f0', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif' },
  quickAmounts: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  quickBtn: { background: 'transparent', border: '1px solid #ffffff08', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' },
  payBtn: { border: 'none', borderRadius: '14px', padding: '16px', color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', letterSpacing: '0.5px' },
}