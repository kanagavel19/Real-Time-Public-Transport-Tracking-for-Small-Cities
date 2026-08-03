// server/server.js
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const busRoutes = require("./routes/busRoutes");
const { startSimulator } = require("./simulator/busSimulator");
const BusModel = require("./models/Bus");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.set("io", io);

app.use("/api", busRoutes);

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send the current fleet snapshot immediately on connect
  socket.emit("fleetUpdate", BusModel.getAllBuses());

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the GPS simulator so the dashboard has live movement out of the box.
// In production, remove this and feed real GPS data via POST /api/buses/:id/location
startSimulator(io);

server.listen(PORT, () => {
  console.log(`TransitTrace server running at http://localhost:${PORT}`);
});
