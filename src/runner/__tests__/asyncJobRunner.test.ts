// unit test for asyncJobRunner

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
    const spy = jest.spyOn(jobStack, "genPostProcessJob");
    jobStack.addJob(job);
    const runner = new AsyncJobRunner(jobStack, logger);
    await runner.run();
    expect(job.status).toBe(AsyncJobStatus.COMPLETED);
    expect(spy).toHaveBeenCalledWith(job);
  });
});
