export type UserRole = 'Viewer' | 'Creator' | 'Admin';

export interface User {
  userId: string; // UUID
  name: string;
  email: string;
  role: UserRole;
  shard?: string; // e.g., 'EU-East-01' for UI display
}

export interface JwtPayload {
  sub: string; // UserID
  email: string;
  name: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  user: User;
}