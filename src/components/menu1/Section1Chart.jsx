import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  BarController, LineController,
  Title, Tooltip, Legend
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { monthlyMap, fmtKRWFull } from '../../utils/dataUtils.js'

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  BarController, LineController,
  Title, Tooltip, Legend
)

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

export default function Section1Chart({ b2bRecords, currentYear }) {
  const map = monthlyMap(b2bRecords)
  const prev = currentYear - 1

  const data2025 = MONTHS.map((_, i) => map[prev]?.[i + 1] ?? 0)
  const data2026 = MONTHS.map((_, i) => map[currentYear]?.[i + 1] ?? 0)

  // 월별 증감률
  const growthRates = data2025.map((v25, i) => {
    const v26 = data2026[i]
    if (!v25 && !v26) return null
    if (!v25) return null
    return ((v26 - v25) / v25) * 100
  })

  const chartData = {
    labels: MONTHS,
    datasets: [
      {
        type: 'bar',
        label: `${prev}년`,
        data: data2025,
        backgroundColor: 'rgba(148,163,184,0.6)',
        borderColor: 'rgba(148,163,184,1)',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'yAmount',
        order: 2,
      },
      {
        type: 'bar',
        label: `${currentYear}년`,
        data: data2026,
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderColor: 'rgba(59,130,246,1)',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'yAmount',
        order: 2,
      },
      {
        type: 'line',
        label: '전년比 증감률(%)',
        data: growthRates,
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b',
        pointBackgroundColor: '#f59e0b',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2,
        tension: 0.35,
        yAxisID: 'yRate',
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
      legend: { position: 'top', labels: { font: { size: 12 }, usePointStyle: true } },
      tooltip: {
        callbacks: {
          label(ctx) {
            if (ctx.dataset.yAxisID === 'yRate') {
              const v = ctx.raw
              return v === null ? '' : ` 증감률: ${v.toFixed(1)}%`
            }
            return ` ${ctx.dataset.label}: ${fmtKRWFull(ctx.raw)}`
          },
        },
      },
    },
    scales: {
      yAmount: {
        type: 'linear',
        position: 'left',
        ticks: {
          font: { size: 11 },
          callback: v => {
            if (v >= 1e8) return `${(v/1e8).toFixed(0)}억`
            if (v >= 1e4) return `${(v/1e4).toFixed(0)}만`
            return v.toLocaleString()
          },
        },
        grid: { color: '#f1f5f9' },
      },
      yRate: {
        type: 'linear',
        position: 'right',
        ticks: { font: { size: 11 }, callback: v => `${v.toFixed(0)}%` },
        grid: { drawOnChartArea: false },
      },
      x: { ticks: { font: { size: 12 } }, grid: { display: false } },
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
