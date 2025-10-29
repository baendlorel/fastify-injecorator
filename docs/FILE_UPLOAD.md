# File Upload Support

This framework provides built-in support for file uploads using `@fastify/multipart`.

## Installation

File upload support requires `@fastify/multipart` as a peer dependency:

```bash
pnpm add @fastify/multipart
# or
npm install @fastify/multipart
# or
yarn add @fastify/multipart
```

## Setup

Register the multipart plugin in your Fastify app before using file upload decorators:

```typescript
import Fastify from 'fastify';
import multipart from '@fastify/multipart';

const app = Fastify();

// Register multipart plugin
await app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB default
    files: 10, // Max 10 files
  },
});
```

## Usage

### Single File Upload

Use the `@File()` decorator to handle single file uploads:

```typescript
import { Controller, Post, File } from 'fastify-injecorator';
import type { MultipartFile } from 'fastify-injecorator';

@Controller('/upload')
export class UploadController {
  @Post('/avatar')
  @File('avatar', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  })
  async uploadAvatar(file: MultipartFile) {
    // Convert file stream to buffer
    const buffer = await file.toBuffer();

    return {
      filename: file.filename,
      mimetype: file.mimetype,
      size: buffer.length,
    };
  }

  // Without field name specification
  @Post('/document')
  @File()
  async uploadDocument(file: MultipartFile) {
    // Process any single file upload
    return {
      filename: file.filename,
      encoding: file.encoding,
    };
  }
}
```

### Multiple Files Upload

Use the `@Files()` decorator to handle multiple file uploads:

```typescript
import { Controller, Post, Files } from 'fastify-injecorator';
import type { MultipartFile } from 'fastify-injecorator';

@Controller('/upload')
export class UploadController {
  @Post('/gallery')
  @Files('images', {
    limits: {
      files: 10, // Max 10 files
      fileSize: 10 * 1024 * 1024, // 10MB per file
    },
  })
  async uploadGallery(files: MultipartFile[]) {
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

  // Accept all files
  @Post('/batch')
  @Files()
  async uploadBatch(files: MultipartFile[]) {
    return {
      count: files.length,
      files: files.map((f) => f.filename),
    };
  }
}
```

## API Reference

### `@File(fieldName?, options?)`

Decorator for handling single file upload.

**Parameters:**

- `fieldName?: string` - Optional field name to match. If not specified, accepts any file field.
- `options?: FileUploadOptions` - Upload configuration options.

**Options:**

```typescript
interface FileUploadOptions {
  fieldName?: string;
  limits?: {
    fileSize?: number; // Max file size in bytes
    files?: number; // Max number of files
    fields?: number; // Max number of fields
  };
}
```

### `@Files(fieldName?, options?)`

Decorator for handling multiple file uploads.

**Parameters:**

- `fieldName?: string` - Optional field name to match. If not specified, accepts all file fields.
- `options?: FileUploadOptions` - Upload configuration options (same as `@File()`).

### `MultipartFile` Interface

```typescript
interface MultipartFile {
  fieldname: string; // Form field name
  filename: string; // Original filename
  encoding: string; // File encoding
  mimetype: string; // MIME type
  file: Readable; // File stream
  toBuffer(): Promise<Buffer>; // Convert to buffer
}
```

## Examples

### With Custom Pipe

You can combine file upload with custom validation pipes:

```typescript
import { Controller, Post, File, UsePipes } from 'fastify-injecorator';
import type { MultipartFile } from 'fastify-injecorator';

@Controller('/upload')
export class UploadController {
  @Post('/image')
  @File()
  async uploadImage(file: MultipartFile) {
    // Validate MIME type
    if (!file.mimetype.startsWith('image/')) {
      throw new Error('Only images are allowed');
    }

    const buffer = await file.toBuffer();

    // Process image...

    return { success: true };
  }
}
```

### Saving Files

```typescript
import { promises as fs } from 'fs';
import { join } from 'path';

@Controller('/upload')
export class UploadController {
  @Post('/save')
  @File()
  async saveFile(file: MultipartFile) {
    const uploadDir = './uploads';
    const filepath = join(uploadDir, file.filename);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Write buffer to file
    const buffer = await file.toBuffer();
    await fs.writeFile(filepath, buffer);

    return {
      filename: file.filename,
      path: filepath,
    };
  }
}
```

## Notes

- File uploads require the `@fastify/multipart` plugin to be registered
- The plugin must be registered **before** registering your application modules
- File streams are consumed when calling `toBuffer()`, so cache the result if needed multiple times
- Set appropriate file size limits to prevent abuse
- Consider using streaming for large files instead of loading into buffer
