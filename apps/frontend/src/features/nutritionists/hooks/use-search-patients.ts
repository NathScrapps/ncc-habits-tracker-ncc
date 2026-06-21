import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchPatientsApi } from '@/services/nutritionists.service'

export const PATIENT_SEARCH_QUERY_KEY = ['patients', 'search'] as const

export function useSearchPatients(q: string) {
  const [debouncedQ, setDebouncedQ] = useState(q)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(timer)
  }, [q])

  return useQuery({
    queryKey: [...PATIENT_SEARCH_QUERY_KEY, debouncedQ],
    queryFn: () => searchPatientsApi(debouncedQ),
    enabled: debouncedQ.trim().length >= 2,
  })
}
