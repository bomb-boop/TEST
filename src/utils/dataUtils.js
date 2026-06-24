// ── 숫자 파싱 ────────────────────────────────────────────────
//  ₩, 쉼표, 공백 제거 — 단, '-' 부호는 유지 (반품/마이너스 값 정확히 처리)
//  ' - ' (대시 표기 = 0) 는 0 반환
export function parseNum(v) {
  if (v === null || v === undefined || v === '') return 0
  const s = String(v)
    .replace(/₩/g, '')         // 원화 기호 제거
    .replace(/,/g, '')          // 쉼표 제거
    .replace(/\s/g, '')         // 공백 제거  ← '-' 부호는 건드리지 않음
    .trim()
  if (s === '' || s === '-') return 0   // 빈값 or 단순 대시('-') = 0
  const n = Number(s)
  return isNaN(n) ? 0 : n
}

// ── 현재 날짜 컨텍스트 ────────────────────────────────────────
export function getDateContext() {
  const today        = new Date()
  const currentYear  = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const prevMonth    = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear     = currentMonth === 1 ? currentYear - 1 : currentYear
  return { today, currentYear, currentMonth, prevMonth, prevYear }
}

// ────────────────────────────────────────────────────────────
//  B2B 매출 마감 현황
//  컬럼: 실적일자(YYYY-MM-DD), 거래처, 담당자, 품번, 원화판매금액, 국가
// ────────────────────────────────────────────────────────────
export function processB2BData(rows) {
  return rows
    .map(r => {
      // 실적일자 날짜 파싱 — 여러 형식 지원
      //   YYYY-MM-DD, YYYY-M-D, YYYY/MM/DD, YYYY.MM.DD
      //   YYYY-MM, YYYY-M, YYYY년MM월, YYYY년 M월, YYYYMM
      let year = 0, month = 0
      const dateStr = (r['실적일자'] || '').trim()
      const m = dateStr.match(/^(\d{4})\D+(\d{1,2})/) ||  // 구분자 있는 경우
                dateStr.match(/^(\d{4})(\d{2})/)           // YYYYMM 붙어있는 경우
      if (m) {
        year  = parseInt(m[1])
        month = parseInt(m[2])
      }
      return {
        year,
        month,
        customer: (r['거래처']         || '').trim().toUpperCase(),
        person:   (r['담당자']         || '').trim(),
        item:     (r['품번']           || '').trim(),
        itemName: (r['품명']           || '').trim(),
        country:  (r['국가']           || '').trim(),
        category: (r['구분']           || '').trim(),
        krw:      parseNum(r['원화판매금액']),
      }
    })
    .filter(r => r.year > 0 && r.month > 0 && r.krw !== 0)
}

// ────────────────────────────────────────────────────────────
//  2026년 매출 목표 (겸 히스토리)
//  컬럼: 현재 담당자, 거래처명, 구분, 지역, 202301, 202302, ..., 202612
//  반환: { year: { month: totalTarget } }
// ────────────────────────────────────────────────────────────
export function processTargetData(rows, headers) {
  const targetMap        = {}   // { year: { month: total } }  — 전체 합계
  const targetByCategory = {}   // { 구분: { year: { month: total } } }

  // YYYYMM 패턴 컬럼만 추출
  const ymCols = headers.filter(h => /^20\d{4}$/.test((h || '').trim()))

  for (const col of ymCols) {
    const ym    = col.trim()
    const year  = parseInt(ym.substring(0, 4))
    const month = parseInt(ym.substring(4, 6))
    if (!targetMap[year]) targetMap[year] = {}
    targetMap[year][month] = 0

    for (const r of rows) {
      const amt = parseNum(r[col])
      targetMap[year][month] += amt

      const cat = (r['구분'] || '').trim()
      if (cat) {
        if (!targetByCategory[cat])           targetByCategory[cat] = {}
        if (!targetByCategory[cat][year])     targetByCategory[cat][year] = {}
        targetByCategory[cat][year][month] =
          (targetByCategory[cat][year][month] || 0) + amt
      }
    }
  }

  return { targetMap, targetByCategory }
}

