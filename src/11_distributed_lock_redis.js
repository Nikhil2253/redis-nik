import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const redis = new Redis(process.env.REDIS_URL);

app.use(express.json());

const acquireLock = async (key, value, ttl) => {
    const res = await redis.set(key, value, "NX", "PX", ttl);
    return res === "OK";
};

const releaseLock = async (key, value) => {
    const current = await redis.get(key);
    if (current === value) {
        await redis.del(key);
    }
};

app.post("/lock-test", async (req, res) => {
    const { resourceId } = req.body;

    const lockKey = `lock:${resourceId}`;
    const lockValue = `${process.pid}-${Date.now()}`;

    const locked = await acquireLock(lockKey, lockValue, 5000);

    if (!locked) {
        return res.status(423).json({
            success: false,
            message: "Locked",
        });
    }

    try {
        await new Promise(r => setTimeout(r, 2000));

        res.json({
            success: true,
            message: "Critical section executed",
        });
    } finally {
        await releaseLock(lockKey, lockValue);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});