import type { PatientDto } from '../nutritionists.types'

interface PatientCardProps {
  patient: PatientDto
  onClick: (patientId: string) => void
  onUnassign: (patientId: string) => void
  isUnassigning: boolean
}

export function PatientCard({ patient, onClick, onUnassign, isUnassigning }: PatientCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
      <button
        type="button"
        className="flex-1 text-left"
        onClick={() => onClick(patient.id)}
      >
        <p className="font-semibold text-deep-purple">{patient.fullName}</p>
        <p className="mt-0.5 text-xs text-gray-400">
          Patient since {new Date(patient.createdAt).toLocaleDateString()}
        </p>
      </button>
      <button
        type="button"
        onClick={() => onUnassign(patient.id)}
        disabled={isUnassigning}
        aria-label={`Unassign ${patient.fullName}`}
        className="ml-4 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
      >
        Unassign
      </button>
    </div>
  )
}
