import redisConnection from "./config/redis";

async function test() {
  console.log("⏳ Attempting to connect to Redis...");

  // Write a simple key
  await redisConnection.set("greeting", "Hello from the Scheduler!");

  // Read it back
  const value = await redisConnection.get("greeting");

  console.log("✅ Redis says:", value);

  // Close connection so the script exits
  redisConnection.quit();
}

test();
