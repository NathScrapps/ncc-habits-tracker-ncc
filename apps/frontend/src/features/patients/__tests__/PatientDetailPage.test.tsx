import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PatientDetailPage } from '@/pages/PatientDetailPage'
import { usePatient } from '@/features/patients/hooks/use-patient'
import { usePatientHabits } from '@/features/patients/hooks/use-patient-habits'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useLogout } from '@/features/auth/hooks/use-logout'

vi.mock('@/features/patients/hooks/use-patient')
vi.mock('@/features/patients/hooks/use-patient-habits')
vi.mock('@/features/auth/hooks/use-auth')
vi.mock('@/features/auth/hooks/use-logout')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ patientId: 'patient-uuid-1' }),
  }
})

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}))

const mockUser = { id: 'u1', email: 'alice@test.com', role: 'NUTRITIONIST' as const }
const mockPatient = {
  id: 'patient-uuid-1',
  fullName: 'Bob Smith',
  createdAt: '2024-01-15T00:00:00.000Z',
}
const mockHabits = [
  {
    id: 'h1',
    date: '2026-06-15',
    waterIntakeMl: 2000,
    exerciseMinutes: 45,
    sleepHours: 8,
    createdAt: '2026-06-15T10:00:00.000Z',
    updatedAt: '2026-06-15T10:00:00.000Z',
  },
]

function setupDefaults() {
  vi.mocked(useAuth).mockReturnValue({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  })
  vi.mocked(useLogout).mockReturnValue({ mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useLogout>)
  vi.mocked(usePatient).mockReturnValue({ data: mockPatient, isLoading: false } as ReturnType<typeof usePatient>)
  vi.mocked(usePatientHabits).mockReturnValue({ data: mockHabits, isLoading: false } as ReturnType<typeof usePatientHabits>)
}

describe('PatientDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupDefaults()
  })

  it('shows a loading spinner while data is being fetched', () => {
    vi.mocked(usePatient).mockReturnValue({ data: undefined, isLoading: true } as ReturnType<typeof usePatient>)
    render(<PatientDetailPage />)
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('renders the patient name when loaded', () => {
    render(<PatientDetailPage />)
    expect(screen.getByText('Bob Smith')).toBeInTheDocument()
  })

  it('renders the "Patient since" date', () => {
    render(<PatientDetailPage />)
    expect(screen.getByText(/patient since/i)).toBeInTheDocument()
  })

  it('shows "patient not found" when patient data is undefined', () => {
    vi.mocked(usePatient).mockReturnValue({ data: undefined, isLoading: false } as ReturnType<typeof usePatient>)
    vi.mocked(usePatientHabits).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof usePatientHabits>)
    render(<PatientDetailPage />)
    expect(screen.getByText(/patient not found/i)).toBeInTheDocument()
  })

  it('renders chart labels when patient has habit entries', () => {
    render(<PatientDetailPage />)
    expect(screen.getByText('Water (ml)')).toBeInTheDocument()
    expect(screen.getByText('Exercise (min)')).toBeInTheDocument()
    expect(screen.getByText('Sleep (hrs)')).toBeInTheDocument()
  })

  it('shows "no habit entries" when the habits array is empty', () => {
    vi.mocked(usePatientHabits).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof usePatientHabits>)
    render(<PatientDetailPage />)
    expect(screen.getByText(/no habit entries yet/i)).toBeInTheDocument()
  })

  it('navigates back to patients list when the back button is clicked', async () => {
    render(<PatientDetailPage />)
    await userEvent.click(screen.getByText(/← Back/))
    expect(mockNavigate).toHaveBeenCalledWith('/nutritionist/patients')
  })
})
