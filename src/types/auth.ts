export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'employee' | 'parent';
  status: 'active' | 'inactive';
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends SignInCredentials {
  first_name: string;
  last_name: string;
  role: User['role'];
}