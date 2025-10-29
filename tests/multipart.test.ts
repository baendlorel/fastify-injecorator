import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';

import { Controller, Post, File, Files, Module } from '@/index.js';
import { apply } from '@/register/index.js';
import lazyInjector from '@/register/lazy-injector.js';
import type { MultipartFile } from '@/types/multipart.js';
import { PipeFile } from '@/multipart/pipes/file.pipe.js';

describe('Multipart File Upload', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify({ logger: false });
    await app.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10,
      },
    });
  });

  afterEach(async () => {
    await app.close();
    lazyInjector.clear();
  });

  it('should upload single file with @File decorator', async () => {
    @Controller('upload')
    class SingleFileController {
      @Post('single')
      @File()
      async uploadSingle(file: MultipartFile) {
        const buffer = await file.toBuffer();
        return {
          filename: file.filename,
          mimetype: file.mimetype,
          size: buffer.length,
          content: buffer.toString(),
        };
      }
    }

    @Module({
      controllers: [SingleFileController],
      providers: [PipeFile],
    })
    class AppModule {}

    await apply(app, { rootModule: AppModule });

    // Create form data with file
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const fileContent = 'Hello, World!';
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="test.txt"',
      'Content-Type: text/plain',
      '',
      fileContent,
      `--${boundary}--`,
    ].join('\r\n');

    const response = await app.inject({
      method: 'POST',
      url: '/upload/single/',
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
      payload: body,
    });

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.payload);
    expect(result.filename).toBe('test.txt');
    expect(result.mimetype).toBe('text/plain');
    expect(result.size).toBe(fileContent.length);
    expect(result.content).toBe(fileContent);
  });

  it('should upload multiple files with @Files decorator', async () => {
    @Controller('upload')
    class MultiFileController {
      @Post('multiple')
      @Files()
      async uploadMultiple(files: MultipartFile[]) {
        const results = await Promise.all(
          files.map(async (file) => ({
            filename: file.filename,
            mimetype: file.mimetype,
            size: (await file.toBuffer()).length,
          }))
        );
        return {
          count: files.length,
          files: results,
        };
      }
    }

    @Module({
      controllers: [MultiFileController],
      providers: [PipeFile],
    })
    class AppModule {}

    await apply(app, { rootModule: AppModule });

    // Create form data with multiple files
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const file1Content = 'First file content';
    const file2Content = 'Second file content';
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="files"; filename="file1.txt"',
      'Content-Type: text/plain',
      '',
      file1Content,
      `--${boundary}`,
      'Content-Disposition: form-data; name="files"; filename="file2.txt"',
      'Content-Type: text/plain',
      '',
      file2Content,
      `--${boundary}--`,
    ].join('\r\n');

    const response = await app.inject({
      method: 'POST',
      url: '/upload/multiple/',
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
      payload: body,
    });

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.payload);
    expect(result.count).toBe(2);
    expect(result.files).toHaveLength(2);
    expect(result.files[0].filename).toBe('file1.txt');
    expect(result.files[0].size).toBe(file1Content.length);
    expect(result.files[1].filename).toBe('file2.txt');
    expect(result.files[1].size).toBe(file2Content.length);
  }, 10000);
});
