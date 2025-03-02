import { Readable } from 'stream';

export abstract class IS3UseCase {
  abstract uploadFile(
    id: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<void>;

  abstract downloadFile(id: string): Promise<Readable>;
}
