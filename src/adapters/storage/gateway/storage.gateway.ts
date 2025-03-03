import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { IStorageGateway } from '../../../application/storage/interfaces/storage.gateway.interface';

export class StorageGateway implements IStorageGateway {
  private s3: S3Client;
  private bucketName: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
  }

  async uploadFile(
    id: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: id,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    const command = new PutObjectCommand(params);

    await this.s3.send(command);
  }

  async downloadFile(id: string): Promise<Readable> {
    const params = {
      Bucket: this.bucketName,
      Key: id,
    };

    const command = new GetObjectCommand(params);
    const response = await this.s3.send(command);

    return response.Body as Readable;
  }

  async deleteFile(id: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: id,
    };

    const command = new DeleteObjectCommand(params);

    await this.s3.send(command);
  }
}
