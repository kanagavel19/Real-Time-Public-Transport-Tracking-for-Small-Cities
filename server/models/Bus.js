// server/models/Bus.js
// In-memory data model for routes, stops, and buses.
// Swap this out for MongoDB/PostgreSQL in production.

// A small city with 2 routes, each with a handful of stops.
// Coordinates are illustrative (roughly laid out around a small city center).
const routes = {
  R1: {
    id: "R1",
    name: "Route 1: Railway Station - City Center - College",
    stops: [
      { id: "S1", name: "Railway Station", lat: 12.9750, lng: 77.5900 },
      { id: "S2", name: "Market Square", lat: 12.9770, lng: 77.5940 },
      { id: "S3", name: "City Center", lat: 12.9790, lng: 77.5980 },
      { id: "S4", name: "Hospital", lat: 12.9810, lng: 77.6020 },
      { id: "S5", name: "College Gate", lat: 12.9830, lng: 77.6060 }
    ]
  },
  R2: {
    id: "R2",
    name: "Route 2: Bus Depot - Industrial Area - Lakeview",
    stops: [
      { id: "S6", name: "Bus Depot", lat: 12.9700, lng: 77.6000 },
      { id: "S7", name: "Industrial Area", lat: 12.9720, lng: 77.6040 },
      { id: "S8", name: "Town Hall", lat: 12.9740, lng: 77.6080 },
      { id: "S9", name: "Lakeview Park", lat: 12.9760, lng: 77.6120 }
    ]
  }
};

// Buses currently in service. `progress` is the fractional position (0..1)
// along its route's stop list, used by the simulator to interpolate lat/lng.
const buses = {
  BUS01: { id: "BUS01", routeId: "R1", lat: 12.9750, lng: 77.5900, progress: 0, speed: 0, direction: 1, lastUpdated: Date.now() },
  BUS02: { id: "BUS02", routeId: "R1", lat: 12.9830, lng: 77.6060, progress: 1, speed: 0, direction: -1, lastUpdated: Date.now() },
  BUS03: { id: "BUS03", routeId: "R2", lat: 12.9700, lng: 77.6000, progress: 0, speed: 0, direction: 1, lastUpdated: Date.now() },
  BUS04: { id: "BUS04", routeId: "R2", lat: 12.9760, lng: 77.6120, progress: 1, speed: 0, direction: -1, lastUpdated: Date.now() }
};

function getAllBuses() {
  return Object.values(buses);
}

function getBus(busId) {
  return buses[busId] || null;
}

function updateBusLocation(busId, { lat, lng, speed }) {
  const bus = buses[busId];
  if (!bus) return null;
  bus.lat = lat;
  bus.lng = lng;
  if (typeof speed === "number") bus.speed = speed;
  bus.lastUpdated = Date.now();
  return bus;
}

function getAllRoutes() {
  return Object.values(routes);
}

function getRoute(routeId) {
  return routes[routeId] || null;
}

module.exports = {
  routes,
  buses,
  getAllBuses,
  getBus,
  updateBusLocation,
  getAllRoutes,
  getRoute
};
