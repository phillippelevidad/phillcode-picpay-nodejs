import { IncomingMessage, ServerResponse } from "http";
import { Logger } from "utils/Logger";
import { HttpError } from "../errors/HttpError";

const logger = new Logger("ErrorHandlerMiddleware");

export function errorHandler(
  err: any,
  req: IncomingMessage,
  res: ServerResponse,
  next: (error?: any) => Promise<void>
): void {
  if (!err) {
    next();
    return;
  }
  if (err instanceof HttpError) {
    send(res, err.status, err.message);
  } else {
    logger.error(`${req.method} ${req.url} - ${err.message}\n${err.stack}`);
    send(res, 500, "Internal Server Error");
  }
}

function send(res: ServerResponse, status: number, message: string): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message }));
}
