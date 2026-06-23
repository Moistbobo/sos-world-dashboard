import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';
import { MIN_CAPACITY, MAX_CAPACITY } from './CapacityRange';

const defaultProps = {
  selectedTags: [],
  onToggleTag: vi.fn(),
  onRemoveTag: vi.fn(),
  selectedQuality: [],
  onToggleQuality: vi.fn(),
  onClear: vi.fn(),
  availableTags: [],
  capacityRange: { min: MIN_CAPACITY, max: MAX_CAPACITY },
  onCapacityChange: vi.fn(),
};

function renderFilterBar(props: Partial<typeof defaultProps> = {}) {
  return render(<FilterBar {...defaultProps} {...props} />);
}

describe('FilterBar', () => {
  it('renders capacity section with inputs when expanded', async () => {
    const user = userEvent.setup();
    renderFilterBar();

    await user.click(screen.getByRole('button', { name: /filters/i }));

    expect(screen.getByText('Player capacity')).toBeInTheDocument();
    expect(screen.getByLabelText('Minimum capacity')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum capacity')).toBeInTheDocument();
  });

  it('shows active capacity chip when not at default range', () => {
    renderFilterBar({ capacityRange: { min: 10, max: 40 } });

    const chip = screen.getByText(/10–40/);
    expect(chip).toBeInTheDocument();
    expect(chip.textContent).toMatch(/players/);
  });

  it('calls onCapacityChange when capacity X chip clicked', async () => {
    const user = userEvent.setup();
    const onCapacityChange = vi.fn();
    renderFilterBar({
      capacityRange: { min: 10, max: 40 },
      onCapacityChange,
    });

    const removeButton = screen.getByRole('button', { name: /remove capacity filter/i });

    await user.click(removeButton);

    expect(onCapacityChange).toHaveBeenCalledTimes(1);
    expect(onCapacityChange).toHaveBeenCalledWith({
      min: MIN_CAPACITY,
      max: MAX_CAPACITY,
    });
  });
});
