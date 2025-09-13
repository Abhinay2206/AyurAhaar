// Navigation utilities for role-based routing
export const getRedirectPath = (userRole) => {
  switch (userRole) {
    case 'doctor':
      return '/app/dashboard';
    case 'admin':
    case 'super-admin':
      return '/super-admin/dashboard';
    default:
      return '/login';
  }
};

// Navigation helper for programmatic routing
export const navigateToRole = (navigate, userRole) => {
  const path = getRedirectPath(userRole);
  navigate(path, { replace: true });
};

// Check if user should have access to a route based on role
export const canAccessRoute = (userRole, routePath) => {
  // Doctor routes
  if (routePath.startsWith('/app/')) {
    return userRole === 'doctor';
  }
  
  // Super admin routes
  if (routePath.startsWith('/super-admin/')) {
    return userRole === 'admin' || userRole === 'super-admin';
  }
  
  // Public routes
  if (routePath === '/login' || routePath === '/super-admin/login') {
    return true;
  }
  
  return false;
};

export default {
  getRedirectPath,
  navigateToRole,
  canAccessRoute
};