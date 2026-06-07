import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from '../App'

describe('sanity', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })

  it('renders app without crashing', () => {
    render(<App />)
    expect(document.body).toBeInTheDocument()
  })
})
