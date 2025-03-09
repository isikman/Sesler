export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}