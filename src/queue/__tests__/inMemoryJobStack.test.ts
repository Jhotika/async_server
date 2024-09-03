import { InMemoryJobStack } from "../inMemoryJobStack";
import { AsyncJobStatus } from "../../jobs/asyncJob";
import { SendNotificationJob } from "../../jobs/sendNotificiationJob";
import { Logger } from "../../logger/logger";

describe("InMemoryJobStack", () => {
  let jobStack: InMemoryJobStack;
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
    jobStack = new InMemoryJobStack([], new Set(), new Set(), 100, logger);
  });

  test("addJob should add a job to the stack", () => {
    const job = new SendNotificationJob({
      title: "Test",
      message: "Test",
      data: {},
    });
    jobStack.addJob(job);
    expect(jobStack.stack.length).toBe(1);
    expect(jobStack.pendingJobUids.has(job.uid)).toBeTruthy();
  });

  test("addJob should throw an error when stack is full", () => {
    const smallStack = new InMemoryJobStack(
      [],
      new Set(),
      new Set(),
      1,
      logger
    );
    const job1 = new SendNotificationJob({
      title: "Test 1",
      message: "Test 1",
      data: {
        dummyData: "dummyData",
      },
    });
    const job2 = new SendNotificationJob({
      title: "Test 2",
      message: "Test 2",
      data: {
        foo: "bar",
      },
    });

    smallStack.addJob(job1);
    expect(() => smallStack.addJob(job2)).toThrow("Job stack is full");
  });

  test("genFetchJobToRun should return a job", async () => {
    const job = new SendNotificationJob({
      title: "Test",
      message: "Test",
      data: {},
    });
    jobStack.addJob(job);

    const fetchedJob = await jobStack.genFetchJobToRun();
    expect(fetchedJob).toBe(job);
    expect(jobStack.runningJobUids.has(job.uid)).toBeTruthy();
  });

  test("genPostProcessJob should remove job from running set", async () => {
    const job = new SendNotificationJob({
      title: "Test",
      message: "Test",
      data: {},
    });
    jobStack.addJob(job);
    await jobStack.genFetchJobToRun();

    await jobStack.genPostProcessJob(job);
    expect(jobStack.runningJobUids.has(job.uid)).toBeFalsy();
  });

  test("removeJobFromRunningSet should remove job from running set", async () => {
    const job = new SendNotificationJob({
      title: "Test",
      message: "Test",
      data: {},
    });
    jobStack.addJob(job);
    await jobStack.genFetchJobToRun();
    await jobStack.genCancelJob(job);
    expect(jobStack.runningJobUids.has(job.uid)).toBeFalsy();
    expect(job.status).toBe(AsyncJobStatus.CANCELLED);
  });

  test("fetchJob should return null when stack is empty", async () => {
    const fetchedJob = await jobStack.genFetchJobToRun();
    expect(fetchedJob).toBeNull();
  });
});
