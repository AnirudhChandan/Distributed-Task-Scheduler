import { TaskProducer } from "./producer";
import { Task } from "../types/task";
import { v4 as uuidv4 } from "uuid";

const producer = new TaskProducer();

async function main() {
  const task: Task = {
    id: uuidv4(),
    type: "reminder-email",
    data: { msg: "This is from the past!" },
    status: "pending",
    createdAt: Date.now(),
  };

  console.log(`[Test] 🕒 Current Time: ${new Date().toLocaleTimeString()}`);

  // Schedule for 10 seconds later
  await producer.addTask(task, 10);

  console.log(`[Test] ✅ Task submitted.`);
  process.exit(0);
}

main();
