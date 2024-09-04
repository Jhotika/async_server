import { AsyncJobStatus, BaseAsyncJob } from "./asyncJob";

interface ExampleJobData {
  title: string;
  message: string;
  data: any;
}

export class ExampleJob extends BaseAsyncJob {
  constructor(
    data: ExampleJobData,
    status: AsyncJobStatus = AsyncJobStatus.PENDING,
    numRetries: number = 0,
    retryCount: number = 0
  ) {
    super(v4(), status, data, numRetries, retryCount);
  }

  async genExecute(): Promise<void> {
    console.log(`Printing notification ${this.data}`);
  }
}

function v4(): string {
  return crypto.randomUUID();
}
