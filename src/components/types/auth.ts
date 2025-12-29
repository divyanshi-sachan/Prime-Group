export interface AuthFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export type UserType = 'customer' | 'photographer';