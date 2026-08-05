import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import ComplianceBadge from "../../../components/shared/ComplianceBadge";
import { ExternalLink, Smartphone } from "lucide-react";

// Helper component to auto-recenter and fit map bounds to all active device pins
function AutoFitBounds({ devices }) {
  const map = useMap();

  useEffect(() => {
    if (devices.length === 0) return;

    const bounds = L.latLngBounds(
      devices.map((d) => [d.lastKnownLocation.lat, d.lastKnownLocation.lng])
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [devices, map]);

  return null;
}

// Custom Colored SVG Marker Factory
const createCustomMarkerIcon = (isCompliant) => {
  const pinColor = isCompliant ? "#10B981" : "#EF4444"; // Emerald green vs Red
  const svgMarker = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
      <path fill="${pinColor}" stroke="#FFFFFF" stroke-width="2" d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z"/>
      <circle cx="12" cy="12" r="5" fill="#FFFFFF"/>
    </svg>
  `;

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: svgMarker,
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -42],
  });
};

const PAKISTAN_CENTER = [30.3753, 69.3451];
const DEFAULT_ZOOM = 6;

export default function DeviceMap({ devices = [] }) {
  const navigate = useNavigate();

  const withLocation = devices.filter(
    (d) => d.lastKnownLocation?.lat && d.lastKnownLocation?.lng
  );

  return (
    <div className="h-150 w-full rounded-xl overflow-hidden border border-slate-200 shadow-xs relative">
      <MapContainer
        center={PAKISTAN_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
      >
     <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  />

        {withLocation.length > 0 && <AutoFitBounds devices={withLocation} />}

        {withLocation.map((device) => {
          const icon = createCustomMarkerIcon(device.isCompliant);

          return (
            <Marker
              key={device._id}
              position={[
                device.lastKnownLocation.lat,
                device.lastKnownLocation.lng,
              ]}
              icon={icon}
            >
              <Popup className="custom-map-popup">
                <div className="p-1 max-w-xs space-y-2 font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">
                      {device.employeeName}
                    </h4>
                    <ComplianceBadge isCompliant={device.isCompliant} />
                  </div>

                  <div className="space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1 font-mono text-[11px] text-slate-700">
                      <Smartphone size={12} className="text-slate-400" />
                      {device.deviceId}
                    </p>
                    <p>
                      <strong>Last Ping:</strong>{" "}
                      {device.lastPingAt
                        ? new Date(device.lastPingAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/devices/${device._id}`)}
                    className="w-full flex items-center justify-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-1.5 px-3 rounded-lg transition mt-2"
                  >
                    Manage Device <ExternalLink size={12} />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}