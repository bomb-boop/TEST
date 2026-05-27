import ReportTable from '../components/menu3/ReportTable.jsx'

export default function Menu3({
  loading, error, lastUpdated, refresh, warnings,
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
  prevYear,
  prevMonth,
  detectedYM,
}) {
  // ── 공통 topbar ───────────────────────────────────────────
  const topbar = (
    <div className="topbar">
      <div className="topbar-title">🎯 메뉴 3. 매출 보고</div>
      <div className="topbar-right">
        {detectedYM && (
          <span className="last-updated" style={{ color: '#10b981', fontWeight: 600 }}>
            당월: {currentYear}년 {currentMonth}월 (납기일 기준)
          </span>
        )}
        {weekStart && (
          <span className="last-updated" style={{ color: '#6366f1', fontWeight: 600 }}>
            금주 기준: {weekStart}~
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

        {/* 매출 보고 테이블 */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">주간 매출 보고</div>
            <div className="section-sub">
              해외법인 · B2B(국가별) · B2C | {currentYear}년 {currentMonth}월 기준
            </div>
          </div>
          <ReportTable
            b2bRecords={b2bRecords}
            targetByCustomer={targetByCustomer}
            estByCustomer={estByCustomer}
            customerCountry={customerCountry}
            overseasMap={overseasMap}
            overseasNames={overseasNames}
            weeklyByCustomer={weeklyByCustomer}
            weekStart={weekStart}
            b2cData={b2cData}
            currentYear={currentYear}
            currentMonth={currentMonth}
          />
        </div>

      </div>
    </>
  )
}
