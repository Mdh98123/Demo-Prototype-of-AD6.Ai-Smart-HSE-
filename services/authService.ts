
import { UserRole, SecureUser } from '../types';
import { SecureStorage } from './storageService';
import { MOCK_USERS } from '../contexts/UserContext'; 
import { auth, provider, signInWithPopup, signOut as firebaseSignOut } from '../lib/firebase';

export type AuthMode = 'demo' | 'firebase' | 'enterprise';

export const getAuthMode = (): AuthMode => {
  const envMode = (import.meta as any).env?.VITE_AUTH_MODE || (import.meta as any).env?.AUTH_MODE;
  if (envMode === 'firebase' || envMode === 'enterprise' || envMode === 'demo') {
    return envMode;
  }
  const stored = typeof window !== 'undefined' ? localStorage.getItem('ad6_auth_mode') : null;
  if (stored === 'firebase' || stored === 'enterprise' || stored === 'demo') {
    return stored as AuthMode;
  }
  return 'demo'; // Default mode enables rich demonstration workflows
};

export const setAuthModeSetting = (mode: AuthMode): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ad6_auth_mode', mode);
  }
};

export const isDemoModeFeatureEnabled = (): boolean => {
  const envFlag = (import.meta as any).env?.VITE_DEMO_MODE ?? (import.meta as any).env?.DEMO_MODE;
  if (envFlag === 'false' || envFlag === false) return false;
  return true;
};

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
  loginWithGoogle: async (): Promise<{ user: SecureUser; token: string; isDemo: boolean } | null> => {
    try {
        const res = await signInWithPopup(auth, provider);
        console.log('User signed in with Google:', res.user.uid);
        
        const name = res.user.displayName || "SSO User";
        const email = res.user.email || "no-email@sso.com";
        const id = res.user.uid;
        
        let targetMock = MOCK_USERS.find(u => 
            u.id === email.split('@')[0].toLowerCase() || u.name.toLowerCase() === name.toLowerCase()
        );

        let secureUser: SecureUser;
        if (targetMock) {
            secureUser = {
                id: res.user.uid,
                username: email,
                name: targetMock.name,
                role: targetMock.role,
                department: targetMock.department,
                permissions: [] 
            };
        } else {
            secureUser = {
                id: res.user.uid,
                username: email,
                name: name,
                role: 'Worker', 
                department: 'External Access',
                permissions: []
            };
        }

        const token = await res.user.getIdToken();
        
        await SecureStorage.setItem('hse_session_token', token);
        await SecureStorage.setItem('hse_current_user', secureUser);
        await SecureStorage.setItem('hse_is_demo_mode', true);

        return { user: secureUser, token, isDemo: true };
    } catch (err) {
        console.error('Auth error:', err);
        return null;
    }
  },

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
    
    // Normal login is non-demo session by default
    const isDemo = false;

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
    await SecureStorage.setItem('hse_is_demo_mode', false);

    return { user: secureUser, token, isDemo };
  },

  // Explicit demo session initializer: activates synthetic data mode with chosen or default persona
  loginDemo: async (demoUserId: string = 'admin'): Promise<{ user: SecureUser; token: string; isDemo: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Match exact user by ID or role key
    let userProfile = MOCK_USERS.find(u => u.id === demoUserId);
    if (!userProfile) {
      if (demoUserId === 'admin') {
        userProfile = MOCK_USERS.find(u => u.id === 'admin' || u.role === 'ADMIN');
      } else if (demoUserId === 'worker' || demoUserId === 'u6') {
        userProfile = MOCK_USERS.find(u => u.id === 'u6' || u.role === 'Worker');
      } else if (demoUserId === 'supervisor' || demoUserId === 'u7') {
        userProfile = MOCK_USERS.find(u => u.id === 'u7' || u.role === 'Site_Supervisor');
      }
    }

    // Default to admin demonstration if no specific user matched
    if (!userProfile) {
      userProfile = MOCK_USERS.find(u => u.id === 'admin') || MOCK_USERS[1] || MOCK_USERS[0];
    }

    const secureUser: SecureUser = {
      id: userProfile.id,
      username: (userProfile.email || userProfile.name || 'Demo User').toLowerCase().replace(/\s+/g, '.'),
      name: userProfile.name,
      role: userProfile.role,
      department: userProfile.department,
      permissions: []
    };

    const token = generateToken(secureUser, false);
    await SecureStorage.setItem('hse_session_token', token);
    await SecureStorage.setItem('hse_current_user', secureUser);
    await SecureStorage.setItem('hse_is_demo_mode', true);

    return { user: secureUser, token, isDemo: true };
  },

  register: async (email: string, name: string, department: string): Promise<{ user: SecureUser; token: string; isDemo: boolean } | null> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    const normalizedEmail = email.toLowerCase().trim();
    
    const secureUser: SecureUser = {
        id: `user_${Date.now()}`,
        username: normalizedEmail,
        name: name,
        role: 'Worker', // Default role for new signups
        department: department || 'General',
        permissions: []
    };

    const token = generateToken(secureUser, false);
    
    await SecureStorage.setItem('hse_session_token', token);
    await SecureStorage.setItem('hse_current_user', secureUser);
    await SecureStorage.setItem('hse_is_demo_mode', false);

    return { user: secureUser, token, isDemo: false };
  },

  logout: async () => {
    try {
      await firebaseSignOut(auth);
    } catch(e) {
      console.warn("Firebase signout failed", e);
    }
    await SecureStorage.removeItem('hse_session_token');
    await SecureStorage.removeItem('hse_current_user');
    await SecureStorage.removeItem('hse_is_demo_mode');
  },

  getCurrentUser: async (): Promise<SecureUser | null> => {
    return await SecureStorage.getItem<SecureUser>('hse_current_user');
  },

  isDemoSession: async (): Promise<boolean> => {
      // Returns true ONLY when explicitly set to true in storage (no automatic true fallback)
      const val = await SecureStorage.getItem<boolean>('hse_is_demo_mode');
      return val === true; 
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await SecureStorage.getItem<string>('hse_session_token');
    return !!token;
  }
};
