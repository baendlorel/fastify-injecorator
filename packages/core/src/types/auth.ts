/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * JWT payload type - can be extended by user
 */
export interface JwtPayload {
  [key: string]: any;
}

/**
 * JWT options for signing tokens
 */
export interface JwtSignOptions {
  /**
   * Token expiration time
   * - e.g., '1h', '7d', '30m', etc.
   */
  expiresIn?: string | number;

  /**
   * Token audience
   */
  audience?: string | string[];

  /**
   * Token issuer
   */
  issuer?: string;

  /**
   * JWT ID
   */
  jwtid?: string;

  /**
   * Token subject
   */
  subject?: string;

  /**
   * Not before (seconds or timestamp)
   */
  notBefore?: string | number;

  /**
   * Algorithm to use for signing
   */
  algorithm?: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';
}

/**
 * JWT verification options
 */
export interface JwtVerifyOptions {
  /**
   * If you want to check audience, provide value here
   */
  audience?: string | string[];

  /**
   * If you want to check issuer, provide value here
   */
  issuer?: string | string[];

  /**
   * If true, do not validate expiration
   */
  ignoreExpiration?: boolean;

  /**
   * Clock tolerance in seconds
   */
  clockTolerance?: number;
}

/**
 * JWT module configuration options
 */
export interface JwtModuleOptions {
  /**
   * Secret key for signing tokens
   */
  secret: string;

  /**
   * Default sign options
   */
  signOptions?: JwtSignOptions;

  /**
   * Default verify options
   */
  verifyOptions?: JwtVerifyOptions;
}
