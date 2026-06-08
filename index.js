import express from "express";
import Redis from "ioredis";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(express.json());

const redis = new Redis(
    process.env.REDIS_URL
);

function otpKey(phone_no){
    return `otp:${phone_no}`;
}

app.post("/otp", async(req, res) => {
    const { phone_no } = req.body;

    const otp = Math.floor(100000 + Math.random()*900000).toString();

    await redis.set(otpKey(phone_no), otp, 'EX', 60);

    res.json({ otp: otp});
});

app.post("/otp/verify", async(req, res) => {
    const { phone_no, otp } = req.body;

    const savedOtp = await redis.get(otpKey(phone_no));

    if(!savedOtp){
        return res.json({ message: "OTP not Found" });
    }

    if(otp === savedOtp){
        await redis.del(otpKey(phone_no));
        return res.json({ message: "OTP verification Successful" });
    } else {
        return res.json({ message: "Incorrect OTP" });
    }
});

app.get("/otp/:phone_no/ttl", async(req, res) => {
    const ttl = await redis.ttl(otpKey(req.params.phone_no));
    res.json({ ttl: ttl });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});