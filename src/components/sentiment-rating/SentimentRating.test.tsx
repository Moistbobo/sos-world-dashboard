import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SentimentRating } from './SentimentRating';

function renderComponent(props = {}) {
  return render(
    <SentimentRating
      summary={{ worldId: 'wrld_123', good: 3, bad: 1, userRating: null }}
      isLoading={false}
      isSubmitting={false}
      onRate={vi.fn()}
      onRemove={vi.fn()}
      {...props}
    />,
  );
}

describe('SentimentRating', () => {
  it('labels both halves', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /Good/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bad/i })).toBeInTheDocument();
  });

  it('does not render individual vote counts on the buttons', () => {
    renderComponent();
    const goodButton = screen.getByRole('button', { name: /Good/i });
    const badButton = screen.getByRole('button', { name: /Bad/i });
    expect(goodButton).toHaveTextContent(/^Good$/);
    expect(badButton).toHaveTextContent(/^Bad$/);
  });

  it('calls onRate("good") when the left half is clicked', () => {
    const onRate = vi.fn();
    renderComponent({ onRate });
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    expect(onRate).toHaveBeenCalledWith('good');
  });

  it('calls onRate("bad") when the right half is clicked', () => {
    const onRate = vi.fn();
    renderComponent({ onRate });
    fireEvent.click(screen.getByRole('button', { name: /Bad/i }));
    expect(onRate).toHaveBeenCalledWith('bad');
  });

  it('marks the active half as pressed', () => {
    renderComponent({ summary: { worldId: 'wrld_123', good: 3, bad: 1, userRating: 'good' } });
    expect(screen.getByRole('button', { name: /Good/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Bad/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onRemove when the active half is clicked again', () => {
    const onRemove = vi.fn();
    renderComponent({
      summary: { worldId: 'wrld_123', good: 3, bad: 1, userRating: 'good' },
      onRemove,
    });
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    expect(onRemove).toHaveBeenCalled();
  });

  it('calls onRate("bad") when the right half is clicked while good is active', () => {
    const onRate = vi.fn();
    renderComponent({
      summary: { worldId: 'wrld_123', good: 3, bad: 1, userRating: 'good' },
      onRate,
    });
    fireEvent.click(screen.getByRole('button', { name: /Bad/i }));
    expect(onRate).toHaveBeenCalledWith('bad');
  });

  it('renders a good/bad distribution bar', () => {
    renderComponent();
    const bar = screen.getByRole('progressbar', { name: /rating distribution/i });
    expect(bar).toBeInTheDocument();
  });

  it('renders clickable good and bad halves when there are no votes', () => {
    renderComponent({ summary: { worldId: 'wrld_123', good: 0, bad: 0, userRating: null } });
    expect(screen.getByRole('button', { name: /Good/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Bad/i })).toBeEnabled();
  });

  it('fills the bar proportionally to good and bad percentages', () => {
    renderComponent({ summary: { worldId: 'wrld_123', good: 3, bad: 1, userRating: null } });
    const fill = screen.getByTestId('rating-fill-container');
    expect(fill.children[0]).toHaveStyle('width: 75%');
    expect(fill.children[0]).toHaveTextContent('75%');
    expect(fill.children[1]).toHaveStyle('width: 25%');
    expect(fill.children[1]).toHaveTextContent('25%');
  });

  it('recolors the good label green when the user voted good', () => {
    renderComponent({ summary: { worldId: 'wrld_123', good: 3, bad: 1, userRating: 'good' } });
    const goodButton = screen.getByRole('button', { name: /Good/i });
    expect(goodButton).toHaveClass('text-emerald-700');
  });

  it('recolors the bad label red when the user voted bad', () => {
    renderComponent({ summary: { worldId: 'wrld_123', good: 3, bad: 1, userRating: 'bad' } });
    const badButton = screen.getByRole('button', { name: /Bad/i });
    expect(badButton).toHaveClass('text-rose-700');
  });
});
