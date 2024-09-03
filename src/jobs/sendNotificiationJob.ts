import { AsyncJobStatus, BaseAsyncJob } from "./asyncJob";

interface TSendNotificationJobData {
  title: string;
  message: string;
  data: any;
}

export class SendNotificationJob extends BaseAsyncJob {
  constructor(
    data: TSendNotificationJobData,
    status: AsyncJobStatus = AsyncJobStatus.PENDING,
    numRetries: number = 0,
    retryCount: number = 0
  ) {
    super(v4(), status, data, numRetries, retryCount);
  }

  async genExecute(): Promise<void> {
    console.log(`SendNotificationJob with uid ${this.uid} executed`);
  }
}

function v4(): string {
  return crypto.randomUUID();
}
