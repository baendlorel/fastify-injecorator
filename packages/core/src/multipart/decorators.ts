import { sym } from '@core/common/sym.js';
import { metaSet } from '@core/register/meta.js';
import { FileUploadOptions, FileUploadMeta } from '@core/types/multipart.js';
import { Func } from '@core/types/primitive.js';
import { UsePipes } from '@core/decorators/middlewares/pipe.js';
import { PipeFile } from './pipes/file.pipe.js';

/**
 * Decorator to handle single file upload
 * Transforms the handler to receive the uploaded file as first argument
 *
 * @param fieldName - The name of the form field (optional)
 * @param options - File upload configuration options
 *
 * @example
 *
 * ```typescript
 * '@'Post('/upload')
 * '@'File()
 * async uploadFile(file: MultipartFile) {
 *   const buffer = await file.toBuffer();
 *   return { filename: file.filename, size: buffer.length };
 * }
 *
 * '@'Post('/avatar')
 * '@'File('avatar', { limits: { fileSize: 5 * 1024 * 1024 } })
 * async uploadAvatar(file: MultipartFile) {
 *   // Handle avatar upload with 5MB limit
 * }
 * ```
 */
export function File(fieldName?: string, options?: FileUploadOptions): Func;
export function File(options?: FileUploadOptions): Func;
export function File(fieldNameOrOptions?: string | FileUploadOptions, options?: FileUploadOptions): Func {
  let fieldName: string | undefined;
  let opts: FileUploadOptions = {};

  if (typeof fieldNameOrOptions === 'string') {
    fieldName = fieldNameOrOptions;
    opts = options || {};
  } else if (fieldNameOrOptions) {
    opts = fieldNameOrOptions;
  }

  return function (target: Func, context: ClassMethodDecoratorContext) {
    const uploadMeta: FileUploadMeta = {
      ...opts,
      fieldName: fieldName || opts.fieldName,
      multiple: false,
    };

    // Store metadata for pipe to use
    metaSet<FileUploadMeta>(context, [sym.file, context.name], uploadMeta);

    // Apply the PipeFile automatically - call UsePipes but don't return its result
    UsePipes({ pipe: PipeFile })(target, context);

    // Return the original target to preserve method name
    return target;
  };
} /**
 * Decorator to handle multiple file uploads
 * Transforms the handler to receive an array of uploaded files as first argument
 *
 * @param fieldName - The name of the form field (optional)
 * @param options - File upload configuration options
 *
 * @example
 * ```ts
 * '@'Post('/upload-multiple')
 * '@'Files()
 * async uploadFiles(files: MultipartFile[]) {
 *   return files.map(f => ({ filename: f.filename, mimetype: f.mimetype }));
 * }
 *
 * '@'Post('/gallery')
 * '@'Files('images', { limits: { files: 10, fileSize: 10 * 1024 * 1024 } })
 * async uploadGallery(files: MultipartFile[]) {
 *   // Handle up to 10 image uploads, each max 10MB
 * }
 * ```
 */
export function Files(fieldName?: string, options?: FileUploadOptions): Func;
export function Files(options?: FileUploadOptions): Func;
export function Files(fieldNameOrOptions?: string | FileUploadOptions, options?: FileUploadOptions): Func {
  let fieldName: string | undefined;
  let opts: FileUploadOptions = {};

  if (typeof fieldNameOrOptions === 'string') {
    fieldName = fieldNameOrOptions;
    opts = options || {};
  } else if (fieldNameOrOptions) {
    opts = fieldNameOrOptions;
  }

  return function (target: Func, context: ClassMethodDecoratorContext) {
    const uploadMeta: FileUploadMeta = {
      ...opts,
      fieldName: fieldName || opts.fieldName,
      multiple: true,
    };

    // Store metadata for pipe to use
    metaSet<FileUploadMeta>(context, [sym.file, context.name], uploadMeta);

    // Apply the PipeFile automatically - call UsePipes but don't return its result
    UsePipes({ pipe: PipeFile })(target, context);

    // Return the original target to preserve method name
    return target;
  };
}
