import { useEffect, useState } from 'react'
import axios from 'axios'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'

export default function NormalityTests() {
  const [columns, setColumns] = useState([])
  const [selectedCol, setSelectedCol] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.get('/api/stats/descriptive').then(res => {
      const cols = res.data.numeric_columns
      setColumns(cols)
      if (cols.length > 0) setSelectedCol(cols[0])
    })
  }, [])

  const runTest = async () => {
    if (!selectedCol) return
    setLoading(true)
    setResult(null)
    try {
      const res = await axios.get(`/api/normality/${selectedCol}`)
      setResult(res.data)
    } catch (err) {
      alert('Test failed: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const qqData = result?.qq_data
    ? result.qq_data.theoretical_quantiles.map((x, i) => ({
        x: parseFloat(x.toFixed(4)),
        y: parseFloat(result.qq_data.sample_quantiles[i].toFixed(4))
      }))
    : []

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Hint */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-sm font-semibold text-green-700">Understanding Normality Tests</p>
          <p className="text-sm text-green-600 mt-0.5">
            <strong>Shapiro-Wilk</strong> is used for small datasets (n ≤ 50).
            <strong> Kolmogorov-Smirnov</strong> is used for larger datasets.
            If p-value &gt; 0.05, the data is likely <strong>normally distributed</strong>.
            This determines which statistical tests are appropriate next.
          </p>
        </div>
      </div>

      {/* Column selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select a numeric column to test
        </label>
        <div className="flex gap-3">
          <select
            value={selectedCol}
            onChange={e => setSelectedCol(e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          <button
            onClick={runTest}
            disabled={loading || !selectedCol}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? 'Running...' : 'Run Test'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Result card */}
          <div className={`rounded-xl border p-5 ${result.is_normal
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{result.is_normal ? '✅' : '⚠️'}</span>
              <div>
                <p className="font-bold text-slate-800 text-lg">
                  {result.is_normal ? 'Normally Distributed' : 'Not Normally Distributed'}
                </p>
                <p className="text-sm text-slate-500">{result.test_used} Test — Column: {result.column}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="bg-white/60 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Test Statistic</p>
                <p className="font-mono font-bold text-slate-700">{result.statistic}</p>
              </div>
              <div className="bg-white/60 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">p-value</p>
                <p className={`font-mono font-bold ${result.p_value > 0.05 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.p_value}
                </p>
              </div>
              <div className="bg-white/60 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Sample Size (n)</p>
                <p className="font-mono font-bold text-slate-700">{result.n}</p>
              </div>
            </div>
            <p className="text-sm mt-3 text-slate-600">
              {result.is_normal
                ? '✓ p-value > 0.05 — You can use parametric tests (t-test, ANOVA, Linear Regression).'
                : '✗ p-value ≤ 0.05 — Consider non-parametric alternatives (Mann-Whitney, Kruskal-Wallis) or data transformation.'}
            </p>
          </div>

          {/* Q-Q Plot */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">Q-Q Plot</h3>
            <p className="text-xs text-slate-400 mb-4">Points close to the line = normal distribution</p>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart>
                <XAxis dataKey="x" name="Theoretical" tick={{ fontSize: 11 }} label={{ value: 'Theoretical Quantiles', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                <YAxis dataKey="y" name="Sample" tick={{ fontSize: 11 }} label={{ value: 'Sample Quantiles', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <ReferenceLine
                  segment={[
                    { x: qqData[0]?.x, y: result.qq_data.slope * qqData[0]?.x + result.qq_data.intercept },
                    { x: qqData[qqData.length - 1]?.x, y: result.qq_data.slope * qqData[qqData.length - 1]?.x + result.qq_data.intercept }
                  ]}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                />
                <Scatter data={qqData} fill="#6366f1" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
