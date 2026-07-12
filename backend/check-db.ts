import "dotenv/config";
import mongoose from "mongoose";
import { Assignment } from "./src/models/Assignment.model";
import { GeneratedPaper } from "./src/models/GeneratedPaper.model";
import { Queue } from "bullmq";
import { redisConnection } from "./src/config/redis";

async function checkDb() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB!");

  const assignments = await Assignment.find().sort({ createdAt: -1 }).limit(10);
  console.log("\nLast 10 Assignments:");
  for (const a of assignments) {
    console.log(`- ID: ${a._id}, Topic: ${a.topic}, Status: ${a.status}, CreatedBy: ${a.createdBy}, CreatedAt: ${(a as any).createdAt}`);
  }

  const papers = await GeneratedPaper.find().sort({ createdAt: -1 }).limit(5);
  console.log("\nLast 5 Generated Papers:");
  for (const p of papers) {
    console.log(`- ID: ${p._id}, AssignmentID: ${p.assignmentId}, Title: ${p.title}, CreatedAt: ${(p as any).createdAt}`);
  }

  console.log("\nChecking BullMQ Queue...");
  const queue = new Queue("paper-generation", { connection: redisConnection });
  const counts = await queue.getJobCounts();
  console.log("BullMQ Job counts:", counts);

  const waitingJobs = await queue.getWaiting();
  console.log(`\nWaiting jobs count: ${waitingJobs.length}`);
  for (const job of waitingJobs) {
    console.log(`- Job ID: ${job.id}, Name: ${job.name}, Data:`, job.data);
  }

  const activeJobs = await queue.getActive();
  console.log(`\nActive jobs count: ${activeJobs.length}`);
  for (const job of activeJobs) {
    console.log(`- Job ID: ${job.id}, Name: ${job.name}, Data:`, job.data);
  }

  const failedJobs = await queue.getFailed();
  console.log(`\nFailed jobs count: ${failedJobs.length}`);
  for (const job of failedJobs.slice(0, 5)) {
    console.log(`- Job ID: ${job.id}, Name: ${job.name}, Reason: ${job.failedReason}`);
  }

  await mongoose.disconnect();
  await queue.close();
  console.log("\nDone!");
  process.exit(0);
}

checkDb().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
