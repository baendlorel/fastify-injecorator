import { Controller } from '../../../packages/core/src/decorators/router/controller.js';
import { Post } from '../../../packages/core/src/decorators/router/http-methods.js';
import { File, Files } from '../../../packages/core/src/multipart/decorators.js';
import { UseInterceptors } from '../../../packages/core/src/decorators/middlewares/interceptor.js';
import { UseFilters } from '../../../packages/core/src/decorators/middlewares/filter.js';
import type { MultipartFile } from '../../../packages/core/src/types/multipart.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { TransformInterceptor } from '../interceptors/transform.interceptor.js';
import { HttpExceptionFilter } from '../filters/http-exception.filter.js';
import { BadRequestException } from '../../../packages/core/src/exceptions/index.js';

// todo 这里要换一个可以配置的地址
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOAD_DIR = join(__dirname, '..', '..', 'files');

// Ensure upload directory exists
mkdir(UPLOAD_DIR, { recursive: true }).catch(() => {});

@Controller('api/upload')
@UseInterceptors(TransformInterceptor)
@UseFilters(HttpExceptionFilter)
export class UploadController {
  @Post('single')
  @File()
  // todo 文件上传是否要带着表单一起？
  async uploadSingle(file: MultipartFile) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const buffer = await file.toBuffer();
    const filename = `${Date.now()}-${file.filename}`;
    const filepath = join(UPLOAD_DIR, filename);

    await writeFile(filepath, buffer);

    return {
      message: 'File uploaded successfully',
      file: {
        originalName: file.filename,
        savedName: filename,
        mimetype: file.mimetype,
        size: buffer.length,
        path: filepath,
      },
    };
  }

  @Post('multiple')
  @Files()
  async uploadMultiple(files: MultipartFile[]) {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.toBuffer();
        const filename = `${Date.now()}-${file.filename}`;
        const filepath = join(UPLOAD_DIR, filename);

        await writeFile(filepath, buffer);

        return {
          originalName: file.filename,
          savedName: filename,
          mimetype: file.mimetype,
          size: buffer.length,
          path: filepath,
        };
      }),
    );

    return {
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles,
    };
  }
}
