import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renders timestamps in MM/DD/YY(ddd)HH:mm:ss format', () => {
    const date = new Date('2026-06-27T21:22:20Z');
    const expected = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${String(date.getFullYear() % 100).padStart(2, '0')}(${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]})${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    const comments = [
      {
        id: 'c1',
        world_id: 'w1',
        user_id: 'u1',
        username: 'Anonymous',
        content: 'Nice!',
        created_at: '2026-06-27T21:22:20Z',
      },
    ];
    render(<SentimentCommentList comments={comments} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('orders comments newest first by default', () => {
    const comments = [
      {
        id: 'c1',
        world_id: 'w1',
        user_id: 'u1',
        username: 'Anonymous',
        content: 'First',
        created_at: '2026-06-27T20:00:00Z',
      },
      {
        id: 'c2',
        world_id: 'w1',
        user_id: 'u1',
        username: 'Anonymous',
        content: 'Second',
        created_at: '2026-06-27T21:00:00Z',
      },
    ];
    render(<SentimentCommentList comments={comments} />);
    const items = screen.getAllByText(/First|Second/);
    expect(items[0]).toHaveTextContent('Second');
  });

  it('toggles to oldest first', () => {
    const comments = [
      {
        id: 'c1',
        world_id: 'w1',
        user_id: 'u1',
        username: 'Anonymous',
        content: 'First',
        created_at: '2026-06-27T20:00:00Z',
      },
      {
        id: 'c2',
        world_id: 'w1',
        user_id: 'u1',
        username: 'Anonymous',
        content: 'Second',
        created_at: '2026-06-27T21:00:00Z',
      },
    ];
    render(<SentimentCommentList comments={comments} />);
    fireEvent.click(screen.getByRole('button', { name: /Newest first/i }));
    const items = screen.getAllByText(/First|Second/);
    expect(items[0]).toHaveTextContent('First');
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
