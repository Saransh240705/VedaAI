require("dotenv").config();
const { Queue, Worker } = require("bullmq");
const { redisConnection } = require("./dist/config/redis"); // require compiled JS to be safe, or we can compile/parse the JS config directly.
// Let's parse the REDIS_URL directly in the script to be 100% independent!
const parseRedisUrl = (rawUrl) => {
  let url = rawUrl.trim();
  if (url.startsWith("REDIS_URL=")) {
    url = url.substring("REDIS_URL=".length).trim();
  }
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || "6379", 10),
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    username: parsed.username && parsed.username !== "default" ? parsed.username : undefined,
    tls: parsed.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null,
  };
};

const connection = process.env.REDIS_URL
  ? parseRedisUrl(process.env.REDIS_URL)
  : {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      maxRetriesPerRequest: null,
    };

async function testBullMQ() {
  console.log("Redis Connection Config:", {
    ...connection,
    password: connection.password ? "exists" : "none",
  });

  const queueName = "test-bullmq-queue-" + Date.now();
  console.log("Creating test queue:", queueName);
  const queue = new Queue(queueName, { connection });

  console.log("Creating test worker...");
  const worker = new Worker(
    queueName,
    async (job) => {
      console.log("[Worker] Processing job:", job.id, "with data:", job.data);
      return { success: true, processedAt: new Date() };
    },
    { connection }
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
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("Closing queue and worker...");
  await queue.close();
  await worker.close();
  console.log("Done!");
}

testBullMQ().catch(console.error);
