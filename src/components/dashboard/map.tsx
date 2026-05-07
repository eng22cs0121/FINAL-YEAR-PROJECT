"use client";

import { useState, useMemo, useEffect } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl, FullscreenControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Pin, Package, Truck, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import type { Feature, LineString } from 'geojson';
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

export type MapPosition = { 
  lat: number; 
  lng: number; 
  location: string;
  status: string;
  timestamp: string;
  batchId?: string;
  drugName?: string;
};

type MapProps = {
  positions: MapPosition[];
  showRoute?: boolean;
  interactive?: boolean;
  height?: string;
};

const statusColors: Record<string, string> = {
  "Approved": "#10b981", // Success
  "In-Transit": "#3b82f6", // Blue
  "Delivered": "#7c3aed", // Purple
  "At-Pharmacy": "#7c3aed", // Purple
  "Sold": "#f59e0b", // Amber (Success completion)
  "Rejected": "#ef4444", // Red
  "Flagged": "#f59e0b", // Warning
};

const StatusIcon = ({ status, className }: { status: string; className?: string }) => {
  switch (status) {
    case 'In-Transit': return <Truck className={className} />;
    case 'Delivered': 
    case 'At-Pharmacy': return <Package className={className} />;
    case 'Sold': return <CheckCircle className={className} />;
    case 'Rejected':
    case 'Flagged': return <AlertTriangle className={className} />;
    default: return <Package className={className} />;
  }
};

export function DashboardMap({ positions, showRoute = true, interactive = true, height = "100%" }: MapProps) {
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  
  // Default to India if no positions
  const initialPosition = positions.length > 0 
    ? { lng: positions[positions.length - 1].lng, lat: positions[positions.length - 1].lat } 
    : { lng: 78.9629, lat: 20.5937 };
    
  const [viewState, setViewState] = useState({
    longitude: initialPosition.lng,
    latitude: initialPosition.lat,
    zoom: positions.length > 1 ? 4 : 10,
  });

  const [popupInfo, setPopupInfo] = useState<MapPosition | null>(null);

  // Update viewState if positions change and we aren't interacting
  useEffect(() => {
    if (positions.length > 0) {
      setViewState(prev => ({
        ...prev,
        longitude: positions[positions.length - 1].lng,
        latitude: positions[positions.length - 1].lat,
      }));
    }
  }, [positions]);

  const markers = useMemo(() => positions.map((p, i) => {
    const isLatest = i === positions.length - 1;
    const color = statusColors[p.status] || "#7035db";
    
    return (
      <Marker 
        key={`marker-${i}-${p.timestamp}`} 
        longitude={p.lng} 
        latitude={p.lat} 
        anchor="bottom" 
        onClick={e => {
          e.originalEvent.stopPropagation();
          setPopupInfo(p);
        }}
      >
        <div className="relative cursor-pointer group">
          {/* Pulse effect for latest position */}
          {isLatest && (
            <div 
              className="absolute -inset-2 rounded-full animate-ping opacity-25" 
              style={{ backgroundColor: color }} 
            />
          )}
          
          <div 
            className={`p-1.5 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110`}
            style={{ backgroundColor: color }}
          >
            <StatusIcon status={p.status} className="h-4 w-4 text-white" />
          </div>
          
          {/* Label on hover or for latest */}
          {(isLatest || interactive) && (
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-0.5 rounded pointer-events-none z-10">
              {p.location}
            </div>
          )}
        </div>
      </Marker>
    );
  }), [positions, interactive]);

  const lineGeoJSON: Feature<LineString> = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: positions.map(p => [p.lng, p.lat])
    },
    properties: {}
  };

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted rounded-lg border border-dashed border-border p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-warning mb-2" />
        <h3 className="font-semibold text-foreground">Map Configuration Missing</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Please add <code>NEXT_PUBLIC_MAPTILER_API_KEY</code> to your .env file to enable location tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-inner border border-border" style={{ height }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={`https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${apiKey}`}
        scrollZoom={interactive}
        dragPan={interactive}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {showRoute && positions.length > 1 && (
          <Source id="route" type="geojson" data={lineGeoJSON}>
            <Layer
              id="route-layer-glow"
              type="line"
              paint={{
                'line-color': '#3b82f6',
                'line-width': 6,
                'line-opacity': 0.2,
                'line-blur': 4
              }}
            />
            <Layer
              id="route-layer"
              type="line"
              paint={{
                'line-color': '#3b82f6',
                'line-width': 3,
                'line-dasharray': [2, 2]
              }}
            />
          </Source>
        )}

        {markers}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={Number(popupInfo.lng)}
            latitude={Number(popupInfo.lat)}
            onClose={() => setPopupInfo(null)}
            closeButton={false}
            className="z-50"
            maxWidth="240px"
          >
            <div className="p-3 bg-card rounded-lg shadow-xl border border-border min-w-[200px]">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  {popupInfo.status}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {format(parseISO(popupInfo.timestamp), "HH:mm")}
                </span>
              </div>
              
              <h4 className="font-bold text-sm text-foreground mb-1 leading-tight">{popupInfo.location}</h4>
              
              {popupInfo.batchId && (
                <div className="mt-2 pt-2 border-t border-border space-y-1">
                  <div className="flex items-center text-[10px] text-muted-foreground">
                    <Package className="h-3 w-3 mr-1" />
                    <span>Batch: <span className="text-foreground font-medium">{popupInfo.batchId}</span></span>
                  </div>
                  {popupInfo.drugName && (
                    <div className="flex items-center text-[10px] text-muted-foreground">
                      <Info className="h-3 w-3 mr-1" />
                      <span>Drug: <span className="text-foreground font-medium">{popupInfo.drugName}</span></span>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-[10px] text-muted-foreground mt-2">
                {format(parseISO(popupInfo.timestamp), "MMM d, yyyy")}
              </p>
            </div>
          </Popup>
        )}
      </Map>
      
      {/* Legend / Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-background/80 backdrop-blur-md p-3 rounded-lg border border-border shadow-lg">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Shipment Status</h5>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(statusColors).filter(([status]) => 
            ["Approved", "In-Transit", "At-Pharmacy", "Sold"].includes(status)
          ).map(([status, color]) => (
            <div key={status} className="flex items-center text-[10px] text-foreground">
              <span className="h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />
              {status}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
