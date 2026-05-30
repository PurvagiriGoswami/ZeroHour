import { useState, useEffect, useMemo } from 'react'
import { auth, db } from '../firebase'
import { updateProfile, sendPasswordResetEmail, deleteUser } from 'firebase/auth'
import { doc, deleteDoc } from 'firebase/firestore'
import { useAppStore } from '../store/useStore'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { EXAMS, MASTER_TOPICS } from '../data'

export default function Profile() {
  const user = auth.currentUser
  const toast = useToast()
  const confirm = useConfirm()
  const { profile, setProfile, zh_sessions, zh_mocks, zh_topicMap, streak } = useAppStore()
  
  const [name, setName] = useState(profile.name || user?.displayName || '')
  const [tagline, setTagline] = useState(profile.tagline || 'Ready for Battle')
  const [targetExam, setTargetExam] = useState(profile.targetExam || 'CDS')
  
  const [isEditing, setIsEditing] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  // ── Aggregate Stats ──
  const stats = useMemo(() => {
    // Total Hours
    const totalMinutes = zh_sessions.reduce((acc, s) => acc + (parseInt(s.duration) || 0), 0)
    const totalHours = (totalMinutes / 60).toFixed(1)

    // Personal Bests
    const cdsMocks = zh_mocks.filter(m => m.type === 'CDS')
    const afcatMocks = zh_mocks.filter(m => m.type === 'AFCAT')
    const pbCDS = cdsMocks.length ? Math.max(...cdsMocks.map(m => m.calculatedMarks?.total || 0)) : 0
    const pbAFCAT = afcatMocks.length ? Math.max(...afcatMocks.map(m => m.calculatedMarks?.total || 0)) : 0

    // Topic Completion
    let totalTopics = 0
    Object.values(MASTER_TOPICS).forEach(sub => {
      Object.values(sub.categories).forEach(cat => {
        totalTopics += cat.topics.length
      })
    })
    const confidentTopics = Object.values(zh_topicMap).filter(t => t.state === 'Confident').length
    const completionRate = totalTopics > 0 ? ((confidentTopics / totalTopics) * 100).toFixed(1) : 0

    return { totalHours, pbCDS, pbAFCAT, completionRate, confidentTopics, totalTopics }
  }, [zh_sessions, zh_mocks, zh_topicMap])

  useEffect(() => {
    if (user && !profile.name) {
      setName(user.displayName || '')
    }
  }, [user, profile.name])

  const handleSave = async () => {
    try {
      if (user && name !== user.displayName) {
        await updateProfile(user, { displayName: name })
      }
      setProfile({ name, tagline, targetExam })
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
      await deleteDoc(doc(db, 'users', user.uid, 'userData', 'main'))
      await deleteDoc(doc(db, 'users', user.uid))
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
    <div className="page-inner fade-in" style={{ paddingBottom: '100px' }}>
      {/* ── Motivational Banner ── */}
      <div className="motivational-banner">
        <div className="banner-content">
          <div className="tagline">{tagline.toUpperCase()}</div>
          <div className="decoration" />
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* ── Profile Info ── */}
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div className="avatar-ring">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">{initials}</div>
              )}
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', margin: '10px 0 5px' }}>{name}</h1>
            <p style={{ color: 'var(--text4)', fontSize: '12px' }}>{user?.email}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label-caps">Name</label>
              <input 
                type="text" className="inp" value={name} 
                onChange={e => setName(e.target.value)} disabled={!isEditing}
              />
            </div>
            <div>
              <label className="label-caps">Tagline</label>
              <input 
                type="text" className="inp" value={tagline} 
                onChange={e => setTagline(e.target.value)} disabled={!isEditing}
              />
            </div>
            <div className="g2">
              <div>
                <label className="label-caps">Target Exam</label>
                <select className="inp" value={targetExam} onChange={e => setTargetExam(e.target.value)} disabled={!isEditing}>
                  <option value="CDS">CDS</option>
                  <option value="AFCAT">AFCAT</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

            {isEditing ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-g" style={{ flex: 1 }} onClick={handleSave}>SAVE</button>
                <button className="btn" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>CANCEL</button>
              </div>
            ) : (
              <button className="btn btn-c" style={{ width: '100%' }} onClick={() => setIsEditing(true)}>EDIT PROFILE</button>
            )}
          </div>
        </div>

        {/* ── Stats Overview ── */}
        <div className="card" style={{ borderColor: 'var(--cyan)' }}>
          <div className="label-caps" style={{ color: 'var(--cyan)', marginBottom: '20px' }}>Service Record</div>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="icon">🔥</div>
              <div className="val">{streak.current}</div>
              <div className="lbl">Current Streak</div>
              <div className="sub">Best: {streak.longest} days</div>
            </div>
            <div className="stat-item">
              <div className="icon">⏱</div>
              <div className="val">{stats.totalHours}</div>
              <div className="lbl">Hours Studied</div>
              <div className="sub">All-time duration</div>
            </div>
            <div className="stat-item">
              <div className="icon">🎯</div>
              <div className="val">{stats.pbCDS}</div>
              <div className="lbl">CDS Best</div>
              <div className="sub">Out of 300</div>
            </div>
            <div className="stat-item">
              <div className="icon">✈</div>
              <div className="val">{stats.pbAFCAT}</div>
              <div className="lbl">AFCAT Best</div>
              <div className="sub">Out of 375</div>
            </div>
          </div>

          <div className="progress-card" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="label-caps" style={{ fontSize: '10px' }}>Topic Map Completion</span>
              <span style={{ color: 'var(--green)', fontSize: '12px', fontWeight: '800' }}>{stats.completionRate}%</span>
            </div>
            <div className="full-progress">
              <div className="fill" style={{ width: `${stats.completionRate}%`, background: 'var(--green)' }} />
            </div>
            <div style={{ marginTop: '5px', fontSize: '10px', color: '#666' }}>
              {stats.confidentTopics} / {stats.totalTopics} Topics Confident
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '20px auto' }}>
        <div className="card" style={{ borderColor: 'var(--red)', background: 'rgba(239, 68, 68, 0.02)' }}>
          <div className="label-caps" style={{ color: 'var(--red)', marginBottom: '15px' }}>Danger Zone</div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>Type "DELETE" to permanently erase your tactical data.</p>
              <input 
                type="text" className="inp" placeholder='DELETE' 
                value={deleteInput} onChange={e => setDeleteInput(e.target.value.toUpperCase())} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn btn-r" disabled={deleteInput !== 'DELETE'} onClick={handleDeleteAccount}>PURGE ACCOUNT</button>
              <button className="btn" onClick={() => auth.signOut()}>LOGOUT</button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .motivational-banner {
          width: 100%; height: 120px; background: #0a0a0a; border: 1px solid var(--border); 
          margin-bottom: 30px; display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; border-radius: 12px;
        }
        .banner-content { text-align: center; z-index: 2; }
        .tagline { font-family: 'Orbitron', sans-serif; font-size: 1.8rem; color: #ffd700; letter-spacing: 4px; text-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
        .decoration { position: absolute; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #ffd700, transparent); bottom: 20%; }
        
        .avatar-ring { 
          width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--indigo); 
          padding: 4px; margin: 0 auto; display: flex; align-items: center; justify-content: center;
        }
        .avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .avatar-placeholder { 
          width: 100%; height: 100%; border-radius: 50%; background: var(--bg3); 
          display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: var(--indigo);
        }

        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .stat-item { background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; border: 1px solid var(--border); text-align: center; }
        .stat-item .icon { font-size: 1.2rem; margin-bottom: 5px; }
        .stat-item .val { font-family: 'Orbitron', sans-serif; font-size: 1.4rem; color: white; }
        .stat-item .lbl { font-size: 10px; color: #888; text-transform: uppercase; margin: 2px 0; }
        .stat-item .sub { font-size: 9px; color: #555; }

        .full-progress { width: 100%; height: 6px; background: #222; border-radius: 3px; overflow: hidden; }
        .full-progress .fill { height: 100%; transition: 1s; }

        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          .tagline { font-size: 1.2rem; }
        }
      `}</style>
    </div>
  )
}
