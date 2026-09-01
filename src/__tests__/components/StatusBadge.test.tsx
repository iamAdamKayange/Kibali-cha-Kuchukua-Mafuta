import React from 'react'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/common/StatusBadge'

describe('StatusBadge', () => {
  it('renders pending status correctly', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('pending')).toBeInTheDocument()
  })

  it('renders approved status correctly', () => {
    render(<StatusBadge status="approved" />)
    expect(screen.getByText('approved')).toBeInTheDocument()
  })

  it('renders rejected status correctly', () => {
    render(<StatusBadge status="rejected" />)
    expect(screen.getByText('rejected')).toBeInTheDocument()
  })

  it('renders completed status correctly', () => {
    render(<StatusBadge status="completed" />)
    expect(screen.getByText('completed')).toBeInTheDocument()
  })
})