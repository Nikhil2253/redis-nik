import express from "express";
import Redis from "ioredis";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

const redis = new Redis(
    process.env.REDIS_URL
);

const MONGODB_URL =
    process.env.MONGODB_URL;

mongoose
    .connect(MONGODB_URL)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Error:", err));

app.get("/redis", async (req, res) => {
    try {
        const response = await redis.ping();

        res.json({
            redis: response
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

app.get("/mongo", (req, res) => {
    res.json({
        mongo: mongoose.connection.readyState === 1,
        database: mongoose.connection.name
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});