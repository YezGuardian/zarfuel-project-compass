/**
 * Permission utilities for role-based access control
 */

export type UserRole = 'viewer' | 'special' | 'admin' | 'superadmin';

// Define pages and which roles can view or edit them
export const PAGE_PERMISSIONS = {
  // All users can view the dashboard
  dashboard: {
    view: ['viewer', 'special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Overview is view-only for all users
  overview: {
    view: ['viewer', 'special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Phases & Tasks - not accessible to viewers
  tasks: {
    view: ['special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Calendar - all can view, special+ can edit
  calendar: {
    view: ['viewer', 'special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Meetings - not accessible to viewers
  meetings: {
    view: ['special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Budget - not accessible to viewers
  budget: {
    view: ['special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Risk Management - not accessible to viewers
  risks: {
    view: ['special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Document Repository - not accessible to viewers
  documents: {
    view: ['special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Contact Directory - not accessible to viewers
  contacts: {
    view: ['special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Forum - all can view
  forum: {
    view: ['viewer', 'special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // User Profile - own profile only
  profile: {
    view: ['viewer', 'special', 'admin', 'superadmin'],
    edit: ['viewer', 'special', 'admin', 'superadmin']
  },
  // User Management - admins only
  users: {
    view: ['admin', 'superadmin'],
    edit: ['admin', 'superadmin']
  },
  // Other users' profiles - superadmin only
  otherProfiles: {
    view: ['superadmin'],
    edit: ['superadmin']
  }
};

/**
 * Safe includes check that handles null/undefined arrays
 */
const safeIncludes = (array: any[] | null | undefined, item: any): boolean => {
  if (!array || !Array.isArray(array)) return false;
  return array.includes(item);
};

/**
 * Check if a user with a given role can view a specific page
 */
export const canViewPage = (role: UserRole | null | undefined, page: keyof typeof PAGE_PERMISSIONS): boolean => {
  try {
    if (!role) return false;
    // SuperAdmin can view all pages
    if (role === 'superadmin') return true;
    
    const permissions = PAGE_PERMISSIONS[page];
    if (!permissions) return false;
    
    return safeIncludes(permissions.view, role);
  } catch (error) {
    console.error('Error in canViewPage:', error);
    return false;
  }
};

/**
 * Check if a user with a given role can edit a specific page
 */
export const canEditPage = (role: UserRole | null | undefined, page: keyof typeof PAGE_PERMISSIONS): boolean => {
  try {
    if (!role) return false;
    // SuperAdmin can edit all pages
    if (role === 'superadmin') return true;
    
    const permissions = PAGE_PERMISSIONS[page];
    if (!permissions) return false;
    
    return safeIncludes(permissions.edit, role);
  } catch (error) {
    console.error('Error in canEditPage:', error);
    return false;
  }
};

/**
 * Get all pages a user with a given role can view
 */
export const getViewablePages = (role: UserRole | null | undefined): (keyof typeof PAGE_PERMISSIONS)[] => {
  try {
    if (!role) return [];
    // SuperAdmin can view all pages
    if (role === 'superadmin') return Object.keys(PAGE_PERMISSIONS) as (keyof typeof PAGE_PERMISSIONS)[];
    
    return Object.entries(PAGE_PERMISSIONS)
      .filter(([_, permissions]) => {
        return safeIncludes(permissions.view, role);
      })
      .map(([page]) => page as keyof typeof PAGE_PERMISSIONS);
  } catch (error) {
    console.error('Error in getViewablePages:', error);
    return [];
  }
};

/**
 * Get all pages a user with a given role can edit
 */
export const getEditablePages = (role: UserRole | null | undefined): (keyof typeof PAGE_PERMISSIONS)[] => {
  try {
    if (!role) return [];
    // SuperAdmin can edit all pages
    if (role === 'superadmin') return Object.keys(PAGE_PERMISSIONS) as (keyof typeof PAGE_PERMISSIONS)[];
    
    return Object.entries(PAGE_PERMISSIONS)
      .filter(([_, permissions]) => {
        return safeIncludes(permissions.edit, role);
      })
      .map(([page]) => page as keyof typeof PAGE_PERMISSIONS);
  } catch (error) {
    console.error('Error in getEditablePages:', error);
    return [];
  }
};

/**
 * Check if a user is a super admin
 */
export const isSuperAdmin = (role: UserRole | null | undefined): boolean => {
  return role === 'superadmin';
};

/**
 * Check if a user is an admin (includes super admin)
 */
export const isAdmin = (role: UserRole | null | undefined): boolean => {
  return role === 'admin' || role === 'superadmin';
};

/**
 * Check if a user is a special user (includes admins and super admins)
 */
export const isSpecial = (role: UserRole | null | undefined): boolean => {
  return role === 'special' || role === 'admin' || role === 'superadmin';
};

/**
 * Check if a user can edit other users' profiles
 */
export const canEditOtherProfiles = (role: UserRole | null | undefined): boolean => {
  return role === 'superadmin';
};

/**
 * Check if admin can only invite certain roles
 */
export const getAllowedRolesToInvite = (role: UserRole | null | undefined): UserRole[] => {
  if (role === 'superadmin') {
    return ['viewer', 'special', 'admin', 'superadmin'];
  } else if (role === 'admin') {
    return ['viewer', 'special'];
  }
  return [];
}; 