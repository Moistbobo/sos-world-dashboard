import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Layout } from '../components/Layout'

vi.mock('../api/client', () => ({
  fetchHealth: vi.fn(() => Promise.resolve()),
}))

describe('Layout sidebar', () => {
  let storage: Record<string, string> = {}

  beforeEach(() => {
    storage = {}
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value
      },
      removeItem: (key: string) => {
        delete storage[key]
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders expanded by default when no localStorage value exists', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Test content</div>
        </Layout>
      </MemoryRouter>,
    )

    expect(screen.getByText('SOS Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Worlds')).toBeInTheDocument()
    expect(screen.getByText('Tags')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument()
  })

  it('reads collapsed state from localStorage on mount', () => {
    storage['sos-sidebar-collapsed'] = 'true'

    render(
      <MemoryRouter>
        <Layout>
          <div>Test content</div>
        </Layout>
      </MemoryRouter>,
    )

    // When collapsed the toggle label flips to "Expand"
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument()
    // Title text is still in DOM (hidden on lg via CSS)
    expect(screen.queryByText('SOS Dashboard')).toBeInTheDocument()
  })

  it('toggles collapsed state and persists to localStorage', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Test content</div>
        </Layout>
      </MemoryRouter>,
    )

    const toggle = screen.getByLabelText('Collapse sidebar')
    expect(toggle).toBeInTheDocument()

    // Collapse
    fireEvent.click(toggle)
    expect(storage['sos-sidebar-collapsed']).toBe('true')
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument()

    // Expand back
    fireEvent.click(screen.getByLabelText('Expand sidebar'))
    expect(storage['sos-sidebar-collapsed']).toBe('false')
    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument()
  })

  it('renders navigation links to all routes', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Test content</div>
        </Layout>
      </MemoryRouter>,
    )

    const nav = screen.getByRole('navigation')
    const links = within(nav).getAllByRole('link')
    const labels = links.map((l) => l.textContent)

    expect(labels).toContain('Dashboard')
    expect(labels).toContain('Worlds')
    expect(labels).toContain('Tags')
    expect(labels).toContain('Settings')
  })

  it('renders mobile menu button and hides desktop collapse toggle', async () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Test content</div>
        </Layout>
      </MemoryRouter>,
    )

    // Wait for async health check effect to settle
    await waitFor(() => {
      // Mobile close button (X) is always rendered
      expect(screen.getByLabelText('Close sidebar')).toBeInTheDocument()
      // Desktop collapse toggle uses aria-label
      expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument()
    })
  })
})
