import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PatientCard } from '../components/PatientCard'
import type { PatientDto } from '../patients.types'

const patient: PatientDto = {
  id: 'patient-uuid-1',
  fullName: 'Bob Smith',
  createdAt: '2024-01-15T00:00:00.000Z',
}

describe('PatientCard', () => {
  it('renders patient name and joined date', () => {
    render(
      <PatientCard
        patient={patient}
        onClick={vi.fn()}
        onUnassign={vi.fn()}
        isUnassigning={false}
      />,
    )
    expect(screen.getByText('Bob Smith')).toBeInTheDocument()
    expect(screen.getByText(/Patient since/)).toBeInTheDocument()
  })

  it('calls onClick with patient id when the card body is clicked', async () => {
    const handleClick = vi.fn()
    render(
      <PatientCard
        patient={patient}
        onClick={handleClick}
        onUnassign={vi.fn()}
        isUnassigning={false}
      />,
    )
    await userEvent.click(screen.getByText('Bob Smith'))
    expect(handleClick).toHaveBeenCalledWith('patient-uuid-1')
  })

  it('calls onUnassign with patient id when Unassign is clicked', async () => {
    const handleUnassign = vi.fn()
    render(
      <PatientCard
        patient={patient}
        onClick={vi.fn()}
        onUnassign={handleUnassign}
        isUnassigning={false}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /unassign bob smith/i }))
    expect(handleUnassign).toHaveBeenCalledWith('patient-uuid-1')
  })

  it('disables the Unassign button while isUnassigning is true', () => {
    render(
      <PatientCard
        patient={patient}
        onClick={vi.fn()}
        onUnassign={vi.fn()}
        isUnassigning={true}
      />,
    )
    expect(screen.getByRole('button', { name: /unassign bob smith/i })).toBeDisabled()
  })
})
