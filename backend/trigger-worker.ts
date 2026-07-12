import "dotenv/config";
import mongoose from "mongoose";
import { Assignment } from "./src/models/Assignment.model";
import { addGenerationJob } from "./src/queues/generationQueue";
import { generationWorker } from "./src/workers/generationWorker";

async function triggerWorker() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB!");

  const targetAssignmentId = "6a1a73e364ca49d686acf4cb";
  const assignment = await Assignment.findById(targetAssignmentId);
  if (!assignment) {
    console.error(`Assignment ${targetAssignmentId} not found in database.`);
    process.exit(1);
  }

  console.log(`Found assignment: ${assignment.topic} (${assignment.subject})`);
  console.log(`Current status: ${assignment.status}`);

  // Reset status to pending so it gets picked up
  assignment.status = "pending";
  await assignment.save();

  console.log("Registering worker event listeners...");
  generationWorker.on("completed", (job, result) => {
    console.log(`[Worker] Job ${job.id} completed successfully! Result:`, result);
    cleanupAndExit(0);
  });

  generationWorker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed! Error:`, err);
    cleanupAndExit(1);
  });

  console.log("Adding job to BullMQ queue...");
  await addGenerationJob(targetAssignmentId);
  console.log("Job queued! Waiting for worker to process...");

  // Keep process alive
  await new Promise((resolve) => setTimeout(resolve, 60000));
  console.log("Timeout waiting for job execution.");
  cleanupAndExit(1);
}

async function cleanupAndExit(code: number) {
  await mongoose.disconnect();
  await generationWorker.close();
  process.exit(code);
}

triggerWorker().catch((err) => {
  console.error("Trigger error:", err);
  process.exit(1);
});
