import { Component } from 'react'

/**
 * 전역 에러 바운더리
 * React 컴포넌트 트리에서 발생하는 렌더링 에러를 잡아
 * 빈 화면 대신 에러 메시지를 표시합니다.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] 앱 렌더링 오류:', error, info)
    this.setState({ info })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh',
          fontFamily: 'sans-serif', background: '#f1f5f9', padding: 40,
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: '32px 40px',
            boxShadow: '0 4px 24px rgba(0,0,0,.08)', maxWidth: 680, width: '100%',
          }}>
            <h2 style={{ color: '#ef4444', marginBottom: 12 }}>⚠️ 앱 렌더링 오류</h2>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
              아래 에러 내용을 개발자에게 전달해 주세요.
            </p>
            <pre style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, padding: 16, fontSize: 12,
              color: '#991b1b', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              maxHeight: 320, overflow: 'auto',
            }}>
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.info?.componentStack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 20, padding: '8px 20px', background: '#3b82f6',
                color: '#fff', border: 'none', borderRadius: 8,
                cursor: 'pointer', fontSize: 13,
              }}
            >
              새로고침
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
