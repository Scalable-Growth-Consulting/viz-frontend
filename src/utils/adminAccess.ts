import { User } from '@supabase/supabase-js';

// Admin email configuration
export const ADMIN_EMAIL = 'creatorvision03@gmail.com';
export const ALLOWED_DOMAIN = '@sgconsultingtech.com';

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
 * Check if user has premium access (admin or @sgconsultingtech.com domain)
 * @param user - The authenticated user object from Supabase
 * @returns boolean indicating if user has premium access
 */
export const hasPremiumAccess = (user: User | null): boolean => {
  if (!user?.email) return false;
  const email = user.email.toLowerCase();
  return (
    isAdmin(user) ||
    email.endsWith(ALLOWED_DOMAIN)
  );
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
