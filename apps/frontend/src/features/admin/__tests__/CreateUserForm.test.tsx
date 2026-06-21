import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CreateUserForm } from '../components/CreateUserForm'

function setup(props?: Partial<React.ComponentProps<typeof CreateUserForm>>) {
  const onSubmit = vi.fn()
  render(
    <CreateUserForm
      onSubmit={onSubmit}
      isPending={false}
      error={null}
      {...props}
    />,
  )
  return { onSubmit }
}

describe('CreateUserForm', () => {
  it('renders all fields', () => {
    setup()
    expect(screen.getByLabelText('Role')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toBeInTheDocument()
  })

  it('hides Full name field when role is ADMIN', async () => {
    setup()
    await userEvent.selectOptions(screen.getByLabelText('Role'), 'ADMIN')
    expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument()
  })

  it('shows Full name field when role is PATIENT or NUTRITIONIST', async () => {
    setup()
    await userEvent.selectOptions(screen.getByLabelText('Role'), 'NUTRITIONIST')
    expect(screen.getByLabelText('Full name')).toBeInTheDocument()
  })

  it('calls onSubmit with correct values for PATIENT role', async () => {
    const { onSubmit } = setup()

    await userEvent.selectOptions(screen.getByLabelText('Role'), 'PATIENT')
    await userEvent.type(screen.getByLabelText('Email'), 'patient@test.com')
    await userEvent.type(screen.getByLabelText('Password'), 'secret123')
    await userEvent.type(screen.getByLabelText('Full name'), 'Jane Doe')
    await userEvent.click(screen.getByRole('button', { name: /create user/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        role: 'PATIENT',
        email: 'patient@test.com',
        password: 'secret123',
        fullName: 'Jane Doe',
      })
    })
  })

  it('calls onSubmit without fullName for ADMIN role', async () => {
    const { onSubmit } = setup()

    await userEvent.selectOptions(screen.getByLabelText('Role'), 'ADMIN')
    await userEvent.type(screen.getByLabelText('Email'), 'admin@test.com')
    await userEvent.type(screen.getByLabelText('Password'), 'adminpass1')
    await userEvent.click(screen.getByRole('button', { name: /create user/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        role: 'ADMIN',
        email: 'admin@test.com',
        password: 'adminpass1',
        fullName: undefined,
      })
    })
  })

  it('shows validation error when fullName is missing for PATIENT', async () => {
    const { onSubmit } = setup()

    await userEvent.selectOptions(screen.getByLabelText('Role'), 'PATIENT')
    await userEvent.type(screen.getByLabelText('Email'), 'patient@test.com')
    await userEvent.type(screen.getByLabelText('Password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /create user/i }))

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows server error when error prop is provided', () => {
    setup({ error: 'Email already in use' })
    expect(screen.getByRole('alert')).toHaveTextContent('Email already in use')
  })

  it('disables inputs and button while pending', () => {
    setup({ isPending: true })
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveTextContent(/creating/i)
  })
})
