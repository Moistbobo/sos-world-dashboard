import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';
import { MIN_CAPACITY, MAX_CAPACITY } from './CapacityRange';

const defaultProps = {
  selectedTags: [] as string[],
  onToggleTag: vi.fn(),
  onRemoveTag: vi.fn(),
  selectedQuality: [] as ('good' | 'bad')[],
  onToggleQuality: vi.fn(),
  onClear: vi.fn(),
  availableTags: [] as { tag: string; count: number }[],
  capacityRange: { min: MIN_CAPACITY, max: MAX_CAPACITY },
  onCapacityChange: vi.fn(),
  selectedPlatforms: [] as string[],
  onTogglePlatform: vi.fn(),
  onRemovePlatform: vi.fn(),
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
    expect(screen.getByRole('spinbutton', { name: /minimum capacity/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /maximum capacity/i })).toBeInTheDocument();
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

  it('renders platform chips when expanded', async () => {
    const user = userEvent.setup();
    renderFilterBar({ selectedPlatforms: [], onTogglePlatform: vi.fn() });

    await user.click(screen.getByRole('button', { name: /filters/i }));

    expect(screen.getByText('Platforms')).toBeInTheDocument();
    expect(screen.getByText('Android')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('calls onTogglePlatform when a platform chip is clicked', async () => {
    const user = userEvent.setup();
    const onTogglePlatform = vi.fn();
    renderFilterBar({ onTogglePlatform });

    await user.click(screen.getByRole('button', { name: /filters/i }));
    await user.click(screen.getByText('Android'));

    expect(onTogglePlatform).toHaveBeenCalledWith('android');
  });

  it('shows selected platform chips in collapsed bar', () => {
    renderFilterBar({ selectedPlatforms: ['android', ''] });
    expect(screen.getByText('Android')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('calls onRemovePlatform when a selected platform X is clicked', async () => {
    const user = userEvent.setup();
    const onRemovePlatform = vi.fn();
    renderFilterBar({ selectedPlatforms: ['android'], onRemovePlatform });

    await user.click(screen.getByRole('button', { name: /remove platform filter/i }));

    expect(onRemovePlatform).toHaveBeenCalledWith('android');
  });

  it('adds a raw platform value when typing and pressing Enter', async () => {
    const user = userEvent.setup();
    const onTogglePlatform = vi.fn();
    renderFilterBar({ onTogglePlatform });

    await user.click(screen.getByRole('button', { name: /filters/i }));
    const input = screen.getByPlaceholderText(/search or add platform/i);
    await user.type(input, '2019.2.4-801-Release');
    await user.keyboard('{Enter}');

    expect(onTogglePlatform).toHaveBeenCalledWith('2019.2.4-801-Release');
  });

  it('clears platforms via onClear', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    renderFilterBar({ selectedPlatforms: ['android'], onClear });

    await user.click(screen.getByRole('button', { name: /clear all/i }));

    expect(onClear).toHaveBeenCalled();
  });
});
