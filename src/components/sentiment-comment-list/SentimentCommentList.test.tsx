import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SentimentCommentList } from './SentimentCommentList';

describe('SentimentCommentList', () => {
  it('shows empty state', () => {
    render(<SentimentCommentList comments={[]} />);
    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
  });

  it('renders recent comment as "just now" without "ago"', () => {
    const comments = [
      {
        id: 'c1',
        world_id: 'w1',
        user_id: 'u1',
        username: 'Anonymous',
        content: 'Nice!',
        created_at: new Date().toISOString(),
      },
    ];
    render(<SentimentCommentList comments={comments} />);
    expect(screen.getByText('Just now')).toBeInTheDocument();
    expect(screen.queryByText(/ago/i)).not.toBeInTheDocument();
  });

  it('renders older comment with "ago"', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const comments = [
      {
        id: 'c1',
        world_id: 'w1',
        user_id: 'u1',
        username: 'Anonymous',
        content: 'Nice!',
        created_at: twoHoursAgo,
      },
    ];
    render(<SentimentCommentList comments={comments} />);
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('renders comments', () => {
    const comments = [
      {
        id: 'c1',
        world_id: 'w1',
        user_id: 'u1',
        username: 'Anonymous',
        content: 'Nice!',
        created_at: new Date().toISOString(),
      },
    ];
    render(<SentimentCommentList comments={comments} />);
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
    expect(screen.getByText('Nice!')).toBeInTheDocument();
  });
});
