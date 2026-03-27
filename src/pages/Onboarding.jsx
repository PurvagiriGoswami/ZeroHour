import { useState, useEffect } from 'react'
import { auth, db } from '../firebase'
import { updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useAppStore } from '../store/useStore'
import { useToast } from '../Toast'
import { EXAMS, makeSyl } from '../data'

export default function Onboarding({ onComplete }) {
  const user = auth.currentUser
  const toast = useToast()
  const store = useAppStore()
  const [step, setStep] = useState(1)
  const [name, setName] = useState(user?.displayName || '')
  const [targetExam, setTargetExam] = useState('CDS I')
  const [examDate, setExamDate] = useState('')
  const [currentScore, setCurrentScore] = useState(0)
  const [targetScore, setTargetScore] = useState(150)

  const handleComplete = async (type = 'fresh') => {
    try {
      const uid = user.uid
      
      // Update Auth Profile
      await updateProfile(user, { displayName: name })
      
      // Update Store Settings
      store.setSettings({
        name,
        targetExam,
        afcatDate: examDate,
        currentMockScore: +currentScore,
        targetMockScore: +targetScore
      })

      if (type === 'fresh') {
        store.setSyl(makeSyl())
      }

      // Mark onboarding as complete in Firestore
      await setDoc(doc(db, 'users', uid, 'meta', 'onboardingComplete'), {
        onboardingComplete: true,
        completedAt: new Date().toISOString(),
        exam: targetExam,
        date: examDate
      })

      onComplete()
    } catch (err) {
      toast(err.message, 'err')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (data.vocab) store.setVocab(data.vocab)
      if (data.syl) store.setSyl(data.syl)
      if (data.mocks) store.setMocks(data.mocks)
      if (data.logs) store.setLogs(data.logs)
      if (data.habs) store.setHabs(data.habs)
      if (data.revision) store.setRevision(data.revision)
      if (data.settings) store.setSettings(data.settings)
      
      toast('Backup data loaded successfully', 'ok')
      handleComplete('import')
    } catch (err) {
      toast('Invalid backup file', 'err')
    }
  }

  const gap = targetScore - currentScore
  const motivation = gap > 80 ? "Ambitious. Let's build the machine." : gap > 40 ? "Steady progress wins the war." : "Within reach. Refine the edges."

  return (
    <div style={{
      height: '100vh', width: '100vw', background: 'var(--bg)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="pop-in" style={{
        width: '100%', maxWidth: '500px', background: 'var(--bg2)', 
        border: '1px solid var(--border)', borderRadius: '24px', padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
      }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text4)', letterSpacing: '2px' }}>STEP {step} OF 4</span>
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--indigo)', letterSpacing: '2px' }}>{Math.round(step/4*100)}% COMPLETE</span>
          </div>
          <div style={{ height: '4px', background: 'var(--bg3)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--indigo)', width: `${(step/4)*100}%`, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </div>
        </div>

        {step === 1 && (
          <div className="fade-in">
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', fontFamily: "'Orbitron', sans-serif" }}>WELCOME</h1>
            <p style={{ color: 'var(--text3)', marginBottom: '32px' }}>What should we call you, soldier?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text4)', textTransform: 'uppercase' }}>Your Callsign</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Name / Alias"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', color: 'var(--text)', fontSize: '16px' }}
              />
            </div>
            <button className="btn btn-c" style={{ width: '100%', marginTop: '32px', padding: '16px' }} onClick={() => setStep(2)}>NEXT STEP</button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '32px', fontFamily: "'Orbitron', sans-serif" }}>MISSION TARGET</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {['CDS I', 'CDS II', 'AFCAT', 'NDA'].map(ex => (
                <button 
                  key={ex}
                  onClick={() => setTargetExam(ex)}
                  style={{
                    padding: '16px', borderRadius: '12px', border: `1px solid ${targetExam === ex ? 'var(--indigo)' : 'var(--border)'}`,
                    background: targetExam === ex ? 'rgba(99,102,241,0.1)' : 'var(--bg3)',
                    color: targetExam === ex ? 'var(--text)' : 'var(--text3)',
                    fontWeight: '700', fontSize: '14px', transition: 'all 0.2s'
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text4)', textTransform: 'uppercase' }}>Examination Date</label>
              <input 
                type="date" 
                value={examDate} 
                onChange={(e) => setExamDate(e.target.value)}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', color: 'var(--text)', fontSize: '16px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setStep(1)}>BACK</button>
              <button className="btn btn-c" style={{ flex: 2 }} onClick={() => setStep(3)}>CONTINUE</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in">
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px', fontFamily: "'Orbitron', sans-serif" }}>SCORE TARGETS</h1>
            <p style={{ color: 'var(--indigo)', fontSize: '13px', fontWeight: '700', marginBottom: '32px' }}>{motivation}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text4)', textTransform: 'uppercase' }}>Current Mock Score</label>
                <input 
                  type="number" 
                  value={currentScore} 
                  onChange={(e) => setCurrentScore(e.target.value)}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', color: 'var(--text)', fontSize: '16px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text4)', textTransform: 'uppercase' }}>Target Score</label>
                <input 
                  type="number" 
                  value={targetScore} 
                  onChange={(e) => setTargetScore(e.target.value)}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', color: 'var(--text)', fontSize: '16px' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setStep(2)}>BACK</button>
              <button className="btn btn-c" style={{ flex: 2 }} onClick={() => setStep(4)}>LAST STEP</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="fade-in">
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '32px', fontFamily: "'Orbitron', sans-serif" }}>INITIALIZATION</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
                onClick={() => handleComplete('fresh')}
                style={{
                  padding: '24px', borderRadius: '16px', border: '1px solid var(--border)',
                  background: 'var(--bg3)', textAlign: 'left', cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>✨ Start Fresh</div>
                <div style={{ fontSize: '12px', color: 'var(--text4)' }}>Initialize with default syllabus and empty logs.</div>
              </button>
              
              <label style={{
                padding: '24px', borderRadius: '16px', border: '1px solid var(--border)',
                background: 'var(--bg3)', textAlign: 'left', cursor: 'pointer', display: 'block'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>📥 Import Backup</div>
                <div style={{ fontSize: '12px', color: 'var(--text4)' }}>Restore your data from a ZeroHour .json file.</div>
                <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
            <button className="btn" style={{ width: '100%', marginTop: '32px' }} onClick={() => setStep(3)}>BACK</button>
          </div>
        )}
      </div>
    </div>
  )
}
