import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const redis = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(express.json());

const STREAM_KEY = "score-events";
const GROUP = "score-group";
const CONSUMER = "worker-1";

try {
    await redis.xgroup("CREATE", STREAM_KEY, GROUP, "0", "MKSTREAM");
} catch (e) {}

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

app.post("/score", async (req, res) => {
    const { userId, score } = req.body;

    const id = await redis.xadd(
        STREAM_KEY,
        "*",
        "userId",
        userId,
        "score",
        score
    );

    res.json({
        success: true,
        eventId: id,
    });
});

const processStream = async () => {
    while (true) {
        const data = await redis.xreadgroup(
            "GROUP",
            GROUP,
            CONSUMER,
            "BLOCK",
            1000,
            "COUNT",
            10,
            "STREAMS",
            STREAM_KEY,
            ">"
        );

        if (!data) continue;

        for (const [, messages] of data) {
            for (const [id, fields] of messages) {
                const userId = fields[1];
                const score = parseInt(fields[3]);

                const lockKey = `lock:leaderboard:${userId}`;
                const lockValue = `${process.pid}-${Date.now()}`;

                const locked = await acquireLock(lockKey, lockValue, 5000);

                if (!locked) continue;

                try {
                    const current = await redis.zscore("leaderboard", userId);
                    const newScore = (parseInt(current) || 0) + score;

                    await redis.zadd("leaderboard", newScore, userId);

                    await redis.set(`user:score:${userId}`, newScore);
                } finally {
                    await releaseLock(lockKey, lockValue);
                }

                await redis.xack(STREAM_KEY, GROUP, id);
            }
        }
    }
};

processStream();

app.get("/leaderboard", async (req, res) => {
    const cached = await redis.get("leaderboard:cache");

    if (cached) {
        return res.json({
            success: true,
            source: "cache",
            data: JSON.parse(cached),
        });
    }

    const data = await redis.zrevrange("leaderboard", 0, 9, "WITHSCORES");

    const result = [];

    for (let i = 0; i < data.length; i += 2) {
        result.push({
            userId: data[i],
            score: parseInt(data[i + 1]),
        });
    }

    await redis.setex("leaderboard:cache", 10, JSON.stringify(result));

    res.json({
        success: true,
        source: "db",
        data: result,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});