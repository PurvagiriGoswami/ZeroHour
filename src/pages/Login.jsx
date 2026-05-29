import { useState } from 'react'
import { auth, googleProvider } from '../firebase'
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    
    if (!auth) {
      setError('Firebase Authentication is not initialized. Please check your environment variables.')
      setLoading(false)
      return
    }

    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Google Sign-In Error:', err.code, err.message)
      
      let friendlyMessage = 'Google Sign-In failed. Please try again.'
      
      switch (err.code) {
        case 'auth/operation-not-allowed':
          friendlyMessage = 'Google Sign-In is not enabled in the Firebase Console. Go to Authentication > Sign-in method to enable it.'
          break
        case 'auth/unauthorized-domain':
          friendlyMessage = 'This domain is not authorized for Firebase Auth. Add it to "Authorized domains" in the Firebase Console.'
          break
        case 'auth/popup-blocked':
          friendlyMessage = 'Sign-in popup was blocked. Please enable popups and try again.'
          break
        case 'auth/popup-closed-by-user':
          friendlyMessage = 'Sign-in window was closed before completion. Please try again.'
          break
        case 'auth/invalid-request':
        case 'auth/invalid-action-code':
          friendlyMessage = 'Invalid request action. This can happen if your Firebase config is incorrect or Google Cloud OAuth is misconfigured.'
          break
        default:
          friendlyMessage = err.message
      }
      
      setError(friendlyMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        const res = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(res.user, { displayName: name })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '20px'
    }}>
      <div className="pop-in" style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            letterSpacing: '-1px',
            color: 'var(--text)',
            marginBottom: '8px'
          }}>
            ZeroHour
          </h1>
          <p style={{ color: 'var(--text4)', fontSize: '14px', fontWeight: '500' }}>
            AI Defence Prep System
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(248, 81, 73, 0.1)',
            border: '1px solid var(--red)',
            color: 'var(--red)',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSignUp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase' }}>Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'var(--text)',
                  fontSize: '14px'
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase' }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="soldier@zerohour.com"
              required
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px',
                color: 'var(--text)',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px',
                color: 'var(--text)',
                fontSize: '14px'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn"
            style={{ 
              marginTop: '8px',
              background: 'var(--indigo)',
              borderColor: 'var(--indigo)',
              color: '#fff',
              width: '100%'
            }}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{ 
          margin: '24px 0', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          color: 'var(--text5)',
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          OR
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn"
          style={{ width: '100%', background: 'transparent' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.173.282-1.712V4.956H.957a8.991 8.991 0 0 0 0 8.088l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.956l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ 
          marginTop: '24px', 
          textAlign: 'center', 
          fontSize: '14px', 
          color: 'var(--text3)',
          fontWeight: '500'
        }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--indigo)', 
              fontWeight: '700', 
              cursor: 'pointer',
              padding: 0
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}