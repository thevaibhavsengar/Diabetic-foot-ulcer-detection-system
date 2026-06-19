import { useEffect, useRef, useState } from "react";

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371, d2r = Math.PI / 180;
  const dLat = (lat2 - lat1) * d2r, dLon = (lon2 - lon1) * d2r;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*d2r)*Math.cos(lat2*d2r)*Math.sin(dLon/2)**2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
}

async function fetchHospitals(lat, lon) {
  const query = `[out:json];(node["amenity"="hospital"](around:5000,${lat},${lon});way["amenity"="hospital"](around:5000,${lat},${lon}););out center;`;
  const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
  const { elements } = await res.json();
  return elements
    .map((el) => ({
      id: el.id,
      name: el.tags?.name || "Hospital",
      address: [el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", ") || "Address not available",
      lat: el.lat ?? el.center?.lat,
      lon: el.lon ?? el.center?.lon,
    }))
    .filter((h) => h.lat && h.lon)
    .map((h) => ({ ...h, distance: getDistance(lat, lon, h.lat, h.lon) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);
}

export default function NearbyHospitals({ onClose }) {
  const mapRef = useRef(null);
  const mapInst = useRef(null);
  const [hospitals, setHospitals] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [status, setStatus] = useState("loading");


  useEffect(() => {
    if (window.L) return;
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);

    const js = document.createElement("script");
    js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    document.head.appendChild(js);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        setUserPos({ lat, lon });
        try {
          setHospitals(await fetchHospitals(lat, lon));
          setStatus("ready");
        } catch {
          setStatus("error");
        }
      },
      () => setStatus("error")
    );
  }, []);

  useEffect(() => {
    if (status !== "ready" || !userPos || !mapRef.current) return;

    const interval = setInterval(() => {
      if (!window.L) return;
      clearInterval(interval);
      const L = window.L;

      if (!mapInst.current) {
        mapInst.current = L.map(mapRef.current).setView([userPos.lat, userPos.lon], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInst.current);
      }

      const blueIcon = L.divIcon({
        className: "",
        html: `<div style="width:12px;height:12px;background:#3b82f6;border:2px solid white;border-radius:50%;"></div>`,
        iconSize: [12, 12], iconAnchor: [6, 6],
      });

      const redIcon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;background:#ef4444;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;">+</div>`,
        iconSize: [20, 20], iconAnchor: [10, 10],
      });

      L.marker([userPos.lat, userPos.lon], { icon: blueIcon }).addTo(mapInst.current).bindPopup("📍 You are here");
      hospitals.forEach((h) => L.marker([h.lat, h.lon], { icon: redIcon }).addTo(mapInst.current).bindPopup(`<b>${h.name}</b>`));

      const allPoints = [[userPos.lat, userPos.lon], ...hospitals.map((h) => [h.lat, h.lon])];
      if (allPoints.length > 1) mapInst.current.fitBounds(allPoints, { padding: [25, 25] });
    }, 200);
  }, [status, userPos, hospitals]);

  return (
    <div className="fixed bottom-24 right-6 w-80 bg-[#0f172a] rounded-2xl border border-[#1e2d47] shadow-2xl overflow-hidden z-[1000]">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a1628] border-b border-[#1e2d47]">
        <div className="flex items-center text-md gap-2">
          <span>🏥</span>
          <span className="text-white font-semibold text-sm">Nearby Hospitals</span>
        </div>
        {/* × closes the map and shows the button again */}
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
      </div>

      {/* Loading */}
      {status === "loading" && (
        <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          Getting your location…
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="h-48 flex items-center justify-center text-red-400 text-xs text-center px-6">
          Location access denied. Please allow location permission and refresh.
        </div>
      )}

      {/* Map */}
      <div ref={mapRef} className="w-full" style={{ height: status === "ready" ? "200px" : "0px" }} />

      {/* Hospital list */}
      {status === "ready" && hospitals.map((h) => (
        <div key={h.id} className="flex items-center gap-3 px-4 py-3 border-t border-[#1e2d47] hover:bg-[#1a2540] transition-colors">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-2xl text-white font-bold shrink-0">+</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{h.name}</p>
            <p className="text-gray-500 text-[11px] truncate">{h.address}</p>
          </div>
          <span className="text-gray-400 text-xs shrink-0">{h.distance} km</span>
        </div>
      ))}

      {/* View more */}
      {status === "ready" && (
        <div className="border-t border-[#1e2d47] py-3 text-center">
          <a
            href={`https://www.openstreetmap.org/search?query=hospital#map=14/${userPos?.lat}/${userPos?.lon}`}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 text-xs hover:text-indigo-300"
          >
            View more hospitals →
          </a>
        </div>
      )}

    </div>
  );
}