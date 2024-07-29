import { IEmailService } from "./IEmailService";
import { RetryDecorator } from "./RetryDecorator";

class MockEmailService implements IEmailService {
  public sendNotification = jest.fn();
}

describe("RetryDecorator", () => {
  const to = "test@example.com";
  const message = "Test Message";
  const delayMs = 0;

  it("should succeed on the first attempt", async () => {
    const mockEmailService = new MockEmailService();
    mockEmailService.sendNotification.mockResolvedValueOnce(undefined);
    const retryDecorator = new RetryDecorator(mockEmailService, 3, delayMs);

    await retryDecorator.sendNotification(to, message);

    expect(mockEmailService.sendNotification).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendNotification).toHaveBeenCalledWith(to, message);
  });

  it("should retry and succeed on the second attempt", async () => {
    const mockEmailService = new MockEmailService();
    mockEmailService.sendNotification
      .mockRejectedValueOnce(new Error("First attempt failed"))
      .mockResolvedValueOnce(undefined);

    const retryDecorator = new RetryDecorator(mockEmailService, 3, delayMs);
    await retryDecorator.sendNotification(to, message);

    expect(mockEmailService.sendNotification).toHaveBeenCalledTimes(2);
    expect(mockEmailService.sendNotification).toHaveBeenCalledWith(to, message);
  });

  it("should fail after the maximum number of attempts", async () => {
    const mockEmailService = new MockEmailService();
    mockEmailService.sendNotification.mockRejectedValue(
      new Error("Attempt failed")
    );

    const retryDecorator = new RetryDecorator(mockEmailService, 3, delayMs);
    await retryDecorator.sendNotification(to, message);

    expect(mockEmailService.sendNotification).toHaveBeenCalledTimes(3);
    expect(mockEmailService.sendNotification).toHaveBeenCalledWith(to, message);
  });
});
