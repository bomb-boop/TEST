import { useMemo } from 'react'
import { monthSum } from '../../utils/dataUtils.js'

const MI = [1,2,3,4,5,6,7,8,9,10,11,12]
const COL_LABELS = ['합계','1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

// ── 숫자 포맷 ────────────────────────────────────────────────
function fmtN(v) {
  return Math.round(v ?? 0).toLocaleString('ko-KR')
}
function fmtP(v) {
  if (v === null || v === undefined) return '-'
  return `${v.toFixed(1)}%`
}

// ── 섹션 데이터 계산 ─────────────────────────────────────────
// currMonthOverride: { month: 1‒12, amt: number } | null
//   → 당월만 출하의뢰 데이터로 대체, 나머지는 마감 기록 사용
function buildData(records, tgtMap, currentYear, currMonthOverride) {
  const prev = currentYear - 1

  // 당해연도 데이터가 있는 월 세트
  const hasMonths = new Set(
    records.filter(r => r.year === currentYear).map(r => r.month)
  )

  const act25 = MI.map(m => monthSum(records, prev, m))
  const tgt26 = MI.map(m => tgtMap?.[currentYear]?.[m] ?? 0)
  const act26 = MI.map(m => {
    // 당월: 출하의뢰 합계로 덮어씀
    if (currMonthOverride && m === currMonthOverride.month) {
      return currMonthOverride.amt
    }
    return hasMonths.has(m) ? monthSum(records, currentYear, m) : null
  })

  const sum25  = act25.reduce((s, v) => s + v, 0)
  const sumTgt = tgt26.reduce((s, v) => s + v, 0)
  const ytd26  = act26.reduce((s, v) => v !== null ? s + v : s, 0)

  // 진척률: 실적 있는 월은 실적/목표, 없는 월은 0
  const rate = MI.map((_, i) =>
    act26[i] === null ? 0 : (tgt26[i] ? (act26[i] / tgt26[i]) * 100 : null)
  )
  const rateTotal = sumTgt ? (ytd26 / sumTgt) * 100 : null

  // YoY: 실적 없는 월은 -100%, 전년 없는 월은 null
  const yoy = MI.map((_, i) => {
    if (act26[i] === null) return -100
    return act25[i] ? ((act26[i] - act25[i]) / act25[i]) * 100 : null
  })
  const yoyTotal = sum25 ? ((ytd26 - sum25) / sum25) * 100 : null

  return { act25, tgt26, act26, sum25, sumTgt, ytd26, rate, rateTotal, yoy, yoyTotal }
}

// ── 셀 값 렌더링 ─────────────────────────────────────────────
function CellVal({ type, d, isTotal, idx }) {
  if (!d) return <span className="m2-blank">-</span>

  if (type === 'act25') {
    return <>{fmtN(isTotal ? d.sum25 : d.act25[idx])}</>
  }
  if (type === 'tgt26') {
    return <>{fmtN(isTotal ? d.sumTgt : d.tgt26[idx])}</>
  }
  if (type === 'act26') {
    const v = isTotal ? d.ytd26 : d.act26[idx]
    return <>{(!isTotal && v === null) ? '-' : fmtN(v)}</>
  }
  if (type === 'rate') {
    const v = isTotal ? d.rateTotal : d.rate[idx]
    return <>{fmtP(v)}</>
  }
  if (type === 'yoy') {
    const v = isTotal ? d.yoyTotal : d.yoy[idx]
    const cls = v === null ? '' : v > 0 ? 'm2-pos' : 'm2-neg'
    return <span className={cls}>{fmtP(v)}</span>
  }
  return null
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function SalesTable({
  b2bRecords,
  targetMap,
  targetB2B,
  targetOverseas,
  overseasNames,
  currentYear,
  currentMonth,
  b2cData,
  shipB2BTotal,
  shipOverseasTotal,
}) {
  const prev = currentYear - 1

  const ROW_TYPES = [
    { key: 'act25', label: `${prev}년` },
    { key: 'tgt26', label: `${currentYear}년 목표` },
    { key: 'act26', label: `${currentYear}년 실적` },
    { key: 'rate',  label: '진척률' },
    { key: 'yoy',   label: 'YoY' },
  ]

  // ── B2C 레코드 배열 (actPrev + actCurr) ─────────────────────
  const b2cRecords = useMemo(() => {
    if (!b2cData) return []
    const recs = []
    if (b2cData.actPrev) {
      b2cData.actPrev.forEach((v, i) => {
        if (v !== null) recs.push({ year: prev, month: i + 1, krw: v })
      })
    }
    if (b2cData.actCurr) {
      b2cData.actCurr.forEach((v, i) => {
        if (v !== null) recs.push({ year: currentYear, month: i + 1, krw: v })
      })
    }
    return recs
  }, [b2cData, currentYear, prev])

  // ── B2C 목표 맵 ───────────────────────────────────────────────
  const b2cTargetMap = useMemo(() => {
    if (!b2cData?.tgtCurr) return {}
    const map = { [currentYear]: {} }
    b2cData.tgtCurr.forEach((v, i) => {
      map[currentYear][i + 1] = v ?? 0
    })
    return map
  }, [b2cData, currentYear])

  // ── 합계 목표 맵 (B2B 전체 목표 + B2C 목표) ──────────────────
  const totalTargetMap = useMemo(() => {
    const merged = {}
    for (const yr in targetMap) merged[yr] = { ...targetMap[yr] }
    if (b2cData?.tgtCurr) {
      if (!merged[currentYear]) merged[currentYear] = {}
      b2cData.tgtCurr.forEach((v, i) => {
        if (v !== null)
          merged[currentYear][i + 1] = (merged[currentYear][i + 1] || 0) + v
      })
    }
    return merged
  }, [targetMap, b2cData, currentYear])

  const sections = useMemo(() => {
    // 해외법인 여부로 실적 분리
    const rAll      = b2bRecords
    const rB2B      = b2bRecords.filter(r => !overseasNames.has(r.customer))
    const rOverseas = b2bRecords.filter(r =>  overseasNames.has(r.customer))

    // 당월 override 객체 (currentMonth 없으면 null → override 비활성)
    const b2cCurrAmt = b2cData?.actCurr?.[currentMonth - 1] ?? 0
    const ovTotal    = currentMonth ? { month: currentMonth, amt: (shipB2BTotal ?? 0) + (shipOverseasTotal ?? 0) + b2cCurrAmt } : null
    const ovB2B      = currentMonth ? { month: currentMonth, amt: shipB2BTotal      ?? 0 } : null
    const ovOverseas = currentMonth ? { month: currentMonth, amt: shipOverseasTotal  ?? 0 } : null

    return [
      {
        label: '합계',
        d: buildData([...rAll, ...b2cRecords], totalTargetMap, currentYear, ovTotal),
        blank: false,
      },
      {
        label: 'B2B',
        d: buildData(rB2B, targetB2B, currentYear, ovB2B),
        blank: false,
      },
      {
        label: '해외법인\n수출',
        d: buildData(rOverseas, targetOverseas, currentYear, ovOverseas),
        blank: false,
      },
      {
        label: 'B2C',
        d: buildData(b2cRecords, b2cTargetMap, currentYear, null),
        blank: false,
      },
    ]
  }, [b2bRecords, targetMap, targetB2B, targetOverseas, overseasNames, currentYear, currentMonth,
      b2cRecords, b2cTargetMap, totalTargetMap, shipB2BTotal, shipOverseasTotal, b2cData])

  return (
    <div className="m2-wrap">
      <table className="m2-table">
        <colgroup>
          <col style={{ width: 64 }} />
          <col style={{ width: 90 }} />
          <col style={{ width: 130 }} />
          {MI.map(m => <col key={m} style={{ width: 108 }} />)}
        </colgroup>
        <thead>
          <tr>
            <th className="m2-th m2-th-sec">구분</th>
            <th className="m2-th m2-th-period">기간</th>
            {COL_LABELS.map(l => (
              <th key={l} className="m2-th m2-th-val">{l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.map((sec, si) =>
            ROW_TYPES.map((row, ri) => (
              <tr
                key={`${si}-${ri}`}
                className={`m2-tr m2-tr-${row.key}${si > 0 && ri === 0 ? ' m2-tr-section-start' : ''}${row.key === 'act26' ? ' m2-tr-act26' : ''}`}
              >
                {/* 섹션 레이블: 5행 병합 */}
                {ri === 0 && (
                  <td className="m2-td m2-td-sec" rowSpan={5}>
                    {sec.label}
                  </td>
                )}

                {/* 기간 레이블 */}
                <td className="m2-td m2-td-period">{row.label}</td>

                {/* 합계 열 */}
                <td className="m2-td m2-td-val">
                  <CellVal type={row.key} d={sec.d} isTotal idx={0} />
                </td>

                {/* 1~12월 열 */}
                {MI.map((m, i) => (
                  <td key={m} className="m2-td m2-td-val">
                    <CellVal type={row.key} d={sec.d} isTotal={false} idx={i} />
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
