import { ExecutionContext } from '@/common/execution-context.js';
import { sym } from '@/common/sym.js';
import { throws } from '@/asserts/expect.js';
import meta from '@/register/meta.js';
import { InjecoratorPipe } from '@/types/middleware.js';
import { FileUploadMeta, MultipartFile } from '@/types/multipart.js';
import { UploadedFile } from '../uploaded-file.js';

/**
 * Check if @fastify/multipart is available
 */
function checkMultipartAvailable() {
  try {
    require.resolve('@fastify/multipart');
    return true;
  } catch {
    return false;
  }
}

/**
 * Pipe for handling file uploads
 * Integrates with @fastify/multipart to process uploaded files
 */
export class PipeFile implements InjecoratorPipe {
  async transform(context: ExecutionContext, input?: any[]): Promise<any[]> {
    if (!checkMultipartAvailable()) {
      throws(
        'File upload requires @fastify/multipart to be installed. ' + 'Please run: npm install @fastify/multipart'
      );
    }

    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const sourceClass = context.getClass();

    const fileMeta = meta.get<Record<string, FileUploadMeta>>(sourceClass, [sym.file]);
    const handlerName = handler.name;

    if (!fileMeta || !fileMeta[handlerName]) {
      // No file upload metadata, return original input
      return input || [];
    }

    const uploadMeta = fileMeta[handlerName];
    const { fieldName, multiple, limits } = uploadMeta;

    // Check if multipart plugin is registered
    if (!request.isMultipart || !request.isMultipart()) {
      throws('Request is not multipart/form-data. Did you register @fastify/multipart plugin?');
    }

    try {
      if (multiple) {
        // Handle multiple files
        const files: MultipartFile[] = [];
        const parts = request.parts({ limits });

        for await (const part of parts) {
          if (part.type === 'file') {
            // If fieldName is specified, only accept files with that field name
            if (!fieldName || part.fieldname === fieldName) {
              files.push(new UploadedFile(part));
            }
          }
        }

        return [files];
      } else {
        // Handle single file
        const file = await request.file({ limits });

        if (!file) {
          throws(`No file uploaded${fieldName ? ` for field "${fieldName}"` : ''}`);
        }

        // If fieldName is specified, validate it matches
        if (fieldName && file.fieldname !== fieldName) {
          throws(`Expected file field "${fieldName}" but got "${file.fieldname}"`);
        }

        return [new UploadedFile(file)];
      }
    } catch (error) {
      if (error instanceof Error) {
        throws(`File upload failed: ${error.message}`);
      }
      throw error;
    }
  }
}
