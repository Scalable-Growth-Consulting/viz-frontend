import React from 'react';
import { render, screen } from '@testing-library/react';
import DUFAProgressTracker from '../DUFAProgressTracker';

describe('DUFAProgressTracker', () => {
  const baseProgress = {
    dataSelection: false,
    forecastConfiguration: false,
    forecastResults: false,
    chatInteraction: false,
    pdfDownload: false,
  };

  it('shows 0% when nothing is done', () => {
    render(<DUFAProgressTracker progress={baseProgress} />);
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });

  it('shows 50% after data/model steps', () => {
    render(
      <DUFAProgressTracker progress={{
        ...baseProgress,
        dataSelection: true,
        forecastConfiguration: true,
        forecastResults: true
      }} />
    );
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it('shows 75% after chat interaction', () => {
    render(
      <DUFAProgressTracker progress={{
        ...baseProgress,
        dataSelection: true,
        forecastConfiguration: true,
        forecastResults: true,
        chatInteraction: true
      }} />
    );
    expect(screen.getByText(/75%/)).toBeInTheDocument();
  });

  it('shows 100% after PDF download', () => {
    render(
      <DUFAProgressTracker progress={{
        dataSelection: true,
        forecastConfiguration: true,
        forecastResults: true,
        chatInteraction: true,
        pdfDownload: true
      }} />
    );
    expect(screen.getByText(/100%/)).toBeInTheDocument();
    expect(screen.getByText(/All steps complete/i)).toBeInTheDocument();
  });
});
