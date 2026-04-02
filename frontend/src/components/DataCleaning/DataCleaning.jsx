import { useEffect, useState } from 'react'
import axios from 'axios'
import DataPreviewModal from '../DataPreview/DataPreviewModal'

export default function DataCleaning() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const fetchSummary = async () => {
    setLoading(true)
    const res = await axios.get('/api/cleaning/summary')
    setSummary(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchSummary() }, [])

  const performAction = async (action, column = null) => {
    setActionLoading(true)
    try {
      await axios.post('/api/cleaning/action', { action, column })
      await fetchSummary()
    } catch (err) {
      alert(err.response?.data?.detail || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleExport = () => {
    window.open('/api/cleaning/export', '_blank')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
    </div>
  )

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Hint */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-sm font-semibold text-amber-700">Data Cleaning Guide</p>
          <p className="text-sm text-amber-600 mt-0.5">
            Review each column below. For missing values, choose to drop rows or impute with mean/median/mode.
            Use IQR outlier detection for numeric columns. All actions are logged below.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-700">{summary?.total_rows}</p>
          <p className="text-xs text-slate-400 mt-1">Total Rows</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className={`text-2xl font-bold ${summary?.duplicate_rows > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {summary?.duplicate_rows}
          </p>
          <p className="text-xs text-slate-400 mt-1">Duplicate Rows</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">
            {Object.values(summary?.columns || {}).filter(c => c.missing_count > 0).length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Columns with Missing</p>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => performAction('drop_duplicates')}
          disabled={actionLoading || summary?.duplicate_rows === 0}
          className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-40 transition"
        >
          🗑️ Remove {summary?.duplicate_rows} Duplicates
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
        >
          👁️ Preview Dataset
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition"
        >
          ⬇️ Export Cleaned CSV
        </button>
      </div>

      {/* Column table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Column Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">Column</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Missing</th>
                <th className="px-4 py-3 text-left">Unique</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(summary?.columns || {}).map(([colName, colData]) => (
                <tr key={colName} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{colName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${colData.dtype.includes('float') || colData.dtype.includes('int')
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'}`}>
                      {colData.dtype}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {colData.missing_count > 0
                      ? <span className="text-red-500 font-medium">{colData.missing_count} ({colData.missing_pct}%)</span>
                      : <span className="text-green-500">✓ None</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-slate-500">{colData.unique}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {colData.missing_count > 0 && (
                        <>
                          {(colData.dtype.includes('float') || colData.dtype.includes('int')) && (
                            <>
                              <button onClick={() => performAction('impute_mean', colName)}
                                className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 border border-blue-200">
                                Mean
                              </button>
                              <button onClick={() => performAction('impute_median', colName)}
                                className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 border border-blue-200">
                                Median
                              </button>
                            </>
                          )}
                          <button onClick={() => performAction('impute_mode', colName)}
                            className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs hover:bg-purple-100 border border-purple-200">
                            Mode
                          </button>
                          <button onClick={() => performAction('drop_missing_column', colName)}
                            className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 border border-red-200">
                            Drop Rows
                          </button>
                        </>
                      )}
                      {(colData.dtype.includes('float') || colData.dtype.includes('int')) && (
                        <button onClick={() => performAction('drop_outliers', colName)}
                          className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-xs hover:bg-orange-100 border border-orange-200">
                          Remove Outliers
                        </button>
                      )}
                      <button onClick={() => performAction('drop_column', colName)}
                        className="px-2 py-1 bg-slate-50 text-slate-500 rounded text-xs hover:bg-slate-100 border border-slate-200">
                        Drop Col
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cleaning Log */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">🗒️ Cleaning Log</h3>
          <span className="text-xs text-slate-400">{summary?.cleaning_log?.length || 0} actions</span>
        </div>
        <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
          {summary?.cleaning_log?.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No actions performed yet.</p>
          ) : (
            summary?.cleaning_log?.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green-500 mt-0.5">✓</span>
                <p className="text-slate-600">{log}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {showPreview && <DataPreviewModal onClose={() => setShowPreview(false)} />}
    </div>
  )
}
