import { useMemo } from 'react'

// ── 숫자 포맷 (만원 단위) ────────────────────────────────────
function fmtW(v) {
  if (v === null || v === undefined) return '-'
  const n = Math.round(v / 10000)
  return n.toLocaleString('ko-KR')
}
function fmtPctVal(num, den) {
  if (!den) return '-'
  return ((num / den) * 100).toFixed(1) + '%'
}
function fmtGrowth(curr, prev) {
  if (!prev) return '-'
  const g = ((curr - prev) / Math.abs(prev)) * 100
  return (g >= 0 ? '▲' : '▼') + Math.abs(g).toFixed(1) + '%'
}

// ── 셀 스타일 ────────────────────────────────────────────────
function pctCls(num, den) {
  if (!den) return ''
  const p = (num / den) * 100
  if (p >= 100) return 'r3-pct-high'
  if (p >= 80)  return 'r3-pct-mid'
  return 'r3-pct-low'
}
function growthCls(curr, prev) {
  if (!prev) return ''
  return curr >= prev ? 'r3-up' : 'r3-down'
}

// ── 거래처 리스트 기반 집계 헬퍼 ─────────────────────────────
function custWeekly(customers, weeklyByCustomer) {
  let prev = 0, curr = 0
  for (const c of customers) {
    const w = weeklyByCustomer[c]
    if (w) { prev += w.prev; curr += w.curr }
  }
  return { prev, curr }
}
function custTargetMonth(customers, targetByCustomer, year, month) {
  let total = 0
  for (const c of customers) {
    total += targetByCustomer[c]?.[year]?.[month] ?? 0
  }
  return total
}
function custTargetCum(customers, targetByCustomer, year, toMonth) {
  let total = 0
  for (const c of customers) {
    for (let m = 1; m <= toMonth; m++) {
      total += targetByCustomer[c]?.[year]?.[m] ?? 0
    }
  }
  return total
}
function custEstSum(customers, estByCustomer) {
  return customers.reduce((s, c) => s + (estByCustomer[c] || 0), 0)
}
function custMonthSum(records, customers, year, month) {
  return records
    .filter(r => customers.includes(r.customer) && r.year === year && r.month === month)
    .reduce((s, r) => s + r.krw, 0)
}
function custCumSum(records, customers, year, toMonth) {
  return records
    .filter(r => customers.includes(r.customer) && r.year === year && r.month >= 1 && r.month <= toMonth)
    .reduce((s, r) => s + r.krw, 0)
}

// ── 행 계산 ──────────────────────────────────────────────────
function buildRow(label, customers, {
  b2bRecords, targetByCustomer, estByCustomer, weeklyByCustomer,
  currentYear, currentMonth, prevYear,
}) {
  const { prev: prevWeek, curr: thisWeek } = custWeekly(customers, weeklyByCustomer)
  const thisWeekCum  = prevWeek + thisWeek
  const monthTarget  = custTargetMonth(customers, targetByCustomer, currentYear, currentMonth)
  const monthEst     = custEstSum(customers, estByCustomer)
  const prevYearMon  = custMonthSum(b2bRecords, customers, prevYear, currentMonth)
  const cumTarget    = custTargetCum(customers, targetByCustomer, currentYear, currentMonth)
  const cumPast      = custCumSum(b2bRecords, customers, currentYear, currentMonth - 1)
  const cumActual    = cumPast + thisWeekCum
  const prevYearCum  = custCumSum(b2bRecords, customers, prevYear, currentMonth)

  return {
    label,
    monthTarget, monthEst,
    prevWeek, thisWeek, thisWeekCum,
    prevYearMon,
    cumTarget, cumActual, prevYearCum,
  }
}

// ── 행 렌더링용 컴포넌트 ─────────────────────────────────────
function DataRow({ row, isSubtotal, isGrandTotal }) {
  const {
    label, monthTarget, monthEst,
    prevWeek, thisWeek, thisWeekCum,
    prevYearMon,
    cumTarget, cumActual, prevYearCum,
  } = row

  const trCls = isGrandTotal
    ? 'r3-tr r3-tr-total'
    : isSubtotal
    ? 'r3-tr r3-tr-sub'
    : 'r3-tr'

  return (
    <tr className={trCls}>
      <td className="r3-td r3-td-item">{label}</td>
      {/* 당월 */}
      <td className="r3-td r3-td-val">{fmtW(monthTarget)}</td>
      <td className="r3-td r3-td-val">{fmtW(monthEst)}</td>
      <td className="r3-td r3-td-val">{fmtW(prevWeek)}</td>
      <td className="r3-td r3-td-val">{fmtW(thisWeek)}</td>
      <td className="r3-td r3-td-val r3-emphasis">{fmtW(thisWeekCum)}</td>
      <td className={`r3-td r3-td-val ${pctCls(thisWeekCum, monthTarget)}`}>
        {fmtPctVal(thisWeekCum, monthTarget)}
      </td>
      {/* 전년 동월비교 */}
      <td className="r3-td r3-td-val">{fmtW(prevYearMon)}</td>
      <td className={`r3-td r3-td-val ${growthCls(thisWeekCum, prevYearMon)}`}>
        {fmtGrowth(thisWeekCum, prevYearMon)}
      </td>
      {/* 누계 */}
      <td className="r3-td r3-td-val">{fmtW(cumTarget)}</td>
      <td className="r3-td r3-td-val r3-emphasis">{fmtW(cumActual)}</td>
      <td className={`r3-td r3-td-val ${pctCls(cumActual, cumTarget)}`}>
        {fmtPctVal(cumActual, cumTarget)}
      </td>
      {/* 전년 누계비교 */}
      <td className="r3-td r3-td-val">{fmtW(prevYearCum)}</td>
      <td className={`r3-td r3-td-val ${growthCls(cumActual, prevYearCum)}`}>
        {fmtGrowth(cumActual, prevYearCum)}
      </td>
    </tr>
  )
}

