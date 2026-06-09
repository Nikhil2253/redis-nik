import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

app.post("/set/:key/add", async (req, res) => {
    const added = await redis.sadd(
        req.params.key,
        req.body.value
    );

    res.json({
        success: true,
        operation: "SADD",
        added
    });
});

app.get("/set/:key", async (req, res) => {
    const members = await redis.smembers(
        req.params.key
    );

    res.json({
        success: true,
        operation: "SMEMBERS",
        members
    });
});

app.get("/set/:key/member/:value", async (req, res) => {
    const exists = await redis.sismember(
        req.params.key,
        req.params.value
    );

    res.json({
        success: true,
        operation: "SISMEMBER",
        exists: Boolean(exists)
    });
});

app.delete("/set/:key/remove/:value", async (req, res) => {
    const removed = await redis.srem(
        req.params.key,
        req.params.value
    );

    res.json({
        success: true,
        operation: "SREM",
        removed
    });
});

app.get("/set/:key/count", async (req, res) => {
    const count = await redis.scard(
        req.params.key
    );

    res.json({
        success: true,
        operation: "SCARD",
        count
    });
});

app.get("/set/:key/random", async (req, res) => {
    const member = await redis.spop(
        req.params.key
    );

    res.json({
        success: true,
        operation: "SPOP",
        member
    });
});

app.get("/set/union", async (req, res) => {
    const members = await redis.sunion(
        ...req.body.keys
    );

    res.json({
        success: true,
        operation: "SUNION",
        members
    });
});

app.get("/set/intersection", async (req, res) => {
    const members = await redis.sinter(
        ...req.body.keys
    );

    res.json({
        success: true,
        operation: "SINTER",
        members
    });
});

app.get("/set/difference", async (req, res) => {
    const members = await redis.sdiff(
        ...req.body.keys
    );

    res.json({
        success: true,
        operation: "SDIFF",
        members
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});