import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, afterEach, vi } from 'vitest';
import DUFAAccessGuard from '../DUFAAccessGuard';

// Mock useAuth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

const { useAuth } = await import('@/contexts/AuthContext');

describe('DUFAAccessGuard', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders children for admin user', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { email: 'creationvision03@gmail.com' } } as any);
    const { getByText } = render(
      <MemoryRouter>
        <DUFAAccessGuard>
          <div>Admin Content</div>
        </DUFAAccessGuard>
      </MemoryRouter>
    );
    expect(getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects non-admin user to /dufa-coming-soon', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { email: 'notadmin@example.com' } } as any);
    const { container } = render(
      <MemoryRouter initialEntries={['/dufa']}>
        <DUFAAccessGuard>
          <div>Admin Content</div>
        </DUFAAccessGuard>
      </MemoryRouter>
    );
    // Check for react-router Navigate
    expect(container.innerHTML).toContain('dufa-coming-soon');
  });

  it('redirects if no user is present', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as any);
    const { container } = render(
      <MemoryRouter initialEntries={['/dufa']}>
        <DUFAAccessGuard>
          <div>Admin Content</div>
        </DUFAAccessGuard>
      </MemoryRouter>
    );
    expect(container.innerHTML).toContain('dufa-coming-soon');
  });
});
