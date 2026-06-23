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

    expect(screen.getByLabelText('Minimum capacity')).toHaveValue(5);
    expect(screen.getByLabelText('Maximum capacity')).toHaveValue(30);
    expect(screen.getByText('to')).toBeInTheDocument();
    expect(screen.getByText('players')).toBeInTheDocument();
  });

  it('calls onChange when min input changes and is blurred', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const minInput = screen.getByLabelText('Minimum capacity');
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

    const minInput = screen.getByLabelText('Minimum capacity');
    await user.clear(minInput);
    await user.type(minInput, '0');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith({ min: MIN_CAPACITY, max: 50 });
  });

  it('clamps max above MAX_CAPACITY', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const maxInput = screen.getByLabelText('Maximum capacity');
    await user.clear(maxInput);
    await user.type(maxInput, '100');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith({ min: 10, max: MAX_CAPACITY });
  });

  it('swaps min/max if user enters min > max', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const minInput = screen.getByLabelText('Minimum capacity');
    await user.clear(minInput);
    await user.type(minInput, '60');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith({ min: 50, max: 60 });
  });

  it('clamps invalid or empty min input to MIN_CAPACITY', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCapacityRange({ min: 10, max: 50, onChange });

    const minInput = screen.getByLabelText('Minimum capacity');
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

    const maxInput = screen.getByLabelText('Maximum capacity');
    await user.clear(maxInput);
    await user.tab();

    expect(onChange).toHaveBeenCalledWith({ min: 10, max: MAX_CAPACITY });
    expect(maxInput).toHaveValue(MAX_CAPACITY);
  });

  it('syncs inputs when external min/max props change', async () => {
    const onChange = vi.fn();
    const { rerender } = renderCapacityRange({ min: 10, max: 50, onChange });

    expect(screen.getByLabelText('Minimum capacity')).toHaveValue(10);
    expect(screen.getByLabelText('Maximum capacity')).toHaveValue(50);

    rerender(<CapacityRange min={5} max={30} onChange={onChange} />);

    expect(screen.getByLabelText('Minimum capacity')).toHaveValue(5);
    expect(screen.getByLabelText('Maximum capacity')).toHaveValue(30);
  });
});
