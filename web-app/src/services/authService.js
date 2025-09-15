import ApiService from './api.js';

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'ayur_ahaar_token';
    this.USER_KEY = 'ayur_ahaar_user';
  }

  // Token management
  setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // User management
  setUser(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  removeUser() {
    localStorage.removeItem(this.USER_KEY);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Get user role
  getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }

  // Login based on detected user type
  async login(credentials) {
    try {
      let response;
      
      // Use universal login to let backend determine the role
      try {
        response = await ApiService.loginUniversal({
          email: credentials.email,
          password: credentials.password
        });
      } catch {
        // If universal login fails, try specific role-based logins as fallback
        try {
          response = await ApiService.loginDoctor({
            email: credentials.email,
            password: credentials.password
          });
        } catch {
          try {
            response = await ApiService.loginSuperAdmin({
              email: credentials.email,
              password: credentials.password
            });
          } catch {
            // If all fail, throw the original error
            throw new Error('Invalid email or password');
          }
        }
      }

      // Store token and user info
      this.setToken(response.token);
      this.setUser(response.user);

      return {
        success: true,
        user: response.user,
        token: response.token,
        redirectTo: response.redirectTo || this.getRedirectPath(response.user.role)
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  // Register new doctor
  async registerDoctor(doctorData) {
    try {
      // Validate required fields
      const requiredFields = ['name', 'email', 'password', 'phone', 'specialization', 'licenseNumber'];
      const missingFields = requiredFields.filter(field => !doctorData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(doctorData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password strength
      if (doctorData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Validate phone number (10 digits)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(doctorData.phone.replace(/\D/g, ''))) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      const response = await ApiService.registerDoctor({
        name: doctorData.name.trim(),
        email: doctorData.email.trim().toLowerCase(),
        phone: doctorData.phone.replace(/\D/g, ''),
        password: doctorData.password,
        specialization: doctorData.specialization,
        licenseNumber: doctorData.licenseNumber.trim(),
        experience: parseInt(doctorData.experience),
        location: doctorData.location.trim(),
        consultationFee: doctorData.consultationFee ? parseFloat(doctorData.consultationFee) : undefined
      });

      // Store token and user info
      this.setToken(response.token);
      this.setUser(response.user);

      return {
        success: true,
        user: response.user,
        token: response.token,
        redirectTo: this.getRedirectPath(response.user.role),
        message: 'Registration successful! Welcome to AyurAhaar.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Get redirect path based on user role
  getRedirectPath(role) {
    switch (role) {
      case 'doctor':
        return '/app/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'super-admin':
        return '/super-admin/dashboard';
      default:
        return '/app/dashboard';
    }
  }

  // Logout
  async logout() {
    try {
      // Call logout API if needed
      // await ApiService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage
      this.removeToken();
      this.removeUser();
    }
  }

  // Check if user has specific role
  hasRole(requiredRole) {
    const userRole = this.getUserRole();
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    return userRole === requiredRole;
  }

  // Check if user is admin (admin or super-admin)
  isAdmin() {
    return this.hasRole(['admin', 'super-admin']);
  }

  // Check if user is doctor
  isDoctor() {
    return this.hasRole('doctor');
  }
}

export default new AuthService();