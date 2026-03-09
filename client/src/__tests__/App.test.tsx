import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Routes, Route } from 'react-router-dom'
import { LandingPage } from '../pages/LandingPage'
import { EpisodesPage } from '../pages/EpisodesPage'

function renderWithProviders(initialRoute: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/episodes" element={<EpisodesPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response('<?xml version="1.0"?><rss><channel></channel></rss>'),
  )
})

describe('App routing', () => {
  it('renders landing page at /', () => {
    renderWithProviders('/')
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders episodes page at /episodes', () => {
    renderWithProviders('/episodes')
    expect(
      screen.getByRole('heading', { level: 1, name: /todos los episodios/i }),
    ).toBeInTheDocument()
  })
})
