import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { PatientHabitsPanel } from '@/features/patients/components/PatientHabitsPanel'
import { usePatient } from '@/features/patients/hooks/use-patient'
import { usePatientHabits } from '@/features/patients/hooks/use-patient-habits'

export function PatientDetailPage() {
  const { patientId = '' } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const { data: patient, isLoading: isPatientLoading } = usePatient(patientId)
  const { data: habits = [], isLoading: isHabitsLoading } = usePatientHabits(patientId)

  if (isPatientLoading || isHabitsLoading) return <LoadingSpinner />

  if (!patient) {
    return (
      <AppLayout>
        <p className="text-sm text-gray-400">Patient not found.</p>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/nutritionist/patients')}
          className="text-sm font-medium text-deep-purple/60 hover:text-deep-purple"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-deep-purple">{patient.fullName}</h1>
          <p className="mt-0.5 text-xs text-gray-400">
            Patient since {new Date(patient.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Last 30 Days
        </h2>
        <PatientHabitsPanel habits={habits} />
      </section>
    </AppLayout>
  )
}
