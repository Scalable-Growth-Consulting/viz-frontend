import React from 'react';
import { Ghost, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GlobalErrorBoundaryState {
  hasError: boolean;
  errorInfo: string;
}

class GlobalErrorBoundary extends React.Component<{
  children: React.ReactNode
}, GlobalErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorInfo: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Optionally log error to an error reporting service
    // console.error('Global Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorInfo: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black text-center px-4">
          <Ghost className="w-20 h-20 text-viz-accent dark:text-viz-accent-light mb-6 animate-bounce mx-auto" />
          <h1 className="text-4xl font-bold mb-2 text-viz-accent dark:text-viz-accent-light">Something went wrong</h1>
          <p className="text-lg text-viz-text-secondary mb-6 max-w-xl mx-auto">
            Our team has been notified. Please try again, or return to the home page.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-6 py-2 bg-viz-accent text-white rounded-lg shadow-lg hover:bg-viz-accent-light hover:scale-105 transition-all duration-200 font-medium text-base focus:outline-none focus:ring-2 focus:ring-viz-accent-dark"
            >
              <RefreshCcw className="w-5 h-5" />
              Retry
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2 bg-viz-accent text-white rounded-lg shadow-lg hover:bg-viz-accent-light hover:scale-105 transition-all duration-200 font-medium text-base focus:outline-none focus:ring-2 focus:ring-viz-accent-dark"
            >
              Go to Home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default GlobalErrorBoundary;
