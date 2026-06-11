import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const redis = new Redis(process.env.REDIS_URL);

app.use(express.json());

const jsonDB = {
    1: { id: 1, name: "Nikhil", role: "Engineer" },
    2: { id: 2, name: "Arjun", role: "Designer" },
};

const cacheMiddleware = async (req, res, next) => {
    const userId = req.params.id;
    const key = `user:${userId}`;

    const cachedData = await redis.get(key);

    if (cachedData) {
        return res.json({
            success: true,
            source: "cache",
            data: JSON.parse(cachedData),
        });
    }

    req.cacheKey = key;
    next();
};

app.get("/user/:id", cacheMiddleware, async (req, res) => {
    const userId = req.params.id;

    const user = jsonDB[userId];

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    await redis.setex(req.cacheKey, 60, JSON.stringify(user));

    res.json({
        success: true,
        source: "db",
        data: user,
    });
});

app.put("/user/:id", async (req, res) => {
    const userId = req.params.id;

    if (!jsonDB[userId]) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    jsonDB[userId] = {
        ...jsonDB[userId],
        ...req.body,
    };

    await redis.del(`user:${userId}`);

    res.json({
        success: true,
        message: "User updated & cache cleared",
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});