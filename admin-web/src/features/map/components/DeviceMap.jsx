import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

export default function DeviceMap({ devices }) {
  const withLocation = devices.filter((d) => d.lastKnownLocation?.lat);

  const center =
    withLocation.length > 0
      ? [withLocation[0].lastKnownLocation.lat, withLocation[0].lastKnownLocation.lng]
      : [20, 0];

  return (
    <div className="h-125 w-full rounded-lg overflow-hidden border border-slate-200">
      <MapContainer center={PAKISTAN_CENTER}
        zoom={PAKISTAN_DEFAULT_ZOOM} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {withLocation.map((device) => (
          <Marker
            key={device._id}
            position={[device.lastKnownLocation.lat, device.lastKnownLocation.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <strong>{device.employeeName}</strong><br />
              {device.isCompliant ? "Compliant" : "Non-Compliant"}<br />
              Last ping: {device.lastPingAt ? new Date(device.lastPingAt).toLocaleTimeString() : "N/A"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}