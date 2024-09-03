import { type ILogger, Logger } from "logger/logger";
import { BaseAsyncJob } from "../jobs/asyncJob";

interface IJobStack {
  addJob(job: BaseAsyncJob): void;
  fetchJob(): BaseAsyncJob | null;
}

export abstract class JobStack implements IJobStack {
  private stack: BaseAsyncJob[];
  constructor(
    private readonly capacity: number = 100,
    private readonly logger: ILogger = new Logger()
  ) {
    this.stack = [];
  }
  abstract addJob(job: BaseAsyncJob): void;
  abstract fetchJob(): BaseAsyncJob | null;
}
