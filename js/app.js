// public/js/app.js
const socket = io("https://real-time-public-transport-tracking-for-vjd5.onrender.com");

const map = L.map("map").setView([12.976, 77.602], 14);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 18
}).addTo(map);

const busMarkers = {};   // busId -> Leaflet marker
const routeColors = { R1: "#1e6f5c", R2: "#f4a259" };

// Custom small circular icon for buses
function busIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #144d3f;"></div>`,
    iconSize: [16, 16]
  });
}

function renderBusList(buses) {
  const container = document.getElementById("bus-list");
  container.innerHTML = "";
  buses.forEach((bus) => {
    const card = document.createElement("div");
    card.className = "bus-card";
    card.innerHTML = `
      <strong>${bus.id}</strong>
      Route: ${bus.routeId}<br/>
      <span class="speed">${bus.speed} km/h</span>
    `;
    container.appendChild(card);
  });
}

function updateBusMarker(bus) {
  const color = routeColors[bus.routeId] || "#1e6f5c";

  if (busMarkers[bus.id]) {
    busMarkers[bus.id].setLatLng([bus.lat, bus.lng]);
  } else {
    busMarkers[bus.id] = L.marker([bus.lat, bus.lng], { icon: busIcon(color) })
      .addTo(map)
      .bindPopup(`<strong>${bus.id}</strong><br/>Route: ${bus.routeId}<br/>Speed: ${bus.speed} km/h`);
  }
}

async function loadRoutes() {
  const res = await fetch("https://real-time-public-transport-tracking-for-vjd5.onrender.com/api/routes");
  const routes = await res.json();

  const container = document.getElementById("route-list");
  container.innerHTML = "";

  routes.forEach((route) => {
    const card = document.createElement("div");
    card.className = "route-card";
    card.innerHTML = `<strong>${route.name}</strong>${route.stops.length} stops`;
    container.appendChild(card);

    // Draw the route path on the map
    const latlngs = route.stops.map((s) => [s.lat, s.lng]);
    L.polyline(latlngs, { color: routeColors[route.id] || "#1e6f5c", weight: 3, opacity: 0.6 }).addTo(map);

    // Mark stops
    route.stops.forEach((stop) => {
      L.circleMarker([stop.lat, stop.lng], {
        radius: 5,
        color: "#144d3f",
        fillColor: "#fff",
        fillOpacity: 1,
        weight: 2
      })
        .addTo(map)
        .bindPopup(`🚏 ${stop.name}`);
    });
  });
}

socket.on("connect", () => {
  document.getElementById("connection-status").textContent = "🟢 Live — connected";
});

socket.on("disconnect", () => {
  document.getElementById("connection-status").textContent = "🔴 Disconnected — retrying…";
});

socket.on("fleetUpdate", (buses) => {
  buses.forEach(updateBusMarker);
  renderBusList(buses);
});

socket.on("busUpdate", (bus) => {
  updateBusMarker(bus);
});

loadRoutes();
