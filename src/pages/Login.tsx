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
  const [isNewUser, setIsNewUser] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleNewUserSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      if (!firstName || !lastName) {
        throw new Error('First name and last name are required');
      }

      // First check if the email exists in auth.users (using signInWithPassword will fail if it doesn't)
      const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
        email,
        password: ''
      });

      // If login failed, check if the user exists in the invitations table
      if (userError) {
        // Check if this email was invited
        const { data: invitationData, error: invitationError } = await supabase
          .from('invitations')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();

        if (invitationError || !invitationData) {
          throw new Error('This email is not registered in our system. Please contact an administrator.');
        }
        
        // If the user has an invitation but no auth account yet, create one
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: newPassword,
          options: {
            data: {
              invitation_id: invitationData.id
            }
          }
        });
        
        if (signUpError) {
          throw signUpError;
        }
        
        if (!signUpData.user) {
          throw new Error('Failed to create user account');
        }
        
        // Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: signUpData.user.id,
            email: email.toLowerCase(),
            first_name: firstName,
            last_name: lastName,
            role: invitationData.role || 'viewer',
            organization: invitationData.organization,
            position: invitationData.position,
            invited_by: invitationData.invited_by
          });
          
        if (profileError) {
          throw profileError;
        }
        
        // Delete the invitation since it's been used
        await supabase
          .from('invitations')
          .delete()
          .eq('id', invitationData.id);
          
        toast.success('Profile completed successfully!');
        await login(email, newPassword);
        navigate('/dashboard');
      } else {
        // User exists in auth system, just update their password and profile
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (updateError) {
          throw updateError;
        }
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ first_name: firstName, last_name: lastName })
          .eq('email', email.toLowerCase());
          
        if (profileError) {
          throw profileError;
        }
        
        toast.success('Profile completed successfully!');
        await login(email, newPassword);
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Profile setup failed:', error);
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
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Login Form */}
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
          {isNewUser ? (
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                  Set up your profile and create a password
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleNewUserSetup}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Your first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Your last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
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
                    className="w-full bg-zarfuel-gold hover:bg-zarfuel-gold/90 text-gray-900"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Setting Up...
                      </span>
                    ) : 'Complete Profile'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsNewUser(false)}
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </CardFooter>
              </form>
            </Card>
          ) : (
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-2xl font-bold">Log in</CardTitle>
                <CardDescription>
                  Access the ZARFUEL committee dashboard
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="p-0 space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Username</Label>
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
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-b border-gray-300 shadow-none rounded-none"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col p-0 pt-6 space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-zarfuel-gold hover:bg-zarfuel-gold/90 text-gray-900 rounded-md"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Signing In...
                      </span>
                    ) : 'Log in'}
                  </Button>
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <span className="text-gray-500">Don't have an account?</span>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-blue-600"
                      onClick={() => setIsNewUser(true)}
                    >
                      New Profile Setup
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>
      </div>
      {/* Right side - Welcome banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-zarfuel-charcoal via-zarfuel-charcoal to-gray-800 justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-zarfuel-gold/10 via-transparent to-transparent"></div>
        <div className="relative z-10 text-center p-8 max-w-2xl mx-auto">
          <h2 className="text-5xl font-bold text-zarfuel-gold mb-8">Fueling Progress. Nourishing Communities.</h2>
          <p className="text-white/80 text-base px-8">
            Discover ZARFUEL, a next-generation truck stop by ZARSOM Group—designed to power South Africa's freight backbone and uplift local communities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
