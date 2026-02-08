import redisConnection from "../config/redis";
import { Task } from "../types/task";

export class TaskProducer {
  private queueName: string;
  private delayedQueue: string;

  constructor(queueName: string = "task-queue") {
    this.queueName = queueName;
    this.delayedQueue = `${queueName}:delayed`; // New ZSET key
  }

  async addTask(task: Task, delayInSeconds: number = 0): Promise<void> {
    const taskString = JSON.stringify(task);

    // Calculate execution time
    const processAt = Date.now() + delayInSeconds * 1000;
    task.processAt = processAt;

    if (delayInSeconds > 0) {
      // 1. Add to Delayed Queue (ZSET)
      // Score = Timestamp. Redis sorts by this score.
      await redisConnection.zadd(this.delayedQueue, processAt, taskString);
      console.log(
        `[Producer] ⏳ Scheduled Task ${task.id} for ${delayInSeconds}s later.`,
      );
    } else {
      // 2. Add to Main Queue (List) - Instant execution
      await redisConnection.rpush(this.queueName, taskString);
      console.log(`[Producer] 📤 Added Task ${task.id} to immediate queue.`);
    }
  }
}
