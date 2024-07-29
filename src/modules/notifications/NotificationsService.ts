import { NotFoundError } from "framework/errors/NotFoundError";
import { UsersService } from "modules/users/UsersService";
import { Logger } from "utils/Logger";
import { EmailService } from "utils/mailing/EmailService";
import { RetryDecorator } from "utils/mailing/RetryDecorator";
import { Notification } from "./Notification";
import { NotificationsRepository } from "./NotificationsRepository";

export class NotificationsService {
  private static readonly logger: Logger = new Logger(
    NotificationsService.name
  );

  static async notify(userId: number, message: string): Promise<void> {
    const user = await UsersService.getUser(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    const emailService = new EmailService();
    const retryEmailService = new RetryDecorator(emailService, 5, 1000);
    await retryEmailService.sendNotification(user.email, message);

    const notification = new Notification({
      userId,
      message,
      date: new Date(),
    });
    await NotificationsRepository.create(notification);

    this.logger.debug(`Notification sent to user ${userId}: ${message}`);
  }
}
