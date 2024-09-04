import { AsyncJobRunner } from "./runner/asyncJobRunner";
import { InMemoryJobStack } from "./queue/inMemoryJobStack";
import { Logger } from "./logger/logger";

export class JobRunnerApp {
  private jobStack: InMemoryJobStack;
  private runner: AsyncJobRunner;
  private logger: Logger;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    jobStack: InMemoryJobStack,
    runner: AsyncJobRunner,
    logger: Logger
  ) {
    this.jobStack = jobStack;
    this.runner = runner;
    this.logger = logger;
  }

  public start(): void {
    this.logger.log("Starting JobRunnerApp...");
    this.intervalId = setInterval(() => this.runJob(), 1000);
    process.on("SIGINT", () => this.stop());
  }

  private async runJob(): Promise<void> {
    if (!this.isRunning) {
      this.logger.log("Running job runner");
      this.isRunning = true;
      try {
        await this.runner.run();
      } catch (error) {
        this.logger.error(`Error running job: ${error}`);
      } finally {
        this.isRunning = false;
      }
    }
  }

  public stop(): void {
    this.logger.log("Received SIGINT signal, shutting down...");
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    if (this.isRunning) {
      this.logger.log("Waiting for the current job to finish...");
      this.runner.run().then(() => {
        this.logger.log("Job completed. Exiting now.");
        process.exit(0);
      }).catch(error => {
        this.logger.error(`Error during shutdown: ${error}`);
        process.exit(1);
      });
    } else {
      process.exit(0);
    }
  }
}
