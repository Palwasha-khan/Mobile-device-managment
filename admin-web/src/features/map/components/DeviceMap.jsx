import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from 'react-leaflet-cluster';

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const PAKISTAN_CENTER = [30.3753, 69.3451];
const PAKISTAN_DEFAULT_ZOOM = 6;

// When multiple devices share the exact same coordinates, Leaflet stacks
// their markers perfectly on top of each other - only the topmost one is
// visible or clickable. This spreads overlapping markers into a small
// circle around the real point, so every device stays visible and tappable.
function spreadOverlappingMarkers(devices) {
  const coordGroups = {};

  devices.forEach((device) => {
    const key = `${device.lastKnownLocation.lat},${device.lastKnownLocation.lng}`;
    if (!coordGroups[key]) coordGroups[key] = [];
    coordGroups[key].push(device);
  });

  const result = [];

  Object.values(coordGroups).forEach((group) => {
    if (group.length === 1) {
      result.push({ ...group[0], displayLat: group[0].lastKnownLocation.lat, displayLng: group[0].lastKnownLocation.lng });
      return;
    }

    // Multiple devices at the same spot - arrange them in a small circle
    // around the real point, a few meters apart (roughly 0.00015 degrees)
    const offsetRadius = 0.00015;
    group.forEach((device, index) => {
      const angle = (2 * Math.PI * index) / group.length;
      result.push({
        ...device,
        displayLat: device.lastKnownLocation.lat + offsetRadius * Math.cos(angle),
        displayLng: device.lastKnownLocation.lng + offsetRadius * Math.sin(angle),
      });
    });
  });

  return result;
}

export default function DeviceMap({ devices }) {
  const withLocation = devices.filter((d) => d.lastKnownLocation?.lat);
  const spreadDevices = spreadOverlappingMarkers(withLocation);

  // Active Location Icon (Green)
const activeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Inactive / Last Seen Icon (Grey)
const inactiveIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

  return (
    <div className="h-125 w-full rounded-lg overflow-hidden border border-slate-200">
      <MapContainer center={PAKISTAN_CENTER} zoom={PAKISTAN_DEFAULT_ZOOM} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MarkerClusterGroup chunkedLoading>
   
        {spreadDevices.map((device) =>{
          const isLocationActive = Boolean(
            device.lastPingAt && (new Date() - new Date(device.lastPingAt)) < 5 * 60 * 1000
          );
        return (
          <Marker key={device._id} position={[device.displayLat, device.displayLng]} icon={isLocationActive ? activeIcon : inactiveIcon}>
            <Popup>
        <strong>{device.employeeName}</strong><br />
        
        {/* Status Badge */}
        <span style={{ color: isLocationActive ? "green" : "gray", fontWeight: "bold" }}>
          ● {isLocationActive ? "Live / Active Location" : "Inactive (Last Known Location)"}
        </span>
        <br />
        
        {/* Compliance */}
        <span>{device.isCompliant ? "Compliant" : "Non-Compliant"}</span><br />
        
        {/* Last Seen Timestamp */}
        <small style={{ color: "#666" }}>
          Last seen: {device.lastPingAt ? new Date(device.lastPingAt).toLocaleString() : "N/A"}
        </small>
      </Popup>
          </Marker>
       ) })}
       </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}