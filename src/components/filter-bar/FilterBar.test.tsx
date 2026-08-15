import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '../filter-bar';
import { MIN_CAPACITY, MAX_CAPACITY } from '../capacity-range';

const defaultProps = {
  selectedTags: [] as string[],
  onToggleTag: vi.fn(),
  onRemoveTag: vi.fn(),
  selectedQuality: [] as ('good' | 'bad')[],
  onToggleQuality: vi.fn(),
  onClear: vi.fn(),
  availableTags: [] as { tag: string; count: number }[],
  qualityCounts: [] as { quality: 'good' | 'bad'; count: number }[],
  platformCounts: [] as { platform: string; count: number }[],
  capacityRange: { min: MIN_CAPACITY, max: MAX_CAPACITY },
  onCapacityChange: vi.fn(),
  selectedPlatforms: [] as string[],
  onTogglePlatform: vi.fn(),
  onRemovePlatform: vi.fn(),
  dayRange: null as number | null,
  onDayRangeChange: vi.fn(),
  showCurator: false,
  highPriority: false,
  onToggleHighPriority: vi.fn(),
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

  it('toggles expanded when clicking anywhere on the filter bar header', async () => {
    const user = userEvent.setup();
    renderFilterBar();

    await user.click(screen.getByTestId('filter-bar-header'));

    expect(screen.getByText('Player capacity')).toBeInTheDocument();
    expect(screen.getByText('Platforms')).toBeInTheDocument();

    await user.click(screen.getByTestId('filter-bar-header'));

    expect(screen.queryByText('Player capacity')).not.toBeInTheDocument();
    expect(screen.queryByText('Platforms')).not.toBeInTheDocument();
  });

  it('does not toggle expanded when clicking the clear all button', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    renderFilterBar({ selectedPlatforms: ['android'], onClear });

    await user.click(screen.getByRole('button', { name: /clear all/i }));

    expect(onClear).toHaveBeenCalled();
    expect(screen.queryByText('Platforms')).not.toBeInTheDocument();
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
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Android')).toBeInTheDocument();
    expect(screen.getByText('iOS')).toBeInTheDocument();
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

  it('clears platforms via onClear', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    renderFilterBar({ selectedPlatforms: ['android'], onClear });

    await user.click(screen.getByRole('button', { name: /clear all/i }));

    expect(onClear).toHaveBeenCalled();
  });

  it('renders date tagged section with presets and custom input when expanded', async () => {
    const user = userEvent.setup();
    renderFilterBar();

    await user.click(screen.getByRole('button', { name: /filters/i }));

    expect(screen.getByText('Date tagged')).toBeInTheDocument();
    expect(screen.getByTestId('day-range-preset-1')).toBeInTheDocument();
    expect(screen.getByTestId('day-range-preset-7')).toBeInTheDocument();
    expect(screen.getByTestId('day-range-preset-14')).toBeInTheDocument();
    expect(screen.getByTestId('day-range-preset-30')).toBeInTheDocument();
    expect(screen.getByTestId('day-range-preset-90')).toBeInTheDocument();
    expect(screen.getByTestId('day-range-preset-180')).toBeInTheDocument();
    expect(screen.getByTestId('day-range-preset-all')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /custom/i })).toBeInTheDocument();
  });

  it('calls onDayRangeChange when a preset chip is clicked', async () => {
    const user = userEvent.setup();
    const onDayRangeChange = vi.fn();
    renderFilterBar({ onDayRangeChange });

    await user.click(screen.getByRole('button', { name: /filters/i }));
    await user.click(screen.getByTestId('day-range-preset-7'));

    expect(onDayRangeChange).toHaveBeenCalledWith(7);
  });

  it('calls onDayRangeChange with the selected preset value regardless of current selection', async () => {
    const user = userEvent.setup();
    const onDayRangeChange = vi.fn();
    renderFilterBar({ dayRange: 7, onDayRangeChange });

    await user.click(screen.getByRole('button', { name: /filters/i }));
    await user.click(screen.getByTestId('day-range-preset-7'));

    expect(onDayRangeChange).toHaveBeenCalledWith(7);
  });

  it('preserves custom input value when a different preset is selected', async () => {
    const user = userEvent.setup();
    const onDayRangeChange = vi.fn();
    renderFilterBar({ dayRange: null, onDayRangeChange });

    await user.click(screen.getByRole('button', { name: /filters/i }));
    const input = screen.getByRole('spinbutton', { name: /custom/i });
    await user.type(input, '45');
    await user.click(screen.getByTestId('day-range-preset-7'));

    expect(input).toHaveValue(45);
    expect(onDayRangeChange).toHaveBeenLastCalledWith(7);
  });

  it('preserves custom input value when it matches the selected preset', async () => {
    const user = userEvent.setup();
    const onDayRangeChange = vi.fn();
    renderFilterBar({ dayRange: null, onDayRangeChange });

    await user.click(screen.getByRole('button', { name: /filters/i }));
    const input = screen.getByRole('spinbutton', { name: /custom/i });
    await user.type(input, '7');
    await user.click(screen.getByTestId('day-range-preset-7'));

    expect(input).toHaveValue(7);
    expect(onDayRangeChange).toHaveBeenLastCalledWith(7);
  });

  it('calls onDayRangeChange with null when All preset chip is clicked', async () => {
    const user = userEvent.setup();
    const onDayRangeChange = vi.fn();
    renderFilterBar({ dayRange: 7, onDayRangeChange });

    await user.click(screen.getByRole('button', { name: /filters/i }));
    await user.click(screen.getByTestId('day-range-preset-all'));

    expect(onDayRangeChange).toHaveBeenCalledWith(null);
  });

  it('calls onDayRangeChange when a custom value is typed', async () => {
    const user = userEvent.setup();
    const onDayRangeChange = vi.fn();
    renderFilterBar({ onDayRangeChange });

    await user.click(screen.getByRole('button', { name: /filters/i }));
    const input = screen.getByRole('spinbutton', { name: /custom/i });
    fireEvent.change(input, { target: { value: '45' } });

    expect(onDayRangeChange).toHaveBeenLastCalledWith(45);
  });

  it('calls onDayRangeChange with null when custom value is cleared', async () => {
    const user = userEvent.setup();
    const onDayRangeChange = vi.fn();
    renderFilterBar({ dayRange: 45, onDayRangeChange });

    await user.click(screen.getByRole('button', { name: /filters/i }));
    const input = screen.getByRole('spinbutton', { name: /custom/i });
    await user.clear(input);

    expect(onDayRangeChange).toHaveBeenLastCalledWith(null);
  });

  it('shows active date range chip in collapsed bar', () => {
    renderFilterBar({ dayRange: 7 });

    expect(screen.getByText(/Last 7 days/)).toBeInTheDocument();
  });

  it('keeps custom input empty for preset day range in collapsed bar', () => {
    renderFilterBar({ dayRange: 7 });

    expect(screen.queryByRole('spinbutton', { name: /custom/i })).not.toBeInTheDocument();
  });

  it('calls onDayRangeChange with null when active date chip X is clicked', async () => {
    const user = userEvent.setup();
    const onDayRangeChange = vi.fn();
    renderFilterBar({ dayRange: 7, onDayRangeChange });

    await user.click(screen.getByRole('button', { name: /remove date tagged filter/i }));

    expect(onDayRangeChange).toHaveBeenCalledWith(null);
  });

  it('includes active date range in filter count badge', () => {
    renderFilterBar({ dayRange: 7 });

    const badge = screen.getByText('1');
    expect(badge).toBeInTheDocument();
  });
});

