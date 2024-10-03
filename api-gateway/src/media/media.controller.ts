import {
  Controller,
  Inject,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('api/images')
export class MediaController {
  constructor(@Inject('MEDIA_SERVICE') private client: ClientProxy) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('file'))
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    const fileBuffers = files.map((file) => file.buffer);
    console.log(fileBuffers);
    return this.client.send({ cmd: 'upload' }, fileBuffers);
  }
}
