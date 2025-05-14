import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { 
  UserRole, 
  isAdmin as checkIsAdmin, 
  isSpecial as checkIsSpecial, 
  isSuperAdmin as checkIsSuperAdmin,
  canViewPage as checkCanViewPage,
  canEditPage as checkCanEditPage 
} from '@/utils/permissions';

// Types for our authentication context
type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  organization?: string;
  position?: string;
  phone?: string;
  invited_by?: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isSpecial: () => boolean;
  isSuperAdmin: () => boolean;
  canViewPage: (page: string) => boolean;
  canEditPage: (page: string) => boolean;
  refreshProfile: () => Promise<void>;
  needsPasswordChange: boolean;
  clearPasswordChangeRequirement: () => Promise<void>;
};

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [needsPasswordChange, setNeedsPasswordChange] = useState<boolean>(false);

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Refresh the user's profile
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            
            // Check if user needs to change password
            const needsChange = session.user.user_metadata?.needs_password_change === true;
            setNeedsPasswordChange(needsChange);
          }, 0);
        } else {
          setProfile(null);
          setNeedsPasswordChange(false);
        }

        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(profileData => {
          setProfile(profileData);
        });
        
        // Check if user needs to change password
        const needsChange = session.user.user_metadata?.needs_password_change === true;
        setNeedsPasswordChange(needsChange);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message || 'Login failed');
        throw error;
      }
      
      if (data.user) {
        const profileData = await fetchProfile(data.user.id);
        setProfile(profileData);
        
        // Check if user needs to change password
        const needsChange = data.user.user_metadata?.needs_password_change === true;
        setNeedsPasswordChange(needsChange);
        
        if (needsChange) {
          toast.info('Please change your password to continue');
        } else {
          toast.success(`Welcome back, ${profileData?.first_name || data.user.email}`);
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear the password change requirement
  const clearPasswordChangeRequirement = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { needs_password_change: false }
      });
      
      if (error) {
        console.error('Error updating user metadata:', error);
        return;
      }
      
      setNeedsPasswordChange(false);
    } catch (error) {
      console.error('Error clearing password change requirement:', error);
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setNeedsPasswordChange(false);
    toast.info('You have been logged out');
  };

  // Use the permission utilities
  const isAdmin = (): boolean => {
    return profile?.role === 'admin' || isSuperAdmin();
  };

  const isSpecial = (): boolean => {
    return profile?.role === 'special' || isAdmin();
  };

  // Super admin function (includes Yezreel Shirinda)
  const isSuperAdmin = (): boolean => {
    if (!profile) return false;
    
    return (
      profile.role === 'superadmin' ||
      profile.email?.toLowerCase() === 'yezreel@whitepaperconcepts.co.za' ||
      (profile.first_name === 'Yezreel' && profile.last_name === 'Shirinda')
    );
  };

  // Check if user can view a page
  const canViewPage = (page: string): boolean => {
    try {
      return checkCanViewPage(profile?.role, page as any);
    } catch (error) {
      console.error(`Error checking if user can view page ${page}:`, error);
      // Default to false for security
      return false;
    }
  };

  // Check if user can edit a page
  const canEditPage = (page: string): boolean => {
    try {
      return checkCanEditPage(profile?.role, page as any);
    } catch (error) {
      console.error(`Error checking if user can edit page ${page}:`, error);
      // Default to false for security
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      isLoading, 
      login, 
      logout, 
      isAdmin,
      isSpecial,
      isSuperAdmin,
      canViewPage,
      canEditPage,
      refreshProfile,
      needsPasswordChange,
      clearPasswordChangeRequirement
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
