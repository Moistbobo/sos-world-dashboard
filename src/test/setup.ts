import '@testing-library/jest-dom'
import '../i18n'

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
