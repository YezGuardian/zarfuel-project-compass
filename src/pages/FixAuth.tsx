import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const FixAuth: React.FC = () => {
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Get error message from URL if present
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }
  }, []);

  const clearAuthData = async () => {
    setIsClearing(true);
    
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
      
      toast.success('Authentication data cleared successfully');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      toast.error('Failed to clear authentication data');
    } finally {
      setIsClearing(false);
    }
  };

  const handleRetry = () => {
    // Navigate to dashboard and attempt to refresh the session
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-center text-red-600 mb-2">
            Authentication Error
          </h1>
          
          <div className="bg-blue-100 text-blue-800 p-3 rounded-md w-full mb-4">
            <p>There was a problem with your authentication session</p>
          </div>

          {errorMessage && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md w-full mb-6">
              <p>{errorMessage}</p>
            </div>
          )}
          
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md w-full mb-6">
            <p className="font-medium">Recommended action:</p>
            <p>Click the button below to clear your authentication data and return to the login page.</p>
          </div>
          
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={handleRetry}
              className="flex-1 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            
            <Button 
              onClick={clearAuthData}
              disabled={isClearing}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isClearing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Clear & Login Again
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixAuth; 