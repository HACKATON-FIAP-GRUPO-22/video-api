export abstract class ITaskGateway {
  abstract sendVideo(messageBody: string): Promise<void>;
  abstract getVideosForProcessed(): Promise<any[]>;
  abstract deleteVideoTask(any): Promise<void>;
}
