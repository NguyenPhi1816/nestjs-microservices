import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
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

  async uploadImages(fileBuffers: Buffer[]) {
    const uploadPromises = fileBuffers.map((fileBuffer) =>
      this.uploadFile(fileBuffer),
    );

    const result = await Promise.all(uploadPromises);

    const paths = result.map((item) => item.secure_url);

    return { paths };
  }
}
