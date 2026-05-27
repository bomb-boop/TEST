import Section1Chart        from '../components/menu1/Section1Chart.jsx'
import Section2Closed       from '../components/menu1/Section2Closed.jsx'
import Section3CurrentMonth from '../components/menu1/Section3CurrentMonth.jsx'
import Section4Filtered     from '../components/menu1/Section4Filtered.jsx'

export default function Dashboard({
  loading, error, lastUpdated, refresh, warnings,
  b2bRecords, targetMap, estTotal, shipmentTotal,
  currentYear, currentMonth, prevYear, prevMonth, detectedYM,
}) {
  // ── 공통 topbar ───────────────────────────────────────────
  const topbar = (
    <div className="topbar">
      <div className="topbar-title">📊 메뉴 1. 대시보드</div>
      <div className="topbar-right">
        {detectedYM && (
          <span className="last-updated" style={{ color: '#10b981', fontWeight: 600 }}>
            당월: {currentYear}년 {currentMonth}월 (납기일 기준)
          </span>
        )}
        {lastUpdated && (
          <span className="last-updated">
            갱신: {lastUpdated.toLocaleTimeString('ko-KR')}
          </span>
        )}
        <button
          className={`btn-refresh ${loading ? 'spinning' : ''}`}
          onClick={refresh}
          disabled={loading}
        >
          <span className="refresh-icon">↻</span>
          {loading ? '로딩 중…' : '새로고침'}
        </button>
      </div>
    </div>
  )

  // ── 로딩 / 에러 ───────────────────────────────────────────
  if (error) return (
    <>
      {topbar}
      <div className="content">
        <div className="error-box">
          <h3>⚠️ 데이터 로드 실패</h3>
          <p style={{ marginTop: 6 }}>{error}</p>
          <p style={{ marginTop: 10, fontSize: 12 }}>
            구글 시트 → <strong>공유 → 링크가 있는 모든 사용자 → 뷰어 이상</strong>
          </p>
        </div>
      </div>
    </>
  )

  if (loading && b2bRecords.length === 0) return (
    <>
      {topbar}
      <div className="center-screen">
        <div className="spinner" />
        <span style={{ color: '#64748b', fontSize: 13 }}>구글 시트에서 데이터를 불러오는 중…</span>
      </div>
    </>
  )

  // 당월/전월이 아직 없으면 렌더링 보류
  if (!currentYear || !currentMonth) return (
    <>
      {topbar}
      <div className="center-screen">
        <div className="spinner" />
        <span style={{ color: '#64748b', fontSize: 13 }}>당월 정보를 확인하는 중…</span>
      </div>
    </>
  )

  return (
    <>
      {topbar}
      <div className="content">

        {/* 경고 */}
        {warnings?.length > 0 && (
          <div style={{
            background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10,
            padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#92400e'
          }}>
            ⚠️ {warnings.join(' | ')}
          </div>
        )}

        {/* Section 1 — 전년 vs 금년 월별 실적 */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">전년 vs 금년 월별 실적</div>
            <div className="section-sub">
              {currentYear - 1}년 · {currentYear}년 비교 · 월별 증감률 (원화판매금액 기준)
            </div>
          </div>
          <Section1Chart b2bRecords={b2bRecords} currentYear={currentYear} />
        </div>

        {/* Section 2 — 마감 실적 KPI */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">마감 실적</div>
            <div className="section-sub">
              기준: {prevYear}년 {prevMonth}월 마감 · B2B 매출 마감 현황 시트 (전월 누적)
            </div>
          </div>
          <Section2Closed
            b2bRecords={b2bRecords}
            targetMap={targetMap}
            currentYear={currentYear}
            prevYear={prevYear}
            prevMonth={prevMonth}
          />
        </div>

        {/* Section 3 — 당월 실적 */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">당월 실적</div>
            <div className="section-sub">
              {currentYear}년 {currentMonth}월 · 납기일 기준 · 미확정 제외
            </div>
          </div>
          <Section3CurrentMonth
            targetMap={targetMap}
            estTotal={estTotal}
            shipmentTotal={shipmentTotal}
            currentYear={currentYear}
            currentMonth={currentMonth}
          />
        </div>

        {/* Section 4 — 마감 실적 필터 */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">마감 실적 상세 (필터)</div>
            <div className="section-sub">
              년도·월·거래처·국가·담당자·품목 복합 필터
            </div>
          </div>
          <Section4Filtered b2bRecords={b2bRecords} />
        </div>

      </div>
    </>
  )
}
