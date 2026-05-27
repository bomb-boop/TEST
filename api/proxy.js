// Simple proxy to fetch Google Sheets CSV server-side and return as text.
// Uses Node.js 18+ built-in fetch (no node-fetch needed)
// Usage: /api/proxy?sheet=Sheet%20Name

const SPREADSHEET_ID = '1rTFpGZr3gpBZdhga74x4Ik_hzu8jSCBQTmda8R0MZbs'

// fetch 재시도 헬퍼 (최대 3회)
async function fetchWithRetry(url, attempts = 3) {
  let lastErr
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(url, { redirect: 'follow' })
      return r
    } catch (e) {
      lastErr = e
      console.warn(`[proxy] attempt ${i + 1} failed: ${e.message}`)
    }
  }
  throw lastErr
}

export default async function handler(req, res) {
  try {
    const sheet = req.query.sheet
    if (!sheet) return res.status(400).send('Missing sheet param')

    const encoded = encodeURIComponent(sheet)
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encoded}`

    const r = await fetchWithRetry(url)

    if (!r.ok) {
      console.error(`[proxy] upstream error ${r.status} for sheet: ${sheet}`)
      return res.status(r.status).send(`Upstream HTTP ${r.status}`)
    }

    const text = await r.text()

    // Google 로그인 페이지 감지
    if (text.includes('accounts.google.com') || text.includes('ServiceLogin')) {
      return res.status(403).send('Sheet not public')
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).send(text)

  } catch (e) {
    console.error('[proxy] error', e.name, e.message)
    return res.status(500).send(`Proxy error: ${e.message}`)
  }
}
