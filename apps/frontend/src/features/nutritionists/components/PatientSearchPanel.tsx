import { useState } from 'react'
import { useSearchPatients } from '../hooks/use-search-patients'
import type { PatientSearchDto } from '../nutritionists.types'

interface PatientSearchPanelProps {
  onAssign: (patientId: string) => void
  isAssigning: boolean
  assigningId: string | null
  error: string | null
}

export function PatientSearchPanel({
  onAssign,
  isAssigning,
  assigningId,
  error,
}: PatientSearchPanelProps) {
  const [query, setQuery] = useState('')
  const { data: results = [], isFetching, isError } = useSearchPatients(query)

  const showResults = query.trim().length >= 2
  const noResults = showResults && !isFetching && results.length === 0

  return (
    <div>
      <label htmlFor="patient-search" className="mb-1 block text-sm font-medium text-gray-700">
        Search by name or email
      </label>
      <input
        id="patient-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. Jane or jane@example.com"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-deep-purple focus:ring-2 focus:ring-lavender"
        autoComplete="off"
      />

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="mt-3 min-h-[60px]">
        {!showResults && (
          <p className="text-sm text-gray-400">Type at least 2 characters to search.</p>
        )}

        {showResults && isFetching && (
          <p className="text-sm text-gray-400">Searching…</p>
        )}

        {isError && (
          <p role="alert" className="text-sm text-red-500">
            Search failed. Please try again.
          </p>
        )}

        {noResults && (
          <p className="text-sm text-gray-400">No unassigned patients found for "{query}".</p>
        )}

        {showResults && !isFetching && results.length > 0 && (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white" role="list">
            {results.map((patient: PatientSearchDto) => (
              <li key={patient.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{patient.fullName}</p>
                  <p className="text-xs text-gray-400">{patient.email}</p>
                </div>
                <button
                  onClick={() => onAssign(patient.id)}
                  disabled={isAssigning && assigningId === patient.id}
                  aria-label={`Assign ${patient.fullName}`}
                  className="ml-4 rounded-lg bg-deep-purple px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAssigning && assigningId === patient.id ? 'Assigning…' : 'Assign'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
