import { useState, useEffect } from 'react'
import { useAllSheets } from './hooks/useAllSheets.js'
import Sidebar   from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Menu2     from './pages/Menu2.jsx'
import Menu3     from './pages/Menu3.jsx'

export default function App() {
  const [activeMenu, setActiveMenu] = useState(1)

  // 단일 데이터 소스 — 모든 메뉴가 동일한 상태를 공유하며 함께 갱신됨
  const sheetData = useAllSheets()

  // 디버그: 콘솔에 상태 출력
  useEffect(() => {
    console.log('App Data State:', sheetData)
  }, [sheetData])

  return (
    <div className="layout">
      <Sidebar activeMenu={activeMenu} onSelect={setActiveMenu} />
      <main className="main">
        {sheetData.loading && (
          <div className="center-screen">
            <div style={{ fontSize: 48 }}>⏳</div>
            <p style={{ color: '#64748b', fontSize: 14 }}>데이터 로딩 중...</p>
            {sheetData.error && <p style={{ color: 'red', fontSize: 12 }}>{sheetData.error}</p>}
          </div>
        )}
        {!sheetData.loading && (
          <>
            {activeMenu === 1 && <Dashboard {...sheetData} />}
            {activeMenu === 2 && <Menu2     {...sheetData} />}
            {activeMenu === 3 && <Menu3     {...sheetData} />}
            {activeMenu > 3 && (
              <div className="center-screen">
                <div style={{ fontSize: 48 }}>🚧</div>
                <p style={{ color: '#64748b', fontSize: 14 }}>메뉴 {activeMenu}은 준비 중입니다.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
