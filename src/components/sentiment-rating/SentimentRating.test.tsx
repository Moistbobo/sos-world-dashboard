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
    />
  );
}

describe('SentimentRating', () => {
  it('renders counts', () => {
    renderComponent();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onRate when good is clicked', () => {
    const onRate = vi.fn();
    renderComponent({ onRate });
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    expect(onRate).toHaveBeenCalledWith('good');
  });

  it('calls onRate when bad is clicked', () => {
    const onRate = vi.fn();
    renderComponent({ onRate });
    fireEvent.click(screen.getByRole('button', { name: /Bad/i }));
    expect(onRate).toHaveBeenCalledWith('bad');
  });

  it('marks active rating', () => {
    renderComponent({ summary: { worldId: 'wrld_123', good: 3, bad: 1, userRating: 'good' } });
    const goodButton = screen.getByRole('button', { name: /Good/i });
    expect(goodButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onRemove when active rating is clicked', () => {
    const onRemove = vi.fn();
    renderComponent({
      summary: { worldId: 'wrld_123', good: 3, bad: 1, userRating: 'good' },
      onRemove,
    });
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    expect(onRemove).toHaveBeenCalled();
  });

  it('renders a good/bad distribution bar', () => {
    renderComponent();
    const bar = screen.getByRole('progressbar', { name: /rating distribution/i });
    expect(bar).toBeInTheDocument();
  });

  it('shows a grey bar when there are no votes', () => {
    renderComponent({ summary: { worldId: 'wrld_123', good: 0, bad: 0, userRating: null } });
    const bar = screen.getByRole('progressbar', { name: /rating distribution/i });
    expect(bar.firstChild).toHaveTextContent('No votes yet');
  });

  it('fills the bar proportionally to good and bad percentages', () => {
    renderComponent({ summary: { worldId: 'wrld_123', good: 3, bad: 1, userRating: null } });
    const bar = screen.getByRole('progressbar', { name: /rating distribution/i });
    expect(bar.children[0]).toHaveStyle('width: 75%');
    expect(bar.children[0]).toHaveTextContent('75%');
    expect(bar.children[1]).toHaveStyle('width: 25%');
    expect(bar.children[1]).toHaveTextContent('25%');
  });
});
