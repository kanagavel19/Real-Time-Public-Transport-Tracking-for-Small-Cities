// server/simulator/busSimulator.js
// Simulates buses moving smoothly along their route's stop list so the
// dashboard has live data to show without needing real GPS hardware.

const BusModel = require("../models/Bus");

const STEP = 0.01;        // fraction of the route advanced per tick
const TICK_MS = 2000;     // how often positions update

function interpolate(stops, progress) {
  const segmentCount = stops.length - 1;
  const scaled = progress * segmentCount;
  const index = Math.min(Math.floor(scaled), segmentCount - 1);
  const localT = scaled - index;

  const from = stops[index];
  const to = stops[index + 1];

  const lat = from.lat + (to.lat - from.lat) * localT;
  const lng = from.lng + (to.lng - from.lng) * localT;

  return { lat, lng };
}

function startSimulator(io) {
  setInterval(() => {
    const buses = BusModel.getAllBuses();

    buses.forEach((bus) => {
      const route = BusModel.getRoute(bus.routeId);
      if (!route) return;

      // Advance progress, bouncing back and forth between route ends
      bus.progress += STEP * bus.direction;
      if (bus.progress >= 1) {
        bus.progress = 1;
        bus.direction = -1;
      } else if (bus.progress <= 0) {
        bus.progress = 0;
        bus.direction = 1;
      }

      const { lat, lng } = interpolate(route.stops, bus.progress);
      bus.lat = lat;
      bus.lng = lng;
      bus.speed = 20 + Math.round(Math.random() * 10); // 20-30 km/h simulated
      bus.lastUpdated = Date.now();
    });

    // Broadcast the full fleet snapshot to every connected client
    io.emit("fleetUpdate", buses);
  }, TICK_MS);
}

module.exports = { startSimulator };
