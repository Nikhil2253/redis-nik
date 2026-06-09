import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

app.post("/bitmap/:key/setbit", async (req, res) => {
    const result = await redis.setbit(
        req.params.key,
        req.body.offset,
        req.body.value
    );

    res.json({
        success: true,
        operation: "SETBIT",
        result
    });
});

app.get("/bitmap/:key/getbit/:offset", async (req, res) => {
    const bit = await redis.getbit(
        req.params.key,
        req.params.offset
    );

    res.json({
        success: true,
        operation: "GETBIT",
        bit
    });
});

app.get("/bitmap/:key/count", async (req, res) => {
    const count = await redis.bitcount(
        req.params.key
    );

    res.json({
        success: true,
        operation: "BITCOUNT",
        count
    });
});

app.post("/hll/:key/add", async (req, res) => {
    const added = await redis.pfadd(
        req.params.key,
        ...req.body.values
    );

    res.json({
        success: true,
        operation: "PFADD",
        added
    });
});

app.get("/hll/:key/count", async (req, res) => {
    const count = await redis.pfcount(
        req.params.key
    );

    res.json({
        success: true,
        operation: "PFCOUNT",
        count
    });
});

app.post("/hll/merge", async (req, res) => {
    await redis.pfmerge(
        req.body.destination,
        ...req.body.sources
    );

    res.json({
        success: true,
        operation: "PFMERGE"
    });
});

app.post("/geo/:key/add", async (req, res) => {
    const added = await redis.geoadd(
        req.params.key,
        req.body.longitude,
        req.body.latitude,
        req.body.member
    );

    res.json({
        success: true,
        operation: "GEOADD",
        added
    });
});

app.get("/geo/:key/position/:member", async (req, res) => {
    const position = await redis.geopos(
        req.params.key,
        req.params.member
    );

    res.json({
        success: true,
        operation: "GEOPOS",
        position
    });
});

app.get("/geo/:key/distance", async (req, res) => {
    const distance = await redis.geodist(
        req.params.key,
        req.query.member1,
        req.query.member2,
        "km"
    );

    res.json({
        success: true,
        operation: "GEODIST",
        distance
    });
});

app.get("/geo/:key/search", async (req, res) => {
    const result = await redis.geosearch(
        req.params.key,
        "FROMLONLAT",
        req.query.longitude,
        req.query.latitude,
        "BYRADIUS",
        req.query.radius,
        "km"
    );

    res.json({
        success: true,
        operation: "GEOSEARCH",
        result
    });
});

app.post("/stream/add", async (req, res) => {
    const id = await redis.xadd(
        req.body.stream,
        "*",
        ...Object.entries(req.body.data).flat()
    );

    res.json({
        success: true,
        operation: "XADD",
        id
    });
});

app.get("/stream/read/:stream", async (req, res) => {
    const messages = await redis.xread(
        "COUNT",
        10,
        "STREAMS",
        req.params.stream,
        "0"
    );

    res.json({
        success: true,
        operation: "XREAD",
        messages
    });
});

app.post("/stream/group", async (req, res) => {
    try {
        await redis.xgroup(
            "CREATE",
            req.body.stream,
            req.body.group,
            "0",
            "MKSTREAM"
        );

        res.json({
            success: true,
            operation: "XGROUP CREATE"
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});

app.post("/stream/consumer/read", async (req, res) => {
    const messages = await redis.xreadgroup(
        "GROUP",
        req.body.group,
        req.body.consumer,
        "COUNT",
        10,
        "STREAMS",
        req.body.stream,
        ">"
    );

    res.json({
        success: true,
        operation: "XREADGROUP",
        messages
    });
});

app.post("/stream/ack", async (req, res) => {
    const acknowledged = await redis.xack(
        req.body.stream,
        req.body.group,
        req.body.id
    );

    res.json({
        success: true,
        operation: "XACK",
        acknowledged
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});