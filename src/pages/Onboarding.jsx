import { useState } from 'react'
import { auth, db } from '../firebase'
import { updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useAppStore } from '../store/useStore'
import { useToast } from '../Toast'
import { EXAMS } from '../data'

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

  const handleComplete = async () => {
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
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '12px' }}>Operational Setup</h1>
            <p style={{ color: 'var(--text4)', fontSize: '14px', marginBottom: '32px' }}>Identify yourself, Aspirant. What name will the system track?</p>
            <div style={{ marginBottom: '32px' }}>
              <label className="label-caps" style={{ display: 'block', marginBottom: '8px' }}>Callsign / Name</label>
              <input 
                className="inp" 
                placeholder="Enter your name" 
                value={name} 
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
            <button className="btn btn-c" style={{ width: '100%' }} onClick={() => setStep(2)} disabled={!name}>NEXT PHASE →</button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '12px' }}>Primary Objective</h1>
            <p style={{ color: 'var(--text4)', fontSize: '14px', marginBottom: '32px' }}>Which theatre of operations are you deploying to?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {EXAMS.map(ex => (
                <button 
                  key={ex.i}
                  className={`btn ${targetExam === ex.l ? 'active' : ''}`}
                  style={{ justifyContent: 'space-between', padding: '16px 20px' }}
                  onClick={() => { setTargetExam(ex.l); if(ex.d) setExamDate(ex.d) }}
                >
                  <span>{ex.l}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text4)' }}>{ex.d || 'TBD'}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setStep(1)}>← BACK</button>
              <button className="btn btn-c" style={{ flex: 2 }} onClick={() => setStep(3)}>NEXT PHASE →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in">
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '12px' }}>Target Parameters</h1>
            <p style={{ color: 'var(--text4)', fontSize: '14px', marginBottom: '32px' }}>Set your benchmarks. What is your current readiness level?</p>
            <div className="g2 keep" style={{ marginBottom: '32px' }}>
              <div>
                <label className="label-caps" style={{ display: 'block', marginBottom: '8px' }}>Current Avg %</label>
                <input 
                  type="number" className="inp" placeholder="0" 
                  value={currentScore} onChange={e => setCurrentScore(e.target.value)}
                />
              </div>
              <div>
                <label className="label-caps" style={{ display: 'block', marginBottom: '8px' }}>Target Avg %</label>
                <input 
                  type="number" className="inp" placeholder="150" 
                  value={targetScore} onChange={e => setTargetScore(e.target.value)}
                />
              </div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(57, 197, 207, 0.05)', borderRadius: '12px', border: '1px solid rgba(57, 197, 207, 0.2)', marginBottom: '32px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--cyan)', letterSpacing: '1px', marginBottom: '4px' }}>INTEL BRIEFING</div>
              <div style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: '600' }}>{motivation}</div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setStep(2)}>← BACK</button>
              <button className="btn btn-c" style={{ flex: 2 }} onClick={() => setStep(4)}>NEXT PHASE →</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="fade-in">
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '12px' }}>Final Authorization</h1>
            <p style={{ color: 'var(--text4)', fontSize: '14px', marginBottom: '32px' }}>System check complete. Ready to initiate mission protocol?</p>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
               <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛰️</div>
               <div className="label-caps" style={{ color: 'var(--green)' }}>Encryption Active</div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setStep(3)}>← BACK</button>
              <button className="btn btn-g" style={{ flex: 2 }} onClick={handleComplete}>INITIATE ZERO HOUR ↵</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
