import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorldCurationActions } from '../world-curation-actions';
import type { World } from '../../types';

const mocks = vi.hoisted(() => ({
  setWorldQuality: vi.fn(),
  setWorldHighPriority: vi.fn(),
  clearWorldHighPriority: vi.fn(),
}));

vi.mock('../../api/client', () => ({
  setWorldQuality: mocks.setWorldQuality,
  setWorldHighPriority: mocks.setWorldHighPriority,
  clearWorldHighPriority: mocks.clearWorldHighPriority,
}));

function makeWorld(overrides: Partial<World> = {}): World {
  return {
    worldId: 'wrld_test',
    name: 'Test World',
    authorName: 'Tester',
    capacity: 40,
    platforms: [],
    tags: [],
    imageUrl: '',
    vrchatUrl: '',
    quality: null,
    createdAt: '2024-01-01',
    guildId: 'guild_1',
    ...overrides,
  };
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.setWorldQuality.mockResolvedValue({ updated: true });
  mocks.setWorldHighPriority.mockResolvedValue({ added: true });
  mocks.clearWorldHighPriority.mockResolvedValue({ removed: true });
});

describe('WorldCurationActions', () => {
  it('shows Good, Bad, and High Priority for an untagged world', () => {
    render(<WorldCurationActions world={makeWorld()} />, { wrapper: Wrapper });
    expect(screen.getByRole('button', { name: 'Mark Good' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark Bad' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark High Priority' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear Quality' })).not.toBeInTheDocument();
  });

  it('shows Good, Bad, and Clear Quality for a high-priority world', () => {
    render(<WorldCurationActions world={makeWorld({ highPriority: true })} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByRole('button', { name: 'Mark Good' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark Bad' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear Quality' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark High Priority' })).not.toBeInTheDocument();
  });

  it('shows only Clear Quality for a quality-tagged world, even when both flags are set', () => {
    render(<WorldCurationActions world={makeWorld({ quality: 'good', highPriority: true })} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByRole('button', { name: 'Clear Quality' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark Good' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark Bad' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark High Priority' })).not.toBeInTheDocument();
  });

  it('fires set-quality with the world id, guild id, and quality', async () => {
    const user = userEvent.setup();
    render(<WorldCurationActions world={makeWorld()} />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'Mark Good' }));

    expect(mocks.setWorldQuality).toHaveBeenCalledWith('wrld_test', 'guild_1', 'good');
    expect(mocks.setWorldHighPriority).not.toHaveBeenCalled();
  });

  it('fires set-high-priority with the world id and guild id', async () => {
    const user = userEvent.setup();
    render(<WorldCurationActions world={makeWorld()} />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'Mark High Priority' }));

    expect(mocks.setWorldHighPriority).toHaveBeenCalledWith('wrld_test', 'guild_1');
  });

  it('fires clear-high-priority (via Clear Quality) with the world id and guild id for a high-priority world', async () => {
    const user = userEvent.setup();
    render(<WorldCurationActions world={makeWorld({ highPriority: true })} />, {
      wrapper: Wrapper,
    });

    await user.click(screen.getByRole('button', { name: 'Clear Quality' }));

    expect(mocks.clearWorldHighPriority).toHaveBeenCalledWith('wrld_test', 'guild_1');
    expect(mocks.setWorldQuality).not.toHaveBeenCalled();
  });

  it('fires clear-quality as a quality update to null', async () => {
    const user = userEvent.setup();
    render(<WorldCurationActions world={makeWorld({ quality: 'bad' })} />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'Clear Quality' }));

    expect(mocks.setWorldQuality).toHaveBeenCalledWith('wrld_test', 'guild_1', null);
  });

  it('disables every button while a mutation is pending and re-enables them after', async () => {
    let resolveMutation!: () => void;
    mocks.setWorldQuality.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveMutation = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<WorldCurationActions world={makeWorld()} />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: 'Mark Bad' }));

    expect(screen.getByRole('button', { name: 'Mark Good' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mark Bad' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mark High Priority' })).toBeDisabled();

    resolveMutation();
    await waitForEnabled();
  });
});

async function waitForEnabled() {
  await vi.waitFor(() => {
    expect(screen.getByRole('button', { name: 'Mark Good' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mark Bad' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mark High Priority' })).not.toBeDisabled();
  });
}
