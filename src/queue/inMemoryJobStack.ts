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
    this.eventType = "in_memory_job_stack";
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

  public genCancelJob = async (job: BaseAsyncJob): Promise<void> => {
    job.status = AsyncJobStatus.CANCELLED;
    if (await this.genRemoveJobFromPendingSet(job)) {
      return;
    }
    await this.genRemoveJobFromRunningSet(job);
  };

  public genFetchJobToRun = async (): Promise<BaseAsyncJob | null> => {
    const job = this.fetchJob();
    if (job) {
      this.runningJobUids.add(job.uid);
    }
    return job;
  };

  public genPostProcessJob = async (job: BaseAsyncJob): Promise<void> => {
    await this.genRemoveJobFromRunningSet(job);
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

  private genRemoveJobFromRunningSet = async (
    job: BaseAsyncJob
  ): Promise<boolean> => {
    const got = this.runningJobUids.delete(job.uid);

    if (!got) {
      this.logger.info(
        `trying to remove non-existent job ${job.uid} from running set ${this.runningJobUids}`
      );
    } else {
      this.logger.info(`job ${job.uid} removed from running set`, {
        event: "running_job_removed",
        eventType: this.eventType,
        uid: job.uid,
        jobType: job.constructor.name,
        status: job.status,
      });
    }
    return got;
  };

  private genRemoveJobFromPendingSet = async (
    job: BaseAsyncJob
  ): Promise<boolean> => {
    return this.runningJobUids.delete(job.uid);
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
        this.pendingJobUids.delete(job.uid);
        return job;
      }
    }
    return null;
  }
}
