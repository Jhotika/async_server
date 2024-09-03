import { AsyncJobStatus, BaseAsyncJob } from "./asyncJob";

interface TNotifJobData {
  title: string;
  message: string;
  data: any;
}

export class SendNotificationJob extends BaseAsyncJob {
  constructor(
    data: TNotifJobData,
    status: AsyncJobStatus = AsyncJobStatus.PENDING,
    numRetries: number = 0,
    retryCount: number = 0
  ) {
    super(v4(), status, data, numRetries, retryCount);
  }

  async genExecute(): Promise<void> {
    console.log(`NotifJob with uid ${this.uid} executed`);
  }
}
function v4(): string {
  return crypto.randomUUID();
}
