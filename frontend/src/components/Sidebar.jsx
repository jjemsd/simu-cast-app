export default function Sidebar({ steps, activeStep, setActiveStep, datasetLoaded, datasetInfo }) {
  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-slate-200">
        <h2 className="text-xl font-bold text-indigo-600 tracking-tight">SimuCast</h2>
        <p className="text-xs text-slate-400 mt-0.5">Predictive Analytics Platform</p>
      </div>

      {/* Steps */}
      <nav className="flex-1 p-3 space-y-1">
        {steps.map((step, index) => {
          const isActive = activeStep === step.id
          const isLocked = !datasetLoaded && step.id !== 'upload'

          return (
            <button
              key={step.id}
              onClick={() => !isLocked && setActiveStep(step.id)}
              disabled={isLocked}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : isLocked
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
            >
              <span className="text-base">{step.icon}</span>
              <span>{step.label}</span>
              {isLocked && (
                <span className="ml-auto text-slate-300 text-xs">🔒</span>
              )}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Dataset info at bottom */}
      {datasetInfo && (
        <div className="p-3 border-t border-slate-200">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Loaded Dataset</p>
            <p className="text-xs text-slate-700 font-medium truncate">{datasetInfo.filename}</p>
            <p className="text-xs text-slate-400">{datasetInfo.rows} rows · {datasetInfo.columns} cols</p>
          </div>
        </div>
      )}
    </aside>
  )
}
