import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

app.post("/zset/:key/add", async (req, res) => {
    const { score, member } = req.body;

    const added = await redis.zadd(
        req.params.key,
        score,
        member
    );

    res.json({
        success: true,
        operation: "ZADD",
        added
    });
});

app.get("/zset/:key", async (req, res) => {
    const members = await redis.zrange(
        req.params.key,
        0,
        -1,
        "WITHSCORES"
    );

    res.json({
        success: true,
        operation: "ZRANGE",
        members
    });
});

app.get("/zset/:key/reverse", async (req, res) => {
    const members = await redis.zrevrange(
        req.params.key,
        0,
        -1,
        "WITHSCORES"
    );

    res.json({
        success: true,
        operation: "ZREVRANGE",
        members
    });
});

app.get("/zset/:key/score/:member", async (req, res) => {
    const score = await redis.zscore(
        req.params.key,
        req.params.member
    );

    res.json({
        success: true,
        operation: "ZSCORE",
        score
    });
});

app.patch("/zset/:key/increment/:member", async (req, res) => {
    const score = await redis.zincrby(
        req.params.key,
        req.body.amount,
        req.params.member
    );

    res.json({
        success: true,
        operation: "ZINCRBY",
        score
    });
});

app.get("/zset/:key/rank/:member", async (req, res) => {
    const rank = await redis.zrank(
        req.params.key,
        req.params.member
    );

    res.json({
        success: true,
        operation: "ZRANK",
        rank
    });
});

app.get("/zset/:key/reverse-rank/:member", async (req, res) => {
    const rank = await redis.zrevrank(
        req.params.key,
        req.params.member
    );

    res.json({
        success: true,
        operation: "ZREVRANK",
        rank
    });
});

app.delete("/zset/:key/remove/:member", async (req, res) => {
    const removed = await redis.zrem(
        req.params.key,
        req.params.member
    );

    res.json({
        success: true,
        operation: "ZREM",
        removed
    });
});

app.get("/zset/:key/count", async (req, res) => {
    const count = await redis.zcard(
        req.params.key
    );

    res.json({
        success: true,
        operation: "ZCARD",
        count
    });
});

app.get("/zset/:key/score-range", async (req, res) => {
    const { min, max } = req.query;

    const members = await redis.zrangebyscore(
        req.params.key,
        min,
        max,
        "WITHSCORES"
    );

    res.json({
        success: true,
        operation: "ZRANGEBYSCORE",
        members
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});