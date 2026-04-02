import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import DataPreviewModal from '../DataPreview/DataPreviewModal'

export default function DataImport({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post('/api/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadResult(res.data)
      onUploadSuccess(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hint card */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-sm font-semibold text-indigo-700">Getting Started</p>
          <p className="text-sm text-indigo-600 mt-0.5">
            Upload a CSV or Excel file to begin. SimuCast will automatically detect column types,
            check for missing values, and guide you through the entire analysis process.
          </p>
        </div>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
          ${isDragActive
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-slate-300 bg-white hover:border-indigo-300 hover:bg-slate-50'
          }`}
      >
        <input {...getInputProps()} />
        <div className="text-5xl mb-4">📂</div>
        {isDragActive ? (
          <p className="text-indigo-600 font-medium">Drop your file here...</p>
        ) : (
          <>
            <p className="text-slate-700 font-medium text-lg">Drag & drop your dataset here</p>
            <p className="text-slate-400 text-sm mt-1">or click to browse files</p>
            <p className="text-slate-300 text-xs mt-3">Supports: CSV, XLSX, XLS</p>
          </>
        )}
      </div>

      {/* Uploading state */}
      {uploading && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          <p className="text-slate-600 text-sm">Uploading and analyzing dataset...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Success result */}
      {uploadResult && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-green-500 text-xl">✅</span>
            <p className="font-semibold text-slate-700">Dataset loaded successfully</p>
          </div>

          {/* Column info table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2 text-left">Column</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Missing</th>
                  <th className="px-4 py-2 text-left">Unique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {uploadResult.column_info?.map((col) => (
                  <tr key={col.name} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-700">{col.name}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${col.type === 'numeric' ? 'bg-blue-100 text-blue-700' :
                          col.type === 'categorical' ? 'bg-purple-100 text-purple-700' :
                          'bg-orange-100 text-orange-700'}`}>
                        {col.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {col.missing > 0
                        ? <span className="text-red-500">{col.missing} ({col.missing_pct}%)</span>
                        : <span className="text-green-500">None</span>
                      }
                    </td>
                    <td className="px-4 py-2 text-slate-500">{col.unique}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setShowPreview(true)}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            View Full Dataset
          </button>
        </div>
      )}

      {showPreview && (
        <DataPreviewModal onClose={() => setShowPreview(false)} />
      )}
    </div>
  )
}
