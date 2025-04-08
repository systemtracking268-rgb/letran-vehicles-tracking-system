import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let latitude = 51.505; // Starting latitude
const longitude = -0.001; // Keep longitude constant (or modify if needed)

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  setInterval(() => {
    latitude += 0.000001; // Increment latitude slightly over time
    socket.emit("locationUpdate", [latitude, longitude]); 
  }, 50);

  socket.on("disconnect", () => console.log("User disconnected"));
});

server.listen(5000, () => console.log("Server running on port 5000"));