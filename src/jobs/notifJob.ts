import { UUID } from "mongodb";
import { AsyncJobStatus, BaseAsyncJob } from "./asyncJob";

interface TNotifJobData {
  title: string;
  message: string;
  data: any;
}

export class NotifJob extends BaseAsyncJob {
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
  return new UUID().id.toString();
}
