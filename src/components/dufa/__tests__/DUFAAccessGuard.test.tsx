import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DUFAAccessGuard from '../DUFAAccessGuard';

// Mock useAuth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

const { useAuth } = require('@/contexts/AuthContext');

describe('DUFAAccessGuard', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders children for admin user', () => {
    useAuth.mockReturnValue({ user: { email: 'creationvision03@gmail.com' } });
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
    useAuth.mockReturnValue({ user: { email: 'notadmin@example.com' } });
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
    useAuth.mockReturnValue({ user: null });
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
