import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListIcon } from './listIcon';

describe('ListIcon', () => {
  it('renders a Lucide icon by name', () => {
    render(<ListIcon icon="Star" color="#000" />);
    expect(screen.getByTestId('list-icon-star')).toBeInTheDocument();
  });

  it('renders an emoji string as text', () => {
    render(<ListIcon icon="🌙" color="#000" />);
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('falls back to Star when icon is null', () => {
    render(<ListIcon icon={null} color="#000" />);
    expect(screen.getByTestId('list-icon-star')).toBeInTheDocument();
  });
});
