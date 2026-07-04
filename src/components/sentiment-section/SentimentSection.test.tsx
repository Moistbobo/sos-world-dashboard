import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SentimentSection } from './SentimentSection';

const mocks = vi.hoisted(() => ({
  useRatings: vi.fn(),
  useComments: vi.fn(),
  useSubmitRating: vi.fn(),
  useSubmitComment: vi.fn(),
}));

vi.mock('../../hooks/useSentiment', () => ({
  useRatings: () => mocks.useRatings(),
  useComments: () => mocks.useComments(),
  useSubmitRating: () => mocks.useSubmitRating(),
  useSubmitComment: () => mocks.useSubmitComment(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('SentimentSection', () => {
  it('renders section', () => {
    mocks.useRatings.mockReturnValue({ data: { worldId: 'w1', good: 0, bad: 0, userRating: null }, isLoading: false });
    mocks.useComments.mockReturnValue({ data: [], isLoading: false });
    mocks.useSubmitRating.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
    mocks.useSubmitComment.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });

    render(<SentimentSection worldId="w1" />, { wrapper });
    expect(screen.getByTestId('sentiment-section')).toBeInTheDocument();
  });
});
