import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

app.post("/user/:id/json", async (req, res) => {
    await redis.set(
        `user:${req.params.id}:json`,
        JSON.stringify(req.body)
    );

    res.json({
        success: true,
        savedAs: "JSON"
    });
});

app.get("/user/:id/json", async (req, res) => {
    const response = await redis.get(
        `user:${req.params.id}:json`
    );

    res.json({
        success: true,
        user: response
            ? JSON.parse(response)
            : "Not Found"
    });
});

app.post("/user/:id/hash", async (req, res) => {
    await redis.hset(`user:${req.params.id}:hash`, req.body);

    res.json({
        success: true,
        operation: "HSET",
        data: req.body
    });
});

app.get("/user/:id/hash", async (req, res) => {
    const user = await redis.hgetall(`user:${req.params.id}:hash`);

    res.json({
        success: true,
        operation: "HGETALL",
        data: Object.keys(user).length ? user : "Not Found"
    });
});

app.get("/user/:id/hash/count", async (req, res) => {
    const count = await redis.hlen(
        `user:${req.params.id}:hash`
    );

    res.json({
        success: true,
        operation: "HLEN",
        count
    });
});

app.get("/user/:id/hash/:field", async (req, res) => {
    const value = await redis.hget(
        `user:${req.params.id}:hash`,
        req.params.field
    );

    res.json({
        success: true,
        operation: "HGET",
        data: value || "Not Found"
    });
});

app.post("/user/:id/hash/multiple", async (req, res) => {
    const { fields } = req.body;

    const values = await redis.hmget(
        `user:${req.params.id}:hash`,
        ...fields
    );

    res.json({
        success: true,
        operation: "HMGET",
        fields,
        values
    });
});

app.delete("/user/:id/hash/:field", async (req, res) => {
    const deleted = await redis.hdel(
        `user:${req.params.id}:hash`,
        req.params.field
    );

    res.json({
        success: true,
        operation: "HDEL",
        deleted: deleted === 1
    });
});

app.get("/user/:id/hash/:field/exists", async (req, res) => {
    const exists = await redis.hexists(
        `user:${req.params.id}:hash`,
        req.params.field
    );

    res.json({
        success: true,
        operation: "HEXISTS",
        exists: Boolean(exists)
    });
});

app.get("/user/:id/hash/keys/all", async (req, res) => {
    const keys = await redis.hkeys(
        `user:${req.params.id}:hash`
    );

    res.json({
        success: true,
        operation: "HKEYS",
        keys
    });
});

app.get("/user/:id/hash/values/all", async (req, res) => {
    const values = await redis.hvals(
        `user:${req.params.id}:hash`
    );

    res.json({
        success: true,
        operation: "HVALS",
        values
    });
});

app.patch("/user/:id/hash/increment/:field", async (req, res) => {
    const { amount } = req.body;

    const updatedValue = await redis.hincrby(
        `user:${req.params.id}:hash`,
        req.params.field,
        amount
    );

    res.json({
        success: true,
        operation: "HINCRBY",
        updatedValue
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});