import { type BaseAsyncJob } from "../jobs/asyncJob";
import { ILogger } from "../logger/logger";
import { JobStack } from "./jobStack";

export class InMemoryJobStack extends JobStack {
  constructor(capacity: number, logger: ILogger) {
    super(capacity, logger);
  }

  addJob(job: BaseAsyncJob): void {
    if (this.stack.length < this.capacity) {
      this.stack.push(job);
    } else {
      this.logger.error("Job stack is full");
    }
  }

  fetchJob(): BaseAsyncJob | null {
    return this.stack.pop() ?? null;
  }
}
