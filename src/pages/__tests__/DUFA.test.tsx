import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as AuthContext from '@/contexts/AuthContext';
import DUFA from '../DUFA';

describe('DUFA page modularity', () => {
  beforeEach(() => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({ user: { email: 'creationvision03@gmail.com' } });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders all DUFA main workflow sections', () => {
    render(
      <MemoryRouter>
        <DUFA />
      </MemoryRouter>
    );
    expect(screen.getByText(/Dataset Selection/i)).toBeInTheDocument();
    expect(screen.getByText(/Forecast Configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/Forecast Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Forecast Chatbot/i)).toBeInTheDocument();
    expect(screen.getByText(/Download PDF Report/i)).toBeInTheDocument();
  });
});
