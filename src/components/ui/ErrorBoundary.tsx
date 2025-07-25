import React from "react";
import * as Sentry from '@sentry/react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log error info to an error reporting service here
    console.error("Uncaught error:", error, errorInfo);
    Sentry.captureException(error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: "center" }}>
          <h1>Something went wrong.</h1>
          <pre style={{ color: "red", margin: 16 }}>{this.state.error?.message}</pre>
          <button onClick={this.handleReload} style={{ padding: "8px 16px", fontSize: 16 }}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
} 