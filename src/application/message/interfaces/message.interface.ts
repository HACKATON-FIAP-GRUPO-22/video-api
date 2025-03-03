export abstract class IMessageUseCase {
  abstract sendMessageErrorVideoProcessed(
    to: string[],
    subject: string,
    body: string,
  ): Promise<void>;
}
