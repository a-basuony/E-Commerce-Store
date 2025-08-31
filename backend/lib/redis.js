import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.UPSTASH_REDIS_URL, // أو redis://localhost:6379 لو شغال محلي
});

client.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

await client.connect();

export default client;