// ── 섹션 헤더 행 ─────────────────────────────────────────────
function SectionHeader({ label, colSpan }) {
  return (
    <tr className="r3-tr r3-tr-section">
      <td className="r3-td r3-td-section-hd" colSpan={colSpan}>{label}</td>
    </tr>
  )
}

// ── 합계 계산 헬퍼 ───────────────────────────────────────────
function sumRows(rows) {
  const zero = {
    monthTarget: 0, monthEst: 0,
    prevWeek: 0, thisWeek: 0, thisWeekCum: 0,
    prevYearMon: 0,
    cumTarget: 0, cumActual: 0, prevYearCum: 0,
  }
  return rows.reduce((acc, r) => {
    for (const k of Object.keys(zero)) acc[k] += (r[k] || 0)
    return acc
  }, { ...zero })
}

// ────────────────────────────────────────────────────────────
//  메인 컴포넌트
// ────────────────────────────────────────────────────────────
export default function ReportTable({
  b2bRecords,
  targetByCustomer,
  estByCustomer,
  customerCountry,
  overseasMap,
  overseasNames,
  weeklyByCustomer,
  weekStart,
  b2cData,
  currentYear,
  currentMonth,
}) {
  const prevYear = currentYear - 1

  const ctx = { b2bRecords, targetByCustomer, estByCustomer, weeklyByCustomer, currentYear, currentMonth, prevYear }

  // ── 법인 행 ──────────────────────────────────────────────
  const corpRows = useMemo(() => {
    return Object.entries(overseasMap || {}).map(([법인명, customers]) =>
      buildRow(법인명, customers, ctx)
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overseasMap, b2bRecords, targetByCustomer, estByCustomer, weeklyByCustomer, currentYear, currentMonth])

  // ── B2B 행 (국가별, 해외법인 제외) ───────────────────────
  const b2bRows = useMemo(() => {
    // 해외법인 아닌 거래처 → 국가별 묶기
    const countryMap = {}  // country → [customer]
    const mappedCusts = new Set()
    for (const [cust, country] of Object.entries(customerCountry || {})) {
      if (overseasNames.has(cust)) continue
      if (!country) continue
      if (!countryMap[country]) countryMap[country] = []
      countryMap[country].push(cust)
      mappedCusts.add(cust)
    }
    const rows = Object.entries(countryMap)
      .map(([country, customers]) => buildRow(country, customers, ctx))
      .sort((a, b) => b.thisWeekCum - a.thisWeekCum)  // 금주 누계 내림차순

    // 국가 미분류 B2B 거래처 → '기타' 행으로 포함 (소계 정합성 유지)
    const unmapped = [...new Set(
      b2bRecords
        .filter(r => !overseasNames.has(r.customer) && !mappedCusts.has(r.customer))
        .map(r => r.customer)
    )]
    if (unmapped.length > 0) rows.push(buildRow('기타', unmapped, ctx))

    return rows
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerCountry, overseasNames, b2bRecords, targetByCustomer, estByCustomer, weeklyByCustomer, currentYear, currentMonth])

  // ── B2C 행 ───────────────────────────────────────────────
  const b2cRow = useMemo(() => {
    if (!b2cData) return null
    const mi = currentMonth - 1
    const monthTarget  = b2cData.tgtCurr?.[mi] ?? 0
    const thisWeekCum  = b2cData.actCurr?.[mi] ?? 0
    const prevYearMon  = b2cData.actPrev?.[mi] ?? 0
    const cumTarget    = (b2cData.tgtCurr  || []).slice(0, currentMonth).reduce((s, v) => s + (v || 0), 0)
    const cumActual    = (b2cData.actCurr  || []).slice(0, currentMonth).reduce((s, v) => s + (v || 0), 0)
    const prevYearCum  = (b2cData.actPrev  || []).slice(0, currentMonth).reduce((s, v) => s + (v || 0), 0)
    return {
      label: 'B2C',
      monthTarget, monthEst: thisWeekCum,
      prevWeek: 0, thisWeek: thisWeekCum, thisWeekCum,
      prevYearMon,
      cumTarget, cumActual, prevYearCum,
    }
  }, [b2cData, currentMonth])

  // ── 법인/B2B 소계 ─────────────────────────────────────────
  const corpSubtotal = useMemo(() => ({ label: '법인 소계', ...sumRows(corpRows) }), [corpRows])
  const b2bSubtotal  = useMemo(() => ({ label: 'B2B 소계',  ...sumRows(b2bRows) }), [b2bRows])

  // ── 총계 ─────────────────────────────────────────────────
  const grandTotal = useMemo(() => {
    const rows = [...corpRows, ...b2bRows, ...(b2cRow ? [b2cRow] : [])]
    return { label: '총계', ...sumRows(rows) }
  }, [corpRows, b2bRows, b2cRow])

  // 1(항목) + 6(당월) + 2(전년동월) + 3(누계) + 2(전년누계) = 14
  const COL_COUNT = 14

  if (!currentYear) return null

  return (
    <div className="r3-wrap">
      <div className="r3-unit-note">단위: 만원</div>
      {weekStart && (
        <div className="r3-week-note">
          금주 기준: {weekStart} (월요일) 이후 납기
        </div>
      )}
      <div className="r3-scroll">
        <table className="r3-table">
          <colgroup>
            <col style={{ width: 110 }} />  {/* 항목 */}
            {/* 당월 (6) */}
            <col style={{ width: 90 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 72 }} />
            {/* 전년 동월비교 (2) */}
            <col style={{ width: 90 }} />
            <col style={{ width: 72 }} />
            {/* 누계목표 (3) */}
            <col style={{ width: 90 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 72 }} />
            {/* 전년 누계비교 (2) */}
            <col style={{ width: 90 }} />
            <col style={{ width: 72 }} />
          </colgroup>

          <thead>
            {/* 1행: 상위 그룹 */}
            <tr>
              <th className="r3-th r3-th-item" rowSpan={2}>항목</th>
              <th className="r3-th r3-th-group r3-g-mon" colSpan={6}>
                {currentYear}년 {currentMonth}월 (당월)
              </th>
              <th className="r3-th r3-th-group r3-g-yoy" colSpan={2}>전년 동월비교</th>
              <th className="r3-th r3-th-group r3-g-cum" colSpan={3}>누계목표</th>
              <th className="r3-th r3-th-group r3-g-yoy" colSpan={2}>전년 누계비교</th>
            </tr>
            {/* 2행: 세부 컬럼 */}
            <tr>
              {/* 당월 */}
              <th className="r3-th r3-th-sub">목표</th>
              <th className="r3-th r3-th-sub">예측</th>
              <th className="r3-th r3-th-sub">전주 누계</th>
              <th className="r3-th r3-th-sub">금주 실적</th>
              <th className="r3-th r3-th-sub r3-emphasis">금주 누계</th>
              <th className="r3-th r3-th-sub">달성율</th>
              {/* 전년 동월 */}
              <th className="r3-th r3-th-sub">{prevYear}년 실적</th>
              <th className="r3-th r3-th-sub">성장율</th>
              {/* 누계 */}
              <th className="r3-th r3-th-sub">1~{currentMonth}월 목표</th>
              <th className="r3-th r3-th-sub r3-emphasis">1~{currentMonth}월 실적</th>
              <th className="r3-th r3-th-sub">달성율</th>
              {/* 전년 누계 */}
              <th className="r3-th r3-th-sub">{prevYear}년 누계</th>
              <th className="r3-th r3-th-sub">성장율</th>
            </tr>
          </thead>

          <tbody>
            {/* ─── 법인 섹션 ─────────────────────────────── */}
            <SectionHeader label="해외법인" colSpan={COL_COUNT} />
            {corpRows.length === 0 && (
              <tr className="r3-tr">
                <td className="r3-td r3-td-empty" colSpan={COL_COUNT}>
                  해외법인 데이터 없음 (당월 예상매출 시트 '명칭'열 확인)
                </td>
              </tr>
            )}
            {corpRows.map((row, i) => <DataRow key={i} row={row} />)}
            <DataRow row={corpSubtotal} isSubtotal />

            {/* ─── B2B 섹션 ──────────────────────────────── */}
            <SectionHeader label="B2B (국가별)" colSpan={COL_COUNT} />
            {b2bRows.length === 0 && (
              <tr className="r3-tr">
                <td className="r3-td r3-td-empty" colSpan={COL_COUNT}>
                  B2B 데이터 없음 (당월 예상매출 시트 '메인유통국가'열 확인)
                </td>
              </tr>
            )}
            {b2bRows.map((row, i) => <DataRow key={i} row={row} />)}
            <DataRow row={b2bSubtotal} isSubtotal />

            {/* ─── B2C 섹션 ──────────────────────────────── */}
            <SectionHeader label="B2C" colSpan={COL_COUNT} />
            {b2cRow
              ? <DataRow row={b2cRow} isSubtotal />
              : (
                <tr className="r3-tr">
                  <td className="r3-td r3-td-empty" colSpan={COL_COUNT}>B2C 데이터 없음</td>
                </tr>
              )
            }

            {/* ─── 총계 ──────────────────────────────────── */}
            <DataRow row={grandTotal} isGrandTotal />
          </tbody>
        </table>
      </div>
    </div>
  )
}
