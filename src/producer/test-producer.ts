// src/producer/test-producer.ts
import { TaskProducer } from "./producer";
import { Task } from "../types/task";
import { v4 as uuidv4 } from "uuid"; // We need to install this

const producer = new TaskProducer();

async function main() {
  // Simulate adding 5 tasks
  for (let i = 1; i <= 5; i++) {
    const task: Task = {
      id: uuidv4(),
      type: "email-notification",
      data: { userId: i, message: `Welcome User ${i}` },
      status: "pending",
      createdAt: Date.now(),
    };

    await producer.addTask(task);
  }

  console.log("✅ Simulation complete. 5 tasks added.");
  process.exit(0);
}

main();
