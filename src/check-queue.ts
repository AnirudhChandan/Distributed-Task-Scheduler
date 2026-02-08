// src/check-queue.ts
import redisConnection from "./config/redis";

async function check() {
  const processing = await redisConnection.lrange(
    "task-queue:processing",
    0,
    -1,
  );
  const queue = await redisConnection.lrange("task-queue", 0, -1);

  console.log("--- SYSTEM STATUS ---");
  console.log(`📁 Main Queue:       ${queue.length} tasks`);
  console.log(
    `⚠️ Processing Queue: ${processing.length} tasks (Stuck/In-Progress)`,
  );

  if (processing.length > 0) {
    console.log("Example stuck task:", processing[0]);
  }

  redisConnection.quit();
}

check();
