import { type ILogger, Logger } from "../logger/logger";
import { BaseAsyncJob } from "../jobs/asyncJob";

export interface IJobStack {
  stack: BaseAsyncJob[];
  runningJobUids: Set<string>;
  pendingJobUids: Set<string>;
  capacity: number;
  logger: ILogger;

  // methods
  addJob(job: BaseAsyncJob): void;
  genFetchJobToRun(): Promise<BaseAsyncJob | null>;
  genPostProcessJob(job: BaseAsyncJob): Promise<void>;
  genCancelJob(job: BaseAsyncJob): void;
}

export abstract class JobStack implements IJobStack {
  public eventType: string = "job_stack";
  constructor(
    public stack: BaseAsyncJob[],
    public pendingJobUids: Set<string>,
    public runningJobUids: Set<string>,
    public readonly capacity: number = 100,
    public readonly logger: ILogger = new Logger()
  ) {}

  abstract addJob(job: BaseAsyncJob): void;
  abstract genFetchJobToRun(): Promise<BaseAsyncJob | null>;
  abstract genPostProcessJob(job: BaseAsyncJob): Promise<void>;
  abstract genCancelJob(job: BaseAsyncJob): void;
}
