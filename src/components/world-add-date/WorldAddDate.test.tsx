import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorldAddDate } from './WorldAddDate';

const mockWorld = {
  worldId: 'wrld_test',
  name: 'Test World',
  authorName: 'Tester',
  capacity: 40,
  platforms: ['pc'],
  tags: [],
  imageUrl: '',
  vrchatUrl: 'https://vrchat.com/home/world/wrld_test',
  quality: 'good' as const,
  createdAt: '2024-01-01',
  internalAddDate: '2024-02-01',
};

describe('WorldAddDate', () => {
  it('renders the formatted dashboard add date', () => {
    render(<WorldAddDate world={mockWorld} />);
    expect(screen.getByText(new Date('2024-02-01').toLocaleDateString())).toBeInTheDocument();
  });

  it('falls back to createdAt when internalAddDate is missing', () => {
    render(<WorldAddDate world={{ ...mockWorld, internalAddDate: undefined }} />);
    expect(screen.getByText(new Date('2024-01-01').toLocaleDateString())).toBeInTheDocument();
  });

  it('shows a tooltip explaining the dashboard date', () => {
    render(<WorldAddDate world={mockWorld} />);
    expect(screen.getByTitle(/dashboard/i)).toBeInTheDocument();
  });

  it('uses a dotted underline treatment', () => {
    render(<WorldAddDate world={mockWorld} />);
    const el = screen.getByTitle(/dashboard/i);
    expect(getComputedStyle(el).textDecorationLine).toBe('underline');
    expect(getComputedStyle(el).textDecorationStyle).toBe('dotted');
  });
});
