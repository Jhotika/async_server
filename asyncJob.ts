export enum AsyncJobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface AsyncJob {
  uid: string;
  status: AsyncJobStatus;
  statusQueue: Array<AsyncJobStatus>;
  data: any;

  genExecute(): Promise<void>;
}

export abstract class BaseAsyncJob implements AsyncJob {
  constructor(
    public uid: string,
    public status: AsyncJobStatus,
    public statusQueue: Array<AsyncJobStatus>,
    public data: any
  ) {}

  protected updateStatus = (status: AsyncJobStatus) => {
    this.statusQueue.push(status);
    this.status = status;
  };

  abstract genExecute(): Promise<void>;
}
