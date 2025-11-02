import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock Firebase
vi.mock('./src/firebase/config', () => ({
  auth: {},
}));

// Mock history API
Object.defineProperty(window, 'history', {
  value: {
    replaceState: vi.fn(),
    pushState: vi.fn(),
  },
  writable: true,
});

// Suppress console errors/warnings during tests if needed
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Optional: Uncomment to suppress specific warnings
  // console.error = vi.fn((...args) => {
  //   if (!args[0]?.includes('specific warning')) {
  //     originalError.call(console, ...args);
  //   }
  // });
});
