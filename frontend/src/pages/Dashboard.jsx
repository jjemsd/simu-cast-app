import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import DataImport from '../components/DataImport/DataImport'
import DataCleaning from '../components/DataCleaning/DataCleaning'
import DescriptiveStats from '../components/DescriptiveStats/DescriptiveStats'
import NormalityTests from '../components/NormalityTests/NormalityTests'
import ModelSelection from '../components/ModelSelection/ModelSelection'
import WhatIfSimulation from '../components/WhatIfSimulation/WhatIfSimulation'
import AIChat from '../components/AIChat/AIChat'

const STEPS = [
  { id: 'upload',     label: 'Data Import',         icon: '📁' },
  { id: 'cleaning',   label: 'Data Cleaning',        icon: '🧹' },
  { id: 'stats',      label: 'Descriptive Stats',    icon: '📊' },
  { id: 'normality',  label: 'Normality Tests',      icon: '📈' },
  { id: 'modeling',   label: 'Model Selection',      icon: '🤖' },
  { id: 'simulation', label: 'What-If Simulation',   icon: '🔮' },
]

export default function Dashboard() {
  const [activeStep, setActiveStep] = useState('upload')
  const [datasetLoaded, setDatasetLoaded] = useState(false)
  const [datasetInfo, setDatasetInfo] = useState(null)

  const handleUploadSuccess = (info) => {
    setDatasetInfo(info)
    setDatasetLoaded(true)
    setActiveStep('cleaning')
  }

  const renderStep = () => {
    switch (activeStep) {
      case 'upload':
        return <DataImport onUploadSuccess={handleUploadSuccess} />
      case 'cleaning':
        return <DataCleaning />
      case 'stats':
        return <DescriptiveStats />
      case 'normality':
        return <NormalityTests />
      case 'modeling':
        return <ModelSelection />
      case 'simulation':
        return <WhatIfSimulation />
      default:
        return <DataImport onUploadSuccess={handleUploadSuccess} />
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        steps={STEPS}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        datasetLoaded={datasetLoaded}
        datasetInfo={datasetInfo}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            {STEPS.find(s => s.id === activeStep)?.icon}{' '}
            {STEPS.find(s => s.id === activeStep)?.label}
          </h1>
          {datasetInfo && (
            <p className="text-sm text-slate-500 mt-1">
              Dataset: <span className="font-medium text-indigo-600">{datasetInfo.filename}</span>
              {' '}— {datasetInfo.rows} rows × {datasetInfo.columns} columns
            </p>
          )}
        </div>

        {/* Step Content */}
        {renderStep()}
      </main>

      {/* AI Chat Sidebar */}
      <AIChat currentStep={activeStep} />
    </div>
  )
}
