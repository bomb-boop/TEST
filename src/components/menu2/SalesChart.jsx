import { Chart as ChartJS, registerables } from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { fmtKRWFull } from '../../utils/dataUtils.js'

ChartJS.register(...registerables)

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

export default function SalesChart({ b2bRecords, targetMap, currentYear, currentMonth, b2cData, shipmentTotal }) {
  const prevYear = currentYear - 1

  // 월별 실적 집계 (B2B)
  const map = {}
  for (const r of b2bRecords) {
    if (!map[r.year]) map[r.year] = {}
    map[r.year][r.month] = (map[r.year][r.month] || 0) + r.krw
  }

  // B2C 실적 합산 (전년 + 당년)
  if (b2cData?.actPrev) {
    b2cData.actPrev.forEach((v, i) => {
      if (v !== null) {
        if (!map[prevYear]) map[prevYear] = {}
        map[prevYear][i + 1] = (map[prevYear][i + 1] || 0) + v
      }
    })
  }
  if (b2cData?.actCurr) {
    b2cData.actCurr.forEach((v, i) => {
      if (v !== null) {
        if (!map[currentYear]) map[currentYear] = {}
        map[currentYear][i + 1] = (map[currentYear][i + 1] || 0) + v
      }
    })
  }

  const data2025 = MONTHS.map((_, i) => map[prevYear]?.[i + 1] ?? 0)
  // 목표: B2B 목표 + B2C 목표 합산
  const dataTarget = MONTHS.map((_, i) => {
    const m = i + 1
    return (targetMap?.[currentYear]?.[m] ?? 0) + (b2cData?.tgtCurr?.[i] ?? 0)
  })
  // 데이터 없는 월은 null → 선이 끊김
  // 당월은 출하의뢰 합계(B2B+해외법인) + B2C 실적으로 대체
  const b2cCurrMo = b2cData?.actCurr?.[currentMonth - 1] ?? 0
  const dataActual = MONTHS.map((_, i) => {
    const m = i + 1
    if (currentMonth && m === currentMonth) {
      const total = (shipmentTotal ?? 0) + b2cCurrMo
      return total > 0 ? total : null
    }
    return map[currentYear]?.[m] !== undefined ? map[currentYear][m] : null
  })

  const chartData = {
    labels: MONTHS,
    datasets: [
      {
        type: 'bar',
        label: `${prevYear}년`,
        data: data2025,
        backgroundColor: 'rgba(148,163,184,0.5)',
        borderColor:     'rgba(148,163,184,0.8)',
        borderWidth: 1,
        borderRadius: 3,
        yAxisID: 'y',
        order: 2,
      },
      {
        type: 'bar',
        label: `${currentYear}년 목표`,
        data: dataTarget,
        backgroundColor: 'rgba(251,191,36,0.65)',
        borderColor:     'rgba(251,191,36,1)',
        borderWidth: 1,
        borderRadius: 3,
        yAxisID: 'y',
        order: 3,
      },
      {
        type: 'line',
        label: `${currentYear}년 실적`,
        data: dataActual,
        borderColor:          '#ef4444',
        backgroundColor:      '#ef4444',
        pointBackgroundColor: '#ef4444',
        pointBorderColor:     '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        borderDash: [6, 4],
        tension: 0,
        yAxisID: 'y',
        order: 1,
        spanGaps: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 12 }, usePointStyle: true },
      },
      tooltip: {
        callbacks: {
          label(ctx) {
            if (ctx.raw === null) return ''
            return ` ${ctx.dataset.label}: ${fmtKRWFull(ctx.raw)}`
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          font: { size: 11 },
          callback: v => {
            if (v >= 1e8) return `${(v / 1e8).toFixed(0)}억`
            if (v >= 1e4) return `${(v / 1e4).toFixed(0)}만`
            return v.toLocaleString()
          },
        },
        grid: { color: '#f1f5f9' },
      },
      x: {
        ticks: { font: { size: 12 } },
        grid: { display: false },
      },
    },
  }

  return (
    <div className="card card-chart">
      <div className="chart-container">
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </div>
  )
}
