import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import Redis from "ioredis";
import { redisConnection } from "../config/redis";

let io: Server;
let publisher: Redis;
let subscriber: Redis;

// Initialize publisher so any process (server or worker) can publish events
publisher = new Redis(redisConnection);

publisher.on("error", (err: any) => {
  console.error("Redis Publisher Error:", err);
});

export const setupSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://PrepStackai-mkhh.onrender.com",
        "https://PrepStack-ai-sage-nine.vercel.app",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: any) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("Client Disconnected", socket.id);
    });
  });

  // Initialize subscriber on the main server to receive events from Redis and emit to clients
  subscriber = new Redis(redisConnection);

  subscriber.on("error", (err: any) => {
    console.error("Redis Subscriber Error:", err);
  });

  subscriber.subscribe("socket-events", (err: any) => {
    if (err) {
      console.error("Failed to subscribe to socket-events channel:", err);
    } else {
      console.log("Subscribed to socket-events Redis channel");
    }
  });

  subscriber.on("message", (channel: string, message: string) => {
    if (channel === "socket-events") {
      try {
        const { event, data } = JSON.parse(message);
        if (io) {
          io.emit(event, data);
        }
      } catch (error) {
        console.error("Error handling socket event from Redis:", error);
      }
    }
  });

  return io;
};

export const getIO = () => {
  // Return a proxy/mock object that behaves like the socket Server
  // but publishes events to Redis so the server process can broadcast them.
  return {
    emit: (event: string, data: any) => {
      publisher
        .publish("socket-events", JSON.stringify({ event, data }))
        .catch((err: any) => {
          console.error("Failed to publish socket event to Redis:", err);
          // Fallback to local emission if io is available
          if (io) {
            io.emit(event, data);
          }
        });
      return true;
    },
  } as unknown as Server;
};
