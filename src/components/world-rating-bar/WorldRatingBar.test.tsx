import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorldRatingBar } from './WorldRatingBar';
import type { RatingSummary } from '../../types';

describe('WorldRatingBar', () => {
  describe('card variant', () => {
    it('renders the empty state when summary is undefined', () => {
      render(<WorldRatingBar summary={undefined} variant="card" />);
      expect(screen.getByText(/no ratings yet/i)).toBeInTheDocument();
      expect(screen.getByTestId('world-rating-bar-card')).toBeInTheDocument();
    });

    it('renders the empty state when both counts are zero', () => {
      const summary: RatingSummary = { worldId: 'wrld_1', good: 0, bad: 0, userRating: null };
      render(<WorldRatingBar summary={summary} variant="card" />);
      expect(screen.getByText(/no ratings yet/i)).toBeInTheDocument();
    });

    it('does not render any percent or count when empty', () => {
      const summary: RatingSummary = { worldId: 'wrld_1', good: 0, bad: 0, userRating: null };
      const { container } = render(<WorldRatingBar summary={summary} variant="card" />);
      expect(container.querySelector('span.font-semibold')).toBeNull();
    });

    it('renders a filled bar with good and bad segments proportional to the counts', () => {
      const summary: RatingSummary = { worldId: 'wrld_1', good: 3, bad: 1, userRating: null };
      const { container } = render(<WorldRatingBar summary={summary} variant="card" />);
      const bar = screen.getByRole('img', { name: /75% good · 4 ratings/i });
      expect(bar).toBeInTheDocument();
      const fills = bar.querySelectorAll('div');
      const goodFill = Array.from(fills).find((el) => el.classList.contains('bg-emerald-500'));
      const badFill = Array.from(fills).find((el) => el.classList.contains('bg-rose-500'));
      expect(goodFill).toHaveStyle('width: 75%');
      expect(badFill).toHaveStyle('width: 25%');
      expect(container.textContent).toMatch(/75%/);
    });

    it('uses the singular "rating" when total is one', () => {
      const summary: RatingSummary = { worldId: 'wrld_1', good: 1, bad: 0, userRating: 'good' };
      render(<WorldRatingBar summary={summary} variant="card" />);
      expect(screen.getByText(/1 rating\b/i)).toBeInTheDocument();
    });
  });

  describe('list variant', () => {
    it('renders the empty state when summary is undefined', () => {
      render(<WorldRatingBar summary={undefined} variant="list" />);
      expect(screen.getByText(/no ratings yet/i)).toBeInTheDocument();
      expect(screen.getByTestId('world-rating-bar-list')).toBeInTheDocument();
    });

    it('renders a filled bar for the list row', () => {
      const summary: RatingSummary = { worldId: 'wrld_1', good: 4, bad: 1, userRating: null };
      render(<WorldRatingBar summary={summary} variant="list" />);
      const bar = screen.getByRole('img', { name: /80% good · 5 ratings/i });
      expect(bar).toBeInTheDocument();
      expect(screen.getByText(/80%/)).toBeInTheDocument();
      expect(screen.getByText(/good/i)).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it('tints the percent emerald when good is the majority', () => {
      const summary: RatingSummary = { worldId: 'wrld_1', good: 8, bad: 2, userRating: null };
      render(<WorldRatingBar summary={summary} variant="list" />);
      const percent = screen.getByText(/80%/);
      expect(percent.className).toMatch(/emerald/);
    });

    it('tints the percent rose when bad is the majority', () => {
      const summary: RatingSummary = { worldId: 'wrld_1', good: 2, bad: 8, userRating: null };
      render(<WorldRatingBar summary={summary} variant="list" />);
      const percent = screen.getByText(/20%/);
      expect(percent.className).toMatch(/rose/);
    });
  });
});
