import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const redis = new Redis(process.env.REDIS_URL);

app.use(express.json());

const rateLimiter = async (req, res, next) => {
    const userId = req.ip;

    const key = `rate_limit:${userId}`;

    const requests = await redis.incr(key);

    if (requests === 1) {
        await redis.expire(key, 60);
    }

    if (requests > 5) {
        const ttl = await redis.ttl(key);

        return res.status(429).json({
            success: false,
            message: "Too many requests",
            retryAfter: ttl,
        });
    }

    next();
};

app.get("/test", rateLimiter, async (req, res) => {
    res.json({
        success: true,
        message: "Request Allowed",
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});