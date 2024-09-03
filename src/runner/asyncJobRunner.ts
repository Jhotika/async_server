import { AsyncJobStatus, BaseAsyncJob } from "../jobs/asyncJob";
import { type ILogger, Logger } from "../logger/logger";
import type { IJobStack } from "../queue/jobStack";

export class AsyncJobRunner {
  public readonly eventType: string = "job_runner";
  constructor(
    private jobStack: IJobStack,

    private job: BaseAsyncJob,
    private logger: ILogger = new Logger()
  ) {}

  run = async () => {
    const job = await this.jobStack.genFetchJobToRun();
    // double check to make sure the job is still processable
    if (!job?.isProcessable()) {
      this.logger.warn(
        `Fetched non-pending function ${this.job.uid}, current status: ${this.job.status}`,
        {
          eventType: this.eventType,
          event: "job_fetched",
          jobType: this.job.constructor.name,
          jobUid: this.job.uid,
        }
      );
      return;
    }
    this.logger.info(`Job ${this.job.uid} is processable`, {
      eventType: this.eventType,
      event: "job_ready",
      jobType: this.job.constructor.name,
      jobUid: this.job.uid,
    });

    for (
      var numAttempt = 0;
      numAttempt <= this.job.numRetries &&
      this.job.status !== AsyncJobStatus.COMPLETED &&
      this.job.status != AsyncJobStatus.CANCELLED;
      ++numAttempt
    ) {
      this.job.status = AsyncJobStatus.PROCESSING;
      try {
        this.logMessage(`Starting job ${this.job.uid}`, "info", {
          event: "job_started",
          numAttempt: numAttempt,
          maxAttempts: this.job.numRetries,
        });
        await this.job.genExecute();
        this.job.status = AsyncJobStatus.COMPLETED;
        this.logMessage(`Job ${this.job.uid} completed`, "info", {
          event: "job_completed",
        });
      } catch (error) {
        this.job.status = AsyncJobStatus.FAILED;
        this.logMessage(`Job ${this.job.uid} failed`, "error", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          numAttempt: numAttempt,
          maxAttempts: this.job.numRetries,
        });
      }
    }
    await this.jobStack.genPostProcessJob(this.job);
  };

  private logMessage = (
    message: string,
    level: "info" | "error" | "warn" | "log",
    otherFields: Record<string, any>
  ) => {
    const func =
      level === "info"
        ? this.logger.info
        : level === "error"
        ? this.logger.error
        : level === "warn"
        ? this.logger.warn
        : this.logger.log;

    func(message, {
      eventType: this.eventType,
      event: level,
      jobType: this.job.constructor.name,
      uid: this.job.uid,
      eventTime: Date.now(),
      ...otherFields,
    });
  };
}
