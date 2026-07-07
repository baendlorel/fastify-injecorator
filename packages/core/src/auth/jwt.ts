import { createHmac } from 'node:crypto';
import { FastifyRequest } from 'fastify';
import { _set, sym, _get } from '@nestify/shared';

import { JwtPayload, JwtSignOptions, JwtVerifyOptions, JwtModuleOptions } from '@core/types/auth.js';

/**
 * Simple JWT Service implementation
 * - Uses Node.js built-in crypto for signing and verification
 * - Supports HS256 algorithm by default
 */
export class JwtService {
  // # actually static but not static methods
  /**
   * Create a different jwt service instance with your own options
   * - but usually, using `this.configure` method is enough
   */
  create(options?: JwtModuleOptions) {
    return new JwtService(options);
  }

  setUserToRequest(request: FastifyRequest, user: any): boolean {
    return _set(request, sym.user, user);
  }

  getUserFromRequest(request: FastifyRequest): any {
    return _get(request, sym.user);
  }

  // # privates
  private secret: string;
  private defaultSignOptions?: JwtSignOptions;
  private defaultVerifyOptions?: JwtVerifyOptions;

  constructor(options?: JwtModuleOptions) {
    this.secret = options?.secret || '';
    this.defaultSignOptions = options?.signOptions;
    this.defaultVerifyOptions = options?.verifyOptions;
  }

  /**
   * Configure JWT service after initialization
   * - Allows setting/changing secret and default options
   */
  configure(options: JwtModuleOptions): void {
    this.secret = options.secret;
    this.defaultSignOptions = options.signOptions;
    this.defaultVerifyOptions = options.verifyOptions;
  }

  /**
   * Base64 URL encode
   */
  private base64UrlEncode(str: string): string {
    return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Base64 URL decode
   */
  private base64UrlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (str.length % 4) {
      str += '=';
    }
    return Buffer.from(str, 'base64').toString('utf-8');
  }

  /**
   * Create HMAC signature using Node.js crypto
   */
  private createSignature(data: string, secret: string): string {
    const hmac = createHmac('sha256', secret);
    hmac.update(data);
    return this.base64UrlEncode(hmac.digest().toString('binary'));
  }

  /**
   * Sign a payload and return JWT token
   */
  async sign(payload: JwtPayload, options?: JwtSignOptions): Promise<string> {
    const mergedOptions = { ...this.defaultSignOptions, ...options };

    // Create header
    const header = {
      alg: mergedOptions.algorithm || 'HS256',
      typ: 'JWT',
    };

    // Create payload with standard claims
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload: JwtPayload = {
      ...payload,
      iat: now, // issued at
    };

    // Add optional claims
    if (mergedOptions.expiresIn) {
      if (typeof mergedOptions.expiresIn === 'number') {
        jwtPayload.exp = now + mergedOptions.expiresIn;
      } else {
        jwtPayload.exp = now + Number(mergedOptions.expiresIn);
      }
    }

    if (mergedOptions.audience) {
      jwtPayload.aud = mergedOptions.audience;
    }

    if (mergedOptions.issuer) {
      jwtPayload.iss = mergedOptions.issuer;
    }

    if (mergedOptions.subject) {
      jwtPayload.sub = mergedOptions.subject;
    }

    if (mergedOptions.jwtid) {
      jwtPayload.jti = mergedOptions.jwtid;
    }

    if (mergedOptions.notBefore) {
      if (typeof mergedOptions.notBefore === 'number') {
        jwtPayload.nbf = now + mergedOptions.notBefore;
      } else {
        jwtPayload.nbf = now + Number(mergedOptions.notBefore);
      }
    }

    // Encode header and payload
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(jwtPayload));

    // Create signature
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`, this.secret);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verify and decode a JWT token
   */
  verify<T = JwtPayload>(token: string, options?: JwtVerifyOptions): T {
    const mergedOptions = { ...this.defaultVerifyOptions, ...options };

    // Split token
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const expectedSignature = this.createSignature(`${encodedHeader}.${encodedPayload}`, this.secret);

    if (signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }

    // Decode payload
    const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as JwtPayload;

    // Verify claims
    const now = Math.floor(Date.now() / 1000);

    // Check expiration
    if (!mergedOptions.ignoreExpiration && payload.exp) {
      const clockTolerance = mergedOptions.clockTolerance || 0;
      if (now > payload.exp + clockTolerance) {
        throw new Error('Token expired');
      }
    }

    // Check not before
    if (payload.nbf) {
      const clockTolerance = mergedOptions.clockTolerance || 0;
      if (now < payload.nbf - clockTolerance) {
        throw new Error('Token not yet valid');
      }
    }

    // Check audience
    if (mergedOptions.audience) {
      const audiences = Array.isArray(mergedOptions.audience) ? mergedOptions.audience : [mergedOptions.audience];
      const tokenAudiences = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];

      if (!audiences.some((aud) => tokenAudiences.includes(aud))) {
        throw new Error('Token audience mismatch');
      }
    }

    // Check issuer
    if (mergedOptions.issuer) {
      const issuers = Array.isArray(mergedOptions.issuer) ? mergedOptions.issuer : [mergedOptions.issuer];

      if (!issuers.includes(payload.iss)) {
        throw new Error('Token issuer mismatch');
      }
    }

    return payload as T;
  }

  /**
   * Decode a JWT token without verification
   */
  decode<T = JwtPayload>(token: string): T | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(this.base64UrlDecode(parts[1]));
      return payload as T;
    } catch {
      return null;
    }
  }
}
export const jwt = new JwtService();
