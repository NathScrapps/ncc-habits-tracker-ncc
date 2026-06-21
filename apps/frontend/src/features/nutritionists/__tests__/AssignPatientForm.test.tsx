import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AssignPatientForm } from '../components/AssignPatientForm'

describe('AssignPatientForm', () => {
  it('renders the patient ID input and Assign button', () => {
    render(<AssignPatientForm onSubmit={vi.fn()} isPending={false} error={null} />)

    expect(screen.getByLabelText(/Patient ID/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /assign/i })).toBeInTheDocument()
  })

  it('calls onSubmit with the patient ID when a valid UUID is submitted', async () => {
    const handleSubmit = vi.fn()
    render(<AssignPatientForm onSubmit={handleSubmit} isPending={false} error={null} />)

    await userEvent.type(
      screen.getByLabelText(/Patient ID/i),
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    )
    await userEvent.click(screen.getByRole('button', { name: /assign/i }))

    expect(handleSubmit).toHaveBeenCalledWith('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
  })

  it('shows a validation error for an invalid UUID and does not call onSubmit', async () => {
    const handleSubmit = vi.fn()
    render(<AssignPatientForm onSubmit={handleSubmit} isPending={false} error={null} />)

    await userEvent.type(screen.getByLabelText(/Patient ID/i), 'not-a-uuid')
    await userEvent.click(screen.getByRole('button', { name: /assign/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/valid patient uuid/i)
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('shows the API error message', () => {
    render(
      <AssignPatientForm
        onSubmit={vi.fn()}
        isPending={false}
        error="Patient not found"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Patient not found')
  })

  it('disables the button and input while isPending', () => {
    render(<AssignPatientForm onSubmit={vi.fn()} isPending={true} error={null} />)

    expect(screen.getByLabelText(/Patient ID/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /assigning/i })).toBeDisabled()
  })
})
