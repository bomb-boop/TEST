export default function Sidebar({ activeMenu, onSelect }) {
  const menus = [
    { id: 1, icon: '📊', label: '대시보드',    ready: true  },
    { id: 2, icon: '📋', label: '매출 상세',   ready: true  },
    { id: 3, icon: '🎯', label: '매출 보고',   ready: true  },
    { id: 4, icon: '🌐', label: '국가별 현황', ready: false },
    { id: 5, icon: '📦', label: '품목별 현황', ready: false },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>글로벌사업부<br/>영업 대시보드</h2>
        <span>Global Sales Intelligence</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">메뉴</div>
        {menus.map(m => (
          <div
            key={m.id}
            className={`nav-item ${activeMenu === m.id ? 'active' : ''}`}
            onClick={() => m.ready && onSelect(m.id)}
            style={{ opacity: m.ready ? 1 : 0.5, cursor: m.ready ? 'pointer' : 'default' }}
          >
            <span className="nav-icon">{m.icon}</span>
            <span>메뉴 {m.id}. {m.label}</span>
            {m.id === 1 && m.ready && <span className="nav-badge">Live</span>}
            {!m.ready && <span className="nav-coming">준비중</span>}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        v0.1 · 글로벌사업부
      </div>
    </aside>
  )
}
