import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { RpcException } from '@nestjs/microservices';
import { CloudinaryResponse } from './cloudinary-response';
import UploadResponse from './dto/response.dto';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  // Hàm hỗ trợ retry
  private async retry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        this.logger.warn(
          `Upload failed, retrying... (${3 - retries} retries left)`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay)); // Đợi trước khi retry
        return this.retry(fn, retries - 1, delay * 2); // Tăng delay lên sau mỗi lần retry
      } else {
        this.logger.error('Upload failed after multiple retries:', error);
        throw new RpcException(new BadRequestException('Request Timeout'));
      }
    }
  }

  // Hàm upload file lên Cloudinary
  uploadFile(fileBuffer: Buffer): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(Buffer.from(fileBuffer)).pipe(uploadStream);
    });
  }

  // Hàm upload file với retry
  async uploadFileWithRetry(fileBuffer: Buffer): Promise<CloudinaryResponse> {
    return this.retry(() => this.uploadFile(fileBuffer), 3); // Retry 3 lần
  }

  // Hàm upload nhiều file
  async uploadImages(fileBuffers: Buffer[]): Promise<UploadResponse[]> {
    const uploadPromises = fileBuffers.map(
      (fileBuffer) => this.uploadFileWithRetry(fileBuffer), // Dùng hàm có retry
    );

    const result = await Promise.all(uploadPromises);

    const res: UploadResponse[] = result.map((item) => ({
      id: item.public_id as string,
      path: item.secure_url as string,
    }));

    console.log(res);

    return res;
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          this.logger.error(
            `Failed to delete image with id ${publicId}:`,
            error,
          );
          return reject(
            new RpcException(
              new HttpException('Delete Failed', HttpStatus.BAD_REQUEST),
            ),
          );
        }

        if (result.result !== 'ok') {
          this.logger.warn(
            `Delete failed or image not found for id ${publicId}`,
          );
          return reject(
            new RpcException(
              new HttpException('Delete Failed', HttpStatus.NOT_FOUND),
            ),
          );
        }

        this.logger.log(`Image with id ${publicId} deleted successfully`);
        resolve();
      });
    });
  }
}
