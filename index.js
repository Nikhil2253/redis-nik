import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const redis = new Redis(process.env.REDIS_URL);

app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});