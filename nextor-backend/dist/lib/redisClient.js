"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
// This will automatically read the REDIS_URL from your .env file
const redisClient = new ioredis_1.default(process.env.REDIS_URL);
redisClient.on("connect", () => {
    console.log("Connected to Redis successfully!");
});
redisClient.on("error", (error) => {
    console.error("Failed to connect to Redis:", error);
});
exports.default = redisClient;
