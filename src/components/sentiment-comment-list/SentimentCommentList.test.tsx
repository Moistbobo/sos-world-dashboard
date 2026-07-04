import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SentimentCommentList } from './SentimentCommentList';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
    },
  },
}));

describe('SentimentCommentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  });

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

  it('highlights the current user comment with (You)', async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u-current' } } },
      error: null,
    });
    const comments = [
      {
        id: 'c1',
        world_id: 'w1',
        user_id: 'u-current',
        username: 'Anonymous',
        content: 'My comment',
        created_at: new Date().toISOString(),
      },
      {
        id: 'c2',
        world_id: 'w1',
        user_id: 'u-other',
        username: 'Anonymous',
        content: 'Other comment',
        created_at: new Date().toISOString(),
      },
    ];
    render(<SentimentCommentList comments={comments} />);
    const youLabel = await screen.findByText('(You)');
    expect(youLabel).toBeInTheDocument();
    expect(youLabel.parentElement).toHaveTextContent('Anonymous (You)');
    expect(screen.getAllByText('Anonymous')).toHaveLength(2);
  });
});
