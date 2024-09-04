import { JobRunnerApp } from "./src/jobRunnerApp";
import { AsyncJobRunner } from "./src/runner/asyncJobRunner";
import { InMemoryJobStack } from "./src/queue/inMemoryJobStack";
import { Logger } from "./src/logger/logger";

const logger = new Logger();
const jobStack = new InMemoryJobStack([], new Set(), new Set(), 100, logger);
const runner = new AsyncJobRunner(jobStack, logger);
const app = new JobRunnerApp(jobStack, runner, logger);

app.start();
