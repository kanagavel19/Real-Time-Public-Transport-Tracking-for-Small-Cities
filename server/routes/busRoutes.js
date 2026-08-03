// server/routes/busRoutes.js
const express = require("express");
const router = express.Router();
const BusModel = require("../models/Bus");

// Haversine distance in km, used for simple ETA estimation
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET /api/buses - list all buses
router.get("/buses", (req, res) => {
  res.json(BusModel.getAllBuses());
});

// GET /api/buses/:busId - single bus detail
router.get("/buses/:busId", (req, res) => {
  const bus = BusModel.getBus(req.params.busId);
  if (!bus) return res.status(404).json({ error: "Bus not found" });
  res.json(bus);
});

// POST /api/buses/:busId/location - push a new GPS reading (for real hardware)
router.post("/buses/:busId/location", (req, res) => {
  const { lat, lng, speed } = req.body;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "lat and lng (numbers) are required" });
  }
  const bus = BusModel.updateBusLocation(req.params.busId, { lat, lng, speed });
  if (!bus) return res.status(404).json({ error: "Bus not found" });

  // Broadcast the update to all connected dashboards
  const io = req.app.get("io");
  io.emit("busUpdate", bus);

  res.json(bus);
});

// GET /api/routes - list all routes with stops
router.get("/routes", (req, res) => {
  res.json(BusModel.getAllRoutes());
});

// GET /api/routes/:routeId/eta/:stopId - naive straight-line ETA estimate
router.get("/routes/:routeId/eta/:stopId", (req, res) => {
  const route = BusModel.getRoute(req.params.routeId);
  if (!route) return res.status(404).json({ error: "Route not found" });

  const stop = route.stops.find((s) => s.id === req.params.stopId);
  if (!stop) return res.status(404).json({ error: "Stop not found" });

  const AVERAGE_SPEED_KMPH = 25; // assumed average city bus speed

  const busesOnRoute = BusModel.getAllBuses().filter((b) => b.routeId === route.id);
  const etas = busesOnRoute.map((bus) => {
    const distance = distanceKm(bus.lat, bus.lng, stop.lat, stop.lng);
    const etaMinutes = Math.round((distance / AVERAGE_SPEED_KMPH) * 60);
    return { busId: bus.id, distanceKm: Number(distance.toFixed(2)), etaMinutes };
  });

  etas.sort((a, b) => a.etaMinutes - b.etaMinutes);

  res.json({ routeId: route.id, stopId: stop.id, stopName: stop.name, etas });
});

module.exports = router;
