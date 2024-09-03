import { AsyncJobRunner } from "../asyncJobRunner";
import { InMemoryJobStack } from "../../queue/inMemoryJobStack";
import { SendNotificationJob } from "../../jobs/sendNotificiationJob";
import { Logger } from "../../logger/logger";
import { AsyncJobStatus } from "../../jobs/asyncJob";

describe("AsyncJobRunner", () => {
  let jobStack: InMemoryJobStack;
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
    jobStack = new InMemoryJobStack([], new Set(), new Set(), 100, logger);
  });

  test("run should process a job", async () => {
    const job = new SendNotificationJob({
      title: "Test notification",
      message: "User X has sent you a message",
      data: {
        foo: "bar",
      },
    });

    jobStack.addJob(job);
    const runner = new AsyncJobRunner(jobStack, logger);
    // In real implementation, the runner will continue to run as a daemon,
    // but here we just run it once and expect it to complete the job
    await runner.run();
    expect(job.status).toBe(AsyncJobStatus.COMPLETED);
    expect(jobStack.stack.length).toBe(0);
    expect(jobStack.pendingJobUids.has(job.uid)).toBeFalsy();
  });
});
