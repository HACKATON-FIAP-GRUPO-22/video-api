export abstract class IEmailUseCase {
  abstract sendEmail(
    to: string[],
    subject: string,
    body: string,
  ): Promise<void>;
}
