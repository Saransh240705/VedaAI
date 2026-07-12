import "dotenv/config";
import { Queue, Worker } from "bullmq";
import { redisConnection } from "./src/config/redis";

async function testBullMQ() {
  console.log("Redis Connection Config:", {
    ...redisConnection,
    password: redisConnection.password ? "exists" : "none",
  });

  const queueName = "test-bullmq-queue-" + Date.now();
  console.log("Creating test queue:", queueName);
  const queue = new Queue(queueName, { connection: redisConnection });

  console.log("Creating test worker...");
  const worker = new Worker(
    queueName,
    async (job) => {
      console.log("[Worker] Processing job:", job.id, "with data:", job.data);
      return { success: true, processedAt: new Date() };
    },
    { connection: redisConnection }
  );

  worker.on("completed", (job, result) => {
    console.log("[Worker] Job completed! Result:", result);
  });

  worker.on("failed", (job, err) => {
    console.error("[Worker] Job failed! Error:", err);
  });

  console.log("Adding job to queue...");
  const job = await queue.add("test-job", { msg: "Hello from BullMQ!" });
  console.log("Job added successfully with ID:", job.id);

  console.log("Waiting for job processing...");
  await new Promise((resolve) => setTimeout(resolve, 15000));

  console.log("Closing queue and worker...");
  await queue.close();
  await worker.close();
  console.log("Done!");
}

testBullMQ().catch(console.error);
