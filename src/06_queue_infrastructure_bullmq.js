import express from "express";
import dotenv from "dotenv";
import { emailQueue } from "./bullmq_queue_infrastructure/queue.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.post("/send-welcome-email", async (req, res) => {
    const { to, name, content, from } = req.body;

    const job = await emailQueue.add(
        "welcome-email",
        {
            to,
            name,
            content,
            from,
        },
        {
            attempts: 5,
            backoff: {
                type: "exponential",
                delay: 3000,
            },
        }
    );

    res.json({
        message: "Welcome Email Job added to the Queue",
        jobId: job.id,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});