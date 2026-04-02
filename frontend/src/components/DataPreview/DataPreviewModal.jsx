import { useEffect, useState } from 'react'
import axios from 'axios'

const PAGE_SIZE = 50

export default function DataPreviewModal({ onClose }) {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/upload/data').then(res => {
      setData(res.data.data)
      setColumns(res.data.columns)
      setTotalRows(res.data.rows)
      setLoading(false)
    })
  }, [])

  const totalPages = Math.ceil(totalRows / PAGE_SIZE)
  const pageData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Full Dataset Preview</h2>
            <p className="text-sm text-slate-400">{totalRows} rows × {columns.length} columns</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >×</button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 border border-slate-200">#</th>
                  {columns.map(col => (
                    <th key={col} className="px-3 py-2 text-left text-xs font-semibold text-slate-600 border border-slate-200 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-3 py-1.5 text-slate-400 text-xs border border-slate-100">
                      {(page - 1) * PAGE_SIZE + i + 1}
                    </td>
                    {columns.map(col => (
                      <td key={col} className="px-3 py-1.5 border border-slate-100 text-slate-700">
                        {row[col] === null || row[col] === undefined
                          ? <span className="text-red-400 italic">null</span>
                          : String(row[col])
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalRows)} of {totalRows} rows
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm bg-slate-100 rounded-lg disabled:opacity-40 hover:bg-slate-200"
            >← Prev</button>
            <span className="px-3 py-1.5 text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm bg-slate-100 rounded-lg disabled:opacity-40 hover:bg-slate-200"
            >Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
