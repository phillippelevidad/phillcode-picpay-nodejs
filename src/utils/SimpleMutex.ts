/**
 * Provides a basic mutual exclusion (mutex) mechanism.
 * Ensures that only one asynchronous operation can execute a
 * critical section of code at any given time.
 */
export class SimpleMutex {
  private queue: Array<() => void>;
  private locked: boolean;

  constructor() {
    // Store the promises of tasks waiting to acquire the lock.
    this.queue = [];

    // A flag indicating whether the lock is currently held.
    this.locked = false;
  }

  /**
   * Acquires a mutex.
   */
  async lock(): Promise<void> {
    // If locked is true, create a promise, add its resolver to queue, and wait.
    // If locked is false, it sets locked to true to acquire the lock.
    if (this.locked) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.locked = true;
  }

  /**
   * Releases a mutex.
   */
  unlock(): void {
    // If there are waiting operations in queue,
    // the first one's resolver function is called, allowing it to proceed.
    // If there are no waiting operations, we set locked to false, making the lock available.
    if (this.queue.length > 0) {
      const nextResolve = this.queue.shift();
      if (nextResolve) {
        nextResolve();
      }
    } else {
      this.locked = false;
    }
  }

  /**
   * Ensures exclusive execution of a callback.
   */
  async runExclusive<T>(callback: () => Promise<T>): Promise<T> {
    // It acquires the lock, runs the callback,
    // and releases the lock afterward, regardless of success or error.
    await this.lock();
    try {
      return await callback();
    } finally {
      this.unlock();
    }
  }
}
