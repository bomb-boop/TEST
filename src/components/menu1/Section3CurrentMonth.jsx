import { fmtKRWFull, fmtPct } from '../../utils/dataUtils.js'

function pctClass(num, den) {
  if (!den) return 'neutral'
  const p = (num / den) * 100
  if (p >= 100) return 'pct-high'
  if (p >= 80)  return 'pct-mid'
  return 'pct-low'
}

export default function Section3CurrentMonth({
  targetMap,
  estTotal,
  shipmentTotal,
  currentYear,
  currentMonth,
}) {
  const monthTarget  = targetMap?.[currentYear]?.[currentMonth] ?? 0
  const accumulated  = shipmentTotal ?? 0
  const estAmount    = estTotal ?? 0

  const kpis = [
    {
      label: `${currentYear}년 ${currentMonth}월 목표 매출`,
      value: fmtKRWFull(monthTarget),
      sub:   '당월 목표액 (목표 시트 기준)',
      color: '#0ea5e9',
      badge: null,
    },
    {
      label: `${currentMonth}월 예상 매출`,
      value: fmtKRWFull(estAmount),
      sub:   `${currentYear}년 ${currentMonth}월 목표 대비 예상 달성률`,
      color: '#0ea5e9',
      badge: fmtPct(estAmount, monthTarget),
      badgeClass: pctClass(estAmount, monthTarget),
    },
    {
      label: `${currentMonth}월 출하 누적 (출하의뢰 합산)`,
      value: fmtKRWFull(accumulated),
      sub:   `${currentYear}년 ${currentMonth}월 목표 대비 달성률`,
      color: '#0ea5e9',
      badge: fmtPct(accumulated, monthTarget),
      badgeClass: pctClass(accumulated, monthTarget),
    },
  ]

  return (
    <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
      {kpis.map((k, i) => (
        <div key={i} className="kpi-card" style={{ borderTop: `3px solid ${k.color}` }}>
          <div className="kpi-label">{k.label}</div>
          <div className="kpi-value sm">{k.value}</div>
          <div className="kpi-sub">{k.sub}</div>
          {k.badge && <div className={`kpi-badge ${k.badgeClass}`}>{k.badge}</div>}
        </div>
      ))}
    </div>
  )
}
