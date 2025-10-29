import { ExecutionContext } from '@/common/execution-context.js';
import { sym } from '@/common/sym.js';
import { throws } from '@/asserts/expect.js';
import meta from '@/register/meta.js';
import { InjecoratorPipe } from '@/types/middleware.js';
import { FileUploadMeta, MultipartFile } from '@/types/multipart.js';
import { UploadedFile } from '../uploaded-file.js';
import { Pipe } from '@/decorators/middlewares/pipe.js';

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

// todo 等lost feature都完成，这里一定要在example里人工测试通过
/**
 * Pipe for handling file uploads
 * Integrates with @fastify/multipart to process uploaded files
 */
@Pipe()
export class PipeFile implements InjecoratorPipe {
  async transform(context: ExecutionContext, input?: any[]): Promise<any[]> {
    if (!checkMultipartAvailable()) {
      throws(
        'File upload requires @fastify/multipart to be installed. ' + 'Please run: npm install @fastify/multipart'
      );
    }

    const request = context.switchToHttp().getRequest();
    const sourceClass = context.getClass();

    const fileMeta = meta.get<Record<string, FileUploadMeta>>(sourceClass, [sym.file]);

    if (!fileMeta) {
      // No file upload metadata at all
      return input || [];
    }

    // Find the matching method by checking which one has file metadata
    const handlerNames = Object.keys(fileMeta);
    if (handlerNames.length === 0) {
      return input || [];
    }

    // For simplicity, use the first (and should be only) file upload method
    const handlerName = handlerNames[0];
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
              // Create UploadedFile and immediately consume the stream to buffer
              const uploadedFile = new UploadedFile(part);
              // Pre-load the buffer to avoid stream issues
              await uploadedFile.toBuffer();
              files.push(uploadedFile);
            } else {
              // Consume and discard streams we don't want to prevent hanging
              await part.file.resume();
            }
          } else {
            // Skip non-file parts (fields)
            continue;
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
