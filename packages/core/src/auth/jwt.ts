import { createHmac } from 'node:crypto';
import type { FastifyRequest as NestifyRequest } from 'fastify';
import { _set, sym, _get, _isObject, _isArray } from '@nestify-js/shared';

import { JwtPayload, JwtSignOptions, JwtVerifyOptions, JwtModuleOptions } from '@core/types/auth.js';

/**
 * Simple JWT Service implementation
 * - Uses Node.js built-in crypto for signing and verification
 * - Supports HS256 algorithm by default
 */
export class JwtService {
  // # actually static but not static methods
  /**
   * Set user info into request object.
   */
  static setUserToRequest(request: NestifyRequest, user: any): boolean {
    return _set(request, sym.user, user);
  }

  static getUserFromRequest<T = any>(request: NestifyRequest): T {
    return _get(request, sym.user) as T;
  }

  // # privates
  private secret: string;
  private defaultSignOptions: Required<JwtSignOptions>;
  private defaultVerifyOptions: Required<JwtVerifyOptions>;

  constructor(options?: JwtModuleOptions) {
    this.secret = options?.secret || 'nestify-js-jwt-secret';
    this.defaultSignOptions = this.validateSignOptions(options?.signOptions ?? {});
    this.defaultVerifyOptions = this.validateVerifyOptions(options?.verifyOptions ?? {});
  }

  /**
   * Configure JWT service after initialization
   * - Allows setting/changing secret and default options
   */
  configure(options: JwtModuleOptions): void {
    this.secret = options.secret;
    this.defaultSignOptions = this.validateSignOptions(options.signOptions ?? {});
    this.defaultVerifyOptions = this.validateVerifyOptions(options.verifyOptions ?? {});
  }

  get expiresIn(): number {
    return this.defaultSignOptions.expiresIn;
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

  private validateSignOptions(options: JwtSignOptions): Required<JwtSignOptions> {
    if (!_isObject<JwtSignOptions>(options) || _isArray(options)) {
      throw new Error('signOptions must be an object');
    }

    const normalized: Required<JwtSignOptions> = {
      expiresIn: 3600, // default: 1 hour
      audience: undefined as unknown as string,
      issuer: '',
      jwtid: '',
      subject: '',
      notBefore: 0,
      algorithm: 'HS256',
    };

    if (options.expiresIn !== undefined) {
      if (typeof options.expiresIn !== 'number' || !Number.isFinite(options.expiresIn) || options.expiresIn <= 0) {
        throw new Error('expiresIn must be a positive finite number representing seconds');
      }
      normalized.expiresIn = options.expiresIn;
    }

    if (options.audience !== undefined) {
      const audiences = _isArray(options.audience) ? options.audience : [options.audience];
      if (audiences.some((aud) => typeof aud !== 'string' || aud.length === 0)) {
        throw new Error('audience must be a non-empty string or an array of non-empty strings');
      }
      normalized.audience = options.audience as string;
    }

    if (options.issuer !== undefined) {
      if (typeof options.issuer !== 'string' || options.issuer.length === 0) {
        throw new Error('issuer must be a non-empty string');
      }
      normalized.issuer = options.issuer;
    }

    if (options.jwtid !== undefined) {
      if (typeof options.jwtid !== 'string' || options.jwtid.length === 0) {
        throw new Error('jwtid must be a non-empty string');
      }
      normalized.jwtid = options.jwtid;
    }

    if (options.subject !== undefined) {
      if (typeof options.subject !== 'string' || options.subject.length === 0) {
        throw new Error('subject must be a non-empty string');
      }
      normalized.subject = options.subject;
    }

    if (options.notBefore !== undefined) {
      const notBefore = typeof options.notBefore === 'string' ? Number(options.notBefore) : options.notBefore;
      if (typeof notBefore !== 'number' || !Number.isFinite(notBefore) || notBefore < 0) {
        throw new Error('notBefore must be a non-negative number of seconds (or a numeric string)');
      }
      normalized.notBefore = notBefore;
    }

    const supportedAlgorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'] as const;
    if (options.algorithm !== undefined) {
      if (!supportedAlgorithms.includes(options.algorithm)) {
        throw new Error(`algorithm must be one of: ${supportedAlgorithms.join(', ')}`);
      }
      normalized.algorithm = options.algorithm;
    }

    return normalized;
  }

  private validateVerifyOptions(options: JwtVerifyOptions): Required<JwtVerifyOptions> {
    if (!_isObject<JwtVerifyOptions>(options) || _isArray(options)) {
      throw new Error('verifyOptions must be an object');
    }

    const normalized: Required<JwtVerifyOptions> = {
      audience: undefined as unknown as string,
      issuer: undefined as unknown as string,
      ignoreExpiration: false,
      clockTolerance: 0,
    };

    if (options.audience !== undefined) {
      const audiences = _isArray(options.audience) ? options.audience : [options.audience];
      if (audiences.some((aud) => typeof aud !== 'string' || aud.length === 0)) {
        throw new Error('audience must be a non-empty string or an array of non-empty strings');
      }
      normalized.audience = options.audience as string;
    }

    if (options.issuer !== undefined) {
      const issuers = _isArray(options.issuer) ? options.issuer : [options.issuer];
      if (issuers.some((iss) => typeof iss !== 'string' || iss.length === 0)) {
        throw new Error('issuer must be a non-empty string or an array of non-empty strings');
      }
      normalized.issuer = options.issuer as string;
    }

    if (options.ignoreExpiration !== undefined) {
      if (typeof options.ignoreExpiration !== 'boolean') {
        throw new Error('ignoreExpiration must be a boolean');
      }
      normalized.ignoreExpiration = options.ignoreExpiration;
    }

    if (options.clockTolerance !== undefined) {
      if (
        typeof options.clockTolerance !== 'number' ||
        !Number.isFinite(options.clockTolerance) ||
        options.clockTolerance < 0
      ) {
        throw new Error('clockTolerance must be a non-negative finite number representing seconds');
      }
      normalized.clockTolerance = options.clockTolerance;
    }

    return normalized;
  }

  /**
   * Sign a payload and return JWT token
   */
  sign(payload: JwtPayload, options?: JwtSignOptions): string {
    const mergedOptions = this.validateSignOptions({ ...this.defaultSignOptions, ...options });

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
      jwtPayload.exp = now + mergedOptions.expiresIn;
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
    const mergedOptions = this.validateVerifyOptions({ ...this.defaultVerifyOptions, ...options });

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
      const audiences = _isArray(mergedOptions.audience) ? mergedOptions.audience : [mergedOptions.audience];
      const tokenAudiences = _isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];

      if (!audiences.some((aud) => tokenAudiences.includes(aud))) {
        throw new Error('Token audience mismatch');
      }
    }

    // Check issuer
    if (mergedOptions.issuer) {
      const issuers = _isArray(mergedOptions.issuer) ? mergedOptions.issuer : [mergedOptions.issuer];

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

/**
 * This is a JwtService instance, you can use `jwt.configure` to set options.
 */
export const jwt = new JwtService();
