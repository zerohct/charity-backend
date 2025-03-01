/* eslint-disable prettier/prettier */
// src/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  sub: string; // typically the user’s ID
  email: string; // the user’s email
  iat?: number; // issued at
  exp?: number; // expiration
}
