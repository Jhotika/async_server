import { type ILogger, Logger } from "logger/logger";
import { BaseAsyncJob } from "../jobs/asyncJob";

interface IJobStack {
  addJob(job: BaseAsyncJob): void;
  fetchJob(): BaseAsyncJob | null;
}

export abstract class JobStack implements IJobStack {
  public stack: BaseAsyncJob[];
  constructor(
    public readonly capacity: number = 100,
    public readonly logger: ILogger = new Logger()
  ) {
    this.stack = [];
  }
  abstract addJob(job: BaseAsyncJob): void;
  abstract fetchJob(): BaseAsyncJob | null;
}
