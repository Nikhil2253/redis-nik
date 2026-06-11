import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const redis = new Redis(process.env.REDIS_URL);

app.use(express.json());

const STREAM_KEY = "order-events";
const GROUP = "order-group";
const CONSUMER = "worker-1";

try {
    await redis.xgroup("CREATE", STREAM_KEY, GROUP, "0", "MKSTREAM");
} catch (e) {}

app.get("/order/:id", async (req, res) => {
    const data = await redis.get(`order:${req.params.id}`);

    if (!data) {
        return res.json({ success: false, message: "Not found" });
    }

    res.json({
        success: true,
        data: JSON.parse(data),
    });
});

app.post("/order", async (req, res) => {
    const { orderId, userId, amount } = req.body;

    const id = await redis.xadd(
        STREAM_KEY,
        "*",
        "orderId",
        orderId,
        "userId",
        userId,
        "amount",
        amount
    );

    res.json({
        success: true,
        eventId: id,
    });
});

const processStream = async () => {
    while (true) {
        const data = await redis.xreadgroup(
            "GROUP",
            GROUP,
            CONSUMER,
            "BLOCK",
            5000,
            "COUNT",
            10,
            "STREAMS",
            STREAM_KEY,
            ">"
        );

        if (!data) continue;

        for (const [, messages] of data) {
            for (const [id, fields] of messages) {
                const orderId = fields[1];
                const userId = fields[3];
                const amount = parseInt(fields[5]);

                await redis.set(`order:${orderId}`, JSON.stringify({
                    orderId,
                    userId,
                    amount,
                    status: "processed"
                }));

                await redis.xack(STREAM_KEY, GROUP, id);
            }
        }
    }
};

processStream();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});