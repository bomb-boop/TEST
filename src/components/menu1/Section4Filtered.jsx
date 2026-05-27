import { useState, useMemo } from 'react'
import { groupSum, groupSumItem, fmtKRWFull, fmtPct } from '../../utils/dataUtils.js'

// ── 필터 Select (options: string[] 또는 {value, label}[]) ────
function FilterSelect({ label, value, options, onChange }) {
  const normalized = options.map(o =>
    typeof o === 'string' ? { value: o, label: o } : o
  )
  return (
    <div className="filter-group">
      <label className="filter-label">{label}</label>
      <select className="filter-select" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">전체</option>
        {normalized.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ── 순위 테이블 ──────────────────────────────────────────────
function RankTable({ title, rows }) {
  const total = rows.reduce((s, r) => s + r.total, 0)
  return (
    <div>
      <div className="sub-table-title">{title}</div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>항목</th>
              <th>매출액</th>
              <th>비중</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>
                  데이터 없음
                </td>
              </tr>
            ) : (
              <>
                {rows.slice(0, 20).map((r, i) => (
                  <tr key={i}>
                    <td>{r.name || '(미상)'}</td>
                    <td>{fmtKRWFull(r.total)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <span>{fmtPct(r.total, total)}</span>
                        <div style={{ width: 44, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                          <div style={{
                            width: `${Math.min(Math.abs(r.total) / Math.abs(total) * 100, 100)}%`,
                            height: '100%',
                            background: r.total < 0 ? '#ef4444' : '#3b82f6',
                            borderRadius: 3
                          }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length > 20 && (
                  <tr>
                    <td colSpan={3} style={{ color: '#94a3b8', fontSize: 11, textAlign: 'center' }}>
                      외 {rows.length - 20}건
                    </td>
                  </tr>
                )}
                <tr className="row-total">
                  <td>합계</td>
                  <td>{fmtKRWFull(total)}</td>
                  <td>100%</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))].sort()
}

export default function Section4Filtered({ b2bRecords }) {
  const [fYear,     setFYear]     = useState('')
  const [fMonth,    setFMonth]    = useState('')
  const [fCustomer, setFCustomer] = useState('')
  const [fCountry,  setFCountry]  = useState('')
  const [fPerson,   setFPerson]   = useState('')
  const [fItem,     setFItem]     = useState('')   // 품번 값으로 필터

  // ── 필터 옵션 목록 ──────────────────────────────────────────
  const years     = useMemo(() => uniq(b2bRecords.map(r => String(r.year))),     [b2bRecords])
  const months    = ['1','2','3','4','5','6','7','8','9','10','11','12']
  const customers = useMemo(() => uniq(b2bRecords.map(r => r.customer)), [b2bRecords])
  const countries = useMemo(() => uniq(b2bRecords.map(r => r.country)),  [b2bRecords])
  const persons   = useMemo(() => uniq(b2bRecords.map(r => r.person)),   [b2bRecords])

  // 품목 필터: value = 품번, label = "품번 | 품명"
  const itemOptions = useMemo(() => {
    const map = {}
    b2bRecords.forEach(r => {
      if (r.item && !map[r.item]) map[r.item] = r.itemName || ''
    })
    return Object.entries(map)
      .map(([품번, 품명]) => ({
        value: 품번,
        label: 품명 ? `${품번} | ${품명}` : 품번,
      }))
      .sort((a, b) => a.value.localeCompare(b.value))
  }, [b2bRecords])

  // ── 필터 적용 ───────────────────────────────────────────────
  const filtered = useMemo(() => b2bRecords.filter(r => {
    if (fYear     && String(r.year)  !== fYear)     return false
    if (fMonth    && String(r.month) !== fMonth)    return false
    if (fCustomer && r.customer      !== fCustomer) return false
    if (fCountry  && r.country       !== fCountry)  return false
    if (fPerson   && r.person        !== fPerson)   return false
    if (fItem     && r.item          !== fItem)     return false  // 품번으로 비교
    return true
  }), [b2bRecords, fYear, fMonth, fCustomer, fCountry, fPerson, fItem])

  // ── 4개 집계 ────────────────────────────────────────────────
  const byCustomer = useMemo(() => groupSum(filtered,     'customer'), [filtered])
  const byCountry  = useMemo(() => groupSum(filtered,     'country'),  [filtered])
  const byItem     = useMemo(() => groupSumItem(filtered),             [filtered])  // 품번+품명
  const byPerson   = useMemo(() => groupSum(filtered,     'person'),   [filtered])

  const total = filtered.reduce((s, r) => s + r.krw, 0)

  function reset() {
    setFYear(''); setFMonth(''); setFCustomer('')
    setFCountry(''); setFPerson(''); setFItem('')
  }

  return (
    <>
      {/* 필터 바 */}
      <div className="filter-bar">
        <FilterSelect label="년도"   value={fYear}     options={years}       onChange={setFYear} />
        <FilterSelect label="월"     value={fMonth}    options={months}      onChange={setFMonth} />
        <FilterSelect label="거래처" value={fCustomer} options={customers}   onChange={setFCustomer} />
        <FilterSelect label="국가"   value={fCountry}  options={countries}   onChange={setFCountry} />
        <FilterSelect label="담당자" value={fPerson}   options={persons}     onChange={setFPerson} />
        <FilterSelect label="품목"   value={fItem}     options={itemOptions} onChange={setFItem} />
        <button className="btn-reset" onClick={reset}>초기화</button>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b', alignSelf: 'flex-end', paddingBottom: 2 }}>
          결과: <strong>{filtered.length.toLocaleString()}건</strong> · 합계 <strong>{fmtKRWFull(total)}</strong>
        </div>
      </div>

      {/* 4개 순위 테이블 2×2 */}
      <div className="sub-tables-grid">
        <RankTable title="🏢 거래처별 매출 현황" rows={byCustomer} />
        <RankTable title="🌐 국가별 매출 현황"   rows={byCountry}  />
        <RankTable title="📦 품목별 매출 현황 (품번 기준)"  rows={byItem}    />
        <RankTable title="👤 담당자별 매출 현황" rows={byPerson}  />
      </div>
    </>
  )
}
