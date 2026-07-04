import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SentimentSection } from './SentimentSection';

const mocks = vi.hoisted(() => ({
  useRatings: vi.fn(),
  useComments: vi.fn(),
  useSubmitRating: vi.fn(),
  useUpdateRating: vi.fn(),
  useDeleteRating: vi.fn(),
  useSubmitComment: vi.fn(),
}));

vi.mock('../../hooks/useSentiment', () => ({
  useRatings: () => mocks.useRatings(),
  useComments: () => mocks.useComments(),
  useSubmitRating: () => mocks.useSubmitRating(),
  useUpdateRating: () => mocks.useUpdateRating(),
  useDeleteRating: () => mocks.useDeleteRating(),
  useSubmitComment: () => mocks.useSubmitComment(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const defaultRatings = { data: { worldId: 'w1', good: 0, bad: 0, userRating: null }, isLoading: false };
const defaultComments = { data: [], isLoading: false };
const defaultMutation = { isPending: false, mutateAsync: vi.fn() };

describe('SentimentSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useRatings.mockReturnValue(defaultRatings);
    mocks.useComments.mockReturnValue(defaultComments);
    mocks.useSubmitRating.mockReturnValue(defaultMutation);
    mocks.useUpdateRating.mockReturnValue(defaultMutation);
    mocks.useDeleteRating.mockReturnValue(defaultMutation);
    mocks.useSubmitComment.mockReturnValue(defaultMutation);
  });

  it('renders section', () => {
    render(<SentimentSection worldId="w1" />, { wrapper });
    expect(screen.getByTestId('sentiment-section')).toBeInTheDocument();
  });

  it('uses submitRating when user has no rating and clicks a rating', () => {
    const submitRating = { ...defaultMutation, mutateAsync: vi.fn().mockResolvedValue(undefined) };
    mocks.useSubmitRating.mockReturnValue(submitRating);
    render(<SentimentSection worldId="w1" />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    expect(submitRating.mutateAsync).toHaveBeenCalledWith({ worldId: 'w1', value: 'good' });
  });

  it('uses updateRating when user has a rating and clicks the opposite rating', () => {
    const updateRating = { ...defaultMutation, mutateAsync: vi.fn().mockResolvedValue(undefined) };
    mocks.useUpdateRating.mockReturnValue(updateRating);
    mocks.useRatings.mockReturnValue({
      data: { worldId: 'w1', good: 1, bad: 0, userRating: 'good' as const },
      isLoading: false,
    });
    render(<SentimentSection worldId="w1" />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: /Bad/i }));
    expect(updateRating.mutateAsync).toHaveBeenCalledWith({ worldId: 'w1', value: 'bad' });
  });

  it('uses deleteRating when user clicks the active rating', () => {
    const deleteRating = { ...defaultMutation, mutateAsync: vi.fn().mockResolvedValue(undefined) };
    mocks.useDeleteRating.mockReturnValue(deleteRating);
    mocks.useRatings.mockReturnValue({
      data: { worldId: 'w1', good: 1, bad: 0, userRating: 'good' as const },
      isLoading: false,
    });
    render(<SentimentSection worldId="w1" />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    expect(deleteRating.mutateAsync).toHaveBeenCalledWith({ worldId: 'w1' });
  });

  it('uses deleteRating when user clicks the X', () => {
    const deleteRating = { ...defaultMutation, mutateAsync: vi.fn().mockResolvedValue(undefined) };
    mocks.useDeleteRating.mockReturnValue(deleteRating);
    mocks.useRatings.mockReturnValue({
      data: { worldId: 'w1', good: 1, bad: 0, userRating: 'good' as const },
      isLoading: false,
    });
    render(<SentimentSection worldId="w1" />, { wrapper });
    fireEvent.click(screen.getByTestId('remove-rating'));
    expect(deleteRating.mutateAsync).toHaveBeenCalledWith({ worldId: 'w1' });
  });
});
