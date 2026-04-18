export interface AuthFormData {
  email: string;
  password: string;
  /** Collected at sign-up only; stored in Supabase `user_metadata`. */
  full_name?: string;
  phone?: string;
  rememberMe?: boolean;
}

export type UserType = 'customer' | 'photographer';