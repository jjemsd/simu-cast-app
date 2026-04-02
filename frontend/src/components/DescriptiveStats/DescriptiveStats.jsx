import { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const STAT_LABELS = {
  count: 'Count', mean: 'Mean', median: 'Median', mode: 'Mode',
  std: 'Std Dev', variance: 'Variance', sum: 'Sum',
  min: 'Min', max: 'Max', range: 'Range',
  skewness: 'Skewness', kurtosis: 'Kurtosis',
  q1: 'Q1 (25%)', q3: 'Q3 (75%)'
}

export default function DescriptiveStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCol, setSelectedCol] = useState(null)

  useEffect(() => {
    axios.get('/api/stats/descriptive').then(res => {
      setStats(res.data)
      const cols = Object.keys(res.data.numeric_stats)
      if (cols.length > 0) setSelectedCol(cols[0])
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
    </div>
  )

  const numericCols = Object.keys(stats?.numeric_stats || {})
  const selectedStats = selectedCol ? stats?.numeric_stats[selectedCol] : null

  const chartData = numericCols.map(col => ({
    name: col,
    mean: stats.numeric_stats[col].mean,
    std: stats.numeric_stats[col].std
  }))

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-sm font-semibold text-blue-700">Reading Descriptive Stats</p>
          <p className="text-sm text-blue-600 mt-0.5">
            Skewness near 0 means symmetric distribution. Values above 1 or below -1 indicate skewed data.
            High kurtosis means heavy tails. Check these before running normality tests.
          </p>
        </div>
      </div>

      {/* Full stats table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Numeric Column Statistics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left sticky left-0 bg-slate-50">Statistic</th>
                {numericCols.map(col => (
                  <th key={col} className="px-4 py-3 text-right whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(STAT_LABELS).map(([key, label]) => (
                <tr key={key} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-600 sticky left-0 bg-white">{label}</td>
                  {numericCols.map(col => {
                    const val = stats.numeric_stats[col][key]
                    const isSkewness = key === 'skewness'
                    const isHigh = isSkewness && Math.abs(val) > 1
                    return (
                      <td key={col} className={`px-4 py-2.5 text-right font-mono text-xs
                        ${isHigh ? 'text-orange-500 font-semibold' : 'text-slate-700'}`}>
                        {val !== null ? val : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar chart - mean comparison */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Mean by Column</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="mean" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Frequency tables for categorical */}
      {Object.keys(stats?.frequency_tables || {}).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Categorical Frequency Tables</h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(stats.frequency_tables).map(([col, freqs]) => (
              <div key={col}>
                <p className="text-sm font-semibold text-slate-700 mb-2">{col}</p>
                <table className="w-full text-sm">
                  <thead className="text-xs text-slate-400">
                    <tr>
                      <th className="text-left pb-1">Value</th>
                      <th className="text-right pb-1">Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(freqs).slice(0, 10).map(([val, count]) => (
                      <tr key={val}>
                        <td className="py-1 text-slate-600">{val}</td>
                        <td className="py-1 text-right text-slate-700 font-mono">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
