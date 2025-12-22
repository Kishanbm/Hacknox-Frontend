import Redis from "ioredis";

// This will automatically read the REDIS_URL from your .env file
const redisClient = new Redis(process.env.REDIS_URL!);

redisClient.on("connect", () => {
  console.log("Connected to Redis successfully!");
});

redisClient.on("error", (error) => {
  console.error("Failed to connect to Redis:", error);
});

export default redisClient;