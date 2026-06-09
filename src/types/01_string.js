import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

app.post("/set/:key", async (req, res) => {
    await redis.set(req.params.key, req.body.value);

    res.json({
        success: true,
        operation: "SET"
    });
});

app.get("/get/:key", async (req, res) => {
    const value = await redis.get(req.params.key);

    res.json({
        success: true,
        operation: "GET",
        value
    });
});

app.post("/mset", async (req, res) => {
    await redis.mset(req.body);

    res.json({
        success: true,
        operation: "MSET"
    });
});

app.post("/mget", async (req, res) => {
    const values = await redis.mget(...req.body.keys);

    res.json({
        success: true,
        operation: "MGET",
        values
    });
});

app.patch("/append/:key", async (req, res) => {
    const length = await redis.append(
        req.params.key,
        req.body.value
    );

    res.json({
        success: true,
        operation: "APPEND",
        length
    });
});

app.get("/strlen/:key", async (req, res) => {
    const length = await redis.strlen(req.params.key);

    res.json({
        success: true,
        operation: "STRLEN",
        length
    });
});

app.patch("/incr/:key", async (req, res) => {
    const value = await redis.incr(req.params.key);

    res.json({
        success: true,
        operation: "INCR",
        value
    });
});

app.patch("/decr/:key", async (req, res) => {
    const value = await redis.decr(req.params.key);

    res.json({
        success: true,
        operation: "DECR",
        value
    });
});

app.patch("/incrby/:key", async (req, res) => {
    const value = await redis.incrby(
        req.params.key,
        req.body.amount
    );

    res.json({
        success: true,
        operation: "INCRBY",
        value
    });
});

app.patch("/decrby/:key", async (req, res) => {
    const value = await redis.decrby(
        req.params.key,
        req.body.amount
    );

    res.json({
        success: true,
        operation: "DECRBY",
        value
    });
});

app.patch("/expire/:key", async (req, res) => {
    const response = await redis.expire(
        req.params.key,
        req.body.seconds
    );

    res.json({
        success: true,
        operation: "EXPIRE",
        response
    });
});

app.get("/ttl/:key", async (req, res) => {
    const ttl = await redis.ttl(req.params.key);

    res.json({
        success: true,
        operation: "TTL",
        ttl
    });
});

app.delete("/delete/:key", async (req, res) => {
    const deleted = await redis.del(req.params.key);

    res.json({
        success: true,
        operation: "DEL",
        deleted: deleted === 1
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});