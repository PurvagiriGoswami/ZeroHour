// ── Weakness Engine ── AI-like performance tracking

/**
 * Determine weakness level from accuracy percentage
 * @param {number} accuracy - 0 to 100
 * @returns {{ level: string, color: string, label: string, emoji: string }}
 */
export function getWeaknessLevel(accuracy) {
  if (accuracy < 60) return { level: 'weak', color: '#ef4444', label: 'Weak', emoji: '🔴' }
  if (accuracy < 80) return { level: 'moderate', color: '#eab308', label: 'Moderate', emoji: '🟡' }
  return { level: 'strong', color: '#22c55e', label: 'Strong', emoji: '🟢' }
}

/**
 * Analyze subject-wise performance from quiz results
 * @param {Array} quizResults - Array of quiz result objects
 * @returns {Object} - { subject: { correct, total, accuracy, weakness } }
 */
export function analyzeSubjectPerformance(quizResults) {
  const subjects = {}
  quizResults.forEach(qr => {
    if (!qr.answers) return
    qr.answers.forEach(a => {
      const sub = a.subject || 'General'
      if (!subjects[sub]) subjects[sub] = { correct: 0, total: 0 }
      subjects[sub].total++
      if (a.isCorrect) subjects[sub].correct++
    })
  })
  Object.keys(subjects).forEach(sub => {
    const s = subjects[sub]
    s.accuracy = s.total > 0 ? Math.round(s.correct / s.total * 100) : 0
    s.weakness = getWeaknessLevel(s.accuracy)
  })
  return subjects
}

/**
 * Analyze topic-wise performance from quiz results
 * @param {Array} quizResults
 * @returns {Object} - { topic: { correct, total, accuracy, weakness } }
 */
export function analyzeTopicPerformance(quizResults) {
  const topics = {}
  quizResults.forEach(qr => {
    if (!qr.answers) return
    qr.answers.forEach(a => {
      const topic = a.topic || a.type || 'General'
      if (!topics[topic]) topics[topic] = { correct: 0, total: 0 }
      topics[topic].total++
      if (a.isCorrect) topics[topic].correct++
    })
  })
  Object.keys(topics).forEach(t => {
    const s = topics[t]
    s.accuracy = s.total > 0 ? Math.round(s.correct / s.total * 100) : 0
    s.weakness = getWeaknessLevel(s.accuracy)
  })
  return topics
}

/**
 * Get weak areas sorted by severity for plan generation
 * @param {Array} quizResults
 * @returns {Array} - sorted weak topics
 */
export function getWeakAreas(quizResults) {
  const topics = analyzeTopicPerformance(quizResults)
  return Object.entries(topics)
    .map(([topic, data]) => ({ topic, ...data }))
    .filter(t => t.accuracy < 80)
    .sort((a, b) => a.accuracy - b.accuracy)
}

/**
 * Calculate overall accuracy from quiz history
 * @param {Array} quizResults
 * @returns {number}
 */
export function getOverallAccuracy(quizResults) {
  let correct = 0, total = 0
  quizResults.forEach(qr => {
    correct += qr.score || 0
    total += qr.totalQuestions || 0
  })
  return total > 0 ? Math.round(correct / total * 100) : 0
}

/**
 * Get performance trend (last N quizzes)
 * @param {Array} quizResults
 * @param {number} count
 * @returns {Array} - [{ date, accuracy, score, total }]
 */
export function getPerformanceTrend(quizResults, count = 10) {
  return [...quizResults]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, count)
    .reverse()
    .map(qr => ({
      date: qr.date,
      accuracy: qr.totalQuestions > 0 ? Math.round(qr.score / qr.totalQuestions * 100) : 0,
      score: qr.score,
      total: qr.totalQuestions,
    }))
}
