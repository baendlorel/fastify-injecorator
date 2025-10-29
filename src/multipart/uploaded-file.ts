import { Readable } from 'stream';
import type { MultipartFile as FastifyMultipartFile } from '@fastify/multipart';
import { MultipartFile } from '@/types/multipart.js';

/**
 * Wrapper class for uploaded files
 * Provides a clean interface for handling multipart files
 */
export class UploadedFile implements MultipartFile {
  fieldname: string;
  filename: string;
  encoding: string;
  mimetype: string;
  file: Readable;

  private _buffer?: Buffer;

  constructor(fastifyFile: FastifyMultipartFile) {
    this.fieldname = fastifyFile.fieldname;
    this.filename = fastifyFile.filename;
    this.encoding = fastifyFile.encoding;
    this.mimetype = fastifyFile.mimetype;
    this.file = fastifyFile.file;
  }

  /**
   * Convert the file stream to a buffer
   * The buffer is cached after first call
   */
  async toBuffer(): Promise<Buffer> {
    if (this._buffer) {
      return this._buffer;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of this.file) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    this._buffer = Buffer.concat(chunks);
    return this._buffer;
  }
}
