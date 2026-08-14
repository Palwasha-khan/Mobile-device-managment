import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const PAKISTAN_CENTER = [30.3753, 69.3451];
const PAKISTAN_DEFAULT_ZOOM = 6;
const ACTIVE_THRESHOLD_MS = 15 * 60 * 1000;

const activeIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Tailwind's filter utilities applied directly as the marker's className -
// Leaflet just puts this class on the <img> it renders internally
const inactiveIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "grayscale opacity-60",
});

const isDeviceActive = (device) => {
  if (!device.lastPingAt) return false;
  return Date.now() - new Date(device.lastPingAt).getTime() < ACTIVE_THRESHOLD_MS;
};

// Builds a cluster badge using Tailwind utility classes directly in the
// HTML string - Tailwind's compiler scans this file's text and includes
// these classes in the build, same as if they were in JSX
const createClusterIcon = (cluster) => {
  const count = cluster.getChildCount();

  const bgClass =
    count >= 10 ? "bg-red-600" : count >= 5 ? "bg-amber-600" : "bg-blue-600";

  return L.divIcon({
    html: `<div class="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm border-[3px] border-white shadow-lg ${bgClass}">${count}</div>`,
    className: "", // prevents Leaflet's own default cluster styling from applying
    iconSize: L.point(20, 20, true),
  });
};

export default function DeviceMap({ devices }) {
  const withLocation = devices.filter((d) => d.lastKnownLocation?.lat);

  return (
    <div className="h-125 w-full rounded-lg overflow-hidden border border-slate-200 relative">
      <div className="absolute bottom-2 left-2 z-300 bg-white rounded-md shadow-sm border border-slate-200 px-3 py-2 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span className="text-slate-700">Active (pinged within 15 min)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span className="text-slate-700">Inactive</span>
        </div>
      </div>

      <MapContainer center={PAKISTAN_CENTER} zoom={PAKISTAN_DEFAULT_ZOOM} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={30}
          disableClusteringAtZoom={10}
        >
          {withLocation.map((device) => {
            const active = isDeviceActive(device);
            return (
              <Marker
                key={device._id}
                position={[device.lastKnownLocation.lat, device.lastKnownLocation.lng]}
                icon={active ? activeIcon : inactiveIcon}
              >
                <Popup>
                  <strong>{device.employeeName}</strong><br />
                  Status: {active ? "🟢 Active" : "⚪ Inactive"}<br />
                  Compliance: {device.isCompliant ? "Compliant" : "Non-Compliant"}<br />
                  Last ping: {device.lastPingAt ? new Date(device.lastPingAt).toLocaleString() : "Never"}
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}