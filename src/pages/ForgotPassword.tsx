import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthError } from '@supabase/supabase-js';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the current origin for redirection
      const origin = window.location.origin;
      
      // For development environments, hardcode to localhost:8086 if needed
      // const redirectUrl = 'http://localhost:8086/reset-password';
      const redirectUrl = `${origin}/reset-password`;
      
      console.log('Sending password reset to:', email);
      console.log('Redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      console.error('Password reset request failed:', error);
      const authError = error as AuthError;
      setError(authError.message || 'Failed to send password reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
              <div className="flex items-center mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/login')} 
                  className="p-0 mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              </div>
              <CardDescription>
                Enter your email to receive a password reset link
              </CardDescription>
            </CardHeader>
            
            {isSuccess ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Check your inbox</h2>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to {email}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                >
                  Return to login
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                        Sending...
                      </span>
                    ) : 'Send Reset Link'}
                  </Button>
                  <div className="text-center">
                    <Link to="/login" className="text-sm text-blue-600 hover:underline">
                      Back to login
                    </Link>
                  </div>
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

export default ForgotPassword; 