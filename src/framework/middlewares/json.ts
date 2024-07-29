import { IncomingMessage, ServerResponse } from "http";

declare module "http" {
  interface IncomingMessage {
    body?: any;
  }
}

export function json(
  req: IncomingMessage,
  _res: ServerResponse,
  next: (error?: any) => Promise<void>
): void {
  if (req.headers["content-type"] !== "application/json") {
    next();
    return;
  }

  const chunks: Buffer[] = [];
  req.on("data", (chunk: Buffer) => {
    chunks.push(chunk);
  });

  req.on("end", () => {
    try {
      const body = Buffer.concat(chunks).toString();
      req.body = JSON.parse(body);
      next();
    } catch (error) {
      next(error);
    }
  });
}
