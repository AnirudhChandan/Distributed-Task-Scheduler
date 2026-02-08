// src/scheduler/index.ts
import redisConnection from "../config/redis";

const QUEUE_NAME = "task-queue";
const DELAYED_QUEUE = `${QUEUE_NAME}:delayed`;

async function runScheduler() {
  console.log("[Scheduler] ⏰ Scheduler Service Started...");

  while (true) {
    try {
      const now = Date.now();

      // 1. Get tasks due for execution (Score <= Now)
      // ZRANGEBYSCORE key min max LIMIT offset count
      const tasks = await redisConnection.zrangebyscore(
        DELAYED_QUEUE,
        0,
        now,
        "LIMIT",
        0,
        10,
      );

      if (tasks.length > 0) {
        for (const taskString of tasks) {
          // 2. Move to Main Queue
          await redisConnection.rpush(QUEUE_NAME, taskString);

          // 3. Remove from Delayed Queue
          await redisConnection.zrem(DELAYED_QUEUE, taskString);

          console.log(`[Scheduler] 🚀 Moved task to active queue.`);
        }
      }

      // Sleep for 1 second before checking again to save CPU
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("[Scheduler] ❌ Error:", error);
    }
  }
}

runScheduler();
