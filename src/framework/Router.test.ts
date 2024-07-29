import { ServerResponse } from "http";
import { RequestWithParams, Router } from "./Router";

jest.mock("utils/Logger");

describe("Router", () => {
  let router: Router;

  beforeEach(() => {
    router = new Router();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("addRoute", () => {
    test("should add a route correctly", () => {
      const handler = jest.fn();
      router.addRoute("/test/:id", "GET", handler);

      expect(router["routes"].length).toBe(1);
      const route = router["routes"][0];
      expect(route.path).toEqual(/^\/test\/([^/]+)$/);
      expect(route.params).toEqual(["id"]);
      expect(route.method).toBe("GET");
      expect(route.handler).toBe(handler);
    });
  });

  describe("createRouterMiddleware", () => {
    let req: RequestWithParams;
    let res: ServerResponse;
    let next: jest.Mock;

    beforeEach(() => {
      req = {
        url: "/test/123?query=abc",
        method: "GET",
        headers: {
          host: "localhost",
        },
      } as RequestWithParams;
      res = {} as ServerResponse;
      next = jest.fn().mockResolvedValue(undefined);
    });

    test("should call the handler if the route matches", async () => {
      const handler = jest.fn();
      const middleware = router.createRouterMiddleware(
        "/test/:id",
        "GET",
        handler
      );

      await middleware(req, res, next);

      expect(handler).toHaveBeenCalledWith(req, res, next);
      expect(req.params).toEqual({ id: "123" });
      expect(req.query).toEqual({ query: "abc" });
      expect(next).not.toHaveBeenCalled();
    });

    test("should call next with an error if the handler throws", async () => {
      const handler = jest.fn(() => {
        throw new Error("Test error");
      });
      const middleware = router.createRouterMiddleware(
        "/test/:id",
        "GET",
        handler
      );

      await middleware(req, res, next);

      expect(handler).toHaveBeenCalledWith(req, res, next);
      expect(next).toHaveBeenCalledWith(new Error("Test error"));
    });

    test("should call next if the route does not match", async () => {
      const handler = jest.fn();
      const middleware = router.createRouterMiddleware(
        "/no-match",
        "GET",
        handler
      );

      await middleware(req, res, next);

      expect(handler).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("extractParams", () => {
    test("should correctly extract parameters from the pathname", () => {
      const route = {
        path: /^\/test\/([^/]+)\/([^/]+)$/,
        params: ["param1", "param2"],
        method: "GET",
        handler: jest.fn(),
      };
      const pathname = "/test/value1/value2";

      const params = router["extractParams"](route, pathname);

      expect(params).toEqual({
        param1: "value1",
        param2: "value2",
      });
    });
  });
});
