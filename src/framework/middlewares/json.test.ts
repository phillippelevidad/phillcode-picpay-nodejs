import { IncomingMessage, ServerResponse } from "http";
import { json } from "./json";

describe("json middleware", () => {
  let req: IncomingMessage;
  let res: ServerResponse;
  let next: jest.MockedFunction<(error?: any) => Promise<void>>;

  beforeEach(() => {
    req = {
      headers: {},
      on: jest.fn(),
    } as unknown as IncomingMessage;

    res = {} as ServerResponse;

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should call next if content-type is not application/json", async () => {
    req.headers["content-type"] = "text/plain";

    json(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("should parse JSON body and set req.body", (done) => {
    req.headers["content-type"] = "application/json";
    const jsonData = JSON.stringify({ key: "value" });
    const chunkBuffer = Buffer.from(jsonData);

    (req.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === "data") {
        callback(chunkBuffer);
      } else if (event === "end") {
        callback();
      }
    });

    next.mockImplementation(async () => {
      try {
        expect(req.body).toEqual({ key: "value" });
        done();
      } catch (error) {
        done(error);
      }
    });

    json(req, res, next);
  });

  test("should call next with error if JSON parsing fails", (done) => {
    req.headers["content-type"] = "application/json";
    const invalidJsonData = "{ key: value }";
    const chunkBuffer = Buffer.from(invalidJsonData);

    (req.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === "data") {
        callback(chunkBuffer);
      } else if (event === "end") {
        callback();
      }
    });

    next.mockImplementation(async (error) => {
      try {
        expect(error).toBeInstanceOf(SyntaxError);
        done();
      } catch (err) {
        done(err);
      }
    });

    json(req, res, next);
  });
});
