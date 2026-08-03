import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorldListRow } from '../world-list-row';
import type { World, RatingSummary } from '../../types';

const mockWorld: World = {
  worldId: 'wrld_test',
  name: 'Test World',
  authorName: 'Tester',
  capacity: 40,
  platforms: ['standalonewindows', 'android', 'ios'],
  tags: ['chill', 'social', 'japanese', 'night'],
  imageUrl: '',
  vrchatUrl: 'https://vrchat.com/home/world/wrld_test',
  quality: 'good',
  createdAt: '2024-01-01',
  internalAddDate: '2024-02-01',
};

const mockSummary: RatingSummary = {
  worldId: 'wrld_test',
  good: 4,
  bad: 1,
  userRating: null,
};

describe('WorldListRow', () => {
  it('renders world name, author, and capacity', () => {
    render(<WorldListRow world={mockWorld} onSelect={vi.fn()} />);
    expect(screen.getByText('Test World')).toBeInTheDocument();
    expect(screen.getByText(/by Tester/)).toBeInTheDocument();
    expect(screen.getByText(/40 capacity/)).toBeInTheDocument();
  });

  it('renders the rating bar when a summary is provided', () => {
    render(<WorldListRow world={mockWorld} onSelect={vi.fn()} ratingSummary={mockSummary} />);
    expect(screen.getByTestId('world-rating-bar-list')).toBeInTheDocument();
  });

  it('hides the rating bar when summary is undefined', () => {
    render(<WorldListRow world={mockWorld} onSelect={vi.fn()} />);
    expect(screen.queryByTestId('world-rating-bar-list')).not.toBeInTheDocument();
  });

  it('hides the rating bar below the sm breakpoint so the row cannot overflow a narrow viewport', () => {
    render(<WorldListRow world={mockWorld} onSelect={vi.fn()} ratingSummary={mockSummary} />);
    const wrapper = screen.getByTestId('world-rating-bar-list').parentElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper!.className).toMatch(/\bhidden\b/);
    expect(wrapper!.className).toMatch(/\bsm:block\b/);
  });
});
