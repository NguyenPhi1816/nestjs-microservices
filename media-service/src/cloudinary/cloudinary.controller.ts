import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @MessagePattern({ cmd: 'upload' })
  async uploadImage(fileBuffers: Buffer[]) {
    return this.cloudinaryService.uploadImages(fileBuffers);
  }

  @MessagePattern({ cmd: 'delete-image' })
  async deleteImage(publicId: string) {
    return this.cloudinaryService.deleteImage(publicId);
  }
}