// ────────────────────────────────────────────────────────────
//  목표 데이터 거래처 기준 분리
//  overseasNames: 해외법인 거래처명 Set
//  → { targetMap, targetB2B, targetOverseas }
// ────────────────────────────────────────────────────────────
export function processTargetBySplit(rows, headers, overseasNames) {
  const targetMap      = {}   // 전체
  const targetB2B      = {}   // 해외법인 제외
  const targetOverseas = {}   // 해외법인만

  const ymCols = headers.filter(h => /^20\d{4}$/.test((h || '').trim()))

  for (const col of ymCols) {
    const ym    = col.trim()
    const year  = parseInt(ym.substring(0, 4))
    const month = parseInt(ym.substring(4, 6))

    if (!targetMap[year])      targetMap[year]      = {}
    if (!targetB2B[year])      targetB2B[year]      = {}
    if (!targetOverseas[year]) targetOverseas[year] = {}

    targetMap[year][month]      = 0
    targetB2B[year][month]      = 0
    targetOverseas[year][month] = 0

    for (const r of rows) {
      const amt  = parseNum(r[col])
      // 목표 시트의 거래처명 컬럼 (거래처명 또는 거래처)
      const name = (r['거래처명'] || r['거래처'] || '').trim().toUpperCase()

      targetMap[year][month] += amt

      if (name && overseasNames.has(name)) {
        targetOverseas[year][month] += amt
      } else if (name) {
        targetB2B[year][month] += amt
      }
    }
  }

  return { targetMap, targetB2B, targetOverseas }
}

// ────────────────────────────────────────────────────────────
//  당월 예상매출
//  컬럼: 담당, 메인유통국가, 거래처, 예상
//  첫 번째 행이 합계 행(거래처 공백)인 경우 건너뜀
// ────────────────────────────────────────────────────────────
export function processEstData(rows) {
  let totalEst = 0
  const customerCountry = {}
  const overseasNames   = new Set()   // 해외법인 거래처명 목록 (명칭 열 기준)
  const overseasMap     = {}          // 법인명(명칭) → [거래처] 리스트
  const estByCustomer   = {}          // 거래처 → 예상매출 합계

  for (const r of rows) {
    const customer = (r['거래처'] || '').trim().toUpperCase()
    const country  = (r['메인유통국가'] || '').trim()
    const amt      = parseNum(r['예상 매출'])
    const 명칭     = (r['명칭'] || '').trim()   // 해외법인 거래처명 열

    if (!customer) continue          // 합계 행 스킵
    totalEst += amt
    if (country) customerCountry[customer] = country
    // '명칭'열에 '법인'이 포함된 행의 거래처명을 해외법인 Set에 추가
    if (명칭 && 명칭.includes('법인')) {
      overseasNames.add(customer)
      if (!overseasMap[명칭]) overseasMap[명칭] = []
      if (!overseasMap[명칭].includes(customer)) overseasMap[명칭].push(customer)
    }
    if (amt > 0) {
      estByCustomer[customer] = (estByCustomer[customer] || 0) + amt
    }
  }

  return { totalEst, customerCountry, overseasNames, overseasMap, estByCustomer }
}

