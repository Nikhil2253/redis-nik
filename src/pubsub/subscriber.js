import Redis from "ioredis";

export const subscriber = new Redis(process.env.REDIS_URL);

subscriber.subscribe("notifications", (err) => {
    if(err){
        console.log("Failed to Subscribe: ", err.message);
    }

    console.log("Subscribed Successfully");
});

subscriber.on("message", (channel, message) => {
    console.log("Notification: ", message, " from ", channel);
});