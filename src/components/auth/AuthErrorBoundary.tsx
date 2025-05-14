import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
    this.setState({
      errorInfo
    });
  }

  clearAuthData = async (): Promise<void> => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear localStorage auth data
      const keysToRemove = [
        'supabase.auth.token',
        'supabase.auth.refreshToken',
        'supabase.auth.expires_at',
        'supabase.auth.provider_token',
        'supabase.auth.provider_refresh_token'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Also clear any keys that start with 'supabase.auth.'
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key);
        }
      });
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  handleRetry = (): void => {
    // Reset the error state and retry
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Refresh the page
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Check if it's an authentication error (contains specific error messages)
      const isAuthError = 
        this.state.error?.message?.includes('authentication') || 
        this.state.error?.message?.includes('auth') ||
        this.state.error?.message?.includes('session') ||
        this.state.error?.message?.includes('token') ||
        this.state.error?.stack?.includes('auth') ||
        this.state.error?.message?.includes('includes');

      // Custom fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <h1 className="text-xl font-bold text-center text-red-600 mb-2">
                {isAuthError ? 'Authentication Error' : 'An Error Occurred'}
              </h1>
              
              <div className="bg-blue-100 text-blue-800 p-3 rounded-md w-full mb-4">
                <p>There was a problem with your authentication session</p>
              </div>

              {this.state.error && (
                <div className="bg-red-100 text-red-800 p-3 rounded-md w-full mb-6">
                  <p>{this.state.error.message}</p>
                </div>
              )}
              
              {isAuthError && (
                <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md w-full mb-6">
                  <p className="font-medium">Recommended action:</p>
                  <p>Click the button below to clear your authentication data and return to the login page.</p>
                </div>
              )}
              
              <div className="flex gap-3 w-full">
                <Button 
                  variant="outline" 
                  onClick={this.handleRetry}
                  className="flex-1 gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
                
                <Button 
                  onClick={this.clearAuthData}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Clear Auth Data & Login Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary; 