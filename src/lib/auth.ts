import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email('Invalid email format');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'employee', 'parent']),
});

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;

class AuthService {
  private static instance: AuthService;
  private readonly DEV_USER_ID = '00000000-0000-0000-0000-000000000000'; // Valid UUID for dev mode

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async getCurrentSession(): Promise<{ user: any }> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return {
          user: {
            id: this.DEV_USER_ID,
            email: 'admin@example.com',
            role: 'admin'
          }
        };
      }

      // TODO: Implement session retrieval with your new auth system
      const response = await fetch('/api/auth/session');
      if (!response.ok) throw new Error('Failed to get session');
      return response.json();
    } catch (error) {
      console.error('Error getting session:', error);
      return { user: null };
    }
  }

  public async getCurrentUser(): Promise<any> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return {
          id: this.DEV_USER_ID,
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin' as const,
          status: 'active' as const,
          permissions: ['manage_clinical', 'manage_billing', 'manage_users', 'manage_settings', 'view_analytics'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      // TODO: Implement user retrieval with your new auth system
      const response = await fetch('/api/auth/user');
      if (!response.ok) throw new Error('Failed to get user');
      const user = await response.json();
      
      if (!user) return null;
      
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  public async signIn({ email, password }: SignInData): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return;
      }

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) throw new Error('Authentication failed');

      const { error } = await response.json();
      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  public async signOut(): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return;
      }

      //const { error } = await supabase.auth.signOut();
      //if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance();