import { Parse } from './parse';
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
  private readonly DEV_USER_ID = '00000000-0000-0000-0000-000000000000';

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

      const currentUser = Parse.User.current();
      if (!currentUser) return { user: null };

      return { user: currentUser.toJSON() };
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

      const currentUser = Parse.User.current();
      if (!currentUser) return null;

      const query = new Parse.Query('_User');
      const user = await query.get(currentUser.id);
      return user.toJSON();
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

      await Parse.User.logIn(email, password);
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

      await Parse.User.logOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  public async signUp(data: SignUpData): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return;
      }

      const user = new Parse.User();
      user.set({
        username: data.email,
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        status: 'active'
      });

      await user.signUp();
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance();