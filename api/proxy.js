import fetch from 'node-fetch'

// Simple proxy to fetch Google Sheets CSV server-side and return as text.
// Usage: /api/proxy?sheet=Sheet%20Name
export default async function handler(req, res) {
  try {
    const sheet = req.query.sheet
    if (!sheet) return res.status(400).send('Missing sheet param')

    // Build Google CSV export URL from request host config.
    // The SPREADSHEET_ID is embedded here to avoid exposing direct fetch from client.
    const SPREADSHEET_ID = '1rTFpGZr3gpBZdhga74x4Ik_hzu8jSCBQTmda8R0MZbs'
    const encoded = encodeURIComponent(sheet)
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encoded}`

    const r = await fetch(url)
    if (!r.ok) return res.status(r.status).send(`Upstream HTTP ${r.status}`)
    const text = await r.text()

    // Basic check for Google login page
    if (text.includes('accounts.google.com') || text.includes('ServiceLogin')) {
      return res.status(403).send('Sheet not public')
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).send(text)
  } catch (e) {
    console.error('[proxy] error', e)
    return res.status(500).send('Proxy error')
  }
}
