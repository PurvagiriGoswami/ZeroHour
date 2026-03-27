// ── Excel Export/Import Service ── Using SheetJS (xlsx)

import * as XLSX from 'xlsx'
import { formatDate } from '../utils/dateUtils'

/**
 * Export all data to a structured Excel file with multiple sheets.
 * Returns { ok: true, filename } on success or { ok: false, error } on failure.
 */
export function exportToExcel({ vocab, quizResults, plannerTasks, revision, syl }) {
  try {
    const wb = XLSX.utils.book_new()
    let hasAnySheet = false

    // Sheet 1: Vocabulary
    if (vocab && vocab.length > 0) {
      const vocabData = vocab.map(v => ({
        'Word': v.word || '',
        'Meaning': v.meaning || '',
        'Example': v.example || '',
        'Synonyms': (v.synonyms || []).join(', '),
        'Antonyms': (v.antonyms || []).join(', '),
        'Important': v.isImportant ? 'Yes' : 'No',
        'Learned': v.learned ? 'Yes' : 'No',
        'Added On': formatDate(v.createdAt),
        'Revisions Done': (v.revisionDates || []).length,
      }))
      const ws1 = XLSX.utils.json_to_sheet(vocabData)
      ws1['!cols'] = [{ wch: 18 }, { wch: 35 }, { wch: 40 }, { wch: 30 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 14 }]
      XLSX.utils.book_append_sheet(wb, ws1, 'Vocabulary')
      hasAnySheet = true
    }

    // Sheet 2: Quiz Results
    if (quizResults && quizResults.length > 0) {
      const quizData = quizResults.map(qr => ({
        'Date': formatDate(qr.date),
        'Score': qr.score ?? 0,
        'Total Questions': qr.totalQuestions ?? 0,
        'Accuracy (%)': (qr.totalQuestions ?? 0) > 0 ? Math.round((qr.score ?? 0) / qr.totalQuestions * 100) : 0,
        'Type': qr.type || 'Mixed',
        'Time Taken (s)': qr.timeTaken || '-',
      }))
      const ws2 = XLSX.utils.json_to_sheet(quizData)
      ws2['!cols'] = [{ wch: 14 }, { wch: 8 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 14 }]
      XLSX.utils.book_append_sheet(wb, ws2, 'Quiz Results')
      hasAnySheet = true
    }

    // Sheet 3: Planner Tasks
    if (plannerTasks && plannerTasks.length > 0) {
      const planData = plannerTasks.map(t => ({
        'Date': formatDate(t.date),
        'Subject': t.subject || '',
        'Topic': t.topic || '',
        'Reason': t.reason || '',
        'Priority': t.priority || '',
        'Status': t.completed ? 'Done' : 'Pending',
      }))
      const ws3 = XLSX.utils.json_to_sheet(planData)
      ws3['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 10 }, { wch: 10 }]
      XLSX.utils.book_append_sheet(wb, ws3, 'Planner')
      hasAnySheet = true
    }

    // Sheet 4: Revision
    if (revision && syl && syl.length > 0) {
      const doneSyl = syl.filter(t => t.status === 'Done')
      if (doneSyl.length > 0) {
        const revData = doneSyl.map(t => {
          const rv = (revision || []).find(r => r.topicId === t.id) || {}
          return {
            'Subject': t.sub,
            'Topic': t.topic,
            'R1 Done': rv.r1Done ? 'Yes' : 'No',
            'R1 Date': rv.r1Date ? formatDate(rv.r1Date) : '-',
            'R2 Done': rv.r2Done ? 'Yes' : 'No',
            'R2 Date': rv.r2Date ? formatDate(rv.r2Date) : '-',
            'R3 Done': rv.r3Done ? 'Yes' : 'No',
            'R3 Date': rv.r3Date ? formatDate(rv.r3Date) : '-',
          }
        })
        const ws4 = XLSX.utils.json_to_sheet(revData)
        ws4['!cols'] = [{ wch: 12 }, { wch: 22 }, { wch: 8 }, { wch: 14 }, { wch: 8 }, { wch: 14 }, { wch: 8 }, { wch: 14 }]
        XLSX.utils.book_append_sheet(wb, ws4, 'Revision')
        hasAnySheet = true
      }
    }

    if (!hasAnySheet) {
      return { ok: false, error: 'No data to export. Add some data first.' }
    }

    const filename = `ZeroHour_Backup_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, filename)
    return { ok: true, filename }
  } catch (err) {
    console.error('Excel export error:', err)
    return { ok: false, error: err?.message || 'Export failed. Please try again.' }
  }
}

/**
 * Import data from Excel file
 * @param {File} file
 * @returns {Promise<Object>} - parsed data object
 */
export function importFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const result = {}

        // Parse Vocabulary sheet
        if (wb.SheetNames.includes('Vocabulary')) {
          const data = XLSX.utils.sheet_to_json(wb.Sheets['Vocabulary'])
          result.vocab = data.map(row => ({
            id: Date.now() + Math.random(),
            word: row['Word'] || '',
            meaning: row['Meaning'] || '',
            example: row['Example'] || '',
            synonyms: (row['Synonyms'] || '').split(',').map(s => s.trim()).filter(Boolean),
            antonyms: (row['Antonyms'] || '').split(',').map(s => s.trim()).filter(Boolean),
            isImportant: row['Important'] === 'Yes',
            learned: row['Learned'] === 'Yes',
            createdAt: new Date().toISOString().split('T')[0],
            revisionDates: [],
          }))
        }

        resolve(result)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}
