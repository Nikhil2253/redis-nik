import { Worker } from "bullmq";
import { connection } from "./queue.js";

const worker = new Worker(
    "emails",
    async (job) => {
        console.log("Job ID:", job.id);
        console.log("Job Name:", job.name);
        console.log("Job Data:", job.data);

        return { success: true };
    },
    { connection }
);

worker.on("completed", (job, result) => {
    console.log("Job ID:", job.id);
    console.log("Job Name:", job.name);
    console.log("Job Data:", job.data);
    console.log("Result:", result);
});

worker.on("failed", (job, error) => {
    console.log("Job ID:", job?.id);
    console.log("Job Name:", job?.name);
    console.log("Job Data:", job?.data);
    console.log("Error:", error.message);
});