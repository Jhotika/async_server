import { AsyncJobStatus, type BaseAsyncJob } from "../jobs/asyncJob";
import { ILogger } from "../logger/logger";
import { JobStack } from "./jobStack";

export class InMemoryJobStack extends JobStack {
  constructor(
    public stack: BaseAsyncJob[],
    public pendingJobUids: Set<string>,
    public runningJobUids: Set<string>,
    capacity: number = 100,
    logger: ILogger
  ) {
    super(stack, pendingJobUids, runningJobUids, capacity, logger);
  }

  addJob(job: BaseAsyncJob): void {
    if (this.stack.length < this.capacity) {
      this.stack.push(job);
      this.pendingJobUids.add(job.uid);
    } else {
      const message = `Job stack is full, capacity: ${this.capacity}, stack size: ${this.stack.length}`;
      this.logger.error(message);
      throw new Error(message);
    }
  }

  removeJobFromRunningSet = (job: BaseAsyncJob) => {
    const got = this.runningJobUids.delete(job.uid);
    if (!got) {
      this.logger.info(
        `trying to remove non-existent job ${job.uid} from running set`
      );
    }
  };

  public genFetchJobToRun = async (): Promise<BaseAsyncJob | null> => {
    const job = this.fetchJob();
    if (job) {
      job.status = AsyncJobStatus.PROCESSING;
      this.runningJobUids.add(job.uid);
    }
    return job;
  };

  public genPostProcessJob = async (job: BaseAsyncJob): Promise<void> => {
    this.genRemoveJobFromPendingStack(job);
    this.logger.info(
      `job ${job.uid} finished with status ${job.status}, removing from pending set`,
      {
        event: "job_finished",
        eventType: this.eventType,
        endTime: Date.now(),
        uid: job.uid,
        jobType: job.constructor.name,
        status: job.status,
      }
    );
  };

  private genRemoveJobFromPendingStack = async (job: BaseAsyncJob) => {
    this.runningJobUids.delete(job.uid);
  };

  private fetchJob(): BaseAsyncJob | null {
    while (this.stack.length) {
      const job = this.stack.pop();
      if (
        job?.uid &&
        this.pendingJobUids.has(job.uid) &&
        job?.isProcessable()
      ) {
        job.status = AsyncJobStatus.PENDING;
        return job;
      }
    }
    return null;
  }
}
