import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CapacityRange, MIN_CAPACITY, MAX_CAPACITY } from './CapacityRange';

function renderCapacityRange(props: Partial<Parameters<typeof CapacityRange>[0]> = {}) {
  const defaults = { min: 10, max: 50, onChange: vi.fn() };
  return render(<CapacityRange {...defaults} {...props} />);
}

describe('CapacityRange', () => {
  it('renders min/max inputs with provided values', () => {
    renderCapacityRange({ min: 5, max: 30 });

    expect(screen.getByLabelText('filter.minCapacity')).toHaveValue(5);
    expect(screen.getByLabelText('filter.maxCapacity')).toHaveValue(30);
    expect(screen.getByText('filter.capacityTo')).toBeInTheDocument();
    expect(screen.getByText('filter.capacityUnit')).toBeInTheDocument();
  });

  it('calls onChange when min input changes and is blurred', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const minInput = screen.getByLabelText('filter.minCapacity');
    await user.clear(minInput);
    await user.type(minInput, '20');
    await user.tab();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ min: 20, max: 50 });
  });

  it('clamps min below MIN_CAPACITY', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const minInput = screen.getByLabelText('filter.minCapacity');
    await user.clear(minInput);
    await user.type(minInput, '0');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith({ min: MIN_CAPACITY, max: 50 });
  });

  it('clamps max above MAX_CAPACITY', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const maxInput = screen.getByLabelText('filter.maxCapacity');
    await user.clear(maxInput);
    await user.type(maxInput, '100');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith({ min: 10, max: MAX_CAPACITY });
  });

  it('swaps min/max if user enters min > max', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const minInput = screen.getByLabelText('filter.minCapacity');
    await user.clear(minInput);
    await user.type(minInput, '60');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith({ min: 50, max: 60 });
  });

  it('clamps invalid or empty min input to MIN_CAPACITY', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const minInput = screen.getByLabelText('filter.minCapacity');
    await user.clear(minInput);
    await user.type(minInput, 'abc');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith({ min: MIN_CAPACITY, max: 50 });
    expect(minInput).toHaveValue(MIN_CAPACITY);
  });

  it('clamps empty input to MIN_CAPACITY for min field', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const minInput = screen.getByLabelText('filter.minCapacity');
    await user.clear(minInput);
    await user.tab();

    expect(onChange).toHaveBeenCalledWith({ min: MIN_CAPACITY, max: 50 });
    expect(minInput).toHaveValue(MIN_CAPACITY);
  });
});
