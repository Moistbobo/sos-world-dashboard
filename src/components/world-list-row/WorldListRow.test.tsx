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

  it('renders the thumbnail through wsrv.nl at w=128 with fetchpriority low', () => {
    render(
      <WorldListRow
        world={{ ...mockWorld, imageUrl: 'https://api.vrchat.cloud/image.png' }}
        onSelect={vi.fn()}
      />,
    );
    const img = document.querySelector('img');
    expect(img).toHaveAttribute(
      'src',
      'https://wsrv.nl/?url=https%3A%2F%2Fapi.vrchat.cloud%2Fimage.png&w=128&output=webp',
    );
    expect(img).toHaveAttribute('fetchpriority', 'low');
  });

  it('shows a shimmer placeholder behind the row thumbnail', () => {
    render(
      <WorldListRow
        world={{ ...mockWorld, imageUrl: 'https://api.vrchat.cloud/image.png' }}
        onSelect={vi.fn()}
      />,
    );
    const shimmer = document.querySelector('.animate-shimmer');
    expect(shimmer).not.toBeNull();
    expect(shimmer).toHaveAttribute('aria-hidden', 'true');
  });
});
