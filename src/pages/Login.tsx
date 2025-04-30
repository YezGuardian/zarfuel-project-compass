
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewAdmin, setIsNewAdmin] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Pre-fill email for admin
    const urlParams = new URLSearchParams(window.location.search);
    const adminSetup = urlParams.get('admin_setup');
    
    if (adminSetup === 'true') {
      setEmail('Yezreel@whitepaperconcepts.co.za');
      setIsNewAdmin(true);
    }
    
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate passwords
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // Check if user exists
      const { data: { user: existingUser }, error: userError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (userError && !existingUser) {
        // Create admin user if they don't exist
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: newPassword,
        });
        
        if (signUpError) {
          throw signUpError;
        }
        
        // Set admin role
        if (signUpData.user) {
          const { error: roleError } = await supabase
            .from('profiles')
            .update({ role: 'admin', first_name: 'Yezreel', last_name: 'Shirinda' })
            .eq('id', signUpData.user.id);
            
          if (roleError) {
            throw roleError;
          }
        }
        
        toast.success('Admin account created successfully');
      } else {
        // Update password for existing user
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        
        if (resetError) {
          throw resetError;
        }
        
        toast.success('Password reset email sent');
      }
      
      // Switch back to regular login
      setIsNewAdmin(false);
      
    } catch (error: any) {
      console.error('Admin setup failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zarfuel-blue mb-1">ZARFUEL</h1>
          <p className="text-zarfuel-charcoal">Committee Dashboard</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{isNewAdmin ? 'Admin Account Setup' : 'Login'}</CardTitle>
            <CardDescription>
              {isNewAdmin 
                ? 'Set up your admin account password'
                : 'Access the ZARFUEL committee dashboard'}
            </CardDescription>
          </CardHeader>
          
          {isNewAdmin ? (
            <form onSubmit={handleAdminSetup}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button 
                  type="submit" 
                  className="w-full bg-zarfuel-blue hover:bg-zarfuel-blue/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      Setting Up...
                    </span>
                  ) : 'Set Up Admin Account'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsNewAdmin(false)}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button 
                  type="submit" 
                  className="w-full bg-zarfuel-blue hover:bg-zarfuel-blue/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      Signing In...
                    </span>
                  ) : 'Sign In'}
                </Button>
                
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={() => {
                    setEmail('Yezreel@whitepaperconcepts.co.za');
                    setIsNewAdmin(true);
                  }}
                >
                  Set up admin account
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;
