export interface IEmailService {
  sendNotification(to: string, message: string): Promise<void>;
}
