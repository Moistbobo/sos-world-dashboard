import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SentimentCommentList } from './SentimentCommentList';

describe('SentimentCommentList', () => {
  it('shows empty state', () => {
    render(<SentimentCommentList comments={[]} />);
    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
  });

  it('renders comments', () => {
    const comments = [
      {
        id: 'c1',
        world_id: 'w1',
        user_id: 'u1',
        username: 'happy-owl',
        content: 'Nice!',
        created_at: new Date().toISOString(),
      },
    ];
    render(<SentimentCommentList comments={comments} />);
    expect(screen.getByText('happy-owl')).toBeInTheDocument();
    expect(screen.getByText('Nice!')).toBeInTheDocument();
  });
});
