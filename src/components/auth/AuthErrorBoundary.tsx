import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Authentication error caught:', error, errorInfo);
  }

  private clearLocalStorage = () => {
    try {
      // Clear all Supabase related items from localStorage
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
      
      // Also try to clear any items that start with 'supabase.auth.'
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key);
        }
      }
      
      // Reload the page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isAuthError = this.state.error?.message?.toLowerCase().includes('auth') || 
                          this.state.error?.message?.toLowerCase().includes('token') ||
                          this.state.error?.message?.toLowerCase().includes('refresh');
      
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                Authentication Error
              </CardTitle>
              <CardDescription>
                There was a problem with your authentication session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                {isAuthError 
                  ? "Your authentication session is invalid or has expired. This can happen if you've been inactive for a long time or if there was a problem with your login."
                  : this.state.error?.message || "An unknown error occurred"}
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800">
                <p className="font-medium">Recommended action:</p>
                <p>Click the button below to clear your authentication data and return to the login page.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={this.handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={this.clearLocalStorage}>
                Clear Auth Data & Login Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary; 