import { ExecutionContext } from '@core/common/execution-context.js';
import { sym } from '@core/common/sym.js';
import { throws } from '@core/asserts/expect.js';
import { metaGet } from '@core/register/meta.js';
import { InjecoratorPipe } from '@core/types/middleware.js';
import { FileUploadMeta, MultipartFile } from '@core/types/multipart.js';
import { UploadedFile } from '../uploaded-file.js';
import { Pipe } from '@core/decorators/middlewares/pipe.js';

/**
 * Pipe for handling file uploads
 * Integrates with @fastify/multipart to process uploaded files
 *
 * Note: Requires @fastify/multipart to be installed and registered with Fastify
 */
@Pipe()
export class PipeFile implements InjecoratorPipe {
  async transform(context: ExecutionContext, input?: any[]): Promise<any[]> {
    const request = context.switchToHttp().getRequest();
    const sourceClass = context.getClass();
    const handler = context.getHandler();
    const handlerName = handler.name;

    const fileMeta = metaGet<Record<string, FileUploadMeta>>(sourceClass, [sym.file]);

    if (!fileMeta) {
      return input || [];
    }

    const uploadMeta = fileMeta[handlerName];

    if (!uploadMeta) {
      return input || [];
    }
    const { fieldName, multiple, limits } = uploadMeta;

    // Check if multipart plugin is registered
    if (!request.isMultipart || !request.isMultipart()) {
      throws('Request is not multipart/form-data. Did you register @fastify/multipart plugin?');
    }

    try {
      if (multiple) {
        const files: MultipartFile[] = [];
        const parts = request.parts({ limits });

        for await (const part of parts) {
          if (part.type === 'file') {
            if (!fieldName || part.fieldname === fieldName) {
              const uploadedFile = new UploadedFile(part);
              await uploadedFile.toBuffer();
              files.push(uploadedFile);
            } else {
              await part.file.resume();
            }
          } else {
            continue;
          }
        }

        return [files];
      } else {
        const file = await request.file({ limits });

        if (!file) {
          throws(`No file uploaded${fieldName ? ` for field "${fieldName}"` : ''}`);
        }

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
