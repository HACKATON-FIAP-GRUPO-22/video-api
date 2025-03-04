import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { IStorageGateway } from '../interfaces/storage.gateway.interface';
import { IStorageUseCase } from '../interfaces/storage.interface';

@Injectable()
export class StorageUseCase implements IStorageUseCase {
  constructor(private gateway: IStorageGateway) {}

  async uploadFile(
    id: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    await this.gateway.uploadFile(id, fileBuffer, mimeType);
  }

  async downloadFile(id: string): Promise<Readable> {
    return this.gateway.downloadFile(id);
  }

  async deleteFile(id: string): Promise<void> {
    await this.gateway.deleteFile(id);
  }
}
