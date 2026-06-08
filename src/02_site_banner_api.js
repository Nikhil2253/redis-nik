import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(express.json());

const redis = new Redis(
    process.env.REDIS_URL
);

const BANNER_KEY = "app:banner";

app.post("/banner", async(req, res) => {
    await redis.set(BANNER_KEY, req.body.message || "Hello Redis");
    res.json({ success: true });
});

app.get("/banner", async(req, res) => {
    const message = await redis.get(BANNER_KEY);
    res.json({ message });
});

app.delete("/banner", async(req, res) => {
    await redis.del(BANNER_KEY);
    res.json({ success: true });
});

app.get("/banner/exists", async(req, res) => {
    const exists = await redis.exists(BANNER_KEY);
    res.json({ exists: exists });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});