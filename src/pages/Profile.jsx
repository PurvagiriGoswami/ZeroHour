import { useState, useEffect } from 'react'
import { auth, db } from '../firebase'
import { updateProfile, sendPasswordResetEmail, deleteUser } from 'firebase/auth'
import { doc, deleteDoc } from 'firebase/firestore'
import { useAppStore } from '../store/useStore'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { EXAMS } from '../data'

export default function Profile() {
  const user = auth.currentUser
  const toast = useToast()
  const confirm = useConfirm()
  const settings = useAppStore(s => s.settings)
  const setSettings = useAppStore(s => s.setSettings)
  const [name, setName] = useState(user?.displayName || settings.name || '')
  const [targetExam, setTargetExam] = useState(settings.targetExam || 'CDS I')
  const [examDate, setExamDate] = useState(settings.afcatDate || '')
  const [currentMock, setCurrentMock] = useState(settings.currentMockScore || 0)
  const [targetMock, setTargetMock] = useState(settings.targetMockScore || 0)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.displayName || settings.name || '')
    }
  }, [user, settings.name])

  const handleSave = async () => {
    try {
      if (user) {
        await updateProfile(user, { displayName: name })
      }
      setSettings({ 
        name, 
        targetExam, 
        afcatDate: examDate,
        currentMockScore: +currentMock,
        targetMockScore: +targetMock
      })
      toast('Profile updated successfully', 'ok')
      setIsEditing(false)
    } catch (err) {
      toast(err.message, 'err')
    }
  }

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email)
      toast('Password reset email sent!', 'ok')
    } catch (err) {
      toast(err.message, 'err')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      toast('Please type DELETE to confirm', 'warn')
      return
    }

    try {
      // 1. Delete Firestore data
      await deleteDoc(doc(db, 'users', user.uid, 'userData', 'main'))
      await deleteDoc(doc(db, 'users', user.uid)) // Base doc if exists

      // 2. Delete Auth user
      await deleteUser(user)
      toast('Account deleted successfully', 'ok')
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        toast('Please sign out and sign back in to delete your account', 'err')
      } else {
        toast(err.message, 'err')
      }
    }
  }

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
  const isEmailProvider = user?.providerData[0]?.providerId === 'password'

  return (
    <div className="page-inner fade-in">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Avatar" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', border: '2px solid var(--indigo)', marginBottom: '16px' }} 
            />
          ) : (
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              background: 'var(--bg3)', 
              color: 'var(--indigo)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '32px', 
              fontWeight: '800',
              border: '2px solid var(--indigo)',
              margin: '0 auto 16px'
            }}>
              {initials}
            </div>
          )}
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>{name}</h1>
          <p style={{ color: 'var(--text4)', fontSize: '14px' }}>{user?.email}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="g2 keep">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase' }}>Display Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={!isEditing}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase' }}>Target Exam</label>
              <select 
                value={targetExam} 
                onChange={(e) => setTargetExam(e.target.value)} 
                disabled={!isEditing}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)' }}
              >
                {EXAMS.map(ex => <option key={ex.i} value={ex.l}>{ex.l}</option>)}
              </select>
            </div>
          </div>

          <div className="g2 keep">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase' }}>Exam Date</label>
              <input 
                type="date" 
                value={examDate} 
                onChange={(e) => setExamDate(e.target.value)} 
                disabled={!isEditing}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase' }}>Current Mock Score</label>
              <input 
                type="number" 
                value={currentMock} 
                onChange={(e) => setCurrentMock(e.target.value)} 
                disabled={!isEditing}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)' }}
              />
            </div>
          </div>

          <div className="g2 keep">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase' }}>Target Mock Score</label>
              <input 
                type="number" 
                value={targetMock} 
                onChange={(e) => setTargetMock(e.target.value)} 
                disabled={!isEditing}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase' }}>Joined Date</label>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text4)', fontSize: '14px' }}>
                {new Date(user?.metadata?.creationTime).toLocaleDateString()}
              </div>
            </div>
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-g" style={{ flex: 1 }} onClick={handleSave}>Save Changes</button>
              <button className="btn" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          ) : (
            <button className="btn btn-c" onClick={() => setIsEditing(true)}>Edit Profile</button>
          )}

          {isEmailProvider && (
            <button className="btn" style={{ background: 'transparent', borderColor: 'var(--border3)' }} onClick={handlePasswordReset}>
              Send Password Reset Email
            </button>
          )}

          <div style={{ marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--red)', marginBottom: '16px' }}>Danger Zone</h2>
            <div style={{ background: 'rgba(248, 81, 73, 0.05)', border: '1px solid rgba(248, 81, 73, 0.2)', borderRadius: '12px', padding: '20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>
                Deleting your account is permanent and will erase all your progress and data.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  type="text" 
                  placeholder='Type "DELETE" to confirm' 
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)' }}
                />
                <button 
                  className="btn btn-r" 
                  onClick={() => confirm('DELETE ACCOUNT', 'Are you absolutely sure? This cannot be undone.', handleDeleteAccount)}
                  disabled={deleteInput !== 'DELETE'}
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </div>

          <button className="btn" style={{ marginTop: '16px', background: 'var(--bg3)', color: 'var(--text2)' }} onClick={() => auth.signOut()}>
            Sign Out
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <code style={{ fontSize: '10px', color: 'var(--text5)' }}>UID: {user?.uid}</code>
          </div>
        </div>
      </div>
    </div>
  )
}
