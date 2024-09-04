import { AsyncJobStatus, type BaseAsyncJob } from "../jobs/asyncJob";
import { type ILogger, Logger } from "../logger/logger";
import type { IJobStack } from "../queue/jobStack";

export class AsyncJobRunner {
  public readonly eventType: string = "job_runner";
  constructor(
    private jobStack: IJobStack,
    private logger: ILogger = new Logger()
  ) {}

  run = async (): Promise<void> => {
    const job: BaseAsyncJob | null = await this.jobStack.genFetchJobToRun();
    if (!job) {
      this.logger.info(`Null job fetched`, {
        eventType: this.eventType,
        event: "null_job",
      });
      return;
    }
    // double check to make sure the job is still processable
    if (!job?.isProcessable()) {
      this.logger.warn(
        `Fetched non-pending function ${job.uid}, current status: ${job.status}`,
        {
          eventType: this.eventType,
          event: "job_fetched",
          jobType: job.constructor.name,
          jobUid: job.uid,
        }
      );
      return;
    }
    this.logger.info(`Job ${job.uid} is processable`, {
      eventType: this.eventType,
      event: "job_ready",
      jobType: job.constructor.name,
      jobUid: job.uid,
    });

    for (
      var numAttempt = 0;
      numAttempt <= job.numRetries &&
      job.status !== AsyncJobStatus.COMPLETED &&
      job.status != AsyncJobStatus.CANCELLED;
      ++numAttempt
    ) {
      job.status = AsyncJobStatus.PROCESSING;
      try {
        this.logMessage(`Starting job ${job.uid}`, "info", job, {
          event: "job_started",
          numAttempt: numAttempt,
          maxAttempts: job.numRetries,
        });
        await job.genExecute();
        job.status = AsyncJobStatus.COMPLETED;
        this.logMessage(`Job ${job.uid} completed`, "info", job, {
          event: "job_completed",
        });
      } catch (error) {
        job.status = AsyncJobStatus.FAILED;
        this.logMessage(`Job ${job.uid} failed`, "error", job, {
          event: "job_attempt_failed",
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          numAttempt: numAttempt,
          maxAttempts: job.numRetries,
        });
        if (numAttempt >= job.numRetries) {
          job.status = AsyncJobStatus.FAILED;
          this.logMessage(
            `Job ${job.uid} failed after ${numAttempt} attempts`,
            "error",
            job,
            {
              event: "job_failed",
              uid: job.uid,
              numAttempt: numAttempt,
              maxAttempts: job.numRetries,
            }
          );
        }
      }
    }
    await this.jobStack.genPostProcessJob(job);
  };

  private logMessage = (
    message: string,
    level: "info" | "error" | "warn" | "log",
    job: BaseAsyncJob,
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
      jobType: job.constructor.name,
      uid: job.uid,
      eventTime: Date.now(),
      ...otherFields,
    });
  };
}
