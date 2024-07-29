import https from "https";
import { EmailService } from "./EmailService";

jest.mock("https");

describe("EmailService", () => {
  let writeMock: jest.Mock;
  let endMock: jest.Mock;

  beforeEach(() => {
    writeMock = jest.fn();
    endMock = jest.fn();

    (https.request as jest.Mock).mockImplementation((options, callback) => {
      const res = {
        statusCode: 200,
        on: jest.fn().mockImplementation((event, listener) => {
          if (event === "data") {
            listener('{"success": true}');
          }
          if (event === "end") {
            listener();
          }
        }),
      };
      callback(res);
      return {
        on: jest.fn(),
        write: writeMock,
        end: endMock,
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should send notification successfully", async () => {
    const to = "test@example.com";
    const message = "Test message";

    const emailService = new EmailService();
    const result = await emailService.sendNotification(to, message);

    expect(result).toEqual({ success: true });
    expect(https.request).toHaveBeenCalledTimes(1);
    expect(writeMock).toHaveBeenCalledWith(JSON.stringify({ to, message }));
    expect(endMock).toHaveBeenCalled();
  });

  test("should handle non-200 status codes", async () => {
    (https.request as jest.Mock).mockImplementation((options, callback) => {
      const res = {
        statusCode: 500,
        on: jest.fn().mockImplementation((event, listener) => {
          if (event === "data") {
            listener("Internal Server Error");
          }
          if (event === "end") {
            listener();
          }
        }),
      };
      callback(res);
      return {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      };
    });

    const to = "test@example.com";
    const message = "Test message";

    const emailService = new EmailService();
    await expect(emailService.sendNotification(to, message)).rejects.toThrow(
      "Status Code: 500, Response: Internal Server Error"
    );
  });

  test("should handle request errors", async () => {
    (https.request as jest.Mock).mockImplementation((options, callback) => {
      return {
        on: jest.fn().mockImplementation((event, listener) => {
          if (event === "error") {
            listener(new Error("Request error"));
          }
        }),
        write: jest.fn(),
        end: jest.fn(),
      };
    });

    const to = "test@example.com";
    const message = "Test message";

    const emailService = new EmailService();
    await expect(emailService.sendNotification(to, message)).rejects.toThrow(
      "Failed to send notification: Request error"
    );
  });
});
