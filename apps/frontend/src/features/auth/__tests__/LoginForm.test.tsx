import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from '../components/LoginForm'

function setup(props?: Partial<Parameters<typeof LoginForm>[0]>) {
  const onSubmit = vi.fn()
  render(<LoginForm onSubmit={onSubmit} isPending={false} error={null} {...props} />)
  return { onSubmit }
}

describe('LoginForm', () => {
  it('renders email, password fields and submit button', () => {
    setup()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation error when email is invalid', async () => {
    setup()
    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })
  })

  it('shows validation error when password is empty', async () => {
    setup()
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('calls onSubmit with correct data when form is valid', async () => {
    const { onSubmit } = setup()
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      expect(onSubmit).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret123' })
    })
  })

  it('displays API error message', () => {
    setup({ error: 'Invalid credentials' })
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
  })

  it('disables the button and inputs while pending', () => {
    setup({ isPending: true })
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByLabelText(/email/i)).toBeDisabled()
    expect(screen.getByLabelText(/password/i)).toBeDisabled()
  })
})
