import { fireEvent, render, screen } from '@testing-library/react'
import Button from '@/components/elements/static/Button'

describe('Button component', () => {
  it('renders provided title', () => {
    render(<Button icon="/icon.svg" title="My button" />)

    expect(screen.getByText('My button')).toBeInTheDocument()
  })

  it('displays icon alt text when icon prop is provided', () => {
    render(<Button icon="/icon.svg" />)

    expect(screen.getByAltText('icon')).toBeInTheDocument()
  })

  it('calls the provided click handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button icon="/icon.svg" title="Clickable" handleClick={handleClick} />)

    fireEvent.click(screen.getByRole('button', { name: /Clickable/ }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
