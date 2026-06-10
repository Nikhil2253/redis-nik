import express from "express";
import dotenv from "dotenv";
import { publisher } from "./src/pubsub/publisher.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.post("/notifications", async (req, res) => {
    const payload = {
        id: Date.now(),
        type: req.body.type || "video-uploaded",
        title: req.body.title || "Redis Pub/Sub Tutorial",
        message:
            req.body.message ||
            "A new video has been uploaded to the channel.",
        channelName: req.body.channelName || "NikTube",
        creator: req.body.creator || "Nikhil",
        link:
            req.body.link ||
            "https://niktube.com/watch/123",
        thumbnail:
            req.body.thumbnail ||
            "https://niktube.com/thumbnails/123.jpg",
        createdAt: new Date().toISOString(),
    };

    await publisher.publish(
        "notifications",
        JSON.stringify(payload)
    );

    res.status(200).json({
        success: true,
        message: "Notification published successfully",
        payload,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});