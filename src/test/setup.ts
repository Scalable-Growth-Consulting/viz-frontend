import '@testing-library/jest-dom';

// Mock useAuth context globally for tests
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null, loading: false }))
}));

// Mock useToast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}));
