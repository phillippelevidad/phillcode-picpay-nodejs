import { setTimeout } from "timers";
import { promisify } from "util";
import { Logger } from "utils/Logger";
import { IEmailService } from "./IEmailService";

const delay = promisify(setTimeout);

export class RetryDecorator implements IEmailService {
  private readonly logger = new Logger(RetryDecorator.name);

  private wrapped: IEmailService;
  private attempts: number;
  private delayMs: number;

  constructor(wrapped: IEmailService, attempts: number, delayMs: number) {
    this.wrapped = wrapped;
    this.attempts = attempts;
    this.delayMs = delayMs;
  }

  async sendNotification(to: string, message: string): Promise<void> {
    const attempt = async (attemptCount: number): Promise<void> => {
      try {
        await this.wrapped.sendNotification(to, message);
      } catch (error) {
        this.logger.warn(
          `Attempt ${this.attempts - attemptCount + 1} failed: ${
            (error as Error).message
          }`
        );
        if (attemptCount > 1) {
          await delay(this.delayMs);
          await attempt(attemptCount - 1);
        } else {
          this.logger.error(
            `Failed to send notification after ${this.attempts} attempts`
          );
        }
      }
    };

    await attempt(this.attempts);
  }
}
