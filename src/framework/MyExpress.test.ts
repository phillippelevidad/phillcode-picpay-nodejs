import * as http from "http";
import { MyExpress } from "./MyExpress";
import { Router } from "./Router";

jest.mock("./Router");

describe("MyExpress", () => {
  let myExpress: MyExpress;
  let req: http.IncomingMessage;
  let res: http.ServerResponse;
  let routerMock: jest.Mocked<Router>;

  beforeEach(() => {
    myExpress = new MyExpress();
    req = {} as http.IncomingMessage;
    res = {
      end: jest.fn(),
      statusCode: 200,
    } as unknown as http.ServerResponse;
    routerMock = new Router() as jest.Mocked<Router>;
    (Router as jest.Mock).mockImplementation(() => routerMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should add middleware using use()", () => {
    const middleware = jest.fn();
    myExpress.use(middleware);
    expect(myExpress["middlewares"]).toContain(middleware);
  });

  test("should add GET route handler", () => {
    const handler = jest.fn();
    const middleware = jest.fn();
    routerMock.createRouterMiddleware.mockReturnValue(middleware);

    myExpress.get("/test", handler);
    expect(routerMock.createRouterMiddleware).toHaveBeenCalledWith(
      "/test",
      "GET",
      handler
    );
    expect(myExpress["middlewares"]).toContain(middleware);
  });

  test("should add POST route handler", () => {
    const handler = jest.fn();
    const middleware = jest.fn();
    routerMock.createRouterMiddleware.mockReturnValue(middleware);

    myExpress.post("/test", handler);
    expect(routerMock.createRouterMiddleware).toHaveBeenCalledWith(
      "/test",
      "POST",
      handler
    );
    expect(myExpress["middlewares"]).toContain(middleware);
  });

  test("should add PUT route handler", () => {
    const handler = jest.fn();
    const middleware = jest.fn();
    routerMock.createRouterMiddleware.mockReturnValue(middleware);

    myExpress.put("/test", handler);
    expect(routerMock.createRouterMiddleware).toHaveBeenCalledWith(
      "/test",
      "PUT",
      handler
    );
    expect(myExpress["middlewares"]).toContain(middleware);
  });

  test("should add DELETE route handler", () => {
    const handler = jest.fn();
    const middleware = jest.fn();
    routerMock.createRouterMiddleware.mockReturnValue(middleware);

    myExpress.delete("/test", handler);
    expect(routerMock.createRouterMiddleware).toHaveBeenCalledWith(
      "/test",
      "DELETE",
      handler
    );
    expect(myExpress["middlewares"]).toContain(middleware);
  });

  test("should handle request with middleware", async () => {
    const middleware = jest.fn((req, res, next) => next());
    myExpress.use(middleware);

    await myExpress["handleRequest"](req, res);

    expect(middleware).toHaveBeenCalled();
    expect(res.end).toHaveBeenCalledWith("Not Found");
    expect(res.statusCode).toBe(404);
  });

  test("should handle request with error-handling middleware", async () => {
    const error = new Error("Test error");
    const middleware = jest.fn((req, res, next) => next(error));
    const errorHandler = jest.fn((err, req, res, next) => {
      res.statusCode = 500;
      res.end(`Internal Server Error: ${err.message}`);
    });
    myExpress.use(middleware);
    myExpress.use(errorHandler);

    await myExpress["handleRequest"](req, res);

    expect(middleware).toHaveBeenCalled();
    expect(errorHandler).toHaveBeenCalledWith(
      error,
      req,
      res,
      expect.any(Function)
    );
    expect(res.end).toHaveBeenCalledWith("Internal Server Error: Test error");
    expect(res.statusCode).toBe(500);
  });

  test("should fallback to 404 if no middleware handles request", async () => {
    await myExpress["handleRequest"](req, res);

    expect(res.end).toHaveBeenCalledWith("Not Found");
    expect(res.statusCode).toBe(404);
  });

  test("should start server on specified port", () => {
    const listenMock = jest
      .spyOn(http.Server.prototype, "listen")
      .mockImplementation((port, callback) => {
        callback?.();
        return {} as any;
      });

    const callback = jest.fn();
    myExpress.listen(3000, callback);

    expect(listenMock).toHaveBeenCalledWith(3000, callback);
    expect(callback).toHaveBeenCalled();
    listenMock.mockRestore();
  });
});
