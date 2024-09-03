import { BaseAsyncJob } from "./asyncJob";

export class JobStack {
  private stack: BaseAsyncJob[];
  private capacity: number;
  constructor(capacity: number = 100) {
    this.stack = [];
    this.capacity = capacity;
  }

  public addJob(job: BaseAsyncJob): void {
    if (this.stack.length >= this.capacity) {
      throw new Error("Job stack is full");
    }
    this.stack.push(job);
  }

  public fetchJob(): BaseAsyncJob | null {
    if (this.stack.length) {
      return this.stack.pop() ?? null;
    }
    return null;
  }
}
