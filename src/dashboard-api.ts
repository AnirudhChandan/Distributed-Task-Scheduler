// src/dashboard-api.ts
import express from "express";
import cors from "cors";
import redisConnection from "./config/redis";
import { TaskProducer } from "./producer/producer";
import { Task } from "./types/task";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(cors());
app.use(express.json()); // Allow JSON bodies

const QUEUE_NAME = "task-queue";
const producer = new TaskProducer(); // Re-use our existing producer logic

// --- GET STATS ---
app.get("/stats", async (req, res) => {
  try {
    const pipeline = redisConnection.pipeline();
    pipeline.llen(QUEUE_NAME);
    pipeline.llen(`${QUEUE_NAME}:processing`);
    pipeline.zcard(`${QUEUE_NAME}:delayed`);
    pipeline.get("stats:completed");
    pipeline.get("stats:failed");

    const results = await pipeline.exec();
    const stats = {
      waiting: results?.[0]?.[1] || 0,
      active: results?.[1]?.[1] || 0,
      delayed: results?.[2]?.[1] || 0,
      completed: parseInt(results?.[3]?.[1] as string) || 0,
      failed: parseInt(results?.[4]?.[1] as string) || 0,
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// --- ACTION: ADD 5 TASKS ---
app.post("/tasks/add", async (req, res) => {
  try {
    for (let i = 0; i < 5; i++) {
      const task: Task = {
        id: uuidv4(),
        type: "frontend-task",
        data: { generatedBy: "dashboard" },
        status: "pending",
        createdAt: Date.now(),
      };
      await producer.addTask(task);
    }
    res.json({ message: "Added 5 tasks" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add tasks" });
  }
});

// --- ACTION: ADD DELAYED TASK ---
app.post("/tasks/delayed", async (req, res) => {
  try {
    const task: Task = {
      id: uuidv4(),
      type: "delayed-task",
      data: { msg: "I waited 10s!" },
      status: "pending",
      createdAt: Date.now(),
    };
    // Delay for 10 seconds
    await producer.addTask(task, 10);
    res.json({ message: "Added delayed task (10s)" });
  } catch (error) {
    res.status(500).json({ error: "Failed to schedule task" });
  }
});

// --- ACTION: CLEAR METRICS ---
app.post("/tasks/reset", async (req, res) => {
  await redisConnection.del("stats:completed");
  await redisConnection.del("stats:failed");
  // Optional: Clear queues too if you want
  await redisConnection.del(QUEUE_NAME);
  await redisConnection.del(`${QUEUE_NAME}:processing`);
  await redisConnection.del(`${QUEUE_NAME}:delayed`);

  res.json({ message: "System reset" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(
    `[Dashboard API] 🎮 Control Center running on http://localhost:${PORT}`,
  );
});
