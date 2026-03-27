import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../firebase'
import { 
  onAuthStateChanged, 
  sendPasswordResetEmail, 
  sendEmailVerification,
  signOut
} from 'firebase/auth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const idToken = await user.getIdToken()
        setToken(idToken)
      } else {
        setToken(null)
      }
    })
    return () => unsubscribe()
  }, [])

  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email)
  }

  const verifyEmail = async () => {
    if (user) return sendEmailVerification(user)
  }

  const logout = async () => {
    return signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, token, resetPassword, verifyEmail, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)