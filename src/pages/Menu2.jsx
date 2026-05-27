import SalesChart from '../components/menu2/SalesChart.jsx'
import SalesTable from '../components/menu2/SalesTable.jsx'

export default function Menu2({
  loading, error, lastUpdated, refresh, warnings,
  b2bRecords, targetMap, targetB2B, targetOverseas, overseasNames,
  b2cData,
  shipmentTotal, shipB2BTotal, shipOverseasTotal,
  currentYear, currentMonth, detectedYM,
}) {
  // ── 공통 topbar ───────────────────────────────────────────
  const topbar = (
    <div className="topbar">
      <div className="topbar-title">📋 메뉴 2. 매출 상세</div>
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
        </div>
      </div>
    </>
  )

  if (loading && b2bRecords.length === 0) return (
    <>
      {topbar}
      <div className="center-screen">
        <div className="spinner" />
        <span style={{ color: '#64748b', fontSize: 13 }}>데이터를 불러오는 중…</span>
      </div>
    </>
  )

  if (!currentYear) return (
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
            padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#92400e',
          }}>
            ⚠️ {warnings.join(' | ')}
          </div>
        )}

        {/* 차트 섹션 */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">전년 vs 금년 월별 실적</div>
            <div className="section-sub">
              {currentYear - 1}년 실적 · {currentYear}년 목표 · {currentYear}년 실적 비교 (합계 기준)
            </div>
          </div>
          <SalesChart
            b2bRecords={b2bRecords}
            targetMap={targetMap}
            currentYear={currentYear}
            currentMonth={currentMonth}
            b2cData={b2cData}
            shipmentTotal={shipmentTotal}
          />
        </div>

        {/* 테이블 섹션 */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">매출 상세 현황</div>
            <div className="section-sub">
              합계 · B2B(해외법인 제외) · 해외법인수출 · B2C | 기준: {currentYear}년
            </div>
          </div>
          <SalesTable
            b2bRecords={b2bRecords}
            targetMap={targetMap}
            targetB2B={targetB2B}
            targetOverseas={targetOverseas}
            overseasNames={overseasNames}
            currentYear={currentYear}
            currentMonth={currentMonth}
            b2cData={b2cData}
            shipB2BTotal={shipB2BTotal}
            shipOverseasTotal={shipOverseasTotal}
          />
        </div>

      </div>
    </>
  )
}
