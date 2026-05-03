import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAccount, updateProfile, changePassword } from '../utils/api'
import toast from 'react-hot-toast'
import Chatbot from '../components/Chatbot'

export default function Settings() {
  const { logoutUser, loginUser, token } = useAuth()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAccount()
  }, [])

  const fetchAccount = async () => {
    try {
      const res = await getAccount()
      setAccount(res.data)
      setProfileForm({ name: res.data.name || '', email: res.data.email || '', phone: res.data.phone || '' })
    } catch (err) {
      toast.error('Failed to load account')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async () => {
    setSaving(true)
    try {
      const res = await updateProfile(profileForm)
      toast.success(res.data.message)
      // Update stored user
      const updatedUser = { ...account, ...profileForm }
      loginUser(updatedUser, token)
      setAccount(updatedUser)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('New passwords do not match ❌')
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }
    setSaving(true)
    try {
      const res = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      toast.success(res.data.message)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => { logoutUser(); navigate('/login') }

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingText}>NEUTRONA</div>
      <div style={styles.loadingSub}>Loading settings...</div>
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
            { label: 'Expenses', icon: '💰', path: '/expense' },
            { label: 'Analytics', icon: '◎', path: '/analytics' },
            { label: 'Admin', icon: '⚡', path: '/admin' },
            { label: 'Settings', icon: '⚙️', path: '/settings', active: true },
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
            <div style={styles.date}>ACCOUNT SETTINGS</div>
            <div style={styles.greeting}>
              Manage your <span style={styles.greetingName}>Profile</span> ⚙️
            </div>
          </div>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot} />
            Account Active
          </div>
        </div>

        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.profileCardShine} />
          <div style={styles.profileAvatar}>
            {account?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={styles.profileInfo}>
            <div style={styles.profileName}>{account?.name}</div>
            <div style={styles.profileEmail}>{account?.email}</div>
            <div style={styles.profileBadge}>⬡ Premium Member · {account?.accountNumber}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { id: 'profile', label: '◎ Personal Info' },
            { id: 'password', label: '🔒 Change Password' },
            { id: 'account', label: '⊞ Account Info' },
          ].map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? styles.tabActive : styles.tab}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Personal Info Tab */}
        {activeTab === 'profile' && (
          <div style={styles.glassCard}>
            <div style={styles.glassCardShine} />
            <div style={styles.cardTitle}>◎ PERSONAL INFORMATION</div>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  style={styles.input}
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="your@email.com"
                  type="email"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  style={styles.input}
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  type="tel"
                />
              </div>
            </div>
            <button onClick={handleProfileSave} disabled={saving} style={styles.saveBtn}>
              {saving ? 'Saving...' : 'Save Changes →'}
            </button>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div style={styles.glassCard}>
            <div style={styles.glassCardShine} />
            <div style={styles.cardTitle}>🔒 CHANGE PASSWORD</div>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Current Password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>New Password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div style={styles.passwordTips}>
              <div style={styles.tip}>✓ At least 6 characters</div>
              <div style={styles.tip}>✓ Mix of letters and numbers</div>
              <div style={styles.tip}>✓ Avoid common passwords</div>
            </div>
            <button onClick={handlePasswordChange} disabled={saving} style={styles.saveBtn}>
              {saving ? 'Changing...' : 'Change Password →'}
            </button>
          </div>
        )}

        {/* Account Info Tab */}
        {activeTab === 'account' && (
          <div style={styles.glassCard}>
            <div style={styles.glassCardShine} />
            <div style={styles.cardTitle}>⊞ ACCOUNT INFORMATION</div>
            <div style={styles.infoGrid}>
              {[
                { label: 'Account Number', value: account?.accountNumber },
                { label: 'Account Status', value: account?.accountStatus, green: true },
                { label: 'Current Balance', value: `₹${account?.balance?.toLocaleString('en-IN')}`, blue: true },
                { label: 'Member Since', value: new Date(account?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'Member Tier', value: 'Premium' },
                { label: 'Account Type', value: 'Savings Account' },
              ].map((info, i) => (
                <div key={i} style={styles.infoItem}>
                  <div style={styles.infoLabel}>{info.label}</div>
                  <div style={{
                    ...styles.infoValue,
                    color: info.green ? '#10b981' : info.blue ? '#60a5fa' : '#cbd5e1'
                  }}>
                    {info.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Danger Zone */}
            <div style={styles.dangerZone}>
              <div style={styles.dangerTitle}>⚠️ Danger Zone</div>
              <div style={styles.dangerDesc}>Once you delete your account all data will be permanently lost.</div>
              <button style={styles.dangerBtn}>Delete Account</button>
            </div>
          </div>
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
  statusBadge: { display: 'flex', alignItems: 'center', gap: 6, background: '#10b98108', border: '1px solid #10b98120', color: '#10b981', fontSize: '11px', padding: '8px 16px', borderRadius: '999px', letterSpacing: '1px' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' },
  profileCard: { background: 'linear-gradient(135deg, #0a1628, #0d0a1e)', border: '1px solid #ffffff08', borderRadius: '20px', padding: '28px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', overflow: 'hidden' },
  profileCardShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #60a5fa30, transparent)' },
  profileAvatar: { width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: '#fff', flexShrink: 0, boxShadow: '0 0 30px #2563eb30' },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: 'sans-serif', fontSize: '22px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' },
  profileEmail: { fontSize: '13px', color: '#475569', marginBottom: '8px' },
  profileBadge: { fontSize: '11px', color: '#60a5fa', background: '#60a5fa10', border: '1px solid #60a5fa20', padding: '4px 12px', borderRadius: '999px', display: 'inline-block' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '16px' },
  tab: { padding: '10px 20px', borderRadius: '10px', fontSize: '13px', color: '#475569', cursor: 'pointer', background: '#07091a', border: '1px solid #ffffff06' },
  tabActive: { padding: '10px 20px', borderRadius: '10px', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer', background: 'linear-gradient(135deg, #1e3a5f20, #7c3aed10)', border: '1px solid #60a5fa30' },
  glassCard: { background: 'linear-gradient(135deg, #050a1490, #020408)', border: '1px solid #ffffff06', borderRadius: '18px', padding: '28px', position: 'relative', overflow: 'hidden' },
  glassCardShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #ffffff08, transparent)' },
  cardTitle: { fontSize: '10px', color: '#1e3a5f', letterSpacing: '2px', marginBottom: '24px', fontWeight: '700' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', color: '#475569', letterSpacing: '0.5px', fontWeight: '500' },
  input: { background: '#020408', border: '1px solid #ffffff08', borderRadius: '12px', padding: '13px 16px', color: '#e2e8f0', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif' },
  saveBtn: { background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: '12px', padding: '13px 28px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 0 20px #2563eb30' },
  passwordTips: { display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' },
  tip: { fontSize: '12px', color: '#10b981' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', background: '#ffffff03', borderRadius: '12px', border: '1px solid #ffffff06' },
  infoLabel: { fontSize: '10px', color: '#334155', letterSpacing: '1px' },
  infoValue: { fontSize: '14px', fontWeight: '600' },
  dangerZone: { border: '1px solid #f8717120', borderRadius: '12px', padding: '20px', background: '#f8717105' },
  dangerTitle: { fontSize: '13px', color: '#f87171', fontWeight: '600', marginBottom: '8px' },
  dangerDesc: { fontSize: '12px', color: '#475569', marginBottom: '16px' },
  dangerBtn: { background: 'transparent', border: '1px solid #f87171', borderRadius: '10px', padding: '10px 20px', color: '#f87171', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
}