import { SimpleMutex } from "./SimpleMutex";

describe("SimpleMutex", () => {
  let mutex: SimpleMutex;

  beforeEach(() => {
    mutex = new SimpleMutex();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("lock", () => {
    test("should acquire the lock immediately if not locked", async () => {
      const lockPromise = mutex.lock();
      await expect(lockPromise).resolves.toBeUndefined();
      expect(mutex["locked"]).toBe(true);
    });

    test("should queue lock requests if already locked", async () => {
      await mutex.lock();
      expect(mutex["locked"]).toBe(true);

      const secondLock = mutex.lock();
      expect(mutex["queue"].length).toBe(1);

      mutex.unlock();
      await expect(secondLock).resolves.toBeUndefined();
    });
  });

  describe("unlock", () => {
    test("should release the lock and allow the next in queue to acquire it", async () => {
      await mutex.lock();
      const secondLock = mutex.lock();

      mutex.unlock();
      await secondLock;

      expect(mutex["locked"]).toBe(true);
      expect(mutex["queue"].length).toBe(0);
    });

    test("should release the lock if no operations are queued", async () => {
      await mutex.lock();
      mutex.unlock();
      expect(mutex["locked"]).toBe(false);
    });
  });

  describe("runExclusive", () => {
    test("should run callback exclusively", async () => {
      const callback = jest.fn().mockResolvedValue("result");
      const result = await mutex.runExclusive(callback);

      expect(result).toBe("result");
      expect(callback).toHaveBeenCalled();
    });

    test("should ensure only one callback runs at a time", async () => {
      const callback1 = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return "result1";
      });
      const callback2 = jest.fn().mockResolvedValue("result2");

      const promise1 = mutex.runExclusive(callback1);
      const promise2 = mutex.runExclusive(callback2);

      const result1 = await promise1;
      const result2 = await promise2;

      expect(result1).toBe("result1");
      expect(result2).toBe("result2");
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback1.mock.invocationCallOrder[0]).toBeLessThan(
        callback2.mock.invocationCallOrder[0]
      );
    });

    test("should release the lock if callback throws an error", async () => {
      const error = new Error("test error");
      const callback = jest.fn().mockRejectedValue(error);

      await expect(mutex.runExclusive(callback)).rejects.toThrow("test error");
      expect(mutex["locked"]).toBe(false);
    });
  });
});
