import { User } from '@supabase/supabase-js';

// Admin email configuration
export const ADMIN_EMAIL = 'creationvision03@gmail.com';

/**
 * Check if the current user is an admin
 * @param user - The authenticated user object from Supabase
 * @returns boolean indicating if user is admin
 */
export const isAdmin = (user: User | null): boolean => {
  if (!user?.email) return false;
  return user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

/**
 * Check if user has access to premium features (MIA, DUFA)
 * Currently only admin has access, but this can be extended for other users
 * @param user - The authenticated user object from Supabase
 * @returns boolean indicating if user has premium access
 */
export const hasPremiumAccess = (user: User | null): boolean => {
  return isAdmin(user);
};

/**
 * Get user access level
 * @param user - The authenticated user object from Supabase
 * @returns 'admin' | 'premium' | 'basic'
 */
export const getUserAccessLevel = (user: User | null): 'admin' | 'premium' | 'basic' => {
  if (isAdmin(user)) return 'admin';
  if (hasPremiumAccess(user)) return 'premium';
  return 'basic';
};
