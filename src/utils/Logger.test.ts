import fs from "fs";
import path from "path";
import { Logger } from "./Logger";

jest.mock("fs");

describe("Logger", () => {
  const mockAppendFile = fs.appendFile as unknown as jest.Mock;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    mockAppendFile.mockImplementation((file, data, callback) => callback(null));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultLogFilePath = path.resolve(__dirname, "logs.txt");

  test("should log INFO messages to console and file", () => {
    const logger = new Logger("TestContext");
    const message = "Test message";
    logger.log(message);

    const expectedLog = expect.stringContaining(
      `INFO (TestContext): ${message}`
    );
    expect(mockAppendFile).toHaveBeenCalledWith(
      defaultLogFilePath,
      expect.any(String),
      expect.any(Function)
    );
    expect(consoleSpy).toHaveBeenCalledWith(expectedLog);
  });

  test("should log ERROR messages to console and file", () => {
    const logger = new Logger("TestContext");
    const message = "Test error message";
    logger.error(message);

    const expectedLog = expect.stringContaining(
      `ERROR (TestContext): ${message}`
    );
    expect(mockAppendFile).toHaveBeenCalledWith(
      defaultLogFilePath,
      expect.any(String),
      expect.any(Function)
    );
    expect(consoleSpy).toHaveBeenCalledWith(expectedLog);
  });

  test("should log WARN messages to console and file", () => {
    const logger = new Logger("TestContext");
    const message = "Test warn message";
    logger.warn(message);

    const expectedLog = expect.stringContaining(
      `WARN (TestContext): ${message}`
    );
    expect(mockAppendFile).toHaveBeenCalledWith(
      defaultLogFilePath,
      expect.any(String),
      expect.any(Function)
    );
    expect(consoleSpy).toHaveBeenCalledWith(expectedLog);
  });

  test("should log DEBUG messages to console and file", () => {
    const logger = new Logger("TestContext");
    const message = "Test debug message";
    logger.debug(message);

    const expectedLog = expect.stringContaining(
      `DEBUG (TestContext): ${message}`
    );
    expect(mockAppendFile).toHaveBeenCalledWith(
      defaultLogFilePath,
      expect.any(String),
      expect.any(Function)
    );
    expect(consoleSpy).toHaveBeenCalledWith(expectedLog);
  });

  test("should use custom log file path if provided", () => {
    const customPath = "/custom/path/logs.txt";
    const logger = new Logger("TestContext", { logFilePath: customPath });
    const message = "Test message";
    logger.log(message);

    const expectedLog = expect.stringContaining(
      `INFO (TestContext): ${message}`
    );
    expect(mockAppendFile).toHaveBeenCalledWith(
      customPath,
      expect.any(String),
      expect.any(Function)
    );
    expect(consoleSpy).toHaveBeenCalledWith(expectedLog);
  });

  test("should disable console logging if logToConsole is false", () => {
    const logger = new Logger("TestContext", { logToConsole: false });
    const message = "Test message";
    logger.log(message);

    const expectedLog = expect.stringContaining(
      `INFO (TestContext): ${message}`
    );
    expect(mockAppendFile).toHaveBeenCalledWith(
      defaultLogFilePath,
      expect.any(String),
      expect.any(Function)
    );
    expect(consoleSpy).not.toHaveBeenCalledWith(expectedLog);
  });

  test("should handle error when writing to log file", () => {
    const errorLogger = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const logger = new Logger("TestContext");
    const message = "Test message";

    mockAppendFile.mockImplementation((file, data, callback) =>
      callback(new Error("Failed to write"))
    );

    logger.log(message);

    expect(errorLogger).toHaveBeenCalledWith(
      "Failed to write to log file",
      expect.any(Error)
    );

    errorLogger.mockRestore();
  });
});
