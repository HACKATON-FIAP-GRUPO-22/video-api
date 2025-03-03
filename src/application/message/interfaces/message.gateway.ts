export abstract class IMessageGateway {
  abstract sendMessage(
    to: string[],
    subject: string,
    body: string,
  ): Promise<void>;
}
