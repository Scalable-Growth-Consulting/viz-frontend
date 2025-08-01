import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DUFAComingSoon from '../DUFAComingSoon';

describe('DUFAComingSoon', () => {
  it('renders Coming Soon headline and email form', () => {
    render(
      <MemoryRouter>
        <DUFAComingSoon />
      </MemoryRouter>
    );
    expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email address/i)).toBeInTheDocument();
    expect(screen.getByText(/Notify Me/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(
      <MemoryRouter>
        <DUFAComingSoon />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByText(/Notify Me/i));
    await waitFor(() => {
      expect(screen.getByText(/Invalid email/i)).toBeInTheDocument();
    });
  });

  it('shows success message after subscribing', async () => {
    render(
      <MemoryRouter>
        <DUFAComingSoon />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText(/Notify Me/i));
    await waitFor(() => {
      expect(screen.getByText(/You're All Set!/i)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });
  });
});
