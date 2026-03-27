import { useState } from 'react'
import { auth, googleProvider, facebookProvider, appleProvider } from '../firebase'
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth'
import { useAuth } from '../context/AuthContext'
import { validateEmail, validatePassword, sanitizeInput } from '../utils/authValidation'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [view, setView] = useState('login') // login, signup, reset
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleProviderSignIn = async (provider) => {
    setError('')
    setLoading(true)
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    // Sanitize and Validate
    const sEmail = sanitizeInput(email)
    const sPassword = sanitizeInput(password)
    const sName = sanitizeInput(name)

    const emailErr = validateEmail(sEmail)
    if (emailErr) { setError(emailErr); setLoading(false); return }

    if (view !== 'reset') {
      const passErr = validatePassword(sPassword)
      if (passErr) { setError(passErr); setLoading(false); return }
    }

    try {
      if (view === 'signup') {
        const res = await createUserWithEmailAndPassword(auth, sEmail, sPassword)
        await updateProfile(res.user, { displayName: sName })
        await sendEmailVerification(res.user)
        setMessage('Account created! Please check your email for verification.')
      } else if (view === 'login') {
        await signInWithEmailAndPassword(auth, sEmail, sPassword)
      } else if (view === 'reset') {
        await resetPassword(sEmail)
        setMessage('Password reset email sent. Please check your inbox.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px'
    }}>
      <div className="pop-in" style={{
        width: '100%', maxWidth: '440px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1.5px', color: 'var(--text)', marginBottom: '8px', fontFamily: "'Orbitron', sans-serif" }}>
            ZEROHOUR
          </h1>
          <p style={{ color: 'var(--text4)', fontSize: '14px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {view === 'reset' ? 'System Recovery' : 'Defence Command Center'}
          </p>
        </div>

        {error && <div style={{ background: 'rgba(248, 81, 73, 0.1)', border: '1px solid var(--red)', color: 'var(--red)', padding: '14px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px', textAlign: 'center', fontWeight: '600' }}>{error}</div>}
        {message && <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--indigo)', color: 'var(--indigo)', padding: '14px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px', textAlign: 'center', fontWeight: '600' }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {view === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Cadet Name" required style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', color: 'var(--text)', fontSize: '14px', outline: 'none' }} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="soldier@zerohour.com" required style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', color: 'var(--text)', fontSize: '14px', outline: 'none' }} />
          </div>

          {view !== 'reset' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                {view === 'login' && (
                  <button type="button" onClick={() => setView('reset')} style={{ background: 'none', border: 'none', color: 'var(--indigo)', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}>Forgot Password?</button>
                )}
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', color: 'var(--text)', fontSize: '14px', outline: 'none' }} />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn" style={{ marginTop: '8px', background: 'var(--indigo)', borderColor: 'var(--indigo)', color: '#fff', width: '100%', height: '52px', borderRadius: '14px', fontWeight: '800', fontSize: '15px' }}>
            {loading ? 'AUTHENTICATING...' : (view === 'signup' ? 'CREATE COMMANDER ACCOUNT' : view === 'reset' ? 'SEND RECOVERY EMAIL' : 'INITIATE LOGIN')}
          </button>
        </form>

        {view !== 'reset' && (
          <>
            <div style={{ margin: '32px 0', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text4)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              Secure Access
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <button onClick={() => handleProviderSignIn(googleProvider)} disabled={loading} className="btn" style={{ background: 'var(--bg3)', height: '52px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.173.282-1.712V4.956H.957a8.991 8.991 0 0 0 0 8.088l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.956l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              </button>
              <button onClick={() => handleProviderSignIn(facebookProvider)} disabled={loading} className="btn" style={{ background: 'var(--bg3)', height: '52px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button onClick={() => handleProviderSignIn(appleProvider)} disabled={loading} className="btn" style={{ background: 'var(--bg3)', height: '52px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.202-.029 2.308-1.17c1.106-1.14 1.07-2.364 1.047-2.454z"/><path d="M9 4.1a4.2 4.2 0 0 0-2 .4c-1.2.6-2.3.6-3 0-1.2-.6-2-1.3-3.4 0-1.2 1.2-2.1 3.4-1.6 5.8.5 2.4 2.2 4.1 3.5 4.1 1.2 0 2.1-.4 3.1-.4s1.9.4 3.1.4c1.3 0 3-1.7 3.5-4.1.5-2.4-.4-4.6-1.6-5.8-1.4-1.3-2.2-.6-3.4 0z"/></svg>
              </button>
            </div>
          </>
        )}

        <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: 'var(--text3)', fontWeight: '600' }}>
          {view === 'login' ? "Don't have an account?" : view === 'signup' ? "Already a commander?" : "Remembered your password?"}{' '}
          <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} style={{ background: 'none', border: 'none', color: 'var(--indigo)', fontWeight: '800', cursor: 'pointer', padding: 0 }}>
            {view === 'login' ? 'SIGN UP' : 'SIGN IN'}
          </button>
        </p>
      </div>
    </div>
  )
}