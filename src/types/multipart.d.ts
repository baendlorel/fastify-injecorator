import type { Readable } from 'stream';
import type { MultipartFile as FastifyMultipartFile } from '@fastify/multipart';

/**
 * Represents a file uploaded through multipart/form-data
 */
export interface MultipartFile {
  /** The file field name */
  fieldname: string;
  /** The original filename */
  filename: string;
  /** The file encoding */
  encoding: string;
  /** The file MIME type */
  mimetype: string;
  /** The file content as a readable stream */
  file: Readable;
  /** Convert the file to a buffer */
  toBuffer(): Promise<Buffer>;
}

/**
 * Options for file upload configuration
 */
export interface FileUploadOptions {
  /** Field name to extract file from */
  fieldName?: string;
  /** Maximum file size in bytes */
  limits?: {
    /** Maximum file size (default: 10MB) */
    fileSize?: number;
    /** Maximum number of files */
    files?: number;
    /** Maximum number of fields */
    fields?: number;
  };
}

/**
 * Internal metadata for file upload decorators
 */
export interface FileUploadMeta extends FileUploadOptions {
  /** Whether this expects multiple files */
  multiple: boolean;
}