// ────────────────────────────────────────────────────────────
//  출하의뢰조회 / 수출출하의뢰조회
//  ① 진행상태 = '미확정' 제외
//  ② 납기일(YYYY-MM-DD)에서 가장 많이 등장하는 년월 → 당월
//  ③ 당월 납기일 행만 amountCol 컬럼 합산
//
//  amountCol:
//    '출하의뢰조회'    → '판매가액계'      (원화, 환율 변환 불필요)
//    '수출출하의뢰조회' → '원화판매금액계'  (이미 원화 환산된 컬럼)
//
//  반환: { total, currentYM }  (currentYM = "YYYY-MM" | null)
// ────────────────────────────────────────────────────────────
function detectCurrentYM(rows) {
  const counts = {}
  for (const r of rows) {
    const d = (r['납기일'] || '').trim()
    if (d.length >= 7) {
      const ym = d.substring(0, 7)               // "YYYY-MM"
      if (/^\d{4}-\d{2}$/.test(ym)) {
        counts[ym] = (counts[ym] || 0) + 1
      }
    }
  }
  if (!Object.keys(counts).length) return null
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

// overseasNames: Set<string> — '당월 예상매출' 시트에서 추출한 해외법인 거래처명
// 반환: { total, b2bTotal, overseasTotal, currentYM }
//   total        = 전체 합계 (B2B + 해외법인)
//   b2bTotal     = 해외법인 제외 합계
//   overseasTotal= 해외법인만 합계
export function processShipmentData(rows, amountCol, overseasNames = new Set()) {
  // ① 미확정 제외
  const confirmed = rows.filter(r =>
    (r['진행상태'] || '').trim() !== '미확정'
  )

  // ② 납기일 기준 당월 감지
  const currentYM = detectCurrentYM(confirmed)

  // ③ 당월에 해당하는 행만 집계
  const monthRows = currentYM
    ? confirmed.filter(r => (r['납기일'] || '').trim().startsWith(currentYM))
    : confirmed

  // ④ 해외법인 여부로 분리 집계 (거래처 컬럼명 '거래처' 또는 '거래처명')
  let total = 0, b2bTotal = 0, overseasTotal = 0
  for (const r of monthRows) {
    const amt      = parseNum(r[amountCol])
    const customer = (r['거래처'] || r['거래처명'] || '').trim().toUpperCase()
    total += amt
    if (customer && overseasNames.has(customer)) {
      overseasTotal += amt
    } else {
      b2bTotal += amt
    }
  }

  return { total, b2bTotal, overseasTotal, currentYM }
}

// ────────────────────────────────────────────────────────────
//  출하의뢰 주차별 집계 (Menu 3 전주/금주 데이터)
//  weekStart: "YYYY-MM-DD" — 금주 월요일  (미전달 시 자동 계산)
//  반환: { weekStart, currentYM, byCustomer: { cust: { prev, curr } } }
// ────────────────────────────────────────────────────────────
export function processShipmentWeekly(rows, amountCol, overseasNames = new Set(), forcedWeekStart = null) {
  const confirmed = rows.filter(r => (r['진행상태'] || '').trim() !== '미확정')
  const currentYM = detectCurrentYM(confirmed)
  if (!currentYM) return { weekStart: null, currentYM: null, byCustomer: {} }

  const monthRows = confirmed.filter(r => (r['납기일'] || '').trim().startsWith(currentYM))

  // 금주 기준: 당월 중 가장 최근 납기일의 월요일
  let weekStart = forcedWeekStart
  if (!weekStart) {
    let latestDate = null
    for (const r of monthRows) {
      const d = (r['납기일'] || '').trim().substring(0, 10)
      if (d.length === 10 && (!latestDate || d > latestDate)) latestDate = d
    }
    if (latestDate) {
      const dt  = new Date(latestDate + 'T00:00:00')
      const day = dt.getDay()               // 0=일, 1=월
      const diff = day === 0 ? -6 : 1 - day // 해당 주 월요일까지
      const mon = new Date(dt)
      mon.setDate(mon.getDate() + diff)
      const yyyy = mon.getFullYear()
      const mm   = String(mon.getMonth() + 1).padStart(2, '0')
      const dd   = String(mon.getDate()).padStart(2, '0')
      weekStart = `${yyyy}-${mm}-${dd}`
    }
  }

  const byCustomer = {}
  for (const r of monthRows) {
    const amt      = parseNum(r[amountCol])
    if (amt === 0) continue
    const customer = (r['거래처'] || r['거래처명'] || '').trim().toUpperCase()
    if (!customer) continue
    const date    = (r['납기일'] || '').trim().substring(0, 10)
    const isThis  = weekStart ? date >= weekStart : false

    if (!byCustomer[customer]) byCustomer[customer] = { prev: 0, curr: 0 }
    if (isThis) byCustomer[customer].curr += amt
    else        byCustomer[customer].prev += amt
  }

  return { weekStart, currentYM, byCustomer }
}

// ────────────────────────────────────────────────────────────
//  목표 시트 거래처별 파싱 (Menu 3 세부 집계용)
//  반환: { byCustomer: { name: { year: { month: amount } } } }
// ────────────────────────────────────────────────────────────
export function processTargetByCustomer(rows, headers) {
  const byCustomer = {}
  const ymCols = (headers || []).filter(h => /^20\d{4}$/.test((h || '').trim()))

  for (const r of rows) {
    const name = (r['거래처명'] || r['거래처'] || '').trim().toUpperCase()
    if (!name) continue
    for (const col of ymCols) {
      const ym   = col.trim()
      const year = parseInt(ym.substring(0, 4))
      const month = parseInt(ym.substring(4, 6))
      const amt  = parseNum(r[col])
      if (!amt) continue
      if (!byCustomer[name])        byCustomer[name] = {}
      if (!byCustomer[name][year])  byCustomer[name][year] = {}
      byCustomer[name][year][month] = (byCustomer[name][year][month] || 0) + amt
    }
  }
  return { byCustomer }
}

// ────────────────────────────────────────────────────────────
//  B2C 시트 파싱 (원시 CSV 텍스트 → 월별 배열)
//  시트 구조: A열=년도, B열=플랫폼명, C~N열=1월~12월
//  년도는 그룹 첫 행에만 있을 수 있음 (Google Sheets 병합 셀 대응)
//
//  반환: {
//    actPrev:  [m1..m12],   // prevYear 실적
//    tgtCurr:  null,        // 목표는 별도 시트에서 관리
//    actCurr:  [m1..m12],   // currentYear 실적 (미입력 월 = null)
//  }
// ────────────────────────────────────────────────────────────
export function processB2CData(rawText, currentYear) {
  const prevYear = currentYear - 1

  function parseLine(line) {
    const result = []
    let inQ = false, cur = ''
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue }
      if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; continue }
      cur += ch
    }
    result.push(cur.trim())
    return result
  }

  function toNum(v) {
    if (!v || v.trim() === '' || v.trim() === '-') return null
    const n = Number(v.replace(/[,\s₩]/g, ''))
    return isNaN(n) ? null : (n > 0 ? n : null)
  }

  const lines = (rawText || '').split(/\r?\n/).filter(l => l.trim())
  let curYear = null
  // 플랫폼별 누산 (총합계 행이 없는 경우 대비)
  const sumPrev = Array(12).fill(null)
  const sumCurr = Array(12).fill(null)
  const result = { actPrev: null, tgtCurr: null, actCurr: null }

  for (const line of lines) {
    const cols = parseLine(line)
    const colA = (cols[0] || '').trim()
    const colB = (cols[1] || '').trim()

    // A열에 4자리 년도 → 현재 년도 컨텍스트 갱신 (병합 셀: 첫 행에만 년도 있음)
    if (/^20\d{2}$/.test(colA)) curYear = parseInt(colA)

    if (!curYear) continue
    if (curYear !== prevYear && curYear !== currentYear) continue

    const monthly = Array.from({ length: 12 }, (_, i) => toNum(cols[i + 2] || ''))
    const target  = curYear === prevYear ? sumPrev : sumCurr

    if (colB === '총합계' || colB === '합계') {
      // 합계 행을 직접 사용
      if (curYear === prevYear)    result.actPrev = monthly
      if (curYear === currentYear) result.actCurr = monthly
    } else if (colB && !colB.includes('플랫폼') && !colB.includes('항목')) {
      // 플랫폼별 행 → 누산 (합계 행이 없는 경우 폴백용)
      for (let i = 0; i < 12; i++) {
        if (monthly[i] !== null) target[i] = (target[i] || 0) + monthly[i]
      }
    }
  }

  // 합계 행이 없었던 경우 누산 값을 사용
  if (!result.actPrev && sumPrev.some(v => v !== null)) result.actPrev = sumPrev
  if (!result.actCurr && sumCurr.some(v => v !== null)) result.actCurr = sumCurr

  return result
}

