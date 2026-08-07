import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import '../i18n'
import { vi } from 'vitest';

vi.mock('sonner', () => ({
  Toaster: () => null,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    message: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  },
}));

class MockIntersectionObserver implements IntersectionObserver {
  root: Document | Element | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

class MockResizeObserver implements ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});
