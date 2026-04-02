import { useEffect, useState } from 'react'
import axios from 'axios'

export default function WhatIfSimulation() {
  const [columns, setColumns] = useState([])
  const [targetCol, setTargetCol] = useState('')
  const [modelType, setModelType] = useState('linear_regression')
  const [inputValues, setInputValues] = useState({})
  const [baseline, setBaseline] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.get('/api/upload/data').then(res => {
      setColumns(res.data.columns)
      const last = res.data.columns[res.data.columns.length - 1]
      setTargetCol(last)
      const initial = {}
      res.data.columns.filter(c => c !== last).forEach(c => initial[c] = 0)
      setInputValues(initial)
    })
  }, [])

  const featureCols = columns.filter(c => c !== targetCol)

  const predict = async (label = 'Scenario') => {
    setLoading(true)
    try {
      const res = await axios.post('/api/simulation/predict', {
        model_type: modelType,
        target_column: targetCol,
        input_values: inputValues
      })
      const result = { ...res.data, label, inputs: { ...inputValues }, timestamp: new Date().toLocaleTimeString() }
      if (!baseline) {
        setBaseline(result)
      } else {
        setScenarios(prev => [...prev, result])
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => {
    setBaseline(null)
    setScenarios([])
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Hint */}
      <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-xl p-4 flex gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-sm font-semibold text-fuchsia-700">How What-If Analysis Works</p>
          <p className="text-sm text-fuchsia-600 mt-0.5">
            First, set your input values and click <strong>Set Baseline</strong> to get the reference prediction.
            Then adjust the values and click <strong>Add Scenario</strong> to compare outcomes.
            Use this to explore "what if X changes?" questions.
          </p>
        </div>
      </div>

      {/* Config */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Target Column</label>
            <select
              value={targetCol}
              onChange={e => setTargetCol(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Model</label>
            <select
              value={modelType}
              onChange={e => setModelType(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="linear_regression">Linear Regression</option>
              <option value="logistic_regression">Logistic Regression</option>
              <option value="decision_tree">Decision Tree</option>
            </select>
          </div>
        </div>

        {/* Input sliders / fields */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Input Variables</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {featureCols.map(col => (
              <div key={col}>
                <label className="block text-xs text-slate-500 mb-1">{col}</label>
                <input
                  type="number"
                  value={inputValues[col] ?? 0}
                  onChange={e => setInputValues(prev => ({ ...prev, [col]: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {!baseline ? (
            <button
              onClick={() => predict('Baseline')}
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {loading ? '⏳ Predicting...' : '📍 Set Baseline'}
            </button>
          ) : (
            <>
              <button
                onClick={() => predict(`Scenario ${scenarios.length + 1}`)}
                disabled={loading}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {loading ? '⏳ Predicting...' : '➕ Add Scenario'}
              </button>
              <button
                onClick={resetAll}
                className="px-5 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
              >
                🔄 Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Comparison table */}
      {baseline && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Scenario Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">Scenario</th>
                  {featureCols.map(c => (
                    <th key={c} className="px-4 py-3 text-right">{c}</th>
                  ))}
                  <th className="px-4 py-3 text-right text-indigo-600">Predicted {targetCol}</th>
                  <th className="px-4 py-3 text-right">vs Baseline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[baseline, ...scenarios].map((s, i) => {
                  const diff = i === 0 ? null : s.prediction - baseline.prediction
                  return (
                    <tr key={i} className={i === 0 ? 'bg-indigo-50' : 'hover:bg-slate-50'}>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {i === 0 ? '📍 Baseline' : `🔮 ${s.label}`}
                        <span className="block text-xs text-slate-400 font-normal">{s.timestamp}</span>
                      </td>
                      {featureCols.map(c => (
                        <td key={c} className="px-4 py-3 text-right font-mono text-slate-600">
                          {s.inputs?.[c] ?? '—'}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right font-mono font-bold text-indigo-700">
                        {parseFloat(s.prediction).toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {diff === null
                          ? <span className="text-slate-400">—</span>
                          : <span className={diff > 0 ? 'text-green-600' : 'text-red-600'}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(4)}
                            </span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
