
import { UserRole, SecureUser } from '../types';
import { SecureStorage } from './storageService';
import { MOCK_USERS } from '../contexts/UserContext'; 

// Simulated JWT generation
const generateToken = (user: SecureUser, rememberMe: boolean) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  
  // 1 Year for Remember Me, otherwise 24 hours to prevent frequent auto-logout
  const duration = rememberMe ? 365 * 24 * 3600 * 1000 : 24 * 3600 * 1000; 
  
  const payload = btoa(JSON.stringify({ 
    sub: user.id, 
    role: user.role, 
    name: user.name, 
    iat: Date.now(),
    exp: Date.now() + duration
  }));
  return `${header}.${payload}.simulated_signature_hash`;
};

export const AuthService = {
  login: async (username: string, rememberMe: boolean = false): Promise<{ user: SecureUser; token: string; isDemo: boolean } | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Normalize input: lowercase, replace all spaces with dots
    const normalizedInput = username.toLowerCase().trim();

    // Find user in mock registry
    const userProfile = MOCK_USERS.find(u => 
      u.name.toLowerCase().replace(/\s+/g, '.') === normalizedInput ||
      u.id === normalizedInput
    );
    
    let secureUser: SecureUser;
    
    // ENABLE DEMO MODE FOR EVERYONE (including visitors)
    const isDemo = true;

    if (userProfile) {
        secureUser = {
            id: userProfile.id,
            username: normalizedInput,
            name: userProfile.name,
            role: userProfile.role,
            department: userProfile.department,
            permissions: [] 
        };
    } else {
        // Allow public access: Create a visitor/worker session for any valid email
        secureUser = {
            id: `visitor_${Date.now()}`,
            username: normalizedInput,
            name: username.split('@')[0] || 'Visitor',
            role: 'Worker', // Default role for external access
            department: 'External Access',
            permissions: []
        };
    }

    const token = generateToken(secureUser, rememberMe);
    
    // Store session securely
    await SecureStorage.setItem('hse_session_token', token);
    await SecureStorage.setItem('hse_current_user', secureUser);
    
    // Always enable demo features for this prototype
    await SecureStorage.setItem('hse_is_demo_mode', true);

    return { user: secureUser, token, isDemo };
  },

  logout: async () => {
    await SecureStorage.removeItem('hse_session_token');
    await SecureStorage.removeItem('hse_current_user');
    await SecureStorage.removeItem('hse_is_demo_mode');
  },

  getCurrentUser: async (): Promise<SecureUser | null> => {
    return await SecureStorage.getItem<SecureUser>('hse_current_user');
  },

  isDemoSession: async (): Promise<boolean> => {
      // Default to true if not set, or read from storage
      const val = await SecureStorage.getItem<boolean>('hse_is_demo_mode');
      return val === true || val === null; 
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await SecureStorage.getItem<string>('hse_session_token');
    return !!token;
  }
};
