// src/worker/worker.ts
import redisConnection from "../config/redis";
import { Task } from "../types/task";

export class TaskWorker {
  private queueName: string;
  private processingQueue: string;

  constructor(queueName: string = "task-queue") {
    this.queueName = queueName;
    this.processingQueue = `${queueName}:processing`;
  }

  async start() {
    console.log(`[Worker] 👷 Worker started. Listening on ${this.queueName}`);

    while (true) {
      try {
        const taskData = await redisConnection.blmove(
          this.queueName,
          this.processingQueue,
          "LEFT",
          "RIGHT",
          0,
        );

        if (taskData) {
          const task: Task = JSON.parse(taskData);
          await this.processTask(task);

          // REMOVE from processing queue
          await redisConnection.lrem(this.processingQueue, 1, taskData);

          // TRACK METRICS: Increment 'completed' counter
          await redisConnection.incr("stats:completed");

          console.log(`[Worker] ✅ Task ${task.id} completed.`);
        }
      } catch (error) {
        console.error("[Worker] ❌ Error:", error);
        // TRACK METRICS: Increment 'failed' counter
        await redisConnection.incr("stats:failed");
      }
    }
  }

  private async processTask(task: Task) {
    console.log(`[Worker] ⚙️ Processing ${task.id}...`);
    // Simulate varying work times (1-3 seconds)
    const delay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
