import * as http from "http";
import { Router } from "./Router";

type Middleware = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next: (error?: any) => Promise<void>
) => void | Promise<void>;

type ErrorHandlerMiddleware = (
  err: any,
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next: (error?: any) => Promise<void>
) => void | Promise<void>;

export class MyExpress {
  private readonly router = new Router();
  private middlewares: (Middleware | ErrorHandlerMiddleware)[] = [];

  use(middleware: Middleware | ErrorHandlerMiddleware): void {
    this.middlewares.push(middleware);
  }

  get(path: string, handler: Middleware): void {
    this.use(this.router.createRouterMiddleware(path, "GET", handler));
  }

  post(path: string, handler: Middleware): void {
    this.use(this.router.createRouterMiddleware(path, "POST", handler));
  }

  put(path: string, handler: Middleware): void {
    this.use(this.router.createRouterMiddleware(path, "PUT", handler));
  }

  delete(path: string, handler: Middleware): void {
    this.use(this.router.createRouterMiddleware(path, "DELETE", handler));
  }

  listen(port: number, callback?: () => void): void {
    const server = http.createServer(this.handleRequest.bind(this));
    server.listen(port, callback);
  }

  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    let i = 0;
    const next = async (error?: any): Promise<void> => {
      if (i >= this.middlewares.length) {
        this.fallbackHandler(req, res, error);
        return;
      }

      const middleware = this.middlewares[i++];
      await this.executeMiddleware(middleware, req, res, next, error);
    };
    await next();
  }

  private fallbackHandler(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    error?: any
  ): void {
    if (error) {
      res.statusCode = 500;
      res.end(`Internal Server Error: ${error.message}`);
    } else {
      res.statusCode = 404;
      res.end("Not Found");
    }
  }

  private async executeMiddleware(
    middleware: Middleware | ErrorHandlerMiddleware,
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: (error?: any) => Promise<void>,
    error?: any
  ): Promise<void> {
    try {
      // Error-handling middleware
      if (error && (middleware as ErrorHandlerMiddleware).length === 4) {
        await (middleware as ErrorHandlerMiddleware)(error, req, res, next);
      }
      // Regular middleware
      else if (!error && (middleware as Middleware).length < 4) {
        await (middleware as Middleware)(req, res, next);
      }
      // Proceed to next middleware
      else {
        await next(error);
      }
    } catch (err) {
      await next(err);
    }
  }
}
