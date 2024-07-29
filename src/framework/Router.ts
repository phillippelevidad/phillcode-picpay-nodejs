import { IncomingMessage, ServerResponse } from "http";
import { Logger } from "utils/Logger";

declare module "http" {
  interface IncomingMessage {
    params?: Record<string, string>;
    query?: Record<string, string>;
  }
}

interface Route {
  path: RegExp;
  params: string[];
  method: string;
  handler: (
    req: RequestWithParams,
    res: ServerResponse,
    next: (error?: any) => Promise<void>
  ) => void | Promise<void>;
}

export interface RequestWithParams extends IncomingMessage {
  params?: Record<string, string>;
  query?: Record<string, string>;
}

export class Router {
  private readonly logger = new Logger(Router.name);
  private routes: Route[] = [];

  addRoute(path: string, method: string, handler: Route["handler"]): void {
    const params: string[] = [];
    const regexPath = path.replace(/:(\w+)/g, (_, param) => {
      params.push(param);
      return "([^/]+)";
    });
    const regex = new RegExp(`^${regexPath}$`);

    this.routes.push({ path: regex, params, method, handler });
  }

  createRouterMiddleware(
    path: string,
    method: string,
    handler: Route["handler"]
  ) {
    this.addRoute(path, method, handler);
    this.logger.debug(`Route added: ${method} ${path}`);

    return async (
      req: RequestWithParams,
      res: ServerResponse,
      next: (error?: any) => Promise<void>
    ) => {
      this.logger.debug(`Request: ${req.method} ${req.url}`);
      const parsedUrl = new URL(req.url!, `http://${req.headers.host}`);
      const pathname = parsedUrl.pathname;

      const route = this.routes.find(
        (route) => route.path.test(pathname) && req.method === route.method
      );

      if (route) {
        req.params = this.extractParams(route, pathname);
        req.query = Object.fromEntries(parsedUrl.searchParams.entries());

        try {
          await route.handler(req, res, next);
        } catch (error) {
          await next(error);
        }
      } else {
        await next();
      }
    };
  }

  private extractParams(
    route: Route,
    pathname: string
  ): Record<string, string> {
    const params: Record<string, string> = {};
    const match = route.path.exec(pathname);

    route.params.forEach((param, index) => {
      params[param] = match![index + 1];
    });

    return params;
  }
}
