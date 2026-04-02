import { useEffect, useState } from 'react'
import axios from 'axios'

const MODEL_INFO = {
  linear_regression: {
    name: 'Linear Regression',
    icon: '📉',
    desc: 'Predicts a continuous numeric value. Best when the relationship between variables is linear.',
    use: 'Regression tasks'
  },
  logistic_regression: {
    name: 'Logistic Regression',
    icon: '🎯',
    desc: 'Predicts a binary outcome (yes/no, 0/1). Provides probability scores for each class.',
    use: 'Classification tasks'
  },
  decision_tree: {
    name: 'Decision Tree',
    icon: '🌳',
    desc: 'Uses if-then rules to make predictions. Easy to interpret and works with mixed data types.',
    use: 'Both regression & classification'
  }
}

export default function ModelSelection() {
  const [columns, setColumns] = useState([])
  const [targetCol, setTargetCol] = useState('')
  const [results, setResults] = useState(null)
  const [taskType, setTaskType] = useState(null)
  const [recommendation, setRecommendation] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.get('/api/upload/data').then(res => {
      setColumns(res.data.columns)
      if (res.data.columns.length > 0) setTargetCol(res.data.columns[res.data.columns.length - 1])
    })
  }, [])

  const trainModels = async () => {
    setLoading(true)
    setResults(null)
    try {
      const res = await axios.post('/api/modeling/train', {
        target_column: targetCol,
        model_type: 'all',
        test_size: 0.2
      })
      setResults(res.data.results)
      setTaskType(res.data.task_type)
      setRecommendation(res.data.recommendation)
    } catch (err) {
      alert(err.response?.data?.detail || 'Training failed')
    } finally {
      setLoading(false)
    }
  }

  const getBestModel = () => {
    if (!results || !taskType) return null
    if (taskType === 'regression') {
      return Object.entries(results).reduce((a, b) =>
        (results[a[0]]?.r2 || -999) > (results[b[0]]?.r2 || -999) ? a : b
      )[0]
    } else {
      return Object.entries(results).reduce((a, b) =>
        (results[a[0]]?.f1 || 0) > (results[b[0]]?.f1 || 0) ? a : b
      )[0]
    }
  }

  const bestModel = getBestModel()

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Hint */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-sm font-semibold text-purple-700">Model Selection Guide</p>
          <p className="text-sm text-purple-600 mt-0.5">
            Select your <strong>target column</strong> — the variable you want to predict.
            SimuCast will automatically detect the task type (regression vs classification)
            and train multiple models so you can compare performance.
          </p>
        </div>
      </div>

      {/* Target column selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Target Column <span className="text-slate-400 font-normal">(what you want to predict)</span>
        </label>
        <p className="text-xs text-slate-400 mb-3">
          Choose a numeric column for regression, or a column with few unique values for classification.
        </p>
        <div className="flex gap-3">
          <select
            value={targetCol}
            onChange={e => setTargetCol(e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          <button
            onClick={trainModels}
            disabled={loading || !targetCol}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? '⏳ Training...' : '🚀 Train Models'}
          </button>
        </div>
      </div>

      {/* Model cards */}
      {!results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(MODEL_INFO).map(([key, info]) => (
            <div key={key} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-2xl mb-2">{info.icon}</div>
              <p className="font-semibold text-slate-700 text-sm">{info.name}</p>
              <p className="text-xs text-slate-400 mt-1">{info.desc}</p>
              <span className="mt-2 inline-block px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">
                {info.use}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Task type */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <span className="text-2xl">{taskType === 'regression' ? '📉' : '🎯'}</span>
            <div>
              <p className="font-semibold text-slate-700">
                Task detected: <span className="text-indigo-600 capitalize">{taskType}</span>
              </p>
              <p className="text-sm text-slate-400">
                {taskType === 'regression'
                  ? 'Your target column contains continuous numeric values.'
                  : 'Your target column contains categorical or few unique values.'}
              </p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm font-semibold text-indigo-700">AI Recommendation</p>
              <p className="text-sm text-indigo-600 mt-0.5">{recommendation}</p>
            </div>
          </div>

          {/* Metrics table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Model Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left">Model</th>
                    {taskType === 'regression'
                      ? <>
                          <th className="px-5 py-3 text-right">MAE</th>
                          <th className="px-5 py-3 text-right">RMSE</th>
                          <th className="px-5 py-3 text-right">R²</th>
                        </>
                      : <>
                          <th className="px-5 py-3 text-right">Accuracy</th>
                          <th className="px-5 py-3 text-right">Precision</th>
                          <th className="px-5 py-3 text-right">Recall</th>
                          <th className="px-5 py-3 text-right">F1</th>
                        </>
                    }
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(results).map(([modelKey, metrics]) => (
                    <tr key={modelKey} className={`hover:bg-slate-50 ${modelKey === bestModel ? 'bg-indigo-50' : ''}`}>
                      <td className="px-5 py-3 font-medium text-slate-700">
                        {MODEL_INFO[modelKey]?.icon} {MODEL_INFO[modelKey]?.name || modelKey}
                      </td>
                      {taskType === 'regression'
                        ? <>
                            <td className="px-5 py-3 text-right font-mono text-slate-600">{metrics.mae}</td>
                            <td className="px-5 py-3 text-right font-mono text-slate-600">{metrics.rmse}</td>
                            <td className="px-5 py-3 text-right font-mono font-bold text-slate-700">{metrics.r2}</td>
                          </>
                        : <>
                            <td className="px-5 py-3 text-right font-mono text-slate-600">{metrics.accuracy}</td>
                            <td className="px-5 py-3 text-right font-mono text-slate-600">{metrics.precision}</td>
                            <td className="px-5 py-3 text-right font-mono text-slate-600">{metrics.recall}</td>
                            <td className="px-5 py-3 text-right font-mono font-bold text-slate-700">{metrics.f1}</td>
                          </>
                      }
                      <td className="px-5 py-3 text-center">
                        {modelKey === bestModel
                          ? <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">⭐ Best</span>
                          : <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-xs">Trained</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
