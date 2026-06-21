import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { PatientCard } from '@/features/patients/components/PatientCard'
import { PatientSearchPanel } from '@/features/nutritionists/components/PatientSearchPanel'
import { usePatients } from '@/features/patients/hooks/use-patients'
import { useAssignPatient } from '@/features/patients/hooks/use-assign-patient'
import { useUnassignPatient } from '@/features/patients/hooks/use-unassign-patient'
import { getErrorMessage } from '@/lib/get-error-message'

type Tab = 'patients' | 'assign'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'patients', label: 'My patients' },
  { id: 'assign', label: 'Assign patient' },
]

export function NutritionistPatientsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('patients')
  const [assigningId, setAssigningId] = useState<string | null>(null)

  const { data: patients = [], isLoading } = usePatients()
  const assign = useAssignPatient()
  const unassign = useUnassignPatient()

  const handleAssign = (patientId: string) => {
    setAssigningId(patientId)
    assign.mutate(patientId, {
      onSuccess: () => {
        assign.reset()
        setActiveTab('patients')
      },
      onSettled: () => setAssigningId(null),
    })
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-deep-purple">Patients</h1>
      </div>

      {/* Nav pills */}
      <div className="mb-6 flex gap-1 rounded-xl bg-light-gray p-1" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-white text-deep-purple shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.id === 'patients' && (
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                ({patients.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* My patients panel */}
      <div
        id="panel-patients"
        role="tabpanel"
        hidden={activeTab !== 'patients'}
      >
        {patients.length === 0 ? (
          <p className="text-sm text-gray-400">
            No patients assigned yet. Go to{' '}
            <button
              className="font-medium text-deep-purple underline"
              onClick={() => setActiveTab('assign')}
            >
              Assign patient
            </button>{' '}
            to add one.
          </p>
        ) : (
          <section className="space-y-3">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={(id) => navigate(`/nutritionist/patients/${id}`)}
                onUnassign={(id) => unassign.mutate(id)}
                isUnassigning={unassign.isPending}
              />
            ))}
          </section>
        )}
      </div>

      {/* Assign patient panel */}
      <div
        id="panel-assign"
        role="tabpanel"
        hidden={activeTab !== 'assign'}
      >
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <PatientSearchPanel
            onAssign={handleAssign}
            isAssigning={assign.isPending}
            assigningId={assigningId}
            error={assign.error ? getErrorMessage(assign.error) : null}
          />
        </div>
      </div>
    </AppLayout>
  )
}
