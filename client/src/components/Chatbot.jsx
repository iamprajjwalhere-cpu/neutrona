import { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '../utils/api'

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am Neutrona Assistant 🤖 How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const res = await sendChatMessage({ message: userMsg })
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I am having trouble connecting. Please try again!' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div style={styles.wrap}>
      {/* Chat Window */}
      {open && (
        <div style={styles.window}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.botAvatar}>🤖</div>
              <div>
                <div style={styles.botName}>Neutrona Assistant</div>
                <div style={styles.botStatus}>● Online</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}>✕</button>
          </div>

          {/* Messages */}
          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={msg.role === 'user' ? styles.userMsgWrap : styles.botMsgWrap}>
                {msg.role === 'assistant' && (
                  <div style={styles.botAvatarSmall}>🤖</div>
                )}
                <div style={msg.role === 'user' ? styles.userMsg : styles.botMsg}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={styles.botMsgWrap}>
                <div style={styles.botAvatarSmall}>🤖</div>
                <div style={styles.botMsg}>Thinking...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button onClick={sendMessage} style={styles.sendBtn}>→</button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <div style={styles.toggleBtn} onClick={() => setOpen(!open)}>
        {open ? '✕' : '🤖'}
      </div>
    </div>
  )
}

const styles = {
  wrap: { position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' },
  window: { width: '340px', height: '480px', background: '#07091a', border: '1px solid #ffffff10', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 0 40px #2563eb20' },
  header: { padding: '16px', background: '#0d1226', borderBottom: '1px solid #ffffff08', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  botAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
  botName: { fontSize: '13px', fontWeight: '600', color: '#e2e8f0' },
  botStatus: { fontSize: '10px', color: '#10b981' },
  closeBtn: { background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '14px' },
  messages: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  userMsgWrap: { display: 'flex', justifyContent: 'flex-end' },
  botMsgWrap: { display: 'flex', alignItems: 'flex-start', gap: '8px' },
  botAvatarSmall: { width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 },
  userMsg: { background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', padding: '10px 14px', borderRadius: '14px 14px 4px 14px', fontSize: '13px', maxWidth: '80%' },
  botMsg: { background: '#0d1226', border: '1px solid #ffffff08', color: '#cbd5e1', padding: '10px 14px', borderRadius: '4px 14px 14px 14px', fontSize: '13px', maxWidth: '80%', lineHeight: '1.5' },
  inputRow: { padding: '12px', borderTop: '1px solid #ffffff08', display: 'flex', gap: '8px' },
  input: { flex: 1, background: '#0d1226', border: '1px solid #ffffff0d', borderRadius: '10px', padding: '10px 14px', color: '#e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif' },
  sendBtn: { width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer' },
  toggleBtn: { width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', cursor: 'pointer', boxShadow: '0 0 30px #2563eb40' },
}