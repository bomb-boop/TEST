import { cumSum, monthSum, fmtKRWFull, fmtPct } from '../../utils/dataUtils.js'

function pctClass(num, den) {
  if (!den) return 'neutral'
  const p = (num / den) * 100
  if (p >= 100) return 'pct-high'
  if (p >= 80)  return 'pct-mid'
  return 'pct-low'
}

function KpiCard({ label, value, sub, badge, badgeClass, color }) {
  return (
    <div className="kpi-card" style={color ? { borderTop: `3px solid ${color}` } : {}}>
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value ${String(value).length > 14 ? 'sm' : ''}`}>{value}</div>
      {sub   && <div className="kpi-sub">{sub}</div>}
      {badge && <div className={`kpi-badge ${badgeClass || 'neutral'}`}>{badge}</div>}
    </div>
  )
}

// ── props ────────────────────────────────────────────────────
// currentYear  : 당월의 연도      (e.g. 2026)
// prevYear     : 전월이 속한 연도  (e.g. April→2026, January→2025)
// prevMonth    : 전월 번호         (e.g. 3)
// targetMap    : { year: { month: amount } }
// ─────────────────────────────────────────────────────────────
export default function Section2Closed({ b2bRecords, targetMap, currentYear, prevYear, prevMonth }) {

  // ── 비교 연도 계산 ────────────────────────────────────────
  // 전년도 = prevYear(전월이 속한 연도) - 1   (e.g. 2026-1 = 2025)
  // 금년도 = prevYear                          (e.g. 2026)
  const compYear   = prevYear - 1    // 전년 비교용 (e.g. 2025)
  const thisYear   = prevYear        // 금년 (e.g. 2026)

  // ── 실적 집계 (B2B 마감 현황, 원화판매금액 기준) ──────────
  const cum_comp   = cumSum(b2bRecords, compYear, 1, prevMonth)   // 전년 1~전월 누적
  const cum_this   = cumSum(b2bRecords, thisYear, 1, prevMonth)   // 금년 1~전월 누적
  const mon_comp   = monthSum(b2bRecords, compYear, prevMonth)    // 전년 전월 단월
  const mon_this   = monthSum(b2bRecords, thisYear, prevMonth)    // 금년 전월 단월

  // ── 목표 집계 (2026년 매출 목표 시트 기준) ────────────────
  const getTarget  = (y, m) => targetMap?.[y]?.[m] ?? 0
  const cumTarget  = Array.from({ length: prevMonth }, (_, i) =>
    getTarget(thisYear, i + 1)
  ).reduce((s, v) => s + v, 0)
  const monTarget  = getTarget(thisYear, prevMonth)

  // ── 증감률 ────────────────────────────────────────────────
  const cumGrowth  = cum_comp ? ((cum_this - cum_comp) / cum_comp * 100).toFixed(1) : null
  const monGrowth  = mon_comp ? ((mon_this - mon_comp) / mon_comp * 100).toFixed(1) : null

  // ── 그룹별 색상 ──────────────────────────────────────────────
  // 누적 실적: 인디고 | 단월 실적: 블루 | 누적 목표: 앰버 | 단월 목표: 에메랄드
  const C_CUM_ACT = '#6366f1'   // 누적 실적 (indigo)
  const C_MON_ACT = '#3b82f6'   // 단월 실적 (blue)
  const C_CUM_TGT = '#f59e0b'   // 누적 목표 (amber)
  const C_MON_TGT = '#10b981'   // 단월 목표 (emerald)

  const kpis = [
    {
      label:     `${compYear}년 1~${prevMonth}월 누적 매출`,
      value:     fmtKRWFull(cum_comp),
      sub:       `${compYear}년 동기 누적 (전년도)`,
      color:     C_CUM_ACT,
    },
    {
      label:     `${thisYear}년 1~${prevMonth}월 누적 매출`,
      value:     fmtKRWFull(cum_this),
      sub:       '전년 동기 대비',
      badge:     cumGrowth !== null
        ? `${Number(cumGrowth) >= 0 ? '▲' : '▼'} ${Math.abs(cumGrowth)}%`
        : null,
      badgeClass: Number(cumGrowth) >= 0 ? 'up' : 'down',
      color:     C_CUM_ACT,
    },
    {
      label:     `${compYear}년 ${prevMonth}월 매출`,
      value:     fmtKRWFull(mon_comp),
      sub:       `${compYear}년 ${prevMonth}월 단월 (전년도)`,
      color:     C_MON_ACT,
    },
    {
      label:     `${thisYear}년 ${prevMonth}월 매출`,
      value:     fmtKRWFull(mon_this),
      sub:       '전년 동월 대비',
      badge:     monGrowth !== null
        ? `${Number(monGrowth) >= 0 ? '▲' : '▼'} ${Math.abs(monGrowth)}%`
        : null,
      badgeClass: Number(monGrowth) >= 0 ? 'up' : 'down',
      color:     C_MON_ACT,
    },
    {
      label:     `${thisYear}년 1~${prevMonth}월 누적 목표`,
      value:     fmtKRWFull(cumTarget),
      sub:       `${thisYear}년 누적 목표`,
      color:     C_CUM_TGT,
    },
    {
      label:     `1~${prevMonth}월 누적 목표 달성률`,
      value:     fmtPct(cum_this, cumTarget),
      sub:       `실적 ${fmtKRWFull(cum_this)}`,
      badge:     fmtPct(cum_this, cumTarget),
      badgeClass: pctClass(cum_this, cumTarget),
      color:     C_CUM_TGT,
    },
    {
      label:     `${thisYear}년 ${prevMonth}월 목표`,
      value:     fmtKRWFull(monTarget),
      sub:       `${prevMonth}월 목표액`,
      color:     C_MON_TGT,
    },
    {
      label:     `${prevMonth}월 목표 달성률`,
      value:     fmtPct(mon_this, monTarget),
      sub:       `실적 ${fmtKRWFull(mon_this)}`,
      badge:     fmtPct(mon_this, monTarget),
      badgeClass: pctClass(mon_this, monTarget),
      color:     C_MON_TGT,
    },
  ]

  return (
    <div className="kpi-grid">
      {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
    </div>
  )
}