describe('FilterBar curator section', () => {
  it('is not rendered when showCurator is false', async () => {
    const user = userEvent.setup();
    renderFilterBar();

    await user.click(screen.getByRole('button', { name: /filters/i }));

    expect(screen.queryByText('Curator')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /high priority/i })).not.toBeInTheDocument();
  });

  it('renders the curator row with the high priority toggle when showCurator is true', async () => {
    const user = userEvent.setup();
    renderFilterBar({ showCurator: true });

    await user.click(screen.getByRole('button', { name: /filters/i }));

    expect(screen.getByText('Curator')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /high priority/i })).toBeInTheDocument();
  });

  it('reflects the active filter state via aria-pressed', async () => {
    const user = userEvent.setup();
    renderFilterBar({ showCurator: true, highPriority: true });

    await user.click(screen.getByRole('button', { name: /filters/i }));

    expect(screen.getByRole('button', { name: /high priority/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('calls onToggleHighPriority when clicked', async () => {
    const user = userEvent.setup();
    const onToggleHighPriority = vi.fn();
    renderFilterBar({ showCurator: true, onToggleHighPriority });

    await user.click(screen.getByRole('button', { name: /filters/i }));
    await user.click(screen.getByRole('button', { name: /high priority/i }));

    expect(onToggleHighPriority).toHaveBeenCalledTimes(1);
  });

  it('counts toward the filter count badge when active', () => {
    renderFilterBar({ showCurator: true, highPriority: true });
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('toggles quality buttons when the curator row is visible', async () => {
    const user = userEvent.setup();
    const onToggleQuality = vi.fn();
    renderFilterBar({ showCurator: true, onToggleQuality });

    await user.click(screen.getByRole('button', { name: /filters/i }));
    await user.click(screen.getByRole('button', { name: /Good/ }));

    expect(onToggleQuality).toHaveBeenCalledWith('good');
  });
});

describe('FilterBar counts', () => {
  it('renders quality counts in expanded quality buttons', async () => {
    const user = userEvent.setup();
    renderFilterBar({
      showCurator: true,
      qualityCounts: [
        { quality: 'good', count: 123 },
        { quality: 'bad', count: 12 },
      ],
    });

    await user.click(screen.getByRole('button', { name: /filters/i }));

    expect(screen.getByRole('button', { name: /Good\s*\(123\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bad\s*\(12\)/ })).toBeInTheDocument();
  });

  it('renders platform counts in expanded platform buttons', async () => {
    const user = userEvent.setup();
    renderFilterBar({
      platformCounts: [
        { platform: 'standalonewindows', count: 80 },
        { platform: 'android', count: 45 },
        { platform: 'ios', count: 6 },
      ],
    });

    await user.click(screen.getByRole('button', { name: /filters/i }));

    expect(screen.getByRole('button', { name: /Desktop\s*\(80\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Android\s*\(45\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iOS\s*\(6\)/ })).toBeInTheDocument();
  });

  it('does not show counts on selected quality chips in collapsed bar', () => {
    renderFilterBar({
      showCurator: true,
      selectedQuality: ['good'],
      qualityCounts: [{ quality: 'good', count: 123 }],
    });

    expect(screen.queryByText(/Good \(123\)/)).not.toBeInTheDocument();
  });

  it('does not show selected quality chips in collapsed bar when showCurator is false', () => {
    renderFilterBar({ selectedQuality: ['good'] });

    expect(screen.queryByRole('button', { name: /good/i })).not.toBeInTheDocument();
  });

  it('does not show counts on selected platform chips in collapsed bar', () => {
    renderFilterBar({
      selectedPlatforms: ['android'],
      platformCounts: [{ platform: 'android', count: 45 }],
    });

    expect(screen.queryByText(/Android \(45\)/)).not.toBeInTheDocument();
  });
});
