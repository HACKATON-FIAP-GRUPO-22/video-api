import { Readable } from 'stream';

export abstract class IStorageGateway {
  abstract uploadFile(
    id: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<void>;

  abstract downloadFile(id: string): Promise<Readable>;
  abstract deleteFile(id: string): Promise<void>;
}
