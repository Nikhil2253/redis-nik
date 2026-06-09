import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

app.post("/hash/:id", async (req, res) => {
    await redis.hset(
        `user:${req.params.id}`,
        req.body
    );

    res.json({
        success: true,
        operation: "HSET"
    });
});

app.get("/hash/:id", async (req, res) => {
    const data = await redis.hgetall(
        `user:${req.params.id}`
    );

    res.json({
        success: true,
        operation: "HGETALL",
        data
    });
});

app.get("/hash/:id/:field", async (req, res) => {
    const value = await redis.hget(
        `user:${req.params.id}`,
        req.params.field
    );

    res.json({
        success: true,
        operation: "HGET",
        value
    });
});

app.post("/hash/:id/multiple", async (req, res) => {
    const values = await redis.hmget(
        `user:${req.params.id}`,
        ...req.body.fields
    );

    res.json({
        success: true,
        operation: "HMGET",
        values
    });
});

app.delete("/hash/:id/:field", async (req, res) => {
    const deleted = await redis.hdel(
        `user:${req.params.id}`,
        req.params.field
    );

    res.json({
        success: true,
        operation: "HDEL",
        deleted
    });
});

app.get("/hash/:id/:field/exists", async (req, res) => {
    const exists = await redis.hexists(
        `user:${req.params.id}`,
        req.params.field
    );

    res.json({
        success: true,
        operation: "HEXISTS",
        exists: Boolean(exists)
    });
});

app.get("/hash/:id/keys/all", async (req, res) => {
    const keys = await redis.hkeys(
        `user:${req.params.id}`
    );

    res.json({
        success: true,
        operation: "HKEYS",
        keys
    });
});

app.get("/hash/:id/values/all", async (req, res) => {
    const values = await redis.hvals(
        `user:${req.params.id}`
    );

    res.json({
        success: true,
        operation: "HVALS",
        values
    });
});

app.get("/hash/:id/count", async (req, res) => {
    const count = await redis.hlen(
        `user:${req.params.id}`
    );

    res.json({
        success: true,
        operation: "HLEN",
        count
    });
});

app.patch("/hash/:id/increment/:field", async (req, res) => {
    const value = await redis.hincrby(
        `user:${req.params.id}`,
        req.params.field,
        req.body.amount
    );

    res.json({
        success: true,
        operation: "HINCRBY",
        value
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});