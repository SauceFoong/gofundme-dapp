'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError?: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error} resetError={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError?: () => void }) {
  const isAccountNotFoundError = error?.message?.includes('Account not found');
  const isProgramError = error?.message?.includes('tipJar') || error?.message?.includes('program');
  
  if (isAccountNotFoundError || isProgramError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center bg-gray-50 rounded-lg border">
        <div className="text-4xl mb-4">🎯</div>
        <h2 className="text-xl font-semibold mb-2">No Tip Jar Found</h2>
        <p className="text-gray-600 mb-4 max-w-md">
          This wallet doesn't have a tip jar yet. Create one using the form to get started!
        </p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-4">
        {error?.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}