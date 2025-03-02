import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { IS3UseCase } from '../interfaces/s3.interface';

@Injectable()
export class S3UseCase implements IS3UseCase {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(
    id: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    const params = {
      Bucket: bucketName,
      Key: id,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    const command = new PutObjectCommand(params);

    await this.s3.send(command);
  }

  async downloadFile(id: string): Promise<Readable> {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    const params = {
      Bucket: bucketName,
      Key: id,
    };

    const command = new GetObjectCommand(params);
    const response = await this.s3.send(command);

    return response.Body as Readable;
  }
}
