import { HttpError } from "framework/errors/HttpError";
import { IncomingMessage, ServerResponse } from "http";
import { Logger } from "utils/Logger";
import { errorHandler } from "./errorHandler";

jest.mock("utils/Logger");

describe("errorHandler middleware", () => {
  let req: IncomingMessage;
  let res: ServerResponse;
  let next: jest.MockedFunction<(error?: any) => Promise<void>>;

  beforeEach(() => {
    req = {
      method: "GET",
      url: "/test",
    } as IncomingMessage;

    res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    } as unknown as ServerResponse;

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle HttpError and send response with correct status and message", () => {
    const httpError = new HttpError(404, "Not Found");

    errorHandler(httpError, req, res, next);

    expect(res.writeHead).toHaveBeenCalledWith(404, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({ message: "Not Found" })
    );
  });

  test("should handle generic error and log it, then send 500 response", () => {
    const error = new Error("Test error");

    errorHandler(error, req, res, next);

    expect(res.writeHead).toHaveBeenCalledWith(500, {
      "Content-Type": "application/json",
    });
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({ message: "Internal Server Error" })
    );
  });

  test("should log stack trace if available", () => {
    const error = new Error("Test error");
    error.stack = "Error stack trace";

    errorHandler(error, req, res, next);
  });

  test("should proceed to next middleware if no error is provided", async () => {
    await errorHandler(null, req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});