// ── 집계 헬퍼 ────────────────────────────────────────────────
export function monthlyMap(records) {
  const map = {}
  for (const r of records) {
    if (!map[r.year])       map[r.year] = {}
    map[r.year][r.month] = (map[r.year][r.month] || 0) + r.krw
  }
  return map
}

export function cumSum(records, year, fromMonth, toMonth) {
  return records
    .filter(r => r.year === year && r.month >= fromMonth && r.month <= toMonth)
    .reduce((s, r) => s + r.krw, 0)
}

export function monthSum(records, year, month) {
  return records
    .filter(r => r.year === year && r.month === month)
    .reduce((s, r) => s + r.krw, 0)
}

export function groupSum(filtered, key) {
  const map = {}
  for (const r of filtered) {
    const k = r[key] || '(미상)'
    map[k] = (map[k] || 0) + r.krw
  }
  return Object.entries(map)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
}

// 품목별 집계: 품번 기준으로 합산, 표시는 "품번 | 품명"
export function groupSumItem(filtered) {
  const map = {}   // 품번 → { total, itemName }
  for (const r of filtered) {
    const key = r.item || '(미상)'
    if (!map[key]) map[key] = { total: 0, itemName: r.itemName || '' }
    map[key].total    += r.krw
    // 품명이 아직 없으면 첫 번째로 나오는 품명 기록
    if (!map[key].itemName && r.itemName) map[key].itemName = r.itemName
  }
  return Object.entries(map)
    .map(([품번, { total, itemName }]) => ({
      name:  itemName ? `${품번} | ${itemName}` : 품번,
      value: 품번,   // 필터 매칭용 원래 품번
      total,
    }))
    .sort((a, b) => b.total - a.total)
}

// ── 포맷 ─────────────────────────────────────────────────────
export function fmtKRWFull(v) {
  const n = Math.round(v || 0)
  return `₩${n.toLocaleString('ko-KR')}`
}

export function fmtKRW(v) {
  const n = Math.round(v || 0)
  if (n >= 1e8) return `${(n / 1e8).toFixed(1)}억원`
  if (n >= 1e4) return `${(n / 1e4).toFixed(0)}만원`
  return `${n.toLocaleString('ko-KR')}원`
}

export function fmtPct(numerator, denominator) {
  if (!denominator) return '-%'
  return `${((numerator / denominator) * 100).toFixed(1)}%`
}
