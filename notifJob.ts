import { UUID } from "mongodb";
import { type AsyncJobStatus, BaseAsyncJob } from "./asyncJob";

interface TNotifJobData {
  title: string;
  message: string;
  data: any;
}

class NotifJob extends BaseAsyncJob {
  constructor(
    status: AsyncJobStatus, // remove
    statusQueue: Array<AsyncJobStatus>, // remove
    data: TNotifJobData
  ) {
    super(v4(), status, statusQueue, data);
  }

  async genExecute(): Promise<void> {
    console.log("NotifJob executed");
  }
}
function v4(): string {
  return new UUID().id.toString();
}
