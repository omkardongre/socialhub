/**
 * Interface representing the JWT payload structure
 * This should match the payload structure used when signing the JWT token
 */
export interface JwtPayload {
  sub: string;
  email: string;
}
