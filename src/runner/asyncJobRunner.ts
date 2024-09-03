import { AsyncJobStatus, BaseAsyncJob } from "./asyncJob";
import { Logger } from "./logger";
import type { ILogger } from "./logger";

export class AsyncJobRunner {
  constructor(
    private job: BaseAsyncJob,
    private logger: ILogger = new Logger()
  ) {}

  run = async () => {
    if (
      (this.job.status === AsyncJobStatus.FAILED && this.job.numRetries == 0) ||
      this.job.status === AsyncJobStatus.COMPLETED
    ) {
      this.logger.warn(
        `Fetched non-pending function ${this.job.uid}, current status: ${this.job.status}`,
        {
          event: "job_fetched",
          jobType: this.job.constructor.name,
          jobUid: this.job.uid,
        }
      );
      return;
    }

    for (
      var numAttempt = 0;
      numAttempt <= this.job.numRetries &&
      this.job.status !== AsyncJobStatus.COMPLETED;
      ++numAttempt
    ) {
      if (this.job.status === AsyncJobStatus.CANCELLED) {
        this.logger.info(
          `Job ${this.job.uid} cancelled while running, skipping`,
          {
            event: "job_cancelled",
            jobType: this.job.constructor.name,
            jobUid: this.job.uid,
            numAttempt: numAttempt,
            maxAttempts: this.job.numRetries,
          }
        );
        return;
      }

      this.job.status = AsyncJobStatus.PROCESSING;
      try {
        this.logger.info(`Starting job ${this.job.uid}`, {
          jobType: this.job.constructor.name,
          startTime: Date.now(),
        });
        await this.job.genExecute();
        this.job.status = AsyncJobStatus.COMPLETED;
        this.logger.info(`Job ${this.job.uid} completed`, {
          jobType: this.job.constructor.name,
          endTime: Date.now(),
        });
      } catch (error) {
        this.job.status = AsyncJobStatus.FAILED;
        this.logger.error(`Job ${this.job.uid} failed`, {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          jobType: this.job.constructor.name,
        });
      }
    }
  };
}
