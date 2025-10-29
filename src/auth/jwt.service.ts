import { Injectable } from '@/decorators/injectable.js';
import { JwtPayload, JwtSignOptions, JwtVerifyOptions, JwtModuleOptions, InjecoratorJwtService } from '@/types/auth.js';

/**
 * Simple JWT Service implementation
 * - Uses built-in crypto for signing and verification
 * - Supports HS256 algorithm by default
 */
@Injectable()
export class JwtService implements InjecoratorJwtService {
  private secret: string;
  private defaultSignOptions?: JwtSignOptions;
  private defaultVerifyOptions?: JwtVerifyOptions;

  constructor(options?: JwtModuleOptions) {
    this.secret = options?.secret || '';
    this.defaultSignOptions = options?.signOptions;
    this.defaultVerifyOptions = options?.verifyOptions;
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
   * Create HMAC signature
   */
  private async createSignature(data: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
      'sign',
    ]);

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return this.base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
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
        // Parse time string like '1h', '7d', etc.
        const seconds = this.parseTimeToSeconds(mergedOptions.expiresIn);
        jwtPayload.exp = now + seconds;
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
        const seconds = this.parseTimeToSeconds(mergedOptions.notBefore);
        jwtPayload.nbf = now + seconds;
      }
    }

    // Encode header and payload
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(jwtPayload));

    // Create signature
    const signature = await this.createSignature(`${encodedHeader}.${encodedPayload}`, this.secret);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verify and decode a JWT token
   */
  async verify<T = JwtPayload>(token: string, options?: JwtVerifyOptions): Promise<T> {
    const mergedOptions = { ...this.defaultVerifyOptions, ...options };

    // Split token
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const expectedSignature = await this.createSignature(`${encodedHeader}.${encodedPayload}`, this.secret);

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

  /**
   * Parse time string to seconds
   * - Supports: s, m, h, d (seconds, minutes, hours, days)
   */
  private parseTimeToSeconds(time: string): number {
    const match = time.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid time format: ${time}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        throw new Error(`Invalid time unit: ${unit}`);
    }
  }
}
