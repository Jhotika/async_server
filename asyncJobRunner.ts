import { BaseAsyncJob } from "./asyncJob";

class AsyncJobRunner {
  constructor(private job: BaseAsyncJob) {}

  run() {
    this.job.genExecute();
  }
}
