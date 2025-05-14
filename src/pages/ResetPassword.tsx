import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthError } from '@supabase/supabase-js';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // Check if we have a session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking session for password reset');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError('Invalid or expired password reset link. Please request a new one.');
          setIsSessionValid(false);
          return;
        }
        
        if (!data.session) {
          console.log('No session found');
          setError('Invalid or expired password reset link. Please request a new one.');
          setIsSessionValid(false);
          return;
        }
        
        console.log('Valid session found');
        setIsSessionValid(true);
      } catch (err) {
        console.error('Error checking session:', err);
        setError('An error occurred while verifying your session. Please try again.');
        setIsSessionValid(false);
      }
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Updating password');
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      toast.success('Password has been reset successfully');
    } catch (error) {
      console.error('Password reset failed:', error);
      const authError = error as AuthError;
      setError(authError.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (isSessionValid === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-zarfuel-gold mb-4" />
          <p className="text-muted-foreground">Verifying your password reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <img 
              src="/zarfuel-logo.png" 
              alt="Zarfuel Logo" 
              className="h-20 w-auto" 
              style={{ maxWidth: 180 }}
            />
          </div>
          
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
              <CardDescription>
                Create a new password for your account
              </CardDescription>
            </CardHeader>
            
            {isSuccess ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Password Reset Complete</h2>
                <p className="text-muted-foreground mb-6">
                  Your password has been reset successfully
                </p>
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-zarfuel-gold hover:bg-zarfuel-gold/90 text-gray-900"
                >
                  Login with new password
                </Button>
              </div>
            ) : !isSessionValid ? (
              <div className="flex flex-col items-center py-8 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Invalid Reset Link</h2>
                <p className="text-muted-foreground mb-6">
                  {error || 'This password reset link is invalid or has expired.'}
                </p>
                <Button 
                  onClick={() => navigate('/forgot-password')}
                  className="bg-zarfuel-gold hover:bg-zarfuel-gold/90 text-gray-900"
                >
                  Request a new link
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardContent className="p-0 space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-b border-gray-300 shadow-none rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="border-b border-gray-300 shadow-none rounded-none"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col p-0 pt-6 space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-zarfuel-gold hover:bg-zarfuel-gold/90 text-gray-900"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Resetting Password...
                      </span>
                    ) : 'Reset Password'}
                  </Button>
                </CardFooter>
              </form>
            )}
          </Card>
        </div>
      </div>
      
      {/* Right side - Background Image */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center" 
        style={{ 
          backgroundImage: "url('/login-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
    </div>
  );
};

export default ResetPassword; 