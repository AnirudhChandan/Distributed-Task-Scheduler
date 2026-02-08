import Redis from "ioredis";

// Define the Redis configuration
const redisConfig = {
  host: "localhost", // Since we are running Node locally and Redis in Docker
  port: 6379,
};

// Create a connection instance
const redisConnection = new Redis(redisConfig);

// Event Listeners: Good for debugging connection issues
redisConnection.on("connect", () => {
  console.log("✅ Connected to Redis successfully!");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis Connection Error:", err);
});

export default redisConnection;
