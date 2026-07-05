import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SentimentCommentForm } from './SentimentCommentForm';

describe('SentimentCommentForm', () => {
  it('submits valid comment', () => {
    const onSubmit = vi.fn();
    render(<SentimentCommentForm isSubmitting={false} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText(/short comment/i), {
      target: { value: 'Great world!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /post comment/i }));
    expect(onSubmit).toHaveBeenCalledWith('Great world!');
  });

  it('shows validation error for url', () => {
    render(<SentimentCommentForm isSubmitting={false} onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/short comment/i), {
      target: { value: 'https://example.com' },
    });
    expect(screen.getByText(/links are not allowed/i)).toBeInTheDocument();
  });
});
