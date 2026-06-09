import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

const QUEUE_KEY = "queue:emails";

async function sendEmail(job){
    console.log("Email");
    console.log(`Sender: ${job.from}`);
    console.log(`Receiver: ${job.to}`);
    console.log(`Subject: ${job.subject}`)
    console.log(`Content: ${job.content}`);

    return true;
}

app.post("/emails", async(req, res) => {
   const job = {
     to: req.body.to,
     from: req.body.from,
     subject: req.body.subject,
     content: req.body.content,
     createdAt: new Date().toISOString()
   };

   await redis.lpush(QUEUE_KEY, JSON.stringify(job));
   res.json({ queued: true, job });
});

app.get("/emails/process-one", async(req, res) => {
   const rawJob = await redis.rpop(QUEUE_KEY);

   if(!rawJob){
      return res.json({ success: true, message: "No Jobs in Email Queue"});
   }

   const job = JSON.parse(rawJob);

   const emailSent = await sendEmail(job);

   res.json({ success: emailSent, message: emailSent? "Email Sent": "Error occured in Sending Email", job});
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});