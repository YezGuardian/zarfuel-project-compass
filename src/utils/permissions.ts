/**
 * Permission utilities for role-based access control
 */

export type UserRole = 'viewer' | 'special' | 'admin' | 'superadmin';

// Define pages and which roles can view or edit them
export const PAGE_PERMISSIONS = {
  // All users can view the dashboard
  dashboard: {
    view: ['viewer', 'special', 'admin', 'superadmin'],
    edit: ['admin', 'superadmin']
  },
  // Overview is view-only
  overview: {
    view: ['viewer', 'special', 'admin', 'superadmin'],
    edit: []
  },
  // Phases & Tasks
  tasks: {
    view: ['viewer', 'special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Calendar
  calendar: {
    view: ['viewer', 'special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Meetings
  meetings: {
    view: ['viewer', 'special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Budget
  budget: {
    view: ['viewer', 'special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Risk Management
  risks: {
    view: ['viewer', 'special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Document Repository
  documents: {
    view: ['special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Contact Directory
  contacts: {
    view: ['special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // Forum
  forum: {
    view: ['special', 'admin', 'superadmin'],
    edit: ['special', 'admin', 'superadmin']
  },
  // User Profile
  profile: {
    view: ['viewer', 'special', 'admin', 'superadmin'],
    edit: ['viewer', 'special', 'admin', 'superadmin']
  },
  // User Management (Admin Only)
  users: {
    view: ['admin', 'superadmin'],
    edit: ['admin', 'superadmin']
  }
};

/**
 * Check if a user with a given role can view a specific page
 */
export const canViewPage = (role: UserRole | null | undefined, page: keyof typeof PAGE_PERMISSIONS): boolean => {
  if (!role) return false;
  // SuperAdmin can view all pages
  if (role === 'superadmin') return true;
  return PAGE_PERMISSIONS[page]?.view?.includes(role) || false;
};

/**
 * Check if a user with a given role can edit a specific page
 */
export const canEditPage = (role: UserRole | null | undefined, page: keyof typeof PAGE_PERMISSIONS): boolean => {
  if (!role) return false;
  // SuperAdmin can edit all pages
  if (role === 'superadmin') return true;
  return PAGE_PERMISSIONS[page]?.edit?.includes(role) || false;
};

/**
 * Get all pages a user with a given role can view
 */
export const getViewablePages = (role: UserRole | null | undefined): (keyof typeof PAGE_PERMISSIONS)[] => {
  if (!role) return [];
  // SuperAdmin can view all pages
  if (role === 'superadmin') return Object.keys(PAGE_PERMISSIONS) as (keyof typeof PAGE_PERMISSIONS)[];
  return Object.entries(PAGE_PERMISSIONS)
    .filter(([_, permissions]) => permissions.view.includes(role))
    .map(([page]) => page as keyof typeof PAGE_PERMISSIONS);
};

/**
 * Get all pages a user with a given role can edit
 */
export const getEditablePages = (role: UserRole | null | undefined): (keyof typeof PAGE_PERMISSIONS)[] => {
  if (!role) return [];
  // SuperAdmin can edit all pages
  if (role === 'superadmin') return Object.keys(PAGE_PERMISSIONS) as (keyof typeof PAGE_PERMISSIONS)[];
  return Object.entries(PAGE_PERMISSIONS)
    .filter(([_, permissions]) => permissions.edit.includes(role))
    .map(([page]) => page as keyof typeof PAGE_PERMISSIONS);
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