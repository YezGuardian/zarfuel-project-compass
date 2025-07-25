import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  organization?: string;
  position?: string;
  default_password?: string;
}

const Register: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extract invitation token from URL
  useEffect(() => {
    const fetchInvitationDetails = async () => {
      setIsVerifying(true);
      try {
        // Parse URL parameters
        const params = new URLSearchParams(location.search);
        const invitationId = params.get('invitation_id');
        
        // If there's no invitation ID, show an error
        if (!invitationId) {
          setError('Invalid invitation link. Please contact your administrator.');
          setIsVerifying(false);
          return;
        }

        // Get email from URL if available (Supabase sends it)
        const email = params.get('email');
        
        // Fetch invitation details from database
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations')
          .select('*')
          .eq('id', invitationId)
          .single();

        if (invitationError || !invitation) {
          console.error('Error fetching invitation:', invitationError);
          setError('Invalid or expired invitation. Please contact your administrator.');
          setIsVerifying(false);
          return;
        }

        // Check if the invitation has expired
        if (new Date(invitation.expires_at) < new Date()) {
          setError('This invitation has expired. Please contact your administrator for a new one.');
          setIsVerifying(false);
          return;
        }
        
        setInvitationDetails({
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          organization: invitation.organization,
          position: invitation.position,
          // Note: default_password would come from invitation if needed
        });
        
      } catch (err) {
        console.error('Error verifying invitation:', err);
        setError('Failed to verify invitation. Please contact your administrator.');
      }
      setIsVerifying(false);
    };

    fetchInvitationDetails();
  }, [location.search]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form
      if (!invitationDetails?.email) {
        throw new Error('Email is missing from invitation');
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      // Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: invitationDetails.email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            invitation_id: invitationDetails.id
          }
        }
      });
      
      if (signUpError) {
        throw signUpError;
      }

      if (data?.user) {
        // Update profile with additional information
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
          })
          .eq('id', data.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

        // Delete the invitation since it's been used
        await supabase
          .from('invitations')
          .delete()
          .eq('id', invitationDetails.id);

        toast.success('Registration successful! You can now log in.');
        navigate('/login');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="w-full max-w-md p-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-zarfuel-blue" />
          <p className="text-lg">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="w-full max-w-md p-4">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/login')} className="w-full">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zarfuel-blue mb-1">Committee Dashboard</h1>
        </div>
        
        {invitationDetails?.default_password ? (
          <Card>
            <CardHeader>
              <CardTitle>Default Password Provided</CardTitle>
              <CardDescription>
                A default password has been set for your account. You can log in directly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <div className="flex flex-col space-y-2">
                  <p>Your administrator has already created an account for you with a default password.</p>
                  <p>Please check your email for login instructions or contact your administrator.</p>
                </div>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full"
              >
                Go to Login
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Complete Registration</CardTitle>
              <CardDescription>
                You've been invited to join the Committee Dashboard
                {invitationDetails?.organization ? ` for ${invitationDetails.organization}` : ''}
                {invitationDetails?.role ? ` as a ${invitationDetails.role}` : ''}.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={invitationDetails?.email || ''}
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Registering...
                    </span>
                  ) : 'Complete Registration'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Register;
