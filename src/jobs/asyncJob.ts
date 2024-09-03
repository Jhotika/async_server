export enum AsyncJobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface AsyncJob {
  uid: string;
  status: AsyncJobStatus;
  data: any;
  numRetries: number;
  retryCount: number;

  genExecute(): Promise<void>;
}

export abstract class BaseAsyncJob implements AsyncJob {
  constructor(
    public uid: string,
    public status: AsyncJobStatus,
    public data: any,
    public numRetries: number = 0,
    public retryCount: number = 0
  ) {}

  protected updateStatus = (status: AsyncJobStatus) => {
    this.status = status;
  };

  isProcessable = () => {
    console.log(this ? "this is not null" : "this is null");
    return (
      this &&
      (this.status === AsyncJobStatus.PENDING ||
        (this.status === AsyncJobStatus.FAILED &&
          this.retryCount < this.numRetries))
    );
  };

  abstract genExecute(): Promise<void>;
}
