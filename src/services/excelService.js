import * as XLSX from 'xlsx'

/**
 * Export all data to a structured Excel file with multiple sheets.
 */
export function exportToExcel({ zh_sessions, zh_topicMap, zh_mocks, zh_weeklyChecks }) {
  try {
    const wb = XLSX.utils.book_new()
    let hasAnySheet = false

    // Sheet 1: Sessions
    if (zh_sessions && zh_sessions.length > 0) {
      const sessionData = zh_sessions.map(s => ({
        'Date': s.date,
        'Subject': s.subject,
        'Topic': s.topic,
        'Phase': s.phase,
        'Duration (m)': s.duration,
        'Score (%)': s.score || '-',
        'Notes': s.notes || ''
      }))
      const ws = XLSX.utils.json_to_sheet(sessionData)
      XLSX.utils.book_append_sheet(wb, ws, 'Sessions')
      hasAnySheet = true
    }

    // Sheet 2: Topic Map
    if (zh_topicMap && Object.keys(zh_topicMap).length > 0) {
      const topicData = Object.entries(zh_topicMap).map(([key, data]) => ({
        'Subject': key.split('::')[0],
        'Topic': key.split('::')[1],
        'First Studied': data.firstStudied,
        'Revisits Count': (data.revisits || []).length
      }))
      const ws = XLSX.utils.json_to_sheet(topicData)
      XLSX.utils.book_append_sheet(wb, ws, 'Topic Map')
      hasAnySheet = true
    }

    // Sheet 3: Mocks
    if (zh_mocks && zh_mocks.length > 0) {
      const mockData = zh_mocks.map(m => ({
        'Date': m.date,
        'Type': m.type,
        'Total %': m.total,
        'Math %': m.math,
        'English %': m.english,
        'GK %': m.gk,
        'Science %': m.science,
        'Notes': m.notes || ''
      }))
      const ws = XLSX.utils.json_to_sheet(mockData)
      XLSX.utils.book_append_sheet(wb, ws, 'Mocks')
      hasAnySheet = true
    }

    if (!hasAnySheet) {
      return { ok: false, error: 'No data to export.' }
    }

    const filename = `ZeroHour_Export_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, filename)
    return { ok: true, filename }
  } catch (err) {
    return { ok: false, error: err?.message || 'Export failed.' }
  }
}

export function importFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const result = {}
        // Basic parsing logic can be added here if needed, 
        // but typically users prefer JSON for full state restoration.
        resolve(result)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}
