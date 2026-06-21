import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NutritionistPatientsPage } from '@/pages/NutritionistPatientsPage'
import { usePatients } from '@/features/patients/hooks/use-patients'
import { useAssignPatient } from '@/features/patients/hooks/use-assign-patient'
import { useUnassignPatient } from '@/features/patients/hooks/use-unassign-patient'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useLogout } from '@/features/auth/hooks/use-logout'

vi.mock('@/features/patients/hooks/use-patients')
vi.mock('@/features/patients/hooks/use-assign-patient')
vi.mock('@/features/patients/hooks/use-unassign-patient')
vi.mock('@/features/auth/hooks/use-auth')
vi.mock('@/features/auth/hooks/use-logout')
vi.mock('@/features/nutritionists/hooks/use-search-patients', () => ({
  useSearchPatients: () => ({ data: [], isFetching: false, isError: false }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockUser = { id: 'u1', email: 'alice@test.com', role: 'NUTRITIONIST' as const }
const mockPatients = [
  { id: 'p1', fullName: 'Bob Smith', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'p2', fullName: 'Carol Jones', createdAt: '2024-02-01T00:00:00.000Z' },
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
  vi.mocked(usePatients).mockReturnValue({ data: mockPatients, isLoading: false } as ReturnType<typeof usePatients>)
  vi.mocked(useAssignPatient).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    error: null,
    reset: vi.fn(),
  } as unknown as ReturnType<typeof useAssignPatient>)
  vi.mocked(useUnassignPatient).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useUnassignPatient>)
}

describe('NutritionistPatientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupDefaults()
  })

  it('shows a loading spinner while patients are being fetched', () => {
    vi.mocked(usePatients).mockReturnValue({ data: undefined, isLoading: true } as ReturnType<typeof usePatients>)
    render(<NutritionistPatientsPage />)
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('renders "My patients" and "Assign patient" tabs', () => {
    render(<NutritionistPatientsPage />)
    expect(screen.getByRole('tab', { name: /my patients/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /assign patient/i })).toBeInTheDocument()
  })

  it('shows patient count in the "My patients" tab pill', () => {
    render(<NutritionistPatientsPage />)
    const tab = screen.getByRole('tab', { name: /my patients/i })
    expect(tab).toHaveTextContent('2')
  })

  it('renders a card for each assigned patient on the default tab', () => {
    render(<NutritionistPatientsPage />)
    expect(screen.getByText('Bob Smith')).toBeInTheDocument()
    expect(screen.getByText('Carol Jones')).toBeInTheDocument()
  })

  it('shows "no patients" message when the list is empty', () => {
    vi.mocked(usePatients).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof usePatients>)
    render(<NutritionistPatientsPage />)
    expect(screen.getByText(/no patients assigned yet/i)).toBeInTheDocument()
  })

  it('navigates to patient detail when a card is clicked', async () => {
    render(<NutritionistPatientsPage />)
    await userEvent.click(screen.getByText('Bob Smith'))
    expect(mockNavigate).toHaveBeenCalledWith('/nutritionist/patients/p1')
  })

  it('calls unassign mutation with the correct patient id', async () => {
    const mockUnassign = vi.fn()
    vi.mocked(useUnassignPatient).mockReturnValue({
      mutate: mockUnassign,
      isPending: false,
    } as unknown as ReturnType<typeof useUnassignPatient>)

    render(<NutritionistPatientsPage />)
    await userEvent.click(screen.getAllByRole('button', { name: /unassign/i })[0]!)
    expect(mockUnassign).toHaveBeenCalledWith('p1')
  })

  it('switches to the assign panel when "Assign patient" tab is clicked', async () => {
    render(<NutritionistPatientsPage />)
    await userEvent.click(screen.getByRole('tab', { name: /assign patient/i }))
    expect(screen.getByLabelText(/search by name or email/i)).toBeInTheDocument()
  })

  it('shows API error from the assign mutation in the assign panel', async () => {
    vi.mocked(useAssignPatient).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: new Error('Patient not found'),
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useAssignPatient>)

    render(<NutritionistPatientsPage />)
    await userEvent.click(screen.getByRole('tab', { name: /assign patient/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('Patient not found')
  })
})
