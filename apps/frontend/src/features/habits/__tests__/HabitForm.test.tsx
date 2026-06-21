import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HabitForm } from '../components/HabitForm'

function setup(props?: Partial<Parameters<typeof HabitForm>[0]>) {
  const onSubmit = vi.fn()
  render(
    <HabitForm
      onSubmit={onSubmit}
      isPending={false}
      error={null}
      defaultDate="2026-06-20"
      {...props}
    />
  )
  return { onSubmit }
}

describe('HabitForm', () => {
  it('renders all four fields and submit button', () => {
    setup()
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/water intake/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/exercise/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sleep/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save habits/i })).toBeInTheDocument()
  })

  it('pre-fills date with defaultDate prop', () => {
    setup({ defaultDate: '2026-06-15' })
    expect(screen.getByLabelText(/date/i)).toHaveValue('2026-06-15')
  })

  it('shows validation error when sleep hours exceed 24', async () => {
    setup()
    await userEvent.clear(screen.getByLabelText(/sleep/i))
    await userEvent.type(screen.getByLabelText(/sleep/i), '25')
    await userEvent.click(screen.getByRole('button', { name: /save habits/i }))
    await waitFor(() => {
      expect(screen.getByText('Must be 24 or less')).toBeInTheDocument()
    })
  })

  it('shows validation error when water intake is negative', async () => {
    setup()
    await userEvent.clear(screen.getByLabelText(/water intake/i))
    await userEvent.type(screen.getByLabelText(/water intake/i), '-1')
    await userEvent.click(screen.getByRole('button', { name: /save habits/i }))
    await waitFor(() => {
      expect(screen.getByText('Must be 0 or more')).toBeInTheDocument()
    })
  })

  it('calls onSubmit with correct numeric values', async () => {
    const { onSubmit } = setup()

    await userEvent.clear(screen.getByLabelText(/water intake/i))
    await userEvent.type(screen.getByLabelText(/water intake/i), '2000')

    await userEvent.clear(screen.getByLabelText(/exercise/i))
    await userEvent.type(screen.getByLabelText(/exercise/i), '45')

    await userEvent.clear(screen.getByLabelText(/sleep/i))
    await userEvent.type(screen.getByLabelText(/sleep/i), '7.5')

    await userEvent.click(screen.getByRole('button', { name: /save habits/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      expect(onSubmit).toHaveBeenCalledWith({
        date: '2026-06-20',
        waterIntakeMl: 2000,
        exerciseMinutes: 45,
        sleepHours: 7.5,
      })
    })
  })

  it('displays API error message', () => {
    setup({ error: 'Habit already logged for this date' })
    expect(screen.getByRole('alert')).toHaveTextContent('Habit already logged for this date')
  })

  it('disables fields and button while pending', () => {
    setup({ isPending: true })
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByLabelText(/water intake/i)).toBeDisabled()
    expect(screen.getByLabelText(/exercise/i)).toBeDisabled()
    expect(screen.getByLabelText(/sleep/i)).toBeDisabled()
  })
})
