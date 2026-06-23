import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CapacityRange, MIN_CAPACITY, MAX_CAPACITY } from './CapacityRange';

function renderCapacityRange(props: Partial<Parameters<typeof CapacityRange>[0]> = {}) {
  const defaults = { min: 10, max: 50, onChange: vi.fn() };
  return render(<CapacityRange {...defaults} {...props} />);
}

function getMinInput() {
  return screen.getByRole('spinbutton', { name: /minimum capacity/i });
}

function getMaxInput() {
  return screen.getByRole('spinbutton', { name: /maximum capacity/i });
}

describe('CapacityRange', () => {
  it('renders min/max inputs with provided values', () => {
    renderCapacityRange({ min: 5, max: 30 });

    expect(getMinInput()).toHaveValue(5);
    expect(getMaxInput()).toHaveValue(30);
    expect(screen.getByText('to')).toBeInTheDocument();
    expect(screen.getByText('players')).toBeInTheDocument();
  });

  it('renders a dual-handle range slider', () => {
    renderCapacityRange({ min: 10, max: 50 });

    const thumbs = screen.getAllByRole('slider');
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0]).toHaveAttribute('aria-valuenow', '10');
    expect(thumbs[1]).toHaveAttribute('aria-valuenow', '50');
  });

  it('calls onChange when Enter is pressed in min input', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const minInput = getMinInput();
    await user.clear(minInput);
    await user.type(minInput, '20');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenLastCalledWith({ min: 20, max: 50 });
  });

  it('calls onChange when min input changes and is blurred', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const minInput = getMinInput();
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

    const minInput = getMinInput();
    await user.clear(minInput);
    await user.type(minInput, '0');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith({ min: MIN_CAPACITY, max: 50 });
  });

  it('clamps max above MAX_CAPACITY', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const maxInput = getMaxInput();
    await user.clear(maxInput);
    await user.type(maxInput, '100');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith({ min: 10, max: MAX_CAPACITY });
  });

  it('swaps min/max if user enters min > max', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const minInput = getMinInput();
    await user.clear(minInput);
    await user.type(minInput, '60');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith({ min: 50, max: 60 });
  });

  it('clamps invalid or empty min input to MIN_CAPACITY', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const minInput = getMinInput();
    await user.clear(minInput);
    await user.type(minInput, 'abc');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith({ min: MIN_CAPACITY, max: 50 });
    expect(minInput).toHaveValue(MIN_CAPACITY);
  });

  it('clamps empty max input to MAX_CAPACITY', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const maxInput = getMaxInput();
    await user.clear(maxInput);
    await user.tab();

    expect(onChange).toHaveBeenCalledWith({ min: 10, max: MAX_CAPACITY });
    expect(maxInput).toHaveValue(MAX_CAPACITY);
  });

  it('syncs inputs and slider when remounted with a new key', async () => {
    const onChange = vi.fn();
    const { rerender } = renderCapacityRange({
      min: 10,
      max: 50,
      onChange,
    });

    expect(getMinInput()).toHaveValue(10);
    expect(getMaxInput()).toHaveValue(50);
    expect(screen.getAllByRole('slider')[0]).toHaveAttribute('aria-valuenow', '10');
    expect(screen.getAllByRole('slider')[1]).toHaveAttribute('aria-valuenow', '50');

    rerender(
      <CapacityRange
        key="capacity-5-30"
        min={5}
        max={30}
        onChange={onChange}
      />
    );

    expect(getMinInput()).toHaveValue(5);
    expect(getMaxInput()).toHaveValue(30);
    expect(screen.getAllByRole('slider')[0]).toHaveAttribute('aria-valuenow', '5');
    expect(screen.getAllByRole('slider')[1]).toHaveAttribute('aria-valuenow', '30');
  });
});
