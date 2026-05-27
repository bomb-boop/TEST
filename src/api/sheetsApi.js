// Use server-side proxy endpoint to avoid CORS / login redirects when deployed

// ── CSV 파서 ────────────────────────────────────────────────
function parseCSVLine(line) {
  const result = []
  let inQuotes = false
  let cur = ''
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === ',' && !inQuotes) { result.push(cur.trim()); cur = ''; continue }
    cur += ch
  }
  result.push(cur.trim())
  return result
}

export function parseCSV(text) {
  const rawLines = text.split(/\r?\n/).filter(l => l.trim())
  if (rawLines.length === 0) return { headers: [], rows: [] }
  const headers = parseCSVLine(rawLines[0])
  const rows = rawLines.slice(1).map(line => {
    const vals = parseCSVLine(line)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = vals[i] ?? '' })
    return obj
  })
  return { headers, rows }
}

// ── raw CSV fetch (헤더 중복 시트용, e.g. B2C) ────────────────
export async function fetchSheetRaw(sheetName) {
  try {
    const url = `/api/proxy?sheet=${encodeURIComponent(sheetName)}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status}${body ? ` — ${body}` : ''}`)
    }
    const text = await res.text()
    if (text.includes('accounts.google.com') || text.includes('ServiceLogin'))
      throw new Error('시트 접근 권한 없음 (공유 설정 확인)')
    return { text, error: null }
  } catch (e) {
    console.warn(`[fetchSheetRaw] ${sheetName}:`, e.message)
    return { text: '', error: e.message }
  }
}

// ── fetch 래퍼 ───────────────────────────────────────────────
export async function fetchSheet(sheetName) {
  try {
    const url = `/api/proxy?sheet=${encodeURIComponent(sheetName)}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status}${body ? ` — ${body}` : ''}`)
    }
    const text = await res.text()
    // Google 로그인 페이지가 반환된 경우 감지
    if (text.includes('accounts.google.com') || text.includes('ServiceLogin')) {
      throw new Error('시트 접근 권한 없음 (공유 설정 확인)')
    }
    return parseCSV(text)
  } catch (e) {
    console.warn(`[fetchSheet] ${sheetName}:`, e.message)
    return { headers: [], rows: [], error: e.message }
  }
}
