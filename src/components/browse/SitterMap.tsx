import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PublicSitterProfile } from "@/hooks/useSitterProfile";
import { getApproximateCoordinates, cyprusCenter, defaultZoom } from "@/lib/townCoordinates";
import { useNavigate } from "react-router-dom";

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface SitterMapProps {
  sitters: PublicSitterProfile[];
  hoveredSitterId?: string | null;
  onSitterHover?: (sitterId: string | null) => void;
  className?: string;
}

const SitterMap = ({
  sitters,
  hoveredSitterId,
  onSitterHover,
  className = "",
}: SitterMapProps) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [cyprusCenter.lat, cyprusCenter.lng],
      zoom: defaultZoom,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, []);

  // Update markers when sitters change
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const map = mapRef.current;
    const currentMarkers = markersRef.current;

    // Remove old markers
    currentMarkers.forEach((marker) => {
      map.removeLayer(marker);
    });
    currentMarkers.clear();

    if (sitters.length === 0) {
      map.setView([cyprusCenter.lat, cyprusCenter.lng], defaultZoom);
      return;
    }

    // Create markers for each sitter
    const bounds: L.LatLngBoundsExpression = [];

    sitters.forEach((sitter) => {
      const coords = getApproximateCoordinates(
        sitter.town,
        sitter.approximate_latitude ?? undefined,
        sitter.approximate_longitude ?? undefined
      );

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: hsl(38, 92%, 50%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px -2px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: customIcon });

      // Create popup content
      const popupContent = `
        <div style="min-width: 180px; font-family: inherit;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <div style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: #e5e7eb;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              font-size: 14px;
              overflow: hidden;
            ">
              ${
                sitter.photos?.[0]
                  ? `<img src="${sitter.photos[0]}" alt="${sitter.first_name}" style="width: 100%; height: 100%; object-fit: cover;" />`
                  : `${sitter.first_name[0]}${sitter.last_name[0]}`
              }
            </div>
            <div>
              <div style="font-weight: 600; font-size: 14px;">${sitter.first_name} ${sitter.last_name}</div>
              <div style="font-size: 12px; color: #6b7280;">${sitter.town}</div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
            ${(sitter.services || [])
              .slice(0, 2)
              .map(
                (service) =>
                  `<span style="background: #f3f4f6; padding: 2px 8px; border-radius: 9999px; font-size: 11px;">${service}</span>`
              )
              .join("")}
            ${
              (sitter.services?.length || 0) > 2
                ? `<span style="background: #f3f4f6; padding: 2px 8px; border-radius: 9999px; font-size: 11px;">+${sitter.services!.length - 2}</span>`
                : ""
            }
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; color: hsl(38, 92%, 50%);">€${sitter.hourly_rate || 0}/hr</span>
            <button 
              onclick="window.location.href='/sitter/${sitter.id}'"
              style="
                background: hsl(38, 92%, 50%);
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
              "
            >
              View Profile
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: "sitter-popup",
      });

      marker.on("mouseover", () => onSitterHover?.(sitter.id));
      marker.on("mouseout", () => onSitterHover?.(null));

      marker.addTo(map);
      currentMarkers.set(sitter.id, marker);
      bounds.push([coords.lat, coords.lng]);
    });

    // Fit bounds to show all markers
    if (bounds.length === 1) {
      map.setView(bounds[0] as [number, number], 12);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, {
        padding: [50, 50],
        maxZoom: 13,
      });
    }
  }, [sitters, isMapReady, onSitterHover]);

  // Highlight hovered marker
  useEffect(() => {
    if (!isMapReady) return;

    markersRef.current.forEach((marker, id) => {
      const element = marker.getElement();
      if (element) {
        const innerDiv = element.querySelector("div");
        if (innerDiv) {
          if (id === hoveredSitterId) {
            innerDiv.style.transform = "scale(1.2)";
            innerDiv.style.zIndex = "1000";
          } else {
            innerDiv.style.transform = "scale(1)";
            innerDiv.style.zIndex = "auto";
          }
        }
      }
    });
  }, [hoveredSitterId, isMapReady]);

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <div
        ref={mapContainerRef}
        className="h-full w-full min-h-[400px]"
        style={{ zIndex: 0 }}
      />

      {/* Approximate location notice */}
      <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground z-[1000]">
        📍 Showing approximate areas
      </div>
    </div>
  );
};

export default SitterMap;
