export abstract class ITaskUseCase {
  abstract sendVideo(messageBody: string): Promise<void>;
  abstract processListVideos(): Promise<void>;
}
