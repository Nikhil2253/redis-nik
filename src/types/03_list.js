import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

app.post("/list/:key/lpush", async (req, res) => {
    const length = await redis.lpush(
        req.params.key,
        req.body.value
    );

    res.json({
        success: true,
        operation: "LPUSH",
        length
    });
});

app.post("/list/:key/rpush", async (req, res) => {
    const length = await redis.rpush(
        req.params.key,
        req.body.value
    );

    res.json({
        success: true,
        operation: "RPUSH",
        length
    });
});

app.get("/list/:key/lpop", async (req, res) => {
    const value = await redis.lpop(
        req.params.key
    );

    res.json({
        success: true,
        operation: "LPOP",
        value
    });
});

app.get("/list/:key/rpop", async (req, res) => {
    const value = await redis.rpop(
        req.params.key
    );

    res.json({
        success: true,
        operation: "RPOP",
        value
    });
});

app.get("/list/:key", async (req, res) => {
    const values = await redis.lrange(
        req.params.key,
        0,
        -1
    );

    res.json({
        success: true,
        operation: "LRANGE",
        values
    });
});

app.get("/list/:key/length", async (req, res) => {
    const length = await redis.llen(
        req.params.key
    );

    res.json({
        success: true,
        operation: "LLEN",
        length
    });
});

app.get("/list/:key/index/:index", async (req, res) => {
    const value = await redis.lindex(
        req.params.key,
        req.params.index
    );

    res.json({
        success: true,
        operation: "LINDEX",
        value
    });
});

app.patch("/list/:key/index/:index", async (req, res) => {
    await redis.lset(
        req.params.key,
        req.params.index,
        req.body.value
    );

    res.json({
        success: true,
        operation: "LSET"
    });
});

app.delete("/list/:key/remove", async (req, res) => {
    const removed = await redis.lrem(
        req.params.key,
        req.body.count,
        req.body.value
    );

    res.json({
        success: true,
        operation: "LREM",
        removed
    });
});

app.patch("/list/:key/trim", async (req, res) => {
    await redis.ltrim(
        req.params.key,
        req.body.start,
        req.body.end
    );

    res.json({
        success: true,
        operation: "LTRIM"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});